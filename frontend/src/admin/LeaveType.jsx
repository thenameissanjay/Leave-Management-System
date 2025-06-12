import React, { useEffect, useState } from 'react';
import { Pencil, Trash2, Save, Plus, X } from 'lucide-react';
import { useToast } from '../employee/ui/ToastContainer';
import api from '../utils/BaseUrl';

const LeaveTypeManagement = () => {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [oldLeaveType, setOldLeaveType] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newLeaveType, setNewLeaveType] = useState({
    name: '',
    description: '',
    yearAccrual: false,
    monthAccrual: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchLeaveTypes = async () => {
      try {
        const response = await api.get(
          '/api/leave-type/leave-type'
        );
        setLeaveTypes(response.data);
      } catch (err) {
        const message = err.response?.data?.message;
        if (err.response?.status === 403) {
          showToast(message || 'You are not authorized', 'error');
        } else if (err.response?.status === 401) {
          showToast(message || 'Session expired', 'error');
        } else {
          showToast('Failed to load leave types', 'error');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaveTypes();
  }, []);

  const handleEditChange = (index, name, value) => {
    const updated = [...leaveTypes];
    updated[index][name] = value;
    setLeaveTypes(updated);
  };

  const handleSave = async (index) => {
    const updatedLeaveType = leaveTypes[index];
    const payload = {
      name: updatedLeaveType.name,
      description: updatedLeaveType.description,
      yearAccrual: updatedLeaveType.yearAccrual,
      monthAccrual: updatedLeaveType.monthAccrual,
    };

    try {
      await api.put(
        `/api/leave-type/leave-type/${updatedLeaveType.id}`,
        payload
      );
      setEditIndex(null);
      setOldLeaveType(null);
      showToast('Leave type updated successfully!', 'success');
    } catch (err) {
      showToast('Failed to update leave type', 'error');
    }
  };

  const handleCancelEdit = (index) => {
    const updated = [...leaveTypes];
    updated[index] = { ...updated[index], ...oldLeaveType };
    setLeaveTypes(updated);
    setEditIndex(null);
    setOldLeaveType(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this leave type?'))
      return;

    try {
      await api.delete(
        `/api/leave-type/leave-type/${id}`
      );
      setLeaveTypes(leaveTypes.filter((lt) => lt.id !== id));
      showToast('Leave type deleted successfully!', 'success');
    } catch (err) {
      showToast('Failed to delete leave type', 'error');
    }
  };

  const handleCreate = async () => {
    if (!newLeaveType.name.trim()) {
      showToast('Leave type name is required', 'error');
      return;
    }

    try {
      const res = await api.post(
        '/api/leave-type/leave-type',
        newLeaveType
      );
      setLeaveTypes([...leaveTypes, res.data]);
      setNewLeaveType({
        name: '',
        description: '',
        yearAccrual: false,
        monthAccrual: false,
      });
      setIsCreating(false);
      showToast('Leave type created successfully!', 'success');
    } catch (err) {
      showToast('Failed to create leave type', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-keka-blue"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold text-gray-800">
            Leave Type Management
          </h1>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-800">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                >
                  Leave Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                >
                  Description
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider"
                >
                  Monthly
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider"
                >
                  Yearly
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaveTypes.length > 0 ? (
                leaveTypes.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editIndex === index ? (
                        <input
                          value={item.name}
                          onChange={(e) =>
                            handleEditChange(index, 'name', e.target.value)
                          }
                          className="w-full px-3 py-1 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-keka-blue"
                        />
                      ) : (
                        <div className="text-sm font-medium text-gray-900">
                          {item.name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editIndex === index ? (
                        <input
                          value={item.description}
                          onChange={(e) =>
                            handleEditChange(
                              index,
                              'description',
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-1 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-keka-blue"
                        />
                      ) : (
                        <div className="text-sm text-gray-500">
                          {item.description || '-'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
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
                        className="h-4 w-4 text-keka-blue focus:ring-keka-blue border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
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
                        className="h-4 w-4 text-keka-blue focus:ring-keka-blue border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center gap-3">
                        {editIndex === index ? (
                          <>
                            <button
                              onClick={() => handleSave(index)}
                              className="text-keka-blue hover:text-keka-blue-dark"
                              title="Save"
                            >
                              <Save size={18} />
                            </button>
                            <button
                              onClick={() => handleCancelEdit(index)}
                              className="text-gray-500 hover:text-gray-700"
                              title="Cancel"
                            >
                              ×
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              setEditIndex(index);
                              setOldLeaveType({
                                name: item.name,
                                description: item.description,
                                monthAccrual: item.monthAccrual,
                                yearAccrual: item.yearAccrual,
                              });
                            }}
                            className="text-keka-blue hover:text-keka-blue-dark"
                            title="Edit"
                          >
                            <Pencil size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No leave types found. Add your first leave type to get
                    started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Create Form */}
        {/* Create Form */}
        <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden">
        
          <div className="bg-white px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
              <input
                type="text"
                placeholder="Leave type name"
                value={newLeaveType.name}
                onChange={(e) =>
                  setNewLeaveType({ ...newLeaveType, name: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-keka-blue"
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
                className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-keka-blue"
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
                  className="h-4 w-4 text-keka-blue focus:ring-keka-blue border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Monthly</span>
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
                  className="h-4 w-4 text-keka-blue focus:ring-keka-blue border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Yearly</span>
              </label>
              <div className="flex justify-end">
                <button
                  onClick={handleCreate}
                  disabled={isCreating}
                  className="w-full bg-gray-800 hover:bg-gray-900 text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveTypeManagement;
