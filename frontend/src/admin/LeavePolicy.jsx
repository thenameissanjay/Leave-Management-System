import React from 'react';
import DesignationManagement  from './Designation';
import LeaveLevelManager  from './LeaveLevel';
import LeaveTypeManagement from './LeaveType';
import LeavePolicyDM from './LeavePolicyDM';

const LeavePolicy = () => {

  return (
    <div className="">
      <LeavePolicyDM/>

      <div className='flex flex-row max-w-2xl'>
      <div >
      <DesignationManagement/>

      </div>
      <div >
      <LeaveLevelManager/>


      </div>


      </div>
      <LeaveTypeManagement/>

    </div>
  );
};

export default LeavePolicy;