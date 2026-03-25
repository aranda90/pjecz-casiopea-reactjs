
// Acciones relacionadas con citas: obtener, crear, cancelar

import { getApiBase } from '../config/apiConfig';

// --- Funcion para obtener token ---
function getToken(): string {
  const token = localStorage.getItem('access_token');
  if (!token) {
    console.error('No se encontró token en localStorage');
    throw new Error('No hay token de autenticación');
  }
  return token;
}

// Utilidad para fetch autenticado que maneja 401 y 403
export async function authFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  // Clonar headers o crear nuevo si no existen
  const headers = new Headers(init?.headers || {});
  
  // Si hay body y no se especificó tiopo de ocntenido, lo agregamos
  if(init?.body && !headers.has('Content-Type')){
    headers.set('Content-Type', 'application/json');
  }
  
  // Incluir token de autenticación si existe
  const token = localStorage.getItem('access_token');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Ejecutar la petición
  const res = await fetch(input, {
    ...init,
    headers,
  });

  // Manejar errores de sesión expirada o token inválido
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('email');

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('sessionExpired'));
    }

    throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
  }
  return res;
}

// --- Tipo Distrito ---
export type Distrito = {
  clave: string;
  nombre: string;
  nombre_corto: string;
  es_distrito_judicial: boolean;
  es_distrito: boolean;
  es_jurisdiccional: boolean;
};

// --- Tipo Oficina ---
export type Oficina = {
  clave: string;
  descripcion: string;
  descripcion_corta: string;
  domicilio_clave: string;
  domicilio_completo: string;
  domicilio_edificio: string;
  es_jurisdiccional: boolean;
};

// --- Tipo Servicio ---
export type Servicio = {
  clave: string;
  descripcion: string;
};

// --- Tipo Oficina Servicio ---
export type OficinaServicio = {
  cit_servicio_clave: string;
  cit_servicio_descripcion: string;
  oficina_clave: string;
  oficina_descripcion: string;
  oficina_descripcion_corta: string;
};

// --- Tipo Cita ---
export type Cita = {
  id: string;
  cit_cliente_nombre: string;
  cit_servicio_clave: string;
  cit_servicio_descripcion: string;
  oficina_clave: string;
  oficina_descripcion: string;
  oficina_descripcion_corta: string;
  inicio: string;
  termino: string;
  notas: string;
  estado: string;
  asistencia: boolean;
  codigo_asistencia: string;
  codigo_acceso_url: string;
  creado: string;
  puede_cancelarse: boolean;
};

// --- Tipo Crear Cita ---
export type CrearCitaRequest = {
  cit_servicio_clave: string;
  fecha: string; // formato: YYYY-MM-DD
  hora_minuto: string; // formato: HH:mm:ss
  oficina_clave: string;
  notas: string;
};

// --- Obtener todos los distritos ---
export async function getDistritos(): Promise<Distrito[]> {
  const API_BASE = await getApiBase();
  const token = getToken();
  const res = await authFetch(`${API_BASE}/api/v5/distritos`, { 
    headers: { Authorization: `Bearer ${token}` } 
  });
  if (!res.ok) throw new Error("No se pudieron cargar distritos");
  const json = await res.json();
  return Array.isArray(json?.data) ? json.data : json;
}

