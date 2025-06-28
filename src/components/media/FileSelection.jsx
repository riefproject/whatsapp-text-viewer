// src/components/FileSelection.jsx

import { useState } from 'react';

function FileSelection({ textFiles, onSelect, onCancel }) {
  const [selectedFile, setSelectedFile] = useState(textFiles[0]?.filename || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedFile) {
      const fileEntry = textFiles.find(f => f.filename === selectedFile);
      onSelect(fileEntry);
    }
  };

  return (
    <div className="bg-gray-800 p-8 rounded-xl shadow-lg animate-fade-in w-full max-w-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Pilih File Chat</h2>
      <p className="text-gray-400 mb-6 text-center">
        Ditemukan beberapa file teks (.txt) di dalam arsip .zip Anda. Silakan pilih salah satu untuk ditampilkan.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 mb-6">
          {textFiles.map((file) => (
            <label
              key={file.filename}
              className={`block w-full p-4 rounded-lg cursor-pointer transition-all ${
                selectedFile === file.filename
                  ? 'bg-cyan-500 text-white font-bold ring-2 ring-cyan-300'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <input
                type="radio"
                name="file-selection"
                value={file.filename}
                checked={selectedFile === file.filename}
                onChange={(e) => setSelectedFile(e.target.value)}
                className="hidden"
              />
              {file.filename}
            </label>
          ))}
        </div>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105"
          >
            Batal
          </button>
          <button
            type="submit"
            className="w-full bg-lime-500 hover:bg-lime-600 text-black font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105"
          >
            Tampilkan Chat
          </button>
        </div>
      </form>
    </div>
  );
}

export default FileSelection;