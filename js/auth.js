// Outcast Auto Parts - Auth API Client
// Communicates with Cloudflare Worker for secure authentication

const AuthAPI = {
  baseUrl: 'https://outcast-auto-parts-auth.outcast-auto-parts.workers.dev',
  useLocalFallback: false,
  localUsers: [
    { username: 'OutcastAutoParts210', passwordHash: '40e995c523b6dd2561c2a579' },
    { username: 'JesusAngel', passwordHash: '0a18abb138fcca6f7590d095' }
  ],
  
  async register(username, email, password, accountType = 'customer') {
    if (this.useLocalFallback) {
      return { success: false, error: 'Local mode: registration disabled. Use hardcoded accounts or deploy Cloudflare Worker.' };
    }
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, accountType })
    });
    return await response.json();
  },
  
  async login(username, password) {
    if (this.useLocalFallback) {
      const user = this.localUsers.find(u => u.username === username);
      if (!user) return { success: false, error: 'Invalid username or password' };
      
      const hash = this.simpleHash(password);
      if (hash === user.passwordHash) {
        const token = 'local-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('outcast_auth_token', token);
        return { success: true, token, user: { username: user.username, email: '', accountType: 'seller' } };
      }
      return { success: false, error: 'Invalid username or password' };
    }
    
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return await response.json();
  },
  
  async verify(token) {
    if (this.useLocalFallback) {
      if (token && token.startsWith('local-')) {
        const username = token.includes('OutcastAutoParts210') ? 'OutcastAutoParts210' : 'JesusAngel';
        return { success: true, user: { username, email: '', accountType: 'seller' } };
      }
      return { success: false, error: 'Invalid token' };
    }
    
    const response = await fetch(`${this.baseUrl}/auth/verify`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await response.json();
  },
  
  async logout(token) {
    if (this.useLocalFallback) {
      return { success: true };
    }
    const response = await fetch(`${this.baseUrl}/auth/logout`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return await response.json();
  },
  
  setToken(token) {
    localStorage.setItem('outcast_auth_token', token);
  },
  
  getToken() {
    return localStorage.getItem('outcast_auth_token');
  },
  
  removeToken() {
    localStorage.removeItem('outcast_auth_token');
  },
  
  isLoggedIn() {
    return !!this.getToken();
  },
  
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    const h1 = Math.abs(hash).toString(16).padStart(8, '0');
    const h2 = Math.abs((hash * 31) & 0xFFFFFFFF).toString(16).padStart(8, '0');
    const h3 = Math.abs((hash * 37) & 0xFFFFFFFF).toString(16).padStart(8, '0');
    return h1 + h2 + h3;
  }
};
