import express from 'express';
import {
  registerAdmin,
  registerEmployee,
  registerEmployer,
  loginAdmin,
  loginEmployee,
  loginEmployer,
} from '../controllers/userController.js';

const router = express.Router();

router.post('/register/admin', registerAdmin);
router.post('/register/employee', registerEmployee);
router.post('/register/employer', registerEmployer);

router.post('/login/admin', loginAdmin);
router.post('/login/employee', loginEmployee);
router.post('/login/employer', loginEmployer);

export default router;
