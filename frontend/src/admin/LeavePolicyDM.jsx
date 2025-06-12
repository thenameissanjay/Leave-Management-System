import React, { useEffect, useState } from "react";
import { useToast } from '../employee/ui/ToastContainer';
import { Save, Undo } from 'lucide-react';
import api from '../utils/BaseUrl';

const LeavePolicyManager = () => {
  const [leavePolicies, setLeavePolicies] = useState([]);
  const [originalPolicies, setOriginalPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const res = await api.get("/api/leave-policy/leave-policy");
        setLeavePolicies(res.data);
        setOriginalPolicies(JSON.parse(JSON.stringify(res.data)));
      } catch (err) {
        console.error("Failed to fetch leave policies:", err);
        showToast("Failed to load leave policies", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchPolicies();
  }, []);

  const handleChange = (designationIndex, leaveIndex, field, newValue) => {
    const updated = [...leavePolicies];
    updated[designationIndex].leaves[leaveIndex][field] = parseInt(newValue, 10) || 0;
    setLeavePolicies(updated);
  };

  const getChanges = () => {
    const changes = [];
    leavePolicies.forEach((currentDesignation, i) => {
      const originalDesignation = originalPolicies[i];
      let changedLeaves = [];

      currentDesignation.leaves.forEach((currentLeave, j) => {
        const originalLeave = originalDesignation.leaves[j];
        if (
          currentLeave.value !== originalLeave.value ||
          currentLeave.max !== originalLeave.max
        ) {
          changedLeaves.push({
            leave_type_id: currentLeave.leave_type_id,
            value: currentLeave.value - originalLeave.value,
            max: currentLeave.max - originalLeave.max,
          });
        }
      });

      if (changedLeaves.length > 0) {
        changes.push({
          designation_id: currentDesignation.designation_id,
          leaves: changedLeaves,
        });
      }
    });
    return changes;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const changes = getChanges();
      if (changes.length === 0) {
        showToast("No changes to save", "info");
        setSaving(false);
        return;
      }

      await api.put("/api/leave-policy/leave-policy", changes);
      showToast("Leave policies updated successfully", "success");
      setOriginalPolicies(JSON.parse(JSON.stringify(leavePolicies)));
    } catch (err) {
      showToast("Failed to update leave policies", "error");
      console.error(err);
    }
    setSaving(false);
  };

  const handleReset = () => {
    setLeavePolicies(JSON.parse(JSON.stringify(originalPolicies)));
    showToast("Changes reverted", "info");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-keka-blue"></div>
      </div>
    );
  }

  const isChanged = JSON.stringify(leavePolicies) !== JSON.stringify(originalPolicies);

  return (
    <div className="max-w-4xl">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold text-gray-800">Leave Policy Management</h1>
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              disabled={!isChanged || saving}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border ${
                !isChanged || saving
                  ? "border-gray-200 text-gray-400 cursor-not-allowed"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Undo size={16} />
              Reset Changes
            </button>
            <button
              onClick={handleSave}
              disabled={!isChanged || saving}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border ${
                !isChanged || saving
                  ? "border-gray-200 text-gray-400 cursor-not-allowed"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-xs">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className=" bg-gray-800 rounded-full">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                >
                  Designation
                </th>
                {leavePolicies[0]?.leaves.map((leave) => (
                  <th 
                    key={leave.leave_type_id} 
                    colSpan={2} 
                    className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider border-l border-gray-200"
                  >
                    {leave.type}
                  </th>
                ))}
              </tr>
              <tr>
                <th className="px-6 py-2"></th>
                {leavePolicies[0]?.leaves.map((leave) => (
                  <React.Fragment key={leave.leave_type_id}>
                    <th className="px-4 py-2 text-xs font-normal text-white border-l border-gray-200">
                      Per Month
                    </th>
                    <th className="px-4 py-2 text-xs font-normal text-white">
                      Max Year
                    </th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
  
            <tbody className="bg-white divide-y divide-gray-200">
              {leavePolicies.map((row, i) => (
                <tr key={row.designation_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row.designation}
                  </td>
                  {row.leaves.map((leave, j) => (
                    <React.Fragment key={leave.leave_type_id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 border-l border-gray-200">
                        <div className="flex justify-center">
                          <input
                            type="number"
                            min="0"
                            value={leave.value}
                            onChange={(e) => handleChange(i, j, "value", e.target.value)}
                            className={`w-16 px-2 py-1 border rounded-md text-center ${
                              leave.value !== originalPolicies[i]?.leaves[j]?.value
                                ? "border-keka-blue bg-keka-blue-light bg-opacity-10"
                                : "border-gray-300"
                            } focus:outline-none focus:ring-2 focus:ring-keka-blue`}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        <div className="flex justify-center">
                          <input
                            type="number"
                            min="0"
                            value={leave.max}
                            onChange={(e) => handleChange(i, j, "max", e.target.value)}
                            className={`w-16 px-2 py-1 border rounded-md text-center ${
                              leave.max !== originalPolicies[i]?.leaves[j]?.max
                                ? "border-keka-blue bg-keka-blue-light bg-opacity-10"
                                : "border-gray-300"
                            } focus:outline-none focus:ring-2 focus:ring-keka-blue`}
                          />
                        </div>
                      </td>
                    </React.Fragment>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      
      </div>
    </div>
  );
};

export default LeavePolicyManager;