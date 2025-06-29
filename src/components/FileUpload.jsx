import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload } from 'react-icons/fi'; // Import ikon dari react-icons

function FileUpload({ onFileAccepted }) {
    // Setup react-dropzone
    const onDrop = useCallback(acceptedFiles => {
        // Panggil fungsi callback dari parent (App.jsx) saat file diterima
        onFileAccepted(acceptedFiles);
    }, [onFileAccepted]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/plain': ['.txt'],
            'application/zip': ['.zip'],
        },
    });

    return (
        // 1. Container luar dengan background gradasi
        // p-1 memberikan "ketebalan" pada border
        <div className="w-full max-w-2xl p-1 rounded-2xl bg-gradient-to-tr from-[#c4e07b] to-[#136880]">
            
            {/* 2. Container dalam yang warnanya sama dengan background utama */}
            {/* Ini akan menjadi area dropzone kita */}
            <div
        {...getRootProps()}
        className={`
            w-full h-72 rounded-xl bg-[#1e1e1e] 
            flex flex-col justify-center items-center 
            text-center p-8 cursor-pointer 
            transition-all duration-300
            ${isDragActive ? 'bg-gray-800' : ''}
        `}
            >
        <input {...getInputProps()} />

        {/* Ikon Download */}
        <FiUpload className={`
            text-5xl mb-4 text-cyan-400 
            transition-transform duration-300
            ${isDragActive ? 'scale-125' : ''}
        `} />

        {/* Teks Instruksi */}
        {isDragActive ? (
            <p className="text-xl font-semibold">Yep, drop it right here!</p>
        ) : (
            <div>
        <p className="font-semibold text-gray-300">
            select your file (extension allowed: .zip, .txt)
        </p>
        <p className="text-gray-500">or drop file here</p>
            </div>
        )}
            </div>
        </div>
    );
}

export default FileUpload;