import express from "express";
import {
  createJob,
  getJobsByEmployer,
  getJobById,
  updateJob,
  deleteJob,
  getClosedJobs,
  closeJob,
  reopenJob,
  getAllApplications,
  getApplicationsByJob,
  getApplicationDetails,
  updateApplicationStatus,

} from "../controllers/employerController.js";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyToken, authorizeRoles(3));

router.get("/jobs", getJobsByEmployer);
router.get("/jobs/closed", getClosedJobs);
router.get("/jobs/:id", getJobById);
router.post("/create-job", createJob);
router.put("/jobs/:id", updateJob);
router.delete("/jobs/:id", deleteJob);
router.patch("/jobs/:id/close", closeJob);
router.patch("/jobs/:id/reopen", reopenJob);

router.get("/applications", getAllApplications);
router.get("/applications/job/:jobId", getApplicationsByJob);
router.get("/applications/:applicationId", getApplicationDetails);
router.patch("/applications/:applicationId/status", updateApplicationStatus);

export default router;
