import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DesignationManagement = () => {
  const [designations, setDesignations] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [oldDesignation, setOldDesignation] = useState(null);
  const [newDesignation, setNewDesignation] = useState({
    name: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDesignations = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/designation/getDesignation');
        const data = await response.data;
        setDesignations(data);
      } catch (err) {
        {
          
          const message = err.response?.data?.message;
          console.log(err)
          if (err.response?.status === 403) {
            alert(message || "You are not authorized to access this resource.");
          } else if (err.response?.status === 401) {
            alert(message || "Session expired. Please log in again.");
          } else {
            alert("An unexpected error occurred.");
          }
        }
        console.error(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDesignations();
  }, []);

  const handleEditChange = (index, name, value) => {
    const updated = [...designations];
    updated[index][name] = value;
    setDesignations(updated);
  };

  const handleSave = async (index) => {
    const updatedDesignation = designations[index];

    const payload = {
      oldName: oldDesignation?.name,
      oldDescription: oldDesignation?.description,
      newName: updatedDesignation.name,
      newDescription: updatedDesignation.description
    };

    try {
      await axios.put(`http://localhost:8080/api/designation/updateDesignation/${updatedDesignation.id}`, payload);
      setEditIndex(null);
      setOldDesignation(null);
      alert('Designation updated successfully!');
    } catch (err) {
      console.error('Error saving designation:', err);
      alert('Failed to update designation');
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this designation?');
    if (!confirmDelete) return;
  
    try {
      await axios.delete(`http://localhost:8080/api/designation/deleteDesignation/${id}`);
      setDesignations(designations.filter(designation => designation.id !== id));
      alert('Designation deleted successfully!');
    } catch (err) {
      console.error('Error deleting designation:', err);
      alert('Failed to delete designation');
    }
  };
  
  const handleCreate = async () => {
    if (!newDesignation.name) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const res = await axios.post('http://localhost:8080/api/designation/createDesignation', newDesignation);
      setDesignations([...designations, res.data]);
      setNewDesignation({ name: '', description: '' });
      alert('Designation created successfully!');
    } catch (err) {
      console.error('Error creating designation:', err);
      alert('Failed to create designation');
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
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Designation Management</h1>

      {/* Flex container for table and form */}
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Left: Designation Table */}
        <div className="md:w-2/3 w-full overflow-x-auto">
          <table className="w-full table-auto border-collapse mb-8">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3 border-b-2 border-gray-200">Name</th>
                <th className="p-3 border-b-2 border-gray-200">Description</th>
                <th className="p-3 border-b-2 border-gray-200 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {designations.length > 0 ? (
                designations.map((designation, index) => (
                  <tr key={designation.id} className="hover:bg-gray-50">
                    <td className="p-3 border-b border-gray-200">
                      <input
                        type="text"
                        value={designation.name}
                        readOnly={editIndex !== index}
                        onChange={(e) => handleEditChange(index, 'name', e.target.value)}
                        className={`w-full p-2 rounded ${editIndex === index ? 'border border-gray-300' : 'border-none bg-transparent'}`}
                      />
                    </td>
                    <td className="p-3 border-b border-gray-200">
                      <input
                        type="text"
                        value={designation.description}
                        readOnly={editIndex !== index}
                        onChange={(e) => handleEditChange(index, 'description', e.target.value)}
                        className={`w-full p-2 rounded ${editIndex === index ? 'border border-gray-300' : 'border-none bg-transparent'}`}
                      />
                    </td>
                    <td className="p-3 border-b border-gray-200 text-center">
                      <div className="flex justify-center space-x-2">
                        {editIndex === index ? (
                          <button
                            onClick={() => handleSave(index)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                          >
                            Save
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setEditIndex(index);
                              setOldDesignation({
                                id: designation.id,
                                name: designation.name,
                                description: designation.description
                              });
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                          >
                            Edit
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(designation.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="p-4 text-center text-gray-500">
                    No designations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Right: Create New Designation */}
        <div className="md:w-1/3 w-full bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Create New Designation</h2>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name*</label>
              <input
                type="text"
                placeholder="e.g. Manager, CEO, Intern"
                value={newDesignation.name}
                onChange={(e) => setNewDesignation({ ...newDesignation, name: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                placeholder="Description (optional)"
                value={newDesignation.description}
                onChange={(e) => setNewDesignation({ ...newDesignation, description: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <button
                onClick={handleCreate}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded transition duration-200"
              >
                Add Designation
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DesignationManagement;
