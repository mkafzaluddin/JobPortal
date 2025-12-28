import sql from 'mssql';
import bcrypt from 'bcryptjs';

export const createUser = async (fullName, email, password, roleId) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const pool = await sql.connect();
  const result = await pool.request()
    .input('FullName', sql.NVarChar, fullName)
    .input('Email', sql.NVarChar, email)
    .input('PasswordHash', sql.NVarChar, hashedPassword)
    .input('RoleID', sql.Int, roleId)
    .query(`
      INSERT INTO Users (FullName, Email, PasswordHash, RoleID)
      VALUES (@FullName, @Email, @PasswordHash, @RoleID)
    `);

  return result.rowsAffected[0] > 0;
};

export const findUserByEmail = async (email) => {
  const pool = await sql.connect();
  const result = await pool.request()
    .input('Email', sql.NVarChar, email)
    .query('SELECT * FROM Users WHERE Email = @Email');
  return result.recordset[0];
};
