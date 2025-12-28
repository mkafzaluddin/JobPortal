import sql from "mssql";
import { connectDB } from "../db.js";

export const requireAdmin = async (req, res, next) => {
    try {
        const user = req.user;

        if (!user || user.RoleID !== 1) {
            return res.status(403).json({ message: "Access denied. Admin only." });
        }

        next();
    } catch (error) {
        console.error("Admin Auth Error:", error);
        res.status(500).json({ error: "Server error" });
    }
};

export const getAdminStats = async (req, res) => {
    try {
        const pool = await connectDB();

        const totalUsers = await pool.request().query`
            SELECT COUNT(*) AS count FROM Users
        `;

        const totalEmployers = await pool.request().query`
            SELECT COUNT(*) AS count FROM Users WHERE RoleID = 3
        `;

        const totalEmployees = await pool.request().query`
            SELECT COUNT(*) AS count FROM Users WHERE RoleID = 2
        `;

        const totalJobs = await pool.request().query`
            SELECT COUNT(*) AS count FROM JobListing
        `;

        const totalApplications = await pool.request().query`
            SELECT COUNT(*) AS count FROM JobApplications
        `;

        const openJobs = await pool.request().query`
            SELECT COUNT(*) AS count 
            FROM JobListing
            WHERE ClosingDate >= CAST(GETDATE() AS DATE)
        `;

        const closedJobs = await pool.request().query`
            SELECT COUNT(*) AS count 
            FROM JobListing
            WHERE ClosingDate < CAST(GETDATE() AS DATE)
        `;

        return res.json({
            totalUsers: totalUsers.recordset[0].count,
            totalEmployers: totalEmployers.recordset[0].count,
            totalEmployees: totalEmployees.recordset[0].count,
            totalJobs: totalJobs.recordset[0].count,
            totalApplications: totalApplications.recordset[0].count,
            jobsOpen: openJobs.recordset[0].count,
            jobsClosed: closedJobs.recordset[0].count,
        });

    } catch (err) {
        console.error("Admin Stats Error:", err);
        return res.status(500).json({ message: "Failed to fetch admin stats" });
    }
};

export const getAllEmployers = async (req, res) => {
    try {
        const pool = await connectDB();

        const result = await pool.request().query(`
            SELECT UserID, FullName, Email, CreatedAt
            FROM Users
            WHERE RoleID = 3
            ORDER BY CreatedAt DESC
        `);

        res.json(result.recordset);
    } catch (error) {
        console.error("getAllEmployers Error:", error);
        res.status(500).json({ error: "Server error" });
    }
};

export const getAllEmployees = async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query(`
            SELECT UserID, FullName, Email, CreatedAt
            FROM Users
            WHERE RoleID = 2
            ORDER BY CreatedAt DESC
        `);

        res.json(result.recordset);
    } catch (error) {
        console.error("getAllEmployees Error:", error);
        res.status(500).json({ error: "Server error" });
    }
};

export const getAllJobs = async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query(`
            SELECT j.*, u.FullName AS EmployerName
            FROM JobListing j
            INNER JOIN Users u ON j.EmployerID = u.UserID
            ORDER BY j.CreatedAt DESC
        `);

        res.json(result.recordset);
    } catch (error) {
        console.error("getAllJobs Error:", error);
        res.status(500).json({ error: "Server error" });
    }
};

export const getAllApplications = async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query(`
            SELECT a.*, j.Position, u.FullName AS EmployeeName
            FROM JobApplications a
            INNER JOIN JobListing j ON a.JobID = j.JobID
            INNER JOIN Users u ON a.EmployeeID = u.UserID
            ORDER BY a.AppliedAt DESC
        `);

        res.json(result.recordset);
    } catch (error) {
        console.error("getAllApplications Error:", error);
        res.status(500).json({ error: "Server error" });
    }
};

export const updateApplicationStatus = async (req, res) => {
    try {
        const { ApplicationID } = req.params;
        const { Status } = req.body;

        const pool = await connectDB(); await pool.request()
            .input("Status", sql.NVarChar, Status)
            .input("ApplicationID", sql.Int, ApplicationID)
            .query(`
                UPDATE JobApplications
                SET Status = @Status, UpdatedAt = GETDATE()
                WHERE ApplicationID = @ApplicationID
        `);

        res.json({ message: "Status updated successfully" });
    } catch (error) {
        console.error("updateApplicationStatus Error:", error);
        res.status(500).json({ error: "Server error" });
    }
};

export const getNewestJobs = async (req, res) => {
    try {
        const pool = await connectDB();

        const result = await pool.request().query(`
      SELECT TOP 5 
        j.JobID,
        j.Position,
        j.Location,
        j.CreatedAt,
        u.FullName AS EmployerName
      FROM JobListing j
      INNER JOIN Users u ON j.EmployerID = u.UserID
      ORDER BY j.CreatedAt DESC
    `);

        res.json(result.recordset);
    } catch (err) {
        console.error("Error fetching newest jobs:", err);
        res.status(500).json({ message: "Failed to fetch newest jobs" });
    }
};

export const getRecentApplications = async (req, res) => {
    try {
        const pool = await connectDB();

        const result = await pool.request().query(`
      SELECT TOP 5 
        a.ApplicationID,
        a.FullName,
        a.Email,
        a.Status,
        a.AppliedAt,
        j.Position
      FROM JobApplications a
      INNER JOIN JobListing j ON a.JobID = j.JobID
      ORDER BY a.AppliedAt DESC
    `);

        res.json(result.recordset);
    } catch (err) {
        console.error("Error fetching recent applications:", err);
        res.status(500).json({ message: "Failed to fetch recent applications" });
    }
};

