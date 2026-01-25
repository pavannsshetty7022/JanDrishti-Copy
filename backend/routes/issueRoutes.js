import express from "express";
import {
  createIssue,
  getUserIssues,
  searchIssue,
  updateIssue,
  deleteIssue,
  getAllIssues,
  getIssueById,
  updateIssueStatus
} from "../controllers/issueController.js";

import { authenticateToken, authorizeAdmin } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.post("/", authenticateToken, upload.array("media", 10), createIssue);

router.get("/user/:userId", authenticateToken, getUserIssues);

router.get("/search/:issueId", authenticateToken, searchIssue);

router.put("/:id", authenticateToken, upload.array("media", 10), updateIssue);

router.delete("/:id", authenticateToken, deleteIssue);

router.get("/", authenticateToken, authorizeAdmin, getAllIssues);

router.get("/:id", authenticateToken, authorizeAdmin, getIssueById);

router.put("/:id/status", authenticateToken, authorizeAdmin, updateIssueStatus);

export default router;
