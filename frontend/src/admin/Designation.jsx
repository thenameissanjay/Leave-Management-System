import React, { useEffect, useState } from 'react';
import { Pencil, Trash2, Save, Plus } from 'lucide-react';
import { useToast } from '../employee/ui/ToastContainer';
import api from '../utils/BaseUrl';

const DesignationManagement = () => {
  const [designations, setDesignations] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [oldDesignation, setOldDesignation] = useState(null);
  const [newDesignation, setNewDesignation] = useState({
    name: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchDesignations = async () => {
      try {
        const res = await api.get(
          '/api/designation/designation'
        );
        setDesignations(res.data);
      } catch (err) {
        const message = err.response?.data?.message;
        if (err.response?.status === 403 || err.response?.status === 401) {
          showToast(message, 'error');
        } else {
          showToast('Unexpected error.', 'error');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchDesignations();
  }, []);

  const handleEditChange = (index, field, value) => {
    const updated = [...designations];
    updated[index][field] = value;
    setDesignations(updated);
  };

  const handleSave = async (index) => {
    const updated = designations[index];
    const payload = {
      name: updated.name,
      description: updated.description,
    };

    try {
      await api.put(
        `/api/designation/designation/${updated.id}`,
        payload
      );
      setEditIndex(null);
      setOldDesignation(null);
      showToast('Designation updated successfully!', 'success');
    } catch {
      showToast('Failed to update designation', 'error');
    }
  };

  const handleCancelEdit = (index) => {
    const updated = [...designations];
    updated[index] = { ...updated[index], ...oldDesignation };
    setDesignations(updated);
    setEditIndex(null);
    setOldDesignation(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this designation?'))
      return;

    try {
      await api.delete(
        `/api/designation/designation/${id}`
      );
      setDesignations(designations.filter((item) => item.id !== id));
      showToast('Designation deleted successfully!', 'success');
    } catch(err) {
      const message = err.response?.data?.message;
      showToast( message, 'error');
    }
  };

  const handleCreate = async () => {
    if (!newDesignation.name.trim()) {
      showToast('Designation name is required', 'error');
      return;
    }

    setIsCreating(true);
    try {
      const res = await api.post(
        '/api/designation/designation',
        newDesignation
      );
      setDesignations([...designations, res.data]);
      setNewDesignation({ name: '', description: '' });
      showToast('Designation created successfully!', 'success');
    } catch {
      showToast('Creation failed. Please try again.', 'error');
    } finally {
      setIsCreating(false);
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
          <h1 className="text-xl font-semibold text-gray-800">Employee Type</h1>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-2 bg-keka-blue hover:bg-keka-blue-dark text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            <Plus size={16} />
            Add Designation
          </button>
        </div>
        {/* Create Designation Form */}
      

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">
                  Designation Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {designations.length > 0 ? (
                designations.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editIndex === index ? (
                        <input
                          value={item.name}
                          onChange={(e) =>
                            handleEditChange(index, 'name', e.target.value)
                          }
                          className="w-full px-2 py-1 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-keka-blue"
                        />
                      ) : (
                        <div className="text-sm font-medium text-gray-900">
                          {item.name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
                          className="w-full px-2 py-1 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-keka-blue"
                        />
                      ) : (
                        <div className="text-sm text-gray-500">
                          {item.description || '-'}
                        </div>
                      )}
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
                              setOldDesignation({
                                name: item.name,
                                description: item.description,
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
                    colSpan="4"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No designations found. Add your first designation to get
                    started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className=" mt-4 bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder=" Name"
                value={newDesignation.name}
                onChange={(e) =>
                  setNewDesignation({ ...newDesignation, name: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-keka-blue"
              />
            </div>
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Description"
                value={newDesignation.description}
                onChange={(e) =>
                  setNewDesignation({
                    ...newDesignation,
                    description: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-keka-blue"
              />
            </div>
            <button
              onClick={handleCreate}
              disabled={isCreating}
              className="bg-gray-800 md:col-span-1 hover:bg-gray-900 text-white text-sm px-2 py-2 rounded-lg disabled:opacity-50"
            >
              { 'Add'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignationManagement;
