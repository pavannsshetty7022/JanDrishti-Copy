import { Issue } from "./mongooseModels.js";

const mapIssueForController = (issue) => {
  if (!issue) return null;
  const obj = issue.toJSON();
  if (obj.user_id && typeof obj.user_id === "object") {
    const user = obj.user_id;
    return {
      ...obj,
      user_id: user.id,
      full_name: user.full_name,
      phone_number: user.phone_number,
      address: user.address,
      user_type: user.user_type,
      user_type_custom: user.user_type_custom,
      media_paths: JSON.stringify(obj.media_paths || []),
      created_at: obj.createdAt,
      resolved_at: obj.resolved_at
    };
  }
  return {
    ...obj,
    media_paths: JSON.stringify(obj.media_paths || []),
    created_at: obj.createdAt,
    resolved_at: obj.resolved_at
  };
};

export const createIssue = async (issueData) => {
  const {
    issueId,
    userId,
    title,
    description,
    location,
    latitude,
    longitude,
    dateOfOccurrence,
    mediaPaths
  } = issueData;

  const issue = await Issue.create({
    issue_id: issueId,
    user_id: userId,
    title,
    description,
    location,
    latitude: latitude || null,
    longitude: longitude || null,
    date_of_occurrence: dateOfOccurrence,
    media_paths: JSON.parse(mediaPaths || "[]"),
    status: "OPEN"
  });

  return issue.id;
};

export const findIssueById = async (id) => {
  const issue = await Issue.findById(id).populate("user_id");
  return mapIssueForController(issue);
};

export const findIssuesByUserId = async (userId) => {
  const issues = await Issue.find({ user_id: userId }).sort({ createdAt: -1 });
  return issues.map(issue => mapIssueForController(issue));
};

export const findIssueByIssueIdAndUserId = async (issueId, userId) => {
  const issue = await Issue.findOne({ issue_id: issueId, user_id: userId });
  return mapIssueForController(issue);
};

export const updateIssue = async (id, issueData) => {
  const {
    title,
    description,
    location,
    latitude,
    longitude,
    dateOfOccurrence,
    allMediaPaths
  } = issueData;

  await Issue.findByIdAndUpdate(id, {
    title,
    description,
    location,
    latitude: latitude || null,
    longitude: longitude || null,
    date_of_occurrence: dateOfOccurrence,
    media_paths: JSON.parse(allMediaPaths || "[]")
  });
};

export const deleteIssue = async (id) => {
  await Issue.findByIdAndDelete(id);
};

export const findAllIssues = async (status, search) => {
  let query = {};

  if (status) {
    query.status = status;
  }

  if (search) {
    query.$or = [
      { issue_id: { $regex: search, $options: "i" } },
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } }
    ];
  }

  const issues = await Issue.find(query).populate("user_id").sort({ createdAt: -1 });
  return issues.map(issue => mapIssueForController(issue));
};

export const updateIssueStatus = async (id, status, resolvedAt) => {
  await Issue.findByIdAndUpdate(id, {
    status: status,
    resolved_at: resolvedAt
  });
};

export const getIssueStatusAndUserId = async (id) => {
  const issue = await Issue.findById(id).select("issue_id status user_id media_paths");
  if (!issue) return null;
  const obj = issue.toJSON();
  return {
    ...obj,
    media_paths: JSON.stringify(obj.media_paths || [])
  };
};
