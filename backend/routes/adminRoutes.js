import express from "express";
import {
  requireAdmin,
  getAdminStats,
  getAllEmployers,
  getAllEmployees,
  getAllJobs,
  getAllApplications,
  updateApplicationStatus,
  getNewestJobs,
  getRecentApplications
} from "../controllers/adminController.js";

import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";
const router = express.Router();

router.use(verifyToken, authorizeRoles(1));

router.get("/stats", getAdminStats);
router.get("/employers", getAllEmployers);
router.get("/employees", getAllEmployees);
router.get("/jobs", getAllJobs);
router.get("/applications", getAllApplications);
router.get("/newest-jobs", getNewestJobs);
router.get("/recent-applications", getRecentApplications);


router.put("/applications/:ApplicationID/status", updateApplicationStatus);

export default router;
