import React, { useEffect, useState } from 'react';
import { Pencil, Trash2, Save, Plus } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../employee/ui/ToastContainer';

const LeaveLevelManager = () => {
  const [levels, setLevels] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [oldLevel, setOldLevel] = useState(null);
  const [newLevel, setNewLevel] = useState({
    start_count: '',
    end_count: '',
    approval_order: '',
  });
  const [isCreating, setIsCreating] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    axios
      .get('http://localhost:8080/api/leave-level/look-up')
      .then((res) => setLevels(res.data))
      .catch((err) =>
        showToast(err?.response?.data?.message || 'Failed to fetch', 'error')
      );
  }, []);

  const handleEditChange = (index, field, value) => {
    const updated = [...levels];
    updated[index][field] = value;
    setLevels(updated);
  };

  const handleSave = async (index) => {
    const item = levels[index];
    try {
      await axios.put(
        `http://localhost:8080/api/leave-level/look-up/${item.leave_level_id}`,
        {
          start_count: parseInt(item.start_count, 10),
          end_count: parseInt(item.end_count, 10),
          approval_order: parseInt(item.approval_order, 10),
        }
      );
      setEditIndex(null);
      showToast('Leave level updated!', 'success');
    } catch {
      showToast('Failed to update', 'error');
    }
  };

  const handleCancelEdit = () => {
    if (editIndex !== null && oldLevel) {
      const updated = [...levels];
      updated[editIndex] = oldLevel;
      setLevels(updated);
    }
    setEditIndex(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await axios.delete(`http://localhost:8080/api/leave-level/look-up/${id}`);
      setLevels(levels.filter((lvl) => lvl.leave_level_id !== id));
      showToast('Deleted!', 'success');
    } catch {
      showToast('Delete failed', 'error');
    }
  };

  const handleCreate = async () => {
    const { start_count, end_count, approval_order } = newLevel;
    if (!start_count || !end_count || !approval_order) {
      return showToast('All fields are required', 'error');
    }
    try {
      const res = await axios.post(
        'http://localhost:8080/api/leave-level/look-up',
        {
          start_count,
          end_count,
          approval_order,
        }
      );
      setLevels([...levels, res.data.data]);
      setNewLevel({ start_count: '', end_count: '', approval_order: '' });
      showToast('Created!', 'success');
    } catch {
      showToast('Failed to create', 'error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-gray-800 text-center">Approval Levels</h1>
   
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">
                  Start Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">
                  End Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">
                  Approval Order
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {levels.length ? (
                levels.map((lvl, index) => (
                  <tr key={lvl.leave_level_id} className="hover:bg-gray-50">
                    {['start_count', 'end_count', 'approval_order'].map(
                      (field) => (
                        <td key={field} className="px-6 py-4 whitespace-nowrap">
                          {editIndex === index ? (
                            <input
                              type="number"
                              value={lvl[field]}
                              onChange={(e) =>
                                handleEditChange(index, field, e.target.value)
                              }
                              className="w-full px-2 py-1 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-keka-blue"
                            />
                          ) : (
                            <div className="text-sm text-gray-900">
                              {lvl[field]}
                            </div>
                          )}
                        </td>
                      )
                    )}
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
                              onClick={handleCancelEdit}
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
                              setOldLevel({ ...lvl });
                            }}
                            className="text-keka-blue hover:text-keka-blue-dark"
                            title="Edit"
                          >
                            <Pencil size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(lvl.leave_level_id)}
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
                    colSpan="4"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No leave levels found. Add your first leave level to get
                    started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add Form */}
        {isCreating && (
          <div className="mt-4 bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-1">
                <input
                  type="number"
                  placeholder="Start Count"
                  value={newLevel.start_count}
                  onChange={(e) =>
                    setNewLevel({ ...newLevel, start_count: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-keka-blue"
                />
              </div>
              <div className="md:col-span-1">
                <input
                  type="number"
                  placeholder="End Count"
                  value={newLevel.end_count}
                  onChange={(e) =>
                    setNewLevel({ ...newLevel, end_count: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-keka-blue"
                />
              </div>
              <div className="md:col-span-2">
                <input
                  type="number"
                  placeholder="Approval Order"
                  value={newLevel.approval_order}
                  onChange={(e) =>
                    setNewLevel({
                      ...newLevel,
                      approval_order: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-keka-blue"
                />
              </div>
              <button
                onClick={handleCreate}
                className="bg-gray-800 hover:bg-gray-900 text-white text-sm px-2 py-2 rounded-lg disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>
        )}
        <div className=" mt-4 bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <input
                type="text"
                placeholder="Start"
                value={newLevel.start_count}
                onChange={(e) =>
                  setNewLevel({ ...newLevel, start_count: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-keka-blue"
              />
            </div>
            <div className="md:col-span-1">
              <input
                type="text"
                placeholder="End"
                value={newLevel.end_count}
                onChange={(e) =>
                  setNewLevel({ ...newLevel, end_count: e.target.value })

                }
                className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-keka-blue"
              />
            </div>
            <div className="md:col-span-1">
              <input
                type="text"
                placeholder="Order"
                value={newLevel.approval_order}
                onChange={(e) =>
                  setNewLevel({ ...newLevel, approval_order: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-keka-blue"
              />
            </div>
            <button
              onClick={handleCreate}
              disabled={isCreating}
              className="bg-gray-800 md:col-span-1 hover:bg-gray-900 text-white text-sm px-2 py-2 rounded-lg disabled:opacity-50"
            >
              {'Add'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveLevelManager;
