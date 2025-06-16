import React, { useState } from 'react';
import axios from 'axios';

const BulkUpload = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    setFile(e.target.files[0]);
    setStatus('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setStatus('⚠️ Please select a CSV file first.');
      return;
    }

    const formData = new FormData();
    formData.append('uploadedFile', file);

    try {
      setStatus('⏳ Uploading...');
      const res = await axios.post('http://localhost:8080/api/admin/employee/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setStatus(`✅ Success: ${res.data}`);
    } catch (error) {
      console.error(error);
      setStatus('❌ Upload failed. Please try again.');
    }
  };

  return (
    <div className="max-w-md h-60 mx-auto mt-16 p-6 bg-white rounded-xl shadow-md  border border-gray-200">
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">📤 BULK Upload Employee</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="file"
          accept=".csv"
          onChange={handleChange}
          className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4
                     file:rounded-md file:border-0 file:text-sm file:font-semibold
                     file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
        >
          Upload
        </button>
      </form>
      {status && <p className="mt-4 text-sm text-gray-600">{status}</p>}
    </div>
  );
};

export default BulkUpload;
