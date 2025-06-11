import React, { useEffect, useState } from "react";
import axios from "axios";
import { useToast } from '../employee/ui/ToastContainer';

const LeavePolicyManager = () => {
  const [leavePolicies, setLeavePolicies] = useState([]);
  const [originalPolicies, setOriginalPolicies] = useState([]); // Last saved snapshot
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/leavepolicyDM/LeavePolicy");
        setLeavePolicies(res.data);
        setOriginalPolicies(JSON.parse(JSON.stringify(res.data)));
      } catch (err) {
        console.error("Failed to fetch leave policies:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPolicies();
  }, []);

  // Update handler to handle both value and max
  const handleChange = (designationIndex, leaveIndex, field, newValue) => {
    const updated = [...leavePolicies];
    updated[designationIndex].leaves[leaveIndex][field] = parseInt(newValue, 10) || 0;
    setLeavePolicies(updated);
  };

  // Compare changes for both value and max fields
  const getChanges = () => {
    const changes = [];

    leavePolicies.forEach((currentDesignation, i) => {
      const originalDesignation = originalPolicies[i];
      let changedLeaves = [];

      currentDesignation.leaves.forEach((currentLeave, j) => {
        const originalLeave = originalDesignation.leaves[j];

        // Check if value or max changed
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
      console.log("Changes to save:", changes);

      if (changes.length === 0) {
        showToast("No changes to save.", 'success');
        setSaving(false);
        return;
      }

      await axios.put("http://localhost:8080/api/leavepolicyDM/LeavePolicy", changes);
      showToast("Leave policies updated successfully.", 'success');
      setOriginalPolicies(JSON.parse(JSON.stringify(leavePolicies)));
    } catch (err) {
      showToast("Error updating leave policies.", 'error');
      console.error(err);
    }
    setSaving(false);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500 text-lg">Loading leave policies...</div>
      </div>
    );

  const isChanged = JSON.stringify(leavePolicies) !== JSON.stringify(originalPolicies);

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white rounded-lg shadow-md">
      <div className="overflow-x-auto border rounded-md shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100 text-gray-600 uppercase h-10 tracking-wide">
            <tr>
              <th>Designation</th>
              {leavePolicies[0]?.leaves.map((leave) => (
                <th key={leave.leave_type_id} colSpan={2} className="text-center border-l border-gray-300">
                  {leave.type}
                </th>
              ))}
            </tr>
            <tr>
              <th></th>
              {leavePolicies[0]?.leaves.map((leave) => (
                <React.Fragment key={leave.leave_type_id}>
                  <th className="text-sm font-normal text-gray-600 border-l border-gray-300">MONTH</th>
                  <th className="text-sm font-normal text-gray-600">YEAR</th>
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
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 border-l border-gray-300">
                      <input
                        type="number"
                        min="0"
                        value={leave.value}
                        onChange={(e) => handleChange(i, j, "value", e.target.value)}
                        className="w-10 px-1 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                      <input
                        type="number"
                        min="0"
                        value={leave.max}
                        onChange={(e) => handleChange(i, j, "max", e.target.value)}
                        className="w-10 px-1 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </td>
                  </React.Fragment>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  
      <div className="mt-8 flex justify-end space-x-4">
        <button
          onClick={isChanged && !saving ? () => setLeavePolicies(JSON.parse(JSON.stringify(originalPolicies))) : undefined}
          aria-disabled={!isChanged || saving}
          tabIndex={isChanged && !saving ? 0 : -1}
          className={`inline-flex items-center px-6 py-2 border border-gray-300 text-sm font-semibold rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
            ${(!isChanged || saving) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          Undo Changes
        </button>
  
        <button
          onClick={handleSave}
          disabled={!isChanged || saving}
          className={`inline-flex items-center px-6 py-2 border border-transparent text-sm font-semibold rounded-md shadow-sm text-white ${
            saving ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
  
};

export default LeavePolicyManager;
