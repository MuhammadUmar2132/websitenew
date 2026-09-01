// Frontend Authentication Helper Utility

export const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('portfolio_token') || null;
};

export const getCurrentUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const userStr = localStorage.getItem('portfolio_user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    return null;
  }
};

export const setAuthSession = (user, token) => {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem('portfolio_token', token);
  if (user) localStorage.setItem('portfolio_user', JSON.stringify(user));
  window.dispatchEvent(new Event('auth-change'));
};

export const clearAuthSession = async (apiUrl) => {
  if (typeof window === 'undefined') return;
  try {
    const base = apiUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8009';
    if (base) {
      await fetch(`${base}/logout`, {
        method: 'POST',
        credentials: 'include',
      }).catch(() => {});
    }
  } catch (e) {
    // Ignore network error on logout
  }
  localStorage.removeItem('portfolio_token');
  localStorage.removeItem('portfolio_user');
  window.dispatchEvent(new Event('auth-change'));
};

export const isAdminUser = () => {
  const user = getCurrentUser();
  return user?.role === 'admin';
};

export const getAuthHeaders = (isMultipart = false) => {
  const token = getAuthToken();
  const headers = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};
