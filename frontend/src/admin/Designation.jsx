import React, { useEffect, useState } from 'react';
import { Pencil, Trash2, Save } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../employee/ui/ToastContainer';


const DesignationManagement = () => {
  const [designations, setDesignations] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [oldDesignation, setOldDesignation] = useState(null);
  const [newDesignation, setNewDesignation] = useState({ name: '', description: '' });
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();


  useEffect(() => {
    const fetchDesignations = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/designation/Designation');
        setDesignations(res.data);
      } catch (err) {
        const message = err.response?.data?.message;
        if (err.response?.status === 403) {
          showToast(message, 'error');
        } else if (err.response?.status === 401) {
          showToast(message, 'error')
        } else {
          showToast('Unexpected error.', 'error')
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
      description: updated.description
    };

    try {
      await axios.put(`http://localhost:8080/api/designation/Designation/${updated.id}`, payload);
      setEditIndex(null);
      setOldDesignation(null);
      showToast('Designation updated!', 'success')
    } catch (err) {
      showToast('Failed to update designation', 'error')
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this designation?')) return;

    try {
      await axios.delete(`http://localhost:8080/api/designation/Designation/${id}`);
      setDesignations(designations.filter(item => item.id !== id));
      showToast('Deleted!', 'success');
    } catch {
      showToast('Delete failed', 'error');
    }
  };

  const handleCreate = async () => {
    if (!newDesignation.name.trim()) {
      showToast('Name is required', 'success');
      return;
    }

    try {
      const res = await axios.post('http://localhost:8080/api/designation/Designation', newDesignation);
      setDesignations([...designations, newDesignation]);
      setNewDesignation({ name: '', description: '' });
      showToast('Created!', 'success');
    } catch {
      showToast('Creation failed', 'error');
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Designation Management</h1>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase tracking-wide">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {designations.length > 0 ? (
                designations.map((item, index) => (
                  <tr key={item.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">
                      <input
                        value={item.name}
                        readOnly={editIndex !== index}
                        onChange={(e) => handleEditChange(index, 'name', e.target.value)}
                        className={`w-full px-2 py-1 rounded ${
                          editIndex === index ? 'border border-gray-300' : 'bg-transparent'
                        }`}
                      />
                    </td>
                    <td className="p-3">
                      <input
                        value={item.description}
                        readOnly={editIndex !== index}
                        onChange={(e) => handleEditChange(index, 'description', e.target.value)}
                        className={`w-full px-2 py-1 rounded ${
                          editIndex === index ? 'border border-gray-300' : 'bg-transparent'
                        }`}
                      />
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center items-center gap-3">
                        {editIndex === index ? (
                          <button onClick={() => handleSave(index)} title="Save">
                            <Save size={18} className="text-green-600 hover:text-green-800" />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setEditIndex(index);
                              setOldDesignation({ name: item.name, description: item.description });
                            }}
                            title="Edit"
                          >
                            <Pencil size={18} className="text-blue-600 hover:text-blue-800" />
                          </button>
                        )}
                        <button onClick={() => handleDelete(item.id)} title="Delete">
                          <Trash2 size={18} className="text-red-600 hover:text-red-800" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-gray-500">
                    No designations found.
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
          <h2 className="text-lg font-medium mb-4 text-gray-700">Create New Designation</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Designation name"
              value={newDesignation.name}
              onChange={(e) => setNewDesignation({ ...newDesignation, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              placeholder="Description"
              value={newDesignation.description}
              onChange={(e) => setNewDesignation({ ...newDesignation, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
               <button
            onClick={handleCreate}
            className=" inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-5 py-2 rounded-lg"
          >
            Add
          </button>
          </div>
       
        </div>
      </div>
    </div>
  );
};

export default DesignationManagement;
