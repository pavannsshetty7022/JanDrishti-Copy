const API_URL = 'https://jandrishti-community-issue-tracker.onrender.com/api';

const fetchWithTimeout = (url, options = {}, timeout = 15000) =>
  Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), timeout)
    )
  ]);

const login = async (username, password) => {
  const response = await fetchWithTimeout(`${API_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Admin login failed');
  return data;
};

const getAllIssues = async (token, statusFilter = '', searchQuery = '') => {
  let url = `${API_URL}/issues`;
  const params = new URLSearchParams();

  if (statusFilter) params.append('status', statusFilter);
  if (searchQuery) params.append('search', searchQuery);
  if (params.toString()) url += `?${params.toString()}`;

  const response = await fetchWithTimeout(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch issues');
  return data;
};

const getIssueById = async (id, token) => {
  const response = await fetchWithTimeout(`${API_URL}/admin/get-single-issue/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch issue');
  return data;
};

const updateIssueStatus = async (issueId, status, token) => {
  const response = await fetchWithTimeout(`${API_URL}/issues/${issueId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update status');
  return data;
};

export default {
  login,
  getAllIssues,
  getIssueById,
  updateIssueStatus
};
