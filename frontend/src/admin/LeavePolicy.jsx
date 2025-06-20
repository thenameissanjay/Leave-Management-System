import React from 'react';
import DesignationManagement from './Designation';
import LeaveLevelManager from './LeaveLevel';
import LeaveTypeManagement from './LeaveType';
import LeavePolicyDM from './LeavePolicyDM';

const LeavePolicy = () => {
  return (
    <div className="pl-12">
      <LeavePolicyDM />

      <div className="flex flex-row min-w-3xl">
        <div>
          <DesignationManagement />
        </div>
        <div>
          <LeaveLevelManager />
        </div>
      </div>
      <LeaveTypeManagement />
    </div>
  );
};

export default LeavePolicy;
