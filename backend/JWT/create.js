const jwt = require('jsonwebtoken');
require('dotenv').config();

// generate Employee Token
const employeeToken = () => {
  const token = jwt.sign(
    { role: process.env.EMPLOYEE_ROLE }, // "employee"
    process.env.SECRETKEY, // "MyScreatkey"
    { expiresIn: '1h' } // time-expired
  );
  return token;
};

// generate Admin Token
const adminToken = () => {
  const token = jwt.sign(
    { role: process.env.ADMIN_ROLE }, // "admin"
    process.env.SECRETKEY, // "MyScreateKey"
    { expiresIn: '1h' } // "time-expired"
  );
  return token;
};

module.exports = { employeeToken, adminToken };
