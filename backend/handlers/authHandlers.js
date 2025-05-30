const {AppDataSource} = require('../connection')
const {adminToken , employeeToken} = require('../JWT/create')
const repo = AppDataSource.getRepository("employee");
const CryptoJS = require("crypto-js");
const bcrypt = require('bcryptjs');
const { decryptFunction } = require('../function/decrypt');
const { hashGenerate } = require('../function/hashPassword');
require('dotenv').config();


const createPassword  = async (req, res) => {
  const { encryptedPassword, id, email } = req.body;
  
  try {
     
    if (!email || !encryptedPassword || !id) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const employee = await repo.findOne({
      where: {
        employee_id: id,
        email: email,
        password: "" 
      }
    });

    if (!employee) {
      return res.status(404).json({
        error: 'Employee not found or password already set'
      });
    }
   const decryptedPassword = decryptFunction(encryptedPassword);
   const hashedPassword =  await hashGenerate(decryptedPassword);
   

   employee.password = hashedPassword;
   await repo.save(employee);

    res.json({
      success: true,
      message: 'Password created successfully'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
  }

const employeeLogin = async (req, res) => {
    const { email, encryptedPassword } = req.body;
    if (!email || !encryptedPassword) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }
  
    try {

      const decryptedPassword = decryptFunction(encryptedPassword);
      const employee = await repo.findOne({ where: { email } });
      const isMatch = await bcrypt.compare( decryptedPassword, employee.password);

      if (!employee || !isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
      }
  
      const token = employeeToken();  // token = employee
  
      res.json({
        success: true,
        employeeId: employee.employee_id,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        designation: employee.designation,
        level: employee.level,
        date_of_joining: employee.date_of_joining,
        sick: employee.sick,
        casual: employee.casual,
        others: employee.others,
        reporting_to: employee.reporting_to,
        access_token: token,
        message: 'Login successful'
      });
  
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

const adminLogin = (req, res)=>{
  const { role } = req.body;
  if (!role) {
    return res.status(400).json({
      success: false,
      error: 'Role is required'
    });
  }

  const token = adminToken();  // toke = admin
  res.json({ access_token: token });
}

module.exports = {
    createPassword,
    employeeLogin,
    adminLogin
}
