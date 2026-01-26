const API_URL = 'https://jandrishti-community-issue-tracker.onrender.com/api';

const fetchWithTimeout = (url, options = {}, timeout = 15000) =>
  Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), timeout)
    )
  ]);

const handleResponse = async (response) => {
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("janDrishtiUser");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login?expired=true";
      }
    }

    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  return response.json();
};

const api = {
  get: async (endpoint, token) => {
    const response = await fetchWithTimeout(`${API_URL}${endpoint}`, {
      method: "GET",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    return handleResponse(response);
  },

  post: async (endpoint, body, token, isFormData = false) => {
    const headers = {
      Authorization: `Bearer ${token}`
    };

    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetchWithTimeout(`${API_URL}${endpoint}`, {
      method: "POST",
      credentials: "include",
      headers,
      body: isFormData ? body : JSON.stringify(body)
    });

    return handleResponse(response);
  },

  put: async (endpoint, body, token, isFormData = false) => {
    const headers = {
      Authorization: `Bearer ${token}`
    };

    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetchWithTimeout(`${API_URL}${endpoint}`, {
      method: "PUT",
      credentials: "include",
      headers,
      body: isFormData ? body : JSON.stringify(body)
    });

    return handleResponse(response);
  },

  delete: async (endpoint, token) => {
    const response = await fetchWithTimeout(`${API_URL}${endpoint}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    return handleResponse(response);
  }
};

export default api;
