import sql from "mssql";
import { connectDB } from "../db.js";

export const createJob = async (req, res) => {
  try {
    const pool = await connectDB();
    const {
      position,
      description,
      location,
      employmentType,
      experienceLevel,
      salaryMin,
      salaryMax,
      openingDate,
      closingDate,
      skillsRequired,
    } = req.body;

    if (
      !position ||
      !description ||
      !location ||
      !employmentType ||
      !salaryMin ||
      !salaryMax ||
      !openingDate ||
      !closingDate
    ) {
      return res.status(400).json({ message: "All required fields must be provided." });
    }

    if (salaryMin >= salaryMax) {
      return res.status(400).json({ message: "SalaryMax must be greater than SalaryMin." });
    }

    const open = new Date(openingDate);
    const close = new Date(closingDate);
    if (close < open) {
      return res.status(400).json({ message: "Closing date cannot be earlier than opening date." });
    }

    const employerId = req.user?.userId;
    if (!employerId) {
      return res.status(401).json({ message: "Unauthorized: Employer not found." });
    }

    const query = `
      INSERT INTO JobListing (
        EmployerID, Position, Description, Location, EmploymentType,
        ExperienceLevel, SalaryMin, SalaryMax, OpeningDate, ClosingDate,
        SkillsRequired, CreatedAt, IsActive
      )
      VALUES (
        @EmployerID, @Position, @Description, @Location, @EmploymentType,
        @ExperienceLevel, @SalaryMin, @SalaryMax, @OpeningDate, @ClosingDate,
        @SkillsRequired, GETDATE(), 1
      )
    `;

    const request = pool.request();
    request.input("EmployerID", sql.Int, employerId);
    request.input("Position", sql.NVarChar(100), position);
    request.input("Description", sql.NVarChar(sql.MAX), description);
    request.input("Location", sql.NVarChar(100), location);
    request.input("EmploymentType", sql.NVarChar(50), employmentType);
    request.input("ExperienceLevel", sql.NVarChar(50), experienceLevel);
    request.input("SalaryMin", sql.Int, salaryMin);
    request.input("SalaryMax", sql.Int, salaryMax);
    request.input("OpeningDate", sql.Date, openingDate);
    request.input("ClosingDate", sql.Date, closingDate);
    request.input("SkillsRequired", sql.NVarChar(sql.MAX), skillsRequired);

    await request.query(query);
    res.status(201).json({ message: "Job listing created successfully." });
  } catch (err) {
    console.error("Error creating job:", err);
    res.status(500).json({ message: "Server error while creating job.", error: err.message });
  }
};

export const getJobsByEmployer = async (req, res) => {
  try {
    const employerId = req.user?.userId;
    const pool = await connectDB();

    const result = await pool
      .request()
      .input("EmployerID", sql.Int, employerId)
      .query(`
        SELECT * FROM JobListing
        WHERE EmployerID = @EmployerID
        ORDER BY CreatedAt DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching jobs:", err);
    res.status(500).json({ message: "Failed to fetch jobs." });
  }
};


export const getClosedJobs = async (req, res) => {
  try {
    const employerId = req.user?.userId;
    const pool = await connectDB();

    const result = await pool
      .request()
      .input("EmployerID", sql.Int, employerId)
      .query(`
        SELECT * FROM JobListing
        WHERE EmployerID = @EmployerID
          AND IsActive = 0
        ORDER BY CreatedAt DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching closed jobs:", err);
    res.status(500).json({ message: "Failed to fetch closed jobs" });
  }
};



export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const employerId = req.user?.userId;

    const pool = await connectDB();
    const result = await pool
      .request()
      .input("JobID", sql.Int, id)
      .input("EmployerID", sql.Int, employerId)
      .query("SELECT * FROM JobListing WHERE JobID = @JobID AND EmployerID = @EmployerID");

    if (result.recordset.length === 0)
      return res.status(404).json({ message: "Job not found or unauthorized." });

    res.json(result.recordset[0]);
  } catch (err) {
    console.error("Error fetching job:", err);
    res.status(500).json({ message: "Failed to fetch job details." });
  }
};

