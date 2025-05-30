import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LeaveLevelManager = () => {
  const [rules, setRules] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [newRule, setNewRule] = useState({
    start_count: '',
    end_count: '',
    level_no: '',
    levels: [],
    start_date: '',
    end_date: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [designations, setDesignations] = useState([]);
  const [selectedDesignations, setSelectedDesignations] = useState([]);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/leavelevel/getLeaveLevel');
        setRules(response.data);
      } catch (err) {
        console.error('Error fetching rules:', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchDesignations = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/designation/getDesignationRole');
        if (Array.isArray(res.data)) {
          setDesignations(res.data);
        } else {
          console.error('Expected array but got:', res.data);
          setDesignations([]);
        }
      } catch (err) {
        console.error('Error fetching designation data:', err);
        setDesignations([]);
      }
    };

    fetchRules();
    fetchDesignations();
  }, []);

  const handleEditChange = (index, name, value) => {
    const updated = [...rules];
    updated[index][name] = value;
    setRules(updated);
  };

  const handleSave = async (index) => {
    const rule = rules[index];
    try {
      await axios.put(`http://localhost:8080/api/leavelevel/updateLeaveLevel/${rule.leave_level_id}`, rule);
      setEditIndex(null);
      alert('Rule updated successfully!');
    } catch (err) {
      console.error('Error saving rule:', err);
      alert('Failed to update rule');
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this rule?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:8080/api/leavelevel/deleteLeaveLevel/${id}`);
      setRules(rules.filter(rule => rule.leave_level_id !== id));
      alert('Rule deleted successfully!');
    } catch (err) {
      console.error('Error deleting rule:', err);
      alert('Failed to delete rule');
    }
  };

  const handleCreate = async () => {
    const { start_count, end_count, level_no, levels, start_date, end_date } = newRule;
    if (!start_count || !end_count || !level_no || !start_date || !end_date) {
      alert('Please fill all required fields');
      return;
    }

    // Prepare payload
    const payload = {
      start_count,
      end_count,
      level_no,
      start_date,
      end_date,
    };

    // Dynamically assign levels
    levels.forEach((value, index) => {
      payload[`level_${index + 1}`] = value;
    });

    try {
      const response = await axios.post('http://localhost:8080/api/leavelevel/createLeaveLevel', payload);
      setRules([...rules, response.data]);
      setNewRule({
        start_count: '',
        end_count: '',
        level_no: '',
        levels: [],
        start_date: '',
        end_date: '',
      });
      alert('Rule created successfully!');
    } catch (err) {
      console.error('Error creating rule:', err);
      alert('Failed to create rule');
    }
  };

  const handleLevelNoChange = (value) => {
    setNewRule(prev => ({
      ...prev,
      level_no: value,
      levels: Array.from({ length: value }, () => '')
    }));
  };

  const handleLevelChange = (index, value) => {
    const updatedLevels = [...newRule.levels];
    updatedLevels[index] = value;
    setNewRule(prev => ({
      ...prev,
      levels: updatedLevels
    }));
  };

  const handleDesignationChange = (levelIndex, value) => {
    const updatedLevels = [...newRule.levels];
    updatedLevels[levelIndex] = value;
    setNewRule(prev => ({
      ...prev,
      levels: updatedLevels
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
    {/* View and Edit Existing Rules */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rules.map((rule, index) => (
     <div
      key={rule.leave_level_id}
      className="bg-white shadow-lg rounded-lg p-4 space-y-4 text-sm break-words"
     >
      <div className="space-y-4">
        {/* Start and End Count */}
        <div className="flex flex-row gap-3 flex-wrap">
          <div className="flex flex-col flex-1 min-w-0">
            <label className="text-xs font-medium text-gray-700">Start Count</label>
            <input
              className="mt-1 border p-2 rounded-md w-full text-sm"
              type="number"
              value={rule.start_count}
              onChange={(e) => handleEditChange(index, 'start_count', e.target.value)}
              disabled={editIndex !== index}
            />
          </div>

          <div className="flex flex-col flex-1 min-w-0">
            <label className="text-xs font-medium text-gray-700">End Count</label>
            <input
              className="mt-1 border p-2 rounded-md w-full text-sm"
              type="number"
              value={rule.end_count}
              onChange={(e) => handleEditChange(index, 'end_count', e.target.value)}
              disabled={editIndex !== index}
            />
          </div>
        </div>

        {/* Level No */}
        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-xs font-medium text-gray-700">Level of Order</label>
          <select
            className="border p-2 rounded-md text-sm"
            value={rule.level_no}
            onChange={(e) => handleEditChange(index, 'level_no', e.target.value)}
            disabled={editIndex !== index}
          >
            {[1, 2, 3].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        {/* Levels */}
        <div className="flex flex-col gap-3 border rounded-md p-3">
          {/* Levels */}
<div className="flex flex-col gap-3 border rounded-md p-3">
  {[1, 2, 3].map((levelNum) => (
    <div key={`level-${levelNum}`} className="flex flex-col">
      <label className="text-xs font-medium text-gray-700 mb-1">{`Level ${levelNum}`}</label>
      {levelNum <= rule.level_no ? (
        <select
          className="border p-2 rounded-md text-sm"
          value={rule[`level_${levelNum}`]}
          onChange={(e) => handleEditChange(index, `level_${levelNum}`, e.target.value)}
          disabled={editIndex !== index}
        >
          {designations.map((designation) => (
            <option key={designation.id} value={designation.id}>
              {designation.name}
            </option>
          ))}
        </select>
      ) : (
        <div className="border p-2 rounded-md text-sm bg-gray-100 text-gray-400 cursor-not-allowed">
          — No Level —
        </div>
      )}
    </div>
  ))}
</div>

        </div>

        {/* Dates */}
        <div className="flex flex-row gap-3 flex-wrap">
          <div className="flex flex-col flex-1 min-w-0">
            <label className="text-xs font-medium text-gray-700">Start Date</label>
            <input
              className="mt-1 border p-2 rounded-md w-full text-sm"
              type="date"
              value={rule.start_date}
              onChange={(e) => handleEditChange(index, 'start_date', e.target.value)}
              disabled={editIndex !== index}
            />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <label className="text-xs font-medium text-gray-700">End Date</label>
            <input
              className="mt-1 border p-2 rounded-md w-full text-sm"
              type="date"
              value={rule.end_date}
              onChange={(e) => handleEditChange(index, 'end_date', e.target.value)}
              disabled={editIndex !== index}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center space-x-3 pt-2 flex-wrap">
          {editIndex === index ? (
            <>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-md text-sm"
                onClick={() => handleSave(index)}
              >
                Save
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-md text-sm"
                onClick={() => window.location.reload()}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                className="bg-yellow-500 text-white px-4 py-2 rounded-md text-sm"
                onClick={() => setEditIndex(index)}
              >
                Edit
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-md text-sm"
                onClick={() => handleDelete(rule.leave_level_id)}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  ))}
</div>

      {/* Create New Rule Section */}
      <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
    Create Rule
         </h2>  
               <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Count */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">Start Count</label>
              <input
                className="mt-2 border p-2 rounded-md"
                type="number"
                value={newRule.start_count}
                onChange={(e) => setNewRule({ ...newRule, start_count: e.target.value })}
              />
            </div>

            {/* End Count */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">End Count</label>
              <input
                className="mt-2 border p-2 rounded-md"
                type="number"
                value={newRule.end_count}
                onChange={(e) => setNewRule({ ...newRule, end_count: e.target.value })}
              />
            </div>
          </div>

          {/* Level No */}
          <div className="flex justify-center items-center gap-4 my-4">
            <label className="text-sm font-medium text-gray-700">Level of Order</label>
            <select
              className="border p-2 rounded-md w-40"
              value={newRule.level_no}
              onChange={(e) => handleLevelNoChange(e.target.value)}
            >
             <option value="NULL">SELECT</option>

              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </div>

          {/* Levels */}
          <div
            className={`grid grid-cols-${newRule.level_no} gap-2 border rounded-md p-4`}
          >
            {/* First Row - Labels */}
            {Array.from({ length: newRule.level_no }).map((_, levelIndex) => (
              <div key={`label-${levelIndex}`} className="flex justify-center">
                <label className="text-sm font-medium text-gray-700">{`Level ${levelIndex + 1}`}</label>
              </div>
            ))}

            {/* Second Row - Dropdowns */}
            {Array.from({ length: newRule.level_no }).map((_, levelIndex) => (
  <div key={`select-${levelIndex}`} className="flex justify-center">
    <select
      className="mt-2 border p-2 rounded-md"
      value={newRule.levels[levelIndex] || "select"}  // Default to "select"
      onChange={(e) => handleLevelChange(levelIndex, e.target.value)}
    >
      <option value="select" disabled>Select</option> {/* Disabled 'Select' option */}
      {designations.map((designation) => (
        <option key={designation.id} value={designation.id}>
          {designation.name}
        </option>
      ))}
    </select>
  </div>
))}

          </div>

          {/* Start and End Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">Start Date</label>
              <input
                className="mt-2 border p-2 rounded-md"
                type="date"
                value={newRule.start_date}
                onChange={(e) => setNewRule({ ...newRule, start_date: e.target.value })}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">End Date</label>
              <input
                className="mt-2 border p-2 rounded-md"
                type="date"
                value={newRule.end_date}
                onChange={(e) => setNewRule({ ...newRule, end_date: e.target.value })}
              />
            </div>
          </div>

          {/* Create Button */}
          <div className="flex justify-center pt-4">
            <button
              className="bg-blue-500 text-white px-6 py-2 rounded-md"
              onClick={handleCreate}
            >
              Create Rule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveLevelManager;
