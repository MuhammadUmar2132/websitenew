'use client';

import { useState } from 'react';

export default function Uploads() {
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    link: '',
    image: null
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setForm({ ...form, image: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Uploading...');

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('link', form.link);
    formData.append('image', form.image);

    try {
      const res = await fetch('http://localhost:8009/upload-photo', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();
      setPreview(data);
      setStatus('Upload successful');
    } catch (err) {
      setStatus('Upload failed: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen  bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto mt-5 bg-gray-900 border border-white rounded-xl shadow-md overflow-hidden md:max-w-1xl">
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white hover:blue-700">Upload Photo</h2>
            <p className="mt-2 text-sm text-gray-600">
              Share your images with the community
            </p>
          </div>
          
          <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                placeholder="Enter a title"
                required
                className="w-full text-black px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                name="description"
                id="description"
                placeholder="Add a description"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-1">
                Link
              </label>
              <input
                type="url"
                name="link"
                id="link"
                placeholder="https://example.com"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                Image
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="image"
                      className="relative cursor-pointer bg-gradient-to-br from-gray-900 to-blue-900 rounded-md font-medium text-white hover:text-blue-500 focus-within:outline-none"
                    >
                      <span>Upload a file</span>
                      <input
                        id="image"
                        name="image"
                        type="file"
                        accept="image/*"
                        required
                        className="sr-only"
                        onChange={handleChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-br from-gray-900 to-blue-900 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Upload
              </button>
            </div>
          </form>

          {status && (
            <div className={`mt-4 p-3 rounded-md text-sm ${status.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {status}
            </div>
          )}

          {/* {preview && (
            <div className="mt-8 border-t pt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{preview.title}</h3>
              <p className="text-gray-600 mb-4">{preview.description}</p>
              <a href={preview.link} className="text-blue-600 hover:text-blue-800" target="_blank" rel="noreferrer">
                {preview.link}
              </a>
              <div className="mt-4">
                <img src={preview.imageUrl} alt="Uploaded" className="max-w-full rounded-lg shadow-md" />
              </div>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
}