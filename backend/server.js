// const conn = require('./connection');
const express = require('express');
const cors = require('cors');

const {AppDataSource} = require('./connection');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const leavePolicyRoute = require('./routes/leavePolicyRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const designationRoutes  = require('./routes/designationRoutes');
const leaveLevelRoutes  = require('./routes/leaveLevelRoutes');
const leaveTypeRoutes  = require('./routes/leavetypeRoutes');
const leavePolicyRouteDM = require('./routes/leavePolicyRoutesDM');

const {adminAuth, employeeAuth} = require('./JWT/verify');


const app = express();
app.use(express.json());
app.use(cors());

app.use(cors({
    allowedHeaders: ['Authorization', 'Content-Type'],
  }));

AppDataSource.initialize()
  .then(() => { console.log("DB connected successfully");

// Login   
app.use('/api/auth', authRoutes);

// Admin
app.use('/api/admin',adminAuth,  adminRoutes);
app.use('/api/designation', adminAuth,  designationRoutes);
app.use('/api/leavepolicy', adminAuth, leavePolicyRoute);
app.use('/api/leavelevel', adminAuth,  leaveLevelRoutes);
app.use('/api/leavetype', adminAuth, leaveTypeRoutes);
app.use('/api/leavepolicyDM', leavePolicyRouteDM);


// Employee   /api/employee/getIDNameDesg
app.use('/api/employee',employeeAuth, employeeRoutes);
app.use('/api/leave', employeeAuth,leaveRoutes);


  app.listen(8080, () => {
      console.log("Server running on http://localhost:8080");
    });
  })
  .catch((err) => {
    console.error("Error initializing DB:", err);
  });