const API_URL = 'http://localhost:8080';

export function getToken() {
  const user = JSON.parse(localStorage.getItem('sau_user') || 'null');
  return user?.token || localStorage.getItem('sau_token') || '';
}

export function saveSession(data) {
  localStorage.setItem('sau_user', JSON.stringify(data));
  localStorage.setItem('sau_token', data.token || '');
}

export function logout() {
  localStorage.removeItem('sau_user');
  localStorage.removeItem('sau_token');
  window.location.href = '/login';
}

export async function api(path, options = {}) {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.message || data?.error || text || 'Error en la solicitud';
    throw new Error(message);
  }

  return data;
}


export async function apiBlob(path, options = {}) {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    throw new Error('Error al descargar el archivo');
  }

  return response.blob();
}

export function login(correo, password) {
  return api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ correo, password })
  });
}

export function register(payload) {
  return api('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

const gradientMap = {
  blue: 'from-blue-600 to-indigo-700',
  green: 'from-emerald-500 to-teal-700',
  orange: 'from-orange-500 to-rose-600',
  purple: 'from-violet-600 to-fuchsia-700'
};

export function normalizeCourse(curso) {
  if (!curso) return null;
  const docenteObj = curso.docente || {};
  return {
    ...curso,
    progreso: curso.progreso ?? curso.avance ?? 0,
    docente: typeof curso.docente === 'string'
      ? curso.docente
      : `${docenteObj.nombres || ''} ${docenteObj.apellidos || ''}`.trim() || 'Sin docente',
    docenteCorreo: docenteObj.correo,
    color: curso.color?.startsWith('from-') ? curso.color : (gradientMap[curso.color] || 'from-blue-600 to-indigo-700')
  };
}

export function normalizeCourses(cursos = []) {
  return cursos.map(normalizeCourse);
}
