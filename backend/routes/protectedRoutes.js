import express from 'express';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin-only route
router.get('/admin/dashboard', verifyToken, authorizeRoles(1), (req, res) => {
  res.json({
    message: 'Welcome, Admin! You have full access to the system.',
    user: req.user
  });
});

// Employer-only route
router.get('/employer/jobs', verifyToken, authorizeRoles(3), (req, res) => {
  res.json({
    message: 'Welcome, Employer! You can manage your job postings here.',
    user: req.user
  });
});

// Employee-only route
router.get('/employee/profile', verifyToken, authorizeRoles(2), (req, res) => {
  res.json({
    message: 'Welcome, Employee! You can view and update your profile here.',
    user: req.user
  });
});

export default router;
