import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pencil, Trash2, Save } from 'lucide-react';
import { useToast } from '../employee/ui/ToastContainer';

const LeaveTypeManagement = () => {
  const [leaveType, setLeaveType] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [oldLeaveType, setOldLeaveType] = useState(null);
  const { showToast } = useToast();

  const [newLeaveType, setNewLeaveType] = useState({
    name: '',
    description: '',
    yearAccrual: false,
    monthAccrual: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaveType = async () => {
      try {
        const response = await axios.get(
          'http://localhost:8080/api/leave-type/leave-type'
        );
        setLeaveType(response.data);
      } catch (err) {
        const message = err.response?.data?.message;
        if (err.response?.status === 403)
          showToast(message || 'You are not authorized', 'error');
        else if (err.response?.status === 401)
          showToast(message || 'Session expired', 'error');
        else showToast('Unexpected error occurred', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaveType();
  }, []);

  const handleEditChange = (index, name, value) => {
    const updated = [...leaveType];
    updated[index][name] = value;
    setLeaveType(updated);
  };

  const handleSave = async (index) => {
    const updatedLeaveType = leaveType[index];
    const payload = {
      name: updatedLeaveType.name,
      description: updatedLeaveType.description,
      yearAccrual: updatedLeaveType.yearAccrual,
      monthAccrual: updatedLeaveType.monthAccrual,
    };

    try {
      await axios.put(
        `http://localhost:8080/api/leave-type/leave-type/${updatedLeaveType.id}`,
        payload
      );
      setEditIndex(null);
      setOldLeaveType(null);
      showToast('Leave Type updated successfully!', 'success');
    } catch (err) {
      console.error('Save error:', err);
      console.log(err);
      showToast('Failed to update Leave Type', 'error');
    }
  };

  const handleDelete = async (id) => {
    console.log(id);
    if (!window.confirm('Are you sure you want to delete this Leave Type?'))
      return;

    try {
      await axios.delete(`http://localhost:8080/api/leave-type/leave-type/${id}`);
      setLeaveType(leaveType.filter((lt) => lt.id !== id));
      showToast('Leave Type deleted successfully!', 'success');
    } catch (err) {
      console.error('Delete error:', err);
      showToast('Failed to delete Leave Type', 'error');
    }
  };

  const handleCreate = async () => {
    if (!newLeaveType.name) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    try {
      await axios.post(
        'http://localhost:8080/api/leave-type/leave-type',
        newLeaveType
      );
      setLeaveType([...leaveType, newLeaveType]);
      setNewLeaveType({
        name: '',
        description: '',
        yearAccrual: false,
        monthAccrual: false,
      });
      showToast('Leave Type created successfully!', 'success');
    } catch (err) {
      console.error('Create error:', err);
      showToast('Failed to create Leave Type', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          LeaveType Management
        </h1>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase tracking-wide">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-left">monthAccrual</th>

                <th className="p-3 text-left">yearAccrual</th>

                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaveType.length > 0 ? (
                leaveType.map((item, index) => (
                  <tr key={item.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">
                      <input
                        value={item.name}
                        readOnly={editIndex !== index}
                        onChange={(e) =>
                          handleEditChange(index, 'name', e.target.value)
                        }
                        className={`w-full px-2 py-1 rounded ${
                          editIndex === index
                            ? 'border border-gray-300'
                            : 'bg-transparent'
                        }`}
                      />
                    </td>
                    <td className="p-3">
                      <input
                        value={item.description}
                        readOnly={editIndex !== index}
                        onChange={(e) =>
                          handleEditChange(index, 'description', e.target.value)
                        }
                        className={`w-full px-2 py-1 rounded ${
                          editIndex === index
                            ? 'border border-gray-300'
                            : 'bg-transparent'
                        }`}
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="checkbox"
                        disabled={editIndex !== index}
                        checked={item.monthAccrual}
                        onChange={(e) =>
                          handleEditChange(
                            index,
                            'monthAccrual',
                            e.target.checked
                          )
                        }
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="checkbox"
                        disabled={editIndex !== index}
                        checked={item.yearAccrual}
                        onChange={(e) =>
                          handleEditChange(
                            index,
                            'yearAccrual',
                            e.target.checked
                          )
                        }
                      />
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center items-center gap-3">
                        {editIndex === index ? (
                          <button
                            onClick={() => handleSave(index)}
                            title="Save"
                          >
                            <Save
                              size={18}
                              className="text-green-600 hover:text-green-800"
                            />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setEditIndex(index);
                              setOldLeaveType({
                                name: item.name,
                                description: item.description,
                              });
                            }}
                            title="Edit"
                          >
                            <Pencil
                              size={18}
                              className="text-blue-600 hover:text-blue-800"
                            />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(item.id)}
                          title="Delete"
                        >
                          <Trash2
                            size={18}
                            className="text-red-600 hover:text-red-800"
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    No leave types found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Divider */}
        <div className="my-6 border-t"></div>

        {/* Create Form */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-medium mb-4 text-gray-700">
            Create New LeaveType
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="LeaveType name"
              value={newLeaveType.name}
              onChange={(e) =>
                setNewLeaveType({ ...newLeaveType, name: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              placeholder="Description"
              value={newLeaveType.description}
              onChange={(e) =>
                setNewLeaveType({
                  ...newLeaveType,
                  description: e.target.value,
                })
              }
              className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={newLeaveType.monthAccrual}
                onChange={(e) =>
                  setNewLeaveType({
                    ...newLeaveType,
                    monthAccrual: e.target.checked,
                  })
                }
              />
              <span className="text-sm">monthAccrual</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={newLeaveType.yearAccrual}
                onChange={(e) =>
                  setNewLeaveType({
                    ...newLeaveType,
                    yearAccrual: e.target.checked,
                  })
                }
              />
              <span className="text-sm">yearAccrual</span>
            </label>

            <button
              onClick={handleCreate}
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-5 py-2 rounded-lg"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveTypeManagement;
