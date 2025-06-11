import React, { useEffect, useContext } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CreateEmployee from './admin/CreateEmployee';
import ViewEmployee from './admin/ViewEmployee';
import UpdateEmployee from './admin/UpdateEmployee';
import LeavePolicy from './admin/LeavePolicy';
import axios from 'axios';
import { AuthContext } from './Context/AuthContext';

import Layout from './Layout/Layout';
import LoginPage from './Authethicate/Login';
import Admin from './admin/admin';
import Employee from './employee/employee';
import RequestForm from './employee/RequestForm';
import RequestStatus from './employee/RequestStatus';
import IncomingRequest from './employee/IncomingRequest';
import ViewLeavePolicy from './employee/LeavePolicy';

const App = () => {

  const {user} = useContext(AuthContext);
  axios.defaults.headers.common['Authorization'] = `Bearer ${user.access_token}`;
  axios.defaults.headers.common['Role'] = ` ${user.role}`; // admin or employee


  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/" element={<Layout />}>
            <Route path="/Admin" element={<Admin />} />
            <Route path="/Employee" element={<Employee />} />
            <Route path="/CreateEmployee" element={<CreateEmployee />} />
            <Route path="/ViewEmployee" element={<ViewEmployee />} />
            <Route path="/UpdateEmployee/:id" element={<UpdateEmployee />} />
            <Route path="/LeavePolicy" element={<LeavePolicy />} />
            <Route path="/RequestForm" element={<RequestForm />} />
            <Route path="/RequestStatus" element={<RequestStatus />} />
            <Route path="/IncomingRequest" element={<IncomingRequest />} />
            <Route path="/ViewLeavePolicy" element={<ViewLeavePolicy />} />

          </Route>
        </Routes>
      </BrowserRouter>
  );
};

export default App;
