import sql from "mssql";
import { connectDB } from "../db.js";


export const getAllJobs = async (req, res) => {
  try {
    const pool = await connectDB();
    const employeeId = req.user?.userId;

    const query = `
      SELECT 
        j.JobID, j.Position, j.Description, j.Location,
        j.SalaryMin, j.SalaryMax, j.EmploymentType, 
        j.ExperienceLevel, j.OpeningDate, j.ClosingDate,
        j.SkillsRequired, j.CreatedAt, j.IsActive,
        a.ApplicationID, a.Status AS ApplicationStatus
      FROM JobListing j
      LEFT JOIN JobApplications a 
        ON j.JobID = a.JobID AND a.EmployeeID = @EmployeeID
      WHERE j.IsActive = 1
      ORDER BY j.CreatedAt DESC;
    `;

    const result = await pool
      .request()
      .input("EmployeeID", sql.Int, employeeId)
      .query(query);

    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching jobs:", err);
    res.status(500).json({ message: "Error fetching jobs.", error: err.message });
  }
};


export const applyToJob = async (req, res) => {
  try {
    const JobID = parseInt(req.params.jobId);
    const EmployeeID = req.user?.userId;

    const { FullName, Email, PhoneNumber, City, CoverLetter } = req.body;

    if (!req.file) {
      console.error("No file uploaded");
      return res.status(400).json({
        message: "Resume is required. Please upload a PDF, DOC, or DOCX file."
      });
    }

    const ResumeURL = req.resumeUrl;

    if (!ResumeURL) {
      console.error("Cloudinary upload failed - no URL");
      return res.status(400).json({
        message: "Resume upload failed. Please try again."
      });
    }

    if (!FullName?.trim() || !Email?.trim()) {
      return res.status(400).json({
        message: "Full Name and Email are required."
      });
    }


    const pool = await connectDB();

    const checkQuery = `
      SELECT ApplicationID FROM JobApplications 
      WHERE JobID = @JobID AND EmployeeID = @EmployeeID
    `;

    const existingApp = await pool.request()
      .input("JobID", sql.Int, JobID)
      .input("EmployeeID", sql.Int, EmployeeID)
      .query(checkQuery);

    if (existingApp.recordset.length > 0) {
      return res.status(400).json({
        message: "You have already applied to this job."
      });
    }

    const insertQuery = `
      INSERT INTO JobApplications 
      (JobID, EmployeeID, FullName, Email, PhoneNumber, City, ResumeURL, CoverLetter, Status)
      VALUES 
      (@JobID, @EmployeeID, @FullName, @Email, @PhoneNumber, @City, @ResumeURL, @CoverLetter, 'Pending')
    `;

    await pool.request()
      .input("JobID", sql.Int, JobID)
      .input("EmployeeID", sql.Int, EmployeeID)
      .input("FullName", sql.NVarChar(150), FullName || '')
      .input("Email", sql.NVarChar(150), Email || '')
      .input("PhoneNumber", sql.NVarChar(20), PhoneNumber || '')
      .input("City", sql.NVarChar(100), City || '')
      .input("ResumeURL", sql.NVarChar(700), ResumeURL)
      .input("CoverLetter", sql.NVarChar(sql.MAX), CoverLetter || '')
      .query(insertQuery);


    res.json({
      message: "Application submitted successfully.",
      resumeUrl: ResumeURL
    });

  } catch (err) {
    return res.status(500).json({
      message: "Error submitting application. Please try again.",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};





export const getMyApplications = async (req, res) => {
  try {
    const EmployeeID = req.user?.userId;

    const pool = await connectDB();

    const query = `
      SELECT 
        a.*,
        j.Position, j.Location, j.EmploymentType,  j.ExperienceLevel,
        j.SalaryMin, j.SalaryMax
      FROM JobApplications a
      INNER JOIN JobListing j ON a.JobID = j.JobID
      WHERE a.EmployeeID = @EmployeeID
      ORDER BY a.AppliedAt DESC;
    `;

    const result = await pool
      .request()
      .input("EmployeeID", sql.Int, EmployeeID)
      .query(query);

    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching applications:", err);
    res.status(500).json({ message: "Error fetching your applications.", error: err.message });
  }
};



export const deleteApplication = async (req, res) => {
  try {
    const ApplicationID = req.params.id;
    const EmployeeID = req.user?.userId;

    const pool = await connectDB();

    const query = `
      DELETE FROM JobApplications
      WHERE ApplicationID = @ApplicationID
        AND EmployeeID = @EmployeeID
    `;

    const result = await pool
      .request()
      .input("ApplicationID", sql.Int, ApplicationID)
      .input("EmployeeID", sql.Int, EmployeeID)
      .query(query);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Application not found or unauthorized." });
    }

    res.json({ message: "Application withdrawn successfully." });
  } catch (err) {
    console.error("Error deleting application:", err);
    res.status(500).json({ message: "Error withdrawing application.", error: err.message });
  }
};
