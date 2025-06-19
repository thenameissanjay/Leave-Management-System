// const conn = require('./connection');
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const { AppDataSource } = require('./config/connection');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const designationRoutes = require('./routes/designationRoutes');
const leaveLevelRoutes = require('./routes/leaveLevelRoutes');
const leaveTypeRoutes = require('./routes/leavetypeRoutes');
const leavePolicyRouteDM = require('./routes/leavePolicyRoutesDM');
const { MonthlyAccrual } = require('./utils/monthlyAccrual');
const { carryForwardLeaveBalance } = require('./utils/NextYearCarryFwd');
const logger = require('./logger/logger');

const { adminAuth, employeeAuth } = require('./JWT/verify');

const app = express();
app.use(express.json());
app.use(cors());

AppDataSource.initialize()
  .then(() => {
    console.log('DB connected successfully');

    // Login
    app.use('/api/auth', authRoutes);

    // Admin
    app.use('/api/admin', adminRoutes);
    app.use('/api/designation', adminAuth, designationRoutes);
    app.use('/api/leave-level', adminAuth, leaveLevelRoutes);
    app.use('/api/leave-type', adminAuth, leaveTypeRoutes);
    app.use('/api/leave-policy', leavePolicyRouteDM);

    // Employee
    app.use('/api/employee', employeeAuth, employeeRoutes);
    app.use('/api/leave', leaveRoutes);

    app.use((err, req, res, next) => {
      if (err && err.error && err.error.isJoi) {
        return res.status(408).json({
          type: err.type,
          message: err.error.details[0].message,
        });
      }
      res.status(500).json({
        message: 'Internal Server Error',
      });
    });

    app.listen(8080, () => {
      console.log('Server running ...');
    });
    // Monthly Accural
    cron.schedule('0 0 1 * *', async () => {
      await MonthlyAccrual();
    });
    // Yearly Carry Forward
    cron.schedule('0 0 1 1 *', async () => {
      await carryForwardLeaveBalance();
    });
  })
  .catch((err) => {
    console.error('Error initializing DB:', err);
  });
