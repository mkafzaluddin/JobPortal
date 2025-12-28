import sql from 'mssql';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import dbConfig from '../db.js';

dotenv.config();

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.UserID,
      roleId: user.RoleID,
      email: user.Email,
    },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );
};

export const registerUser = async (req, res) => {
  const { name, email, password, roleId } = req.body;

  try {
    const pool = await sql.connect(dbConfig);

    const existingUser = await pool
      .request()
      .input('Email', sql.NVarChar, email)
      .query('SELECT * FROM Users WHERE Email = @Email');

    if (existingUser.recordset.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool
      .request()
      .input('FullName', sql.NVarChar, name)
      .input('Email', sql.NVarChar, email)
      .input('PasswordHash', sql.NVarChar, hashedPassword)
      .input('RoleID', sql.Int, roleId)
      .query(
        `INSERT INTO Users (FullName, Email, PasswordHash, RoleID)
         VALUES (@FullName, @Email, @PasswordHash, @RoleID)`
      );

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const registerAdmin = async (req, res) => {
  req.body.roleId = 1;
  return registerUser(req, res);
};

export const registerEmployee = async (req, res) => {
  req.body.roleId = 2;
  return registerUser(req, res);
};

export const registerEmployer = async (req, res) => {
  req.body.roleId = 3;
  return registerUser(req, res);
};

const loginByRole = async (req, res, expectedRoleId) => {
  const { email, password } = req.body;

  try {
    const pool = await sql.connect(dbConfig);

    const result = await pool
      .request()
      .input('Email', sql.NVarChar, email)
      .query('SELECT * FROM Users WHERE Email = @Email');

    const user = result.recordset[0];
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.PasswordHash);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    if (user.RoleID !== expectedRoleId) {
      return res.status(403).json({ message: 'Unauthorized role for this login route' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.UserID,
        name: user.FullName,
        email: user.Email,
        roleId: user.RoleID,
      },
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const loginAdmin = (req, res) => loginByRole(req, res, 1);
export const loginEmployee = (req, res) => loginByRole(req, res, 2);
export const loginEmployer = (req, res) => loginByRole(req, res, 3);