export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const employerId = req.user?.userId;
    const updates = req.body;

    if (Object.keys(updates).length === 0)
      return res.status(400).json({ message: "At least one field must be updated." });

    if (updates.salaryMin && updates.salaryMax && updates.salaryMin >= updates.salaryMax)
      return res.status(400).json({ message: "SalaryMax must be greater than SalaryMin." });

    if (updates.openingDate && updates.closingDate) {
      const open = new Date(updates.openingDate);
      const close = new Date(updates.closingDate);
      if (close < open)
        return res.status(400).json({ message: "Closing date cannot be earlier than opening date." });
    }

    const keyMap = {
      position: "Position",
      description: "Description",
      location: "Location",
      employmentType: "EmploymentType",
      experienceLevel: "ExperienceLevel",
      salaryMin: "SalaryMin",
      salaryMax: "SalaryMax",
      openingDate: "OpeningDate",
      closingDate: "ClosingDate",
      skillsRequired: "SkillsRequired",
    };

    const fields = Object.keys(updates)
      .map((key) => `${keyMap[key] || key} = @${key}`)
      .join(", ");

    const pool = await connectDB();
    const request = pool.request();
    request.input("JobID", sql.Int, id);
    request.input("EmployerID", sql.Int, employerId);

    for (const [key, value] of Object.entries(updates)) {
      if (key.toLowerCase().includes("salary")) {
        request.input(key, sql.Int, parseInt(value));
      } else if (key.toLowerCase().includes("date")) {
        request.input(key, sql.Date, new Date(value));
      } else {
        request.input(key, sql.NVarChar(sql.MAX), value);
      }
    }

    const query = `
      UPDATE JobListing
      SET ${fields}
      WHERE JobID = @JobID AND EmployerID = @EmployerID
    `;

    const result = await request.query(query);

    if (result.rowsAffected[0] === 0)
      return res.status(404).json({ message: "Job not found or unauthorized." });

    res.json({ message: "Job updated successfully." });
  } catch (err) {
    console.error("Error updating job:", err);
    res.status(500).json({ message: "Failed to update job.", error: err.message });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const employerId = req.user?.userId;

    const pool = await connectDB();
    const result = await pool
      .request()
      .input("JobID", sql.Int, id)
      .input("EmployerID", sql.Int, employerId)
      .query("DELETE FROM JobListing WHERE JobID = @JobID AND EmployerID = @EmployerID");

    if (result.rowsAffected[0] === 0)
      return res.status(404).json({ message: "Job not found or unauthorized." });

    res.json({ message: "Job deleted successfully." });
  } catch (err) {
    console.error("Error deleting job:", err);
    res.status(500).json({ message: "Failed to delete job." });
  }
};

export const closeJob = async (req, res) => {
  try {
    const { id } = req.params;
    const employerId = req.user?.userId;

    const pool = await connectDB();
    const result = await pool
      .request()
      .input("JobID", sql.Int, id)
      .input("EmployerID", sql.Int, employerId)
      .query(`
        UPDATE JobListing
        SET IsActive = 0
        WHERE JobID = @JobID AND EmployerID = @EmployerID
      `);

    if (result.rowsAffected[0] === 0)
      return res.status(404).json({ message: "Job not found or unauthorized." });

    res.json({ message: "Job closed successfully." });
  } catch (err) {
    console.error("Error closing job:", err);
    res.status(500).json({ message: "Failed to close job." });
  }
};

export const reopenJob = async (req, res) => {
  try {
    const { id } = req.params;
    const employerId = req.user?.userId;

    const pool = await connectDB();
    const result = await pool
      .request()
      .input("JobID", sql.Int, id)
      .input("EmployerID", sql.Int, employerId)
      .query(`
        UPDATE JobListing
        SET IsActive = 1
        WHERE JobID = @JobID AND EmployerID = @EmployerID
      `);

    if (result.rowsAffected[0] === 0)
      return res.status(404).json({ message: "Job not found or unauthorized." });

    res.json({ message: "Job reopened successfully." });
  } catch (err) {
    console.error("Error reopening job:", err);
    res.status(500).json({ message: "Failed to reopen job." });
  }
};

