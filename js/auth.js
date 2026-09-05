// Outcast Auto Parts - Auth API Client
// Communicates with Cloudflare Worker for secure authentication

const AuthAPI = {
  baseUrl: 'https://outcast-auto-parts-auth.your-subdomain.workers.dev',
  
  async register(username, email, password, accountType = 'customer') {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, accountType })
    });
    return await response.json();
  },
  
  async login(username, password) {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return await response.json();
  },
  
  async verify(token) {
    const response = await fetch(`${this.baseUrl}/auth/verify`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await response.json();
  },
  
  async logout(token) {
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
  }
};
