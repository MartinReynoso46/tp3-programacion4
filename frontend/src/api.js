const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function api(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(API + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body && JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({})); // el DELETE devuelve 204 sin cuerpo
  if (res.status === 401 && token) { // token vencido (4 h) o inválido
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  if (!res.ok) throw new Error(data.error || data.errores?.map(e => e.mensaje).join('. ') || 'Error inesperado');
  return data;
}