export const getAllApplications = async (req, res) => {
  try {
    const employerId = req.user?.userId;
    const pool = await connectDB();

    const query = `
      SELECT 
        a.ApplicationID, a.JobID, a.EmployeeID,
        a.FullName, a.Email, a.PhoneNumber, a.City,
        a.ResumeURL, a.CoverLetter, a.Status,
        a.AppliedAt, a.UpdatedAt,
        j.Position, j.Location
      FROM JobApplications a
      INNER JOIN JobListing j ON a.JobID = j.JobID
      WHERE j.EmployerID = @EmployerID
      ORDER BY a.AppliedAt DESC
    `;

    const result = await pool
      .request()
      .input("EmployerID", sql.Int, employerId)
      .query(query);

    const formatted = result.recordset.map(r => ({
      ...r,
      AppliedAt: r.AppliedAt ? new Date(r.AppliedAt).toISOString() : null,
      UpdatedAt: r.UpdatedAt ? new Date(r.UpdatedAt).toISOString() : null,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching all applications:", err);
    res.status(500).json({ message: "Failed to fetch applications." });
  }
};

export const getApplicationsByJob = async (req, res) => {
  try {
    const employerId = req.user?.userId;
    const { jobId } = req.params;

    const pool = await connectDB();

    const query = `
      SELECT 
        a.ApplicationID, a.JobID, a.EmployeeID,
        a.FullName, a.Email, a.PhoneNumber, a.City,
        a.ResumeURL, a.CoverLetter, a.Status,
        a.AppliedAt, a.UpdatedAt
      FROM JobApplications a
      INNER JOIN JobListing j ON a.JobID = j.JobID
      WHERE a.JobID = @JobID AND j.EmployerID = @EmployerID
      ORDER BY a.AppliedAt DESC
    `;

    const result = await pool
      .request()
      .input("JobID", sql.Int, jobId)
      .input("EmployerID", sql.Int, employerId)
      .query(query);

    const formatted = result.recordset.map(r => ({
      ...r,
      AppliedAt: r.AppliedAt ? new Date(r.AppliedAt).toISOString() : null,
      UpdatedAt: r.UpdatedAt ? new Date(r.UpdatedAt).toISOString() : null,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching applications by job:", err);
    res.status(500).json({ message: "Failed to fetch job applications." });
  }
};

export const getApplicationDetails = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const employerId = req.user?.userId;

    const pool = await connectDB();

    const query = `
      SELECT 
        a.*, 
        j.Position, j.Location, j.EmploymentType
      FROM JobApplications a
      INNER JOIN JobListing j ON a.JobID = j.JobID
      WHERE a.ApplicationID = @ApplicationID
        AND j.EmployerID = @EmployerID
    `;

    const result = await pool
      .request()
      .input("ApplicationID", sql.Int, applicationId)
      .input("EmployerID", sql.Int, employerId)
      .query(query);

    if (result.recordset.length === 0)
      return res.status(404).json({ message: "Application not found or unauthorized." });

    res.json(result.recordset[0]);
  } catch (err) {
    console.error("Error fetching application details:", err);
    res.status(500).json({ message: "Failed to fetch application details." });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;
    const employerId = req.user?.userId;

    const allowed = ["Pending", "Reviewed", "Shortlisted", "Rejected", "Hired"];
    if (!allowed.includes(status))
      return res.status(400).json({ message: "Invalid status value." });

    const pool = await connectDB();

    const query = `
      UPDATE a
      SET Status = @Status, UpdatedAt = GETDATE()
      FROM JobApplications a
      INNER JOIN JobListing j ON a.JobID = j.JobID
      WHERE a.ApplicationID = @ApplicationID
        AND j.EmployerID = @EmployerID
    `;

    const result = await pool
      .request()
      .input("Status", sql.NVarChar(20), status)
      .input("ApplicationID", sql.Int, applicationId)
      .input("EmployerID", sql.Int, employerId)
      .query(query);

    if (result.rowsAffected[0] === 0)
      return res.status(404).json({ message: "Application not found or unauthorized." });

    res.json({ message: "Application status updated successfully." });
  } catch (err) {
    console.error("Error updating application status:", err);
    res.status(500).json({ message: "Failed to update application status." });
  }

};
