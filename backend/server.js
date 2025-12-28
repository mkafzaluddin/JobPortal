import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import sql from 'mssql';
import dbConfig from './db.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import employerRoutes from './routes/employerRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import cloudinary from "./config/cloudinary.js";
import downloadRoute from "./routes/downloadRoutes.js";
import protectedRoutes from './routes/protectedRoutes.js';
import cron from "node-cron"; 

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

sql.connect(dbConfig)
  .then(() => console.log('Connected to SQL Server!'))
  .catch(err => console.error('Database connection failed:', err));

app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/employer', employerRoutes);
app.use('/api/employee', employeeRoutes);
app.use("/download", downloadRoute);
app.use('/api/protected', protectedRoutes);


// CRON JOB – Auto Close Jobs (every minute)

cron.schedule("*/1 * * * *", async () => {
  try {
    console.log("⏳ Running auto-close job task...");

    const query = `
      UPDATE JobListing
      SET IsActive = 0
      WHERE IsActive = 1 AND ClosingDate < CAST(GETDATE() AS DATE);
    `;

    await sql.query(query);

    console.log("✔ Auto-close job task completed!");
  } catch (err) {
    console.error("❌ Auto-close job error:", err);
  }
});

app.get('/', (req, res) => {
  res.send('Job Portal API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

cloudinary.api.ping()
  .then(() => console.log("Cloudinary connected!"))
  .catch(err => console.error("Cloudinary error:", err));
