import React, { useState } from 'react';
import { FiFile, FiDownload } from 'react-icons/fi';
import { createObjectURL } from '../../utils/zipHelper';

const FileView = ({ filename, file }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [fileUrl, setFileUrl] = useState(null);

  React.useEffect(() => {
    const loadFile = async () => {
      if (file) {
        try {
          const url = await createObjectURL(file);
          setFileUrl(url);
        } catch (error) {
          console.error("Failed to load file:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    
    loadFile();
    
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [file, filename]);

  // Get file extension
  const getFileExtension = () => {
    if (!filename) return "";
    return filename.split('.').pop().toLowerCase();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-2 bg-gray-800 rounded-lg h-16">
        <span className="text-gray-400">Loading file...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
      <div className="flex items-center">
        <div className="w-10 h-10 flex items-center justify-center bg-gray-700 rounded-lg mr-3">
          <FiFile size={20} className="text-gray-300" />
        </div>
        <div>
          <span className="text-gray-300 text-sm font-medium truncate block max-w-[160px]">
            {filename || "Unknown file"}
          </span>
          <span className="text-gray-400 text-xs uppercase">
            {getFileExtension()}
          </span>
        </div>
      </div>
      
      {fileUrl ? (
        <a 
          href={fileUrl}
          download={filename}
          className="p-1.5 rounded-full bg-gray-700 hover:bg-gray-600 text-white"
          title="Download file"
        >
          <FiDownload size={16} />
        </a>
      ) : (
        <span className="text-gray-400 text-xs">Not available</span>
      )}
    </div>
  );
};

export default FileView;