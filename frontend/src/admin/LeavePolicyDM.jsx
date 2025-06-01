import { useEffect, useState } from 'react';
import axios from 'axios';

const LeavePolicyDM = () => {
  const [data, setData] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [newPolicy, setNewPolicy] = useState({ designation: '', values: {} });

  useEffect(() => {
    axios.get('http://localhost:8080/api/leavepolicyDM/getLeavePolicy')
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));
  }, []);

  if (data.length === 0) return <p className="text-center mt-8">Loading...</p>;

  const leaveTypes = Object.keys(data[0]).filter(key => key !== 'designation');

  const handleEditChange = (index, key, value) => {
    const updated = [...data];
    updated[index][key] = value;
    setData(updated);
  };

  const handleSave = (index) => {
    // TODO: PUT request to update policy
    setEditIndex(null);
  };

  const handleDelete = (designation) => {
    // TODO: DELETE request by designation
    setData(data.filter(item => item.designation !== designation));
  };



  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Leave Policies Management</h1>

      <div className="overflow-x-auto mb-8">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3 border-b-2 border-gray-200">Designation</th>
              {leaveTypes.map(type => (
                <th key={type} className="p-3 border-b-2 border-gray-200 capitalize">{type}</th>
              ))}
              <th className="p-3 border-b-2 border-gray-200 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((policy, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="p-3 border-b border-gray-200">
                  <input
                    type="text"
                    value={policy.designation}
                    readOnly={editIndex !== index}
                    onChange={(e) => handleEditChange(index, 'designation', e.target.value)}
                    className={`w-full p-2 rounded ${editIndex === index ? 'border border-gray-300' : 'border-none bg-transparent'}`}
                  />
                </td>
                {leaveTypes.map(type => (
                  <td key={type} className="p-3 border-b border-gray-200">
                    <input
                      type="number"
                      value={policy[type]}
                      readOnly={editIndex !== index}
                      onChange={(e) => handleEditChange(index, type, e.target.value)}
                      className={`w-full p-2 rounded ${editIndex === index ? 'border border-gray-300' : 'border-none bg-transparent'}`}
                    />
                  </td>
                ))}
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
                        onClick={() => setEditIndex(index)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(policy.designation)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default LeavePolicyDM;
