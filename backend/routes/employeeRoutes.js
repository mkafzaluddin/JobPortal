import express from "express";
import {
  getAllJobs,
  applyToJob,
  getMyApplications,
  deleteApplication,
} from "../controllers/employeeController.js";

import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";
import upload, { uploadResumeToCloudinary } from "../middleware/resumeUpload.js";

const router = express.Router();

router.use(verifyToken, authorizeRoles(2));

router.get("/jobs", getAllJobs);

router.post(
  "/apply/:jobId",
  upload.single("resume"),
  async (req, res, next) => {
    console.log("📤 Uploaded file:", req.file);

    const url = await uploadResumeToCloudinary(req.file);
    console.log("Cloudinary URL:", url);

    req.resumeUrl = url;
    next();
  },
  applyToJob
);

router.get("/applications", getMyApplications);

router.delete("/applications/:id", deleteApplication);

export default router;
