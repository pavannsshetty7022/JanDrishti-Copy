import api from './api';

const reportIssue = async (issueData, mediaFiles, token) => {
  const formData = new FormData();
  for (const key in issueData) {
    formData.append(key, issueData[key]);
  }
  if (mediaFiles && mediaFiles.length > 0) {
    mediaFiles.forEach((file) => {
      formData.append('media', file);
    });
  }

  return api.post('/issues', formData, token, true);
};

const getUserIssues = async (userId, token) => {
  return api.get(`/issues/user/${userId}`, token);
};

const searchUserIssue = async (issueId, token) => {
  return api.get(`/issues/search/${issueId}`, token);
};

const editIssue = async (issueId, issueData, newMediaFiles, existingMediaPaths, token) => {
  const formData = new FormData();
  for (const key in issueData) {
    formData.append(key, issueData[key]);
  }

  if (newMediaFiles && newMediaFiles.length > 0) {
    newMediaFiles.forEach((file) => {
      formData.append('newMedia', file);
    });
  }

  if (existingMediaPaths && existingMediaPaths.length > 0) {
    formData.append('existingMedia', JSON.stringify(existingMediaPaths));
  } else {
    formData.append('existingMedia', '[]');
  }

  return api.put(`/issues/${issueId}`, formData, token, true);
};

const deleteIssue = async (issueId, token) => {
  return api.delete(`/issues/${issueId}`, token);
};

const IssueService = {
  reportIssue,
  getUserIssues,
  searchUserIssue,
  editIssue,
  deleteIssue
};

export default IssueService;