// Frontend API wrapper for StylU/Outfit Court
// Handles fetch calls with error handling and credentials

const API_BASE = window.location.origin;

class StyluAPI {
  constructor() {
    this.baseURL = `${API_BASE}/api`;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const headers = { ...options.headers };
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    } else {
      delete headers['Content-Type'];
    }

    const config = {
      credentials: 'include', // Send cookies for session
      headers,
      ...options
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Trials
  async submitTrial(formData) {
    return this.request('/trials', {
      method: 'POST',
      body: formData
    });
  }

  async getTrial(trialId) {
    return this.request(`/trials/${trialId}`);
  }

  async getMyCases(limit = 20, offset = 0) {
    return this.request(`/trials?mine=1&limit=${limit}&offset=${offset}`);
  }

  async deleteTrial(trialId) {
    return this.request(`/trials/${trialId}`, {
      method: 'DELETE'
    });
  }

  async appealTrial(trialId) {
    return this.request(`/trials/${trialId}/appeal`, {
      method: 'POST'
    });
  }

  // Judges
  async getJudges() {
    return this.request('/judges');
  }

  // Dresscodes
  async getDresscodes() {
    return this.request('/dresscodes');
  }

  // Settings
  async getSettings() {
    return this.request('/settings');
  }

  async updateSettings(settings) {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }

  // Lucky Wheel
  async getWeekPlan() {
    return this.request('/wheel/week-plan');
  }

  async spinWheel(dayIndex) {
    return this.request('/wheel/spin', {
      method: 'POST',
      body: JSON.stringify({ day_index: dayIndex })
    });
  }

  async autoGenerateWeek() {
    return this.request('/wheel/auto-week', {
      method: 'POST'
    });
  }

  // Helper for error display
  formatError(error) {
    if (error.message.includes('Failed to fetch')) {
      return 'CONNECTION ERROR // SERVER OFFLINE';
    }
    if (error.message.includes('rate limit')) {
      return 'RATE LIMIT EXCEEDED // SLOW DOWN';
    }
    return `ERROR: ${error.message.toUpperCase()}`;
  }
}

// Create global API instance
window.StyluAPI = new StyluAPI();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StyluAPI;
}
