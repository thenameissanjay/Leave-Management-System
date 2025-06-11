import React from 'react';
import DesignationManagement  from './Designation';
import LeaveLevelManager  from './LeaveLevel';
import LeaveTypeManagement from './LeaveType';
import LeavePolicyDM from './LeavePolicyDM';

const LeavePolicy = () => {

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <LeavePolicyDM/>

      <div className='flex flex-row'>
      <div >
      <DesignationManagement/>

      </div>
      <div >
      <LeaveTypeManagement/>

      </div>


      </div>
    
     <LeaveLevelManager/>
    </div>
  );
};

export default LeavePolicy;