// Obtener las oficinas filtradas por el distrito seleccionado --
export async function getOficinasFiltradas(distrito_clave: string): Promise<Oficina[]> {
  const API_BASE = await getApiBase();
  const token = getToken();
  const res = await authFetch(`${API_BASE}/api/v5/oficinas?distrito_clave=${distrito_clave}`, {
    headers: { 
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("No se pudieron cargar oficinas");
  const json = await res.json();
  return Array.isArray(json?.data) ? json.data : json;
}

// --- Obtener oficinas paginado ---
export async function getOficinasPaginado(limit = 10, offset = 0, domicilio_clave?: string, oficina_clave?: string) {
  const API_BASE = await getApiBase();
  const token = getToken();
  const params = new URLSearchParams();
  params.append('limit', limit.toString());
  params.append('offset', offset.toString());
  if (domicilio_clave) params.append('domicilio_clave', domicilio_clave);
  if (oficina_clave) params.append('oficina_clave', oficina_clave);
  const res = await authFetch(`${API_BASE}/api/v5/oficinas?${params.toString()}`, {
    headers: { 
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('No se pudieron cargar las oficinas');
  const json = await res.json();
  return Array.isArray(json?.data) ? json.data : json;
}

// --- Obtener servicios ---
export async function getServicios(): Promise<Servicio[]> {
  const API_BASE = await getApiBase();
  const token = getToken();
  const res = await authFetch(`${API_BASE}/api/v5/cit_servicios`, {
    headers: { 
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("No se pudieron cargar servicios");
  const json = await res.json();
  return Array.isArray(json?.data) ? json.data : json;
}

// --- Obtener servicios por oficina ---
export async function getServiciosPorOficina(oficinaClave: string): Promise<OficinaServicio[]> {
  const API_BASE = await getApiBase();
  const token = getToken();
  const res = await authFetch(
    `${API_BASE}/api/v5/cit_oficinas_servicios?oficina_clave=${oficinaClave}`,
    {
      headers: { 
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) throw new Error("No se pudieron cargar servicios por oficina");
  const json = await res.json();
  const data = Array.isArray(json?.data) ? json.data :  Array.isArray(json) ? json : [];
  return data;
}

// --- Obtener fechas disponibles ---
export async function getFechasDisponibles(oficinaClave: string, tramiteClave: string) {
  const API_BASE = await getApiBase();
  const token = getToken();
  const res = await authFetch(
    `${API_BASE}/api/v5/cit_dias_disponibles?oficina=${oficinaClave}&tramite=${tramiteClave}`,
    {
      headers: { 
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) throw new Error("No se pudieron cargar fechas disponibles");
  const json = await res.json();
  return Array.isArray(json?.data) ? json.data : json;
}

// --- Obtener horas disponibles ---
export async function getHorasDisponibles(oficinaClave: string, servicioClave: string, fecha: string) {
  const API_BASE = await getApiBase();
  const token = getToken();
  const res = await authFetch(
    `${API_BASE}/api/v5/cit_horas_disponibles?fecha=${fecha}&oficina_clave=${oficinaClave}&cit_servicio_clave=${servicioClave}`,
    {
      headers: { 
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) throw new Error("No se pudieron cargar horas disponibles");
  const json = await res.json();
  return Array.isArray(json?.data) ? json.data : json;
}

// --- Obtener citas ---
export async function getCitas(): Promise<Cita[]> {
  const API_BASE = await getApiBase();
  const token = getToken();
  const res = await authFetch(`${API_BASE}/api/v5/cit_citas`, {
    headers: { 
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('No se pudieron cargar citas');
  const json = await res.json();
  return Array.isArray(json?.data) ? json.data : json;
}

// --- Crear cita ---
export async function createCita(cita: CrearCitaRequest): Promise<Cita> {
  const API_BASE = await getApiBase();
  const token = getToken();
  const res = await authFetch(`${API_BASE}/api/v5/cit_citas/crear`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(cita),
  });
  let data: any = {};
  try {
    data = await res.json();
  } catch (e) {
    console.error('Error parseando respuesta de createCita:', e);
  }
  if (!res.ok || data?.success === false || !data?.data) {
    console.error('Error en createCita:', data);
    throw new Error(data?.message || 'No se pudo crear la cita');
  }
  return data.data as Cita;
}

// --- Cancelar cita ---
export async function cancelarCita(citaId: string): Promise<Cita> {
  const API_BASE = await getApiBase();
  const res = await authFetch(`${API_BASE}/api/v5/cit_citas/cancelar?cit_cita_id=${citaId}`, {
    method: 'PATCH',
  });
  const data = await res.json();
  // Lanzar error solo si la respuesta falla
  if (!res.ok || data.success === false || !data?.data) {
    throw new Error(data?.message || 'No se pudo cancelar la cita');
  }
  return data.data as Cita;
}
