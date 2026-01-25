import issueModel from "../models/issueModel.js";

export const createIssue = async (req, res) => {
  const { title, description, location, dateOfOccurrence, latitude, longitude } = req.body;
  const userId = req.user.id;

  const mediaPaths = req.files?.length
    ? JSON.stringify(req.files.map(file => file.path))
    : "[]";

  const issueId = `JDR-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.random().toString(36).substring(2,6).toUpperCase()}`;

  if (!title || !description || !location || !dateOfOccurrence) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    const insertId = await issueModel.createIssue({
      issueId,
      userId,
      title,
      description,
      location,
      latitude,
      longitude,
      dateOfOccurrence,
      mediaPaths
    });

    const newIssue = await issueModel.findIssueById(insertId);

    newIssue.media_paths = JSON.parse(newIssue.media_paths || "[]");

    req.io?.emit("new_issue", newIssue);

    res.status(201).json({
      message: "Issue reported successfully",
      issue: newIssue
    });

  } catch (err) {
    console.error("Create issue error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserIssues = async (req, res) => {
  const userId = req.user.id;

  try {
    const rows = await issueModel.findIssuesByUserId(userId);

    const parsed = rows.map(issue => ({
      ...issue,
      media_paths: JSON.parse(issue.media_paths || "[]")
    }));

    res.json(parsed);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const searchIssue = async (req, res) => {
  const { issueId } = req.params;
  const userId = req.user.id;

  try {
    const issue = await issueModel.findIssueByIssueIdAndUserId(issueId, userId);

    if (!issue) return res.status(404).json({ message: "Issue not found" });

    issue.media_paths = JSON.parse(issue.media_paths || "[]");

    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateIssue = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { title, description, location, dateOfOccurrence, latitude, longitude } = req.body;

  const newMedia = req.files?.length
    ? req.files.map(file => file.path)
    : [];

  try {
    const issue = await issueModel.getIssueStatusAndUserId(id);

    if (!issue) return res.status(404).json({ message: "Issue not found" });

    if (issue.user_id !== userId) return res.status(403).json({ message: "Unauthorized" });

    if (issue.status !== "OPEN") return res.status(400).json({ message: "Only OPEN issues editable" });

    const existingMedia = JSON.parse(issue.media_paths || "[]");

    const allMedia = JSON.stringify([...existingMedia, ...newMedia]);

    await issueModel.updateIssue(id, {
      title,
      description,
      location,
      latitude,
      longitude,
      dateOfOccurrence,
      allMediaPaths: allMedia
    });

    res.json({ message: "Issue updated successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteIssue = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const issue = await issueModel.getIssueStatusAndUserId(id);

    if (!issue) return res.status(404).json({ message: "Issue not found" });

    if (issue.user_id !== userId) return res.status(403).json({ message: "Unauthorized" });

    if (issue.status !== "OPEN") return res.status(400).json({ message: "Only OPEN issues deletable" });

    await issueModel.deleteIssue(id);

    res.json({ message: "Issue deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllIssues = async (req, res) => {
  const { status, search } = req.query;

  try {
    const rows = await issueModel.findAllIssues(status, search);

    const parsed = rows.map(issue => ({
      ...issue,
      media_paths: JSON.parse(issue.media_paths || "[]")
    }));

    res.json(parsed);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getIssueById = async (req, res) => {
  const { id } = req.params;

  try {
    const issue = await issueModel.findIssueById(id);

    if (!issue) return res.status(404).json({ message: "Issue not found" });

    issue.media_paths = JSON.parse(issue.media_paths || "[]");

    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateIssueStatus = async (req, res) => {
  const { id } = req.params;
  const status = req.body.status?.toUpperCase();

  const allowed = ["OPEN", "PENDING", "RESOLVED", "REJECTED"];
  if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });

  try {
    await issueModel.updateIssueStatus(id, status, status === "RESOLVED" ? new Date() : null);

    const updated = await issueModel.findIssueById(id);
    updated.media_paths = JSON.parse(updated.media_paths || "[]");

    req.io?.emit("status_updated", updated);

    res.json({ message: "Status updated", issue: updated });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};