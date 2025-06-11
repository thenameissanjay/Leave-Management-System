// LeaveLevelManagement.jsx
import React, { useEffect, useState } from 'react';
import { Pencil, Trash2, Save } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../employee/ui/ToastContainer';

const LeaveLevelManager = () => {
  const [levels, setLevels] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [newLevel, setNewLevel] = useState({
    start_count: '',
    end_count: '',
    approval_order: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  /* ─────────────── FETCH ALL ─────────────── */
  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const res = await axios.get(
          'http://localhost:8080/api/leavelevel/lookup'
        );
        setLevels(res.data);
      } catch (err) {
        const message = err.response?.data?.message;
        const code = err.response?.status;
        if (code === 403) showToast(message || 'Unauthorized access.', 'error');
        else if (code === 401) showToast(message || 'Session expired.', 'error');
        else showToast(message || 'Unexpected error.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLevels();
  }, []);

  /* ─────────────── TABLE EDIT HANDLERS ─────────────── */
  const handleEditChange = (index, field, value) => {
    const updated = [...levels];
    updated[index][field] = value;
    setLevels(updated);
  };

  const handleSave = async (index) => {
    const item = levels[index];

    // Basic front-end validation
    if (
      item.start_count === '' ||
      item.end_count === '' ||
      item.approval_order === ''
    ) {
      return showToast('All fields are required', 'error');
    }

    try {
      await axios.put(
        `http://localhost:8080/api/leavelevel/lookup/${item.leave_level_id}`,
        {
          start_count: (item.start_count, 10),
          end_count: parseInt(item.end_count, 10),
          approval_order: parseInt(item.approval_order, 10),
        }
      );
      setEditIndex(null);
      showToast('Leave level updated!', 'success');
    } catch (err) {
      showToast('Failed to update leave level', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this leave level?')) return;

    try {
      await axios.delete ( 
        `http://localhost:8080/api/leavelevel/lookup/${id}`
      );
      setLevels(levels.filter((lvl) => lvl.leave_level_id !== id));
      showToast('Deleted!', 'success');
    } catch {
      showToast('Delete failed', 'error');
    }
  };

  /* ─────────────── CREATE NEW ─────────────── */
  const handleCreate = async () => {
    const { start_count, end_count, approval_order } = newLevel;

    if (start_count === '' || end_count === '' || approval_order === '') {
      return showToast('All fields are required', 'error');
    }

    try {
      const res = await axios.post(
        'http://localhost:8080/api/leavelevel/lookup',
        {
          start_count: start_count,
          end_count: end_count, 
          approval_order: approval_order,
        }
      );
      setLevels([...levels, res.data.data]); // backend returns the created row in `data`
      setNewLevel({ start_count: '', end_count: '', approval_order: '' });
      showToast('Created!', 'success');
    } catch {
      showToast('Creation failed', 'error');
    }
  };

  /* ─────────────── UI ─────────────── */
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-12 w-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Leave-Level Management
        </h1>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase tracking-wide">
              <tr>
                <th className="p-3 text-left">Start Count</th>
                <th className="p-3 text-left">End Count</th>
                <th className="p-3 text-left">Approval Order</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {levels.length ? (
                levels.map((lvl, index) => (
                  <tr key={lvl.leave_level_id} className="border-t hover:bg-gray-50">
                    {['start_count', 'end_count', 'approval_order'].map((field) => (
                      <td key={field} className="p-3">
                        <input
                          type="number"
                          value={lvl[field]}
                          readOnly={editIndex !== index}
                          onChange={(e) =>
                            handleEditChange(index, field, e.target.value)
                          }
                          className={`w-full px-2 py-1 rounded ${
                            editIndex === index
                              ? 'border border-gray-300'
                              : 'bg-transparent'
                          }`}
                        />
                      </td>
                    ))}

                    <td className="p-3 text-center">
                      <div className="flex justify-center gap-3">
                        {editIndex === index ? (
                          <button onClick={() => handleSave(index)} title="Save">
                            <Save
                              size={18}
                              className="text-green-600 hover:text-green-800"
                            />
                          </button>
                        ) : (
                          <button
                            onClick={() => setEditIndex(index)}
                            title="Edit"
                          >
                            <Pencil
                              size={18}
                              className="text-blue-600 hover:text-blue-800"
                            />
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(lvl.leave_level_id)}
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
                    No leave levels found.
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
            Create New Leave Level
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="number"
              placeholder="Start count"
              value={newLevel.start_count}
              onChange={(e) =>
                setNewLevel({ ...newLevel, start_count: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="number"
              placeholder="End count"
              value={newLevel.end_count}
              onChange={(e) =>
                setNewLevel({ ...newLevel, end_count: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="number"
              placeholder="Approval order"
              value={newLevel.approval_order}
              onChange={(e) =>
                setNewLevel({ ...newLevel, approval_order: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <button
              onClick={handleCreate}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-5 py-2 rounded-lg"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveLevelManager;
