const jwt = require('jsonwebtoken');
require('dotenv').config();

const employeeToken = () => {
  const token = jwt.sign(
    { role: process.env.EMPLOYEE_ROLE },
    process.env.SECRETKEY,
    { expiresIn: '1h' }
  );
  return token;
};

const adminToken = () => {
  const token = jwt.sign(
    { role: process.env.ADMIN_ROLE },
    process.env.SECRETKEY,
    { expiresIn: '1h' }
  );
  return token;
};

module.exports = { employeeToken, adminToken };
