// Outcast Auto Parts - Auth Worker
// Secure customer account system for Cloudflare Pages
//
// Deploy with: wrangler deploy
// Setup KV: wrangler kv namespace create AUTH

const AUTH_KV = AUTH;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400'
};

async function hashPassword(password, salt) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  const hash = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'HMAC', hash: 'SHA-256', length: 256 },
    false,
    ['sign']
  );
  
  const hashBuffer = await crypto.subtle.exportKey('raw', hash);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateSalt() {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
  });
}

function errorResponse(message, status = 400) {
  return jsonResponse({ error: message }, status);
}

async function handleRegister(request) {
  try {
    const { username, email, password, accountType } = await request.json();
    
    if (!username || !email || !password) {
      return errorResponse('Username, email, and password are required');
    }
    
    if (username.length < 3) {
      return errorResponse('Username must be at least 3 characters');
    }
    
    if (password.length < 8) {
      return errorResponse('Password must be at least 8 characters');
    }
    
    const existingUser = await AUTH_KV.get(`user:${username}`);
    if (existingUser) {
      return errorResponse('Username already exists');
    }
    
    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);
    
    const user = {
      username,
      email,
      passwordHash,
      salt,
      accountType: accountType || 'customer',
      createdAt: new Date().toISOString(),
      verified: false
    };
    
    await AUTH_KV.put(`user:${username}`, JSON.stringify(user));
    await AUTH_KV.put(`email:${email}`, username);
    
    const sessionToken = generateToken();
    const session = {
      username,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    await AUTH_KV.put(`session:${sessionToken}`, JSON.stringify(session));
    
    return jsonResponse({
      success: true,
      message: 'Account created successfully',
      token: sessionToken,
      user: { username, email, accountType: user.accountType }
    });
  } catch (error) {
    return errorResponse('Registration failed: ' + error.message, 500);
  }
}

async function handleLogin(request) {
  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return errorResponse('Username and password are required');
    }
    
    const userData = await AUTH_KV.get(`user:${username}`);
    if (!userData) {
      return errorResponse('Invalid username or password');
    }
    
    const user = JSON.parse(userData);
    const passwordHash = await hashPassword(password, user.salt);
    
    if (passwordHash !== user.passwordHash) {
      return errorResponse('Invalid username or password');
    }
    
    const sessionToken = generateToken();
    const session = {
      username,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    await AUTH_KV.put(`session:${sessionToken}`, JSON.stringify(session));
    
    return jsonResponse({
      success: true,
      message: 'Login successful',
      token: sessionToken,
      user: { username, email: user.email, accountType: user.accountType }
    });
  } catch (error) {
    return errorResponse('Login failed: ' + error.message, 500);
  }
}

async function handleVerify(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse('Unauthorized', 401);
    }
    
    const token = authHeader.split(' ')[1];
    const sessionData = await AUTH_KV.get(`session:${token}`);
    
    if (!sessionData) {
      return errorResponse('Invalid or expired session', 401);
    }
    
    const session = JSON.parse(sessionData);
    const now = new Date();
    const expiresAt = new Date(session.expiresAt);
    
    if (now > expiresAt) {
      await AUTH_KV.delete(`session:${token}`);
      return errorResponse('Session expired', 401);
    }
    
    const userData = await AUTH_KV.get(`user:${session.username}`);
    if (!userData) {
      return errorResponse('User not found', 401);
    }
    
    const user = JSON.parse(userData);
    return jsonResponse({
      success: true,
      user: { username: user.username, email: user.email, accountType: user.accountType }
    });
  } catch (error) {
    return errorResponse('Verification failed: ' + error.message, 500);
  }
}

async function handleLogout(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      await AUTH_KV.delete(`session:${token}`);
    }
    return jsonResponse({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    return errorResponse('Logout failed', 500);
  }
}

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  
  if (path === '/auth/register' && request.method === 'POST') {
    return handleRegister(request);
  }
  
  if (path === '/auth/login' && request.method === 'POST') {
    return handleLogin(request);
  }
  
  if (path === '/auth/verify' && request.method === 'GET') {
    return handleVerify(request);
  }
  
  if (path === '/auth/logout' && request.method === 'POST') {
    return handleLogout(request);
  }
  
  return errorResponse('Not found', 404);
}

export default handleRequest;
