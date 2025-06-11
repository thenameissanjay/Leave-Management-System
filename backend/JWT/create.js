const jwt = require('jsonwebtoken')
require('dotenv').config();

const employeeToken =()=>{
    const token = jwt.sign(
        { role: "employee" },
        process.env.SECRETKEY, 
        { expiresIn: '1h' }
      );
      return token;

}

const adminToken = ()=>{
    const token = jwt.sign(
        { role: "admin" },
        process.env.SECRETKEY, 
        { expiresIn: '1h' }
      );
      return token;
}

module.exports ={ employeeToken, adminToken}