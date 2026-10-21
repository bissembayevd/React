// All application data comes from FastAPI. Static form choices are not records.
export const PLAYER_ROLES = ['AWPer', 'Rifler', 'Entry Fragger', 'Support', 'IGL'];

export class ApiError extends Error {
  constructor(message, code, status = 0, details = []) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

function baseUrl() {
  // The process fallback allows Node integration tests to use isolated test servers.
  const configured = import.meta.env?.VITE_API_BASE_URL ?? globalThis.process?.env?.VITE_API_BASE_URL ?? '';
  return configured.replace(/\/+$/, '');
}

async function request(path, { signal, method = 'GET', body } = {}) {
  let response;
  try {
    response = await fetch(baseUrl() + '/api' + path, {
      method, signal,
      ...(body !== undefined ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError('Cannot reach the server. Check that the backend is running and try again.', 'NETWORK_ERROR');
  }
  let data;
  try { data = await response.json(); }
  catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError('The server returned an invalid response.', 'INVALID_RESPONSE', response.status);
  }
  if (!response.ok) {
    const detail = data.detail;
    const message = typeof detail === 'string' ? detail : detail?.message;
    throw new ApiError(message || 'The request failed. Please try again.', detail?.code || 'HTTP_ERROR', response.status, detail?.errors || []);
  }
  return data;
}

function getById(collection, id, options) {
  if (typeof id !== 'string' || !id.trim()) return Promise.reject(new ApiError('ID must be a non-empty string.', 'INVALID_ID'));
  return request('/' + collection + '/' + encodeURIComponent(id), options);
}

export const getPlayers = (options) => request('/players', options);
export const getPlayerById = (id, options) => getById('players', id, options);
export const addPlayer = (playerData, options) => request('/players', { ...options, method: 'POST', body: playerData });
export const getTeams = (options) => request('/teams', options);
export const getTeamById = (id, options) => getById('teams', id, options);
export const getNews = (options) => request('/news', options);
export const getNewsById = (id, options) => getById('news', id, options);
export const getMatches = (options) => request('/matches', options);
export const getMatchById = (id, options) => getById('matches', id, options);
export const getTournaments = (options) => request('/tournaments', options);
export const getTournamentById = (id, options) => getById('tournaments', id, options);
