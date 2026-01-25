import express from "express";
import {
  testConnectivity,
  login,
  createAdmin,
  checkAdmins
} from "../controllers/adminController.js";

import {
  getIssueById
} from "../controllers/issueController.js";

import {
  authenticateToken,
  authorizeAdmin
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/test-connectivity", testConnectivity);
router.post("/login", login);
router.post("/create", createAdmin);
router.get("/check", checkAdmins);

router.get(
  "/get-single-issue/:id",
  authenticateToken,
  authorizeAdmin,
  getIssueById
);

export default router;
