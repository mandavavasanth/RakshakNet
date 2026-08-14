const BASE_URL = '';
const API_KEY = 'rashaknet-secret-key-2026';

const authHeaders = {
  'Content-Type': 'application/json',
  'X-API-Key': API_KEY
};

const readHeaders = {
  'Content-Type': 'application/json'
};

async function request(url, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${url}`, options);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn(`API call failed: ${url}`, e.message);
    return null;
  }
}

export const api = {
  // Alerts
  fetchAlerts: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.helpType) params.set('helpType', filters.helpType);
    const qs = params.toString();
    return request(`/api/alerts${qs ? '?' + qs : ''}`, { headers: readHeaders });
  },

  fetchAlert: (id) => request(`/api/alerts/${id}`, { headers: readHeaders }),

  createAlert: (data) => request('/api/alert', {
    method: 'POST', headers: authHeaders, body: JSON.stringify(data)
  }),

  updateAlert: (id, data) => request(`/api/alerts/${id}`, {
    method: 'PATCH', headers: authHeaders, body: JSON.stringify(data)
  }),

  // Teams
  fetchTeams: () => request('/api/teams', { headers: readHeaders }),

  createTeam: (data) => request('/api/teams', {
    method: 'POST', headers: authHeaders, body: JSON.stringify(data)
  }),

  updateTeam: (id, data) => request(`/api/teams/${id}`, {
    method: 'PATCH', headers: authHeaders, body: JSON.stringify(data)
  }),

  // Stats
  fetchStats: () => request('/api/stats', { headers: readHeaders }),

  // Chat
  fetchChatMessages: (channel) => {
    const qs = channel ? `?channel=${channel}` : '';
    return request(`/api/chat/messages${qs}`, { headers: readHeaders });
  },

  sendChatMessage: (data) => request('/api/chat/messages', {
    method: 'POST', headers: authHeaders, body: JSON.stringify(data)
  }),

  // Missions
  fetchMissions: () => request('/api/missions', { headers: readHeaders }),

  // Inventory
  fetchTeamInventory: (teamId) => request(`/api/teams/${teamId}/inventory`, { headers: readHeaders }),
};
