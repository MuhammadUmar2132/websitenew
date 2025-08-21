'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function UploadPage() {
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    link: '',
    image: null,
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
      const res = await fetch('http://localhost:8000/upload-photo', {
        method: 'POST',
        body: formData,
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
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl text-black font-semibold mb-4">Upload Photo</h2>
      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="space-y-4"
      >
        <input
          type="text"
          name="title"
          placeholder="Title"
          required
          className="w-full p-2 border text-gray-900"
          onChange={handleChange}
        />
        <input
          type="text"
          name="description"
          placeholder="Description"
          className="w-full p-2 border text-gray-900"
          onChange={handleChange}
        />
        <input
          type="url"
          name="link"
          placeholder="Link"
          required
          className="w-full p-2 border text-gray-900"
          onChange={handleChange}
        />
        <input
          type="file"
          name="image"
          accept="image/*"
          required
          className="w-full p-2 border text-gray-900 file:text-gray-900"
          onChange={handleChange}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2"
        >
          Upload
        </button>
      </form>

      {status && <p className="mt-4 text-sm text-gray-900">{status}</p>}

      {preview && (
        <div className="mt-6 border-t pt-4">
          <h3 className="text-xl font-bold mb-2 text-gray-900">
            {preview.title}
          </h3>
          <p className="text-gray-900">{preview.description}</p>
          <a
            href={preview.link}
            className="text-blue-500"
            target="_blank"
            rel="noreferrer"
          >
            {preview.link}
          </a>
          <div className="mt-4">
            <Image
              src={preview.imageUrl}
              alt="Uploaded"
              width={500}
              height={300}
              className="max-w-sm rounded shadow"
            />
          </div>
        </div>
      )}
    </div>
  );
}
