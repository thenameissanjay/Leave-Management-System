// middleware/verifyToken.js
const jwt = require('jsonwebtoken');
require('dotenv').config();
const adminAuth = (req, res, next) => {
  const authHeader = req.headers['authorization']; // bearer m
  const role = req.headers.role;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access token missing or invalid' });
  }

  const token = authHeader.split(' ')[1];

  try {

    const decoded = jwt.verify(token, process.env.SECRETKEY);
   if(decoded.role == "admin")
    next();
   if(decoded.role != "admin")
   {  
    
    return  res.status(403).json({ message: "admin authorized is need" });
   }
  } catch (err) {

    return res.status(401).json({ message: 'Token verification failed' });
  }
};

const employeeAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];  // bearer Token 
  const role = req.headers.role;  // employee

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access token missing or invalid' });
  }

  const token = authHeader.split(' ')[1];

  try {

    const decoded = jwt.verify(token, process.env.SECRETKEY); 
   if(decoded.role == "employee")
    next();
   if(decoded.role != "employee")
    return res.status(403).json({ message: "employee authorized is need" });


  } catch (err) {

    return res.status(401).json({ message: 'Token verification failed' });
  }
};
  
module.exports = {adminAuth, employeeAuth};
