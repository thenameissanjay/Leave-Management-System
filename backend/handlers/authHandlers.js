const { AppDataSource } = require('../config/connection');
const { adminToken, employeeToken } = require('../JWT/create');
const repo = AppDataSource.getRepository('employee');
const CryptoJS = require('crypto-js');
const bcrypt = require('bcryptjs');
const { decryptFunction } = require('../utils/decrypt');
const { hashGenerate } = require('../utils/hashPassword');
const logger = require('../logger/logger');

require('dotenv').config();

/**Create New Employee Password
 * POST 
 * /api/auth/password
 * req.body = 
 * {
  "id": 1,
  "email": "sanjay@gmail.com",
  "encryptedPassword": "U2FsdGVkX18eLalVZFiduBLFUDsRxYeVMWVI2dCrSKY="  // sanjay123
   }
 * 
 */
const createPassword = async (req, res) => {
  const { encryptedPassword, id, email } = req.body;

  try {
    const employee = await repo.findOne({
      where: {
        employee_id: id,
        email: email,
        password: '',
      },
    });

    if (!employee) {
      logger.error(`/authHandler/createPassword: Employee not found`);
      return res.status(404).json({
        message: 'Employee not found or password already set',
      });
    }
    // decrypting password using crypto JS
    const decryptedPassword = decryptFunction(encryptedPassword); // sanjay123
    // hashing using bcrypt
    const hashedPassword = await hashGenerate(decryptedPassword); // $10$gBDg44jVdWNoWlq.GjJLLOpyLqwDd4Z0x/ABmIb9uPLLlnkvVMI8i

    employee.password = hashedPassword;
    // stored hashed password
    await repo.save(employee);

    res.json({
      success: true,
      message: 'Password created successfully',
    });
  } catch (err) {
    logger.error(`/authHandler/createPassword: ${err}`);
    res.status(500).json({ message: 'Database error' });
  }
};

/** Checking Employee Login
 * POST 
 * /api/auth/employee-login
 * req.body = 
 * {
  "email": "sanjay@gmail.com",
  "encryptedPassword": "U2FsdGVkX18eLalVZFiduBLFUDsRxYeVMWVI2dCrSKY="  // sanjay123
   }
 * 
 */

const employeeLogin = async (req, res) => {
  const { email, encryptedPassword } = req.body;

  try {
    // decrypting password using crypto JS
    const decryptedPassword = decryptFunction(encryptedPassword); // sanjay123
    const employee = await repo.findOne({
      where: {
        email,
        isAdmin: 0,
      },
    });
    // matching sanjay123 with DB hashed Password
    const isMatch = await bcrypt.compare(decryptedPassword, employee.password);

    if (!employee || !isMatch) {
      logger.error(`/authHandler/employeeLogin: Invalid email or password`);

      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    //  Generating JWT Token "role:employee"
    const token = employeeToken();
    // sending to employee login page
    res.json({
      employeeId: employee.employee_id,
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      designation: employee.designation,
      date_of_joining: employee.date_of_joining,
      reporting_to: employee.reporting_to,
      access_token: token, // JWT Token
    });
  } catch (err) {
    logger.error(`/authHandler/employeeLogin: ${err}`);
    res.status(500).json({
      message: 'Invalid Credentials',
    });
  }
};

/** Generating Admin JWT Token 
 * POST
 * /api/auth/admin-login'
 * req.body = 
 * {
  "email": "admin@gmail.com",
  "encryptedPassword": "U2FsdGVkX18uFtqcAH3JebCU7/FefRGxjDXF3IOZMiA="
}
 * 
 */
const adminLogin = async (req, res) => {
  const { email, encryptedPassword } = req.body;

  try {
    const decryptedPassword = decryptFunction(encryptedPassword); // admin
    const admin = await repo.findOne({
      where: {
        email,
        isAdmin: 1,
      },
    });
    const isMatch = await bcrypt.compare(decryptedPassword, admin.password);

    if (!admin || !isMatch) {
      logger.error(`/authHandler/admin-login: Invalid email or password`);

      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    // Generatign JWT Token
    const token = adminToken();
    res.json({ access_token: token });
  } catch (err) {
    logger.error(`/authHandler/employeeLogin: ${err}`);
    res.status(500).json({
      message: 'Invalid Credentials',
    });
  }
};

module.exports = {
  createPassword,
  employeeLogin,
  adminLogin,
};
