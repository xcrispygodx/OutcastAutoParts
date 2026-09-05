// Outcast Auto Parts - Auth Worker
// Secure customer account system for Cloudflare Pages
//
// Deploy with: wrangler deploy
// Setup KV: wrangler kv namespace create AUTH

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400'
};

function kvNotConfiguredResponse() {
  return new Response(JSON.stringify({ error: 'KV namespace not configured. Run: wrangler kv namespace create AUTH' }), {
    status: 500,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
  });
}

async function hashPassword(password, salt) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );
  
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

async function handleRegister(request, env) {
  const AUTH_KV = env?.AUTH;
  if (!AUTH_KV) return kvNotConfiguredResponse();
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

async function handleLogin(request, env) {
  const AUTH_KV = env?.AUTH;
  if (!AUTH_KV) return kvNotConfiguredResponse();
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

async function handleVerify(request, env) {
  const AUTH_KV = env?.AUTH;
  if (!AUTH_KV) return kvNotConfiguredResponse();
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

async function handleLogout(request, env) {
  const AUTH_KV = env?.AUTH;
  if (!AUTH_KV) return kvNotConfiguredResponse();
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

async function handleYardImages(request, env) {
  try {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');
    const mode = url.searchParams.get('mode') || 'gallery';
    
    if (!targetUrl) {
      return errorResponse('URL parameter required', 400);
    }
    
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OutcastAutoParts/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      }
    });
    
    if (!response.ok) {
      return errorResponse('Failed to fetch yard page', 400);
    }
    
    const html = await response.text();
    const imageUrls = [];
    
    if (mode === 'recent') {
      const recentMatch = html.match(/href=["']([^"']*recent-arrivals[^"']*)["']/i);
      if (recentMatch && recentMatch[1]) {
        const recentUrl = new URL(recentMatch[1], targetUrl).href;
        const recentResponse = await fetch(recentUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; OutcastAutoParts/1.0)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
          }
        });
        
        if (recentResponse.ok) {
          const recentHtml = await recentResponse.text();
          const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
          let match;
          while ((match = imgRegex.exec(recentHtml)) !== null) {
            let src = match[1];
            if (src && !src.startsWith('data:')) {
              if (src.startsWith('//')) {
                src = 'https:' + src;
              } else if (src.startsWith('/')) {
                const baseUrl = new URL(targetUrl);
                src = baseUrl.origin + src;
              } else if (!src.startsWith('http')) {
                const baseUrl = new URL(targetUrl);
                src = baseUrl.origin + '/' + src;
              }
              if (!imageUrls.includes(src)) {
                imageUrls.push(src);
              }
            }
          }
        }
      }
    }
    
    if (imageUrls.length === 0) {
      const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
      let match;
      while ((match = imgRegex.exec(html)) !== null) {
        let src = match[1];
        if (src && !src.startsWith('data:')) {
          if (src.startsWith('//')) {
            src = 'https:' + src;
          } else if (src.startsWith('/')) {
            const baseUrl = new URL(targetUrl);
            src = baseUrl.origin + src;
          } else if (!src.startsWith('http')) {
            const baseUrl = new URL(targetUrl);
            src = baseUrl.origin + '/' + src;
          }
          if (!imageUrls.includes(src)) {
            imageUrls.push(src);
          }
        }
      }
    }
    
    const sortedImages = imageUrls.slice(0, 20);
    
    return new Response(JSON.stringify({ images: sortedImages }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    return errorResponse('Failed to fetch images: ' + error.message, 500);
  }
}

async function handleRequest(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  
  if (path === '/auth/register' && request.method === 'POST') {
    return handleRegister(request, env);
  }
  
  if (path === '/auth/login' && request.method === 'POST') {
    return handleLogin(request, env);
  }
  
  if (path === '/auth/verify' && request.method === 'GET') {
    return handleVerify(request, env);
  }
  
  if (path === '/auth/logout' && request.method === 'POST') {
    return handleLogout(request, env);
  }
  
  if (path === '/yard-images' && request.method === 'GET') {
    return handleYardImages(request, env);
  }
  
  if (path === '/' && request.method === 'GET') {
    return new Response(JSON.stringify({ 
      service: 'Outcast Auto Parts Auth API', 
      status: 'ok',
      authKv: env?.AUTH ? 'bound' : 'missing',
      authType: typeof env?.AUTH
    }), {
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
    });
  }
  
  return errorResponse('Not found', 404);
}

export default {
  fetch(request, env, ctx) {
    return handleRequest(request, env);
  }
};
