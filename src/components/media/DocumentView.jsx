import React, { useState } from 'react';
import { FiFileText, FiDownload, FiEye } from 'react-icons/fi';
import { createObjectURL } from '../../utils/zipHelper';

const DocumentView = ({ filename, file }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [docUrl, setDocUrl] = useState(null);

  React.useEffect(() => {
    const loadDocument = async () => {
      if (file) {
        try {
          const url = await createObjectURL(file);
          setDocUrl(url);
        } catch (error) {
          console.error("Failed to load document:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    
    loadDocument();
    
    return () => {
      if (docUrl) {
        URL.revokeObjectURL(docUrl);
      }
    };
  }, [file, filename]);

  // Get file extension
  const getFileExtension = () => {
    if (!filename) return "";
    return filename.split('.').pop().toLowerCase();
  };
  
  // Get the icon based on extension
  const getFileIcon = () => {
    const ext = getFileExtension();
    switch (ext) {
      case 'pdf':
        return "📄";
      case 'doc':
      case 'docx':
        return "📝";
      case 'xls':
      case 'xlsx':
      case 'csv':
        return "📊";
      case 'ppt':
      case 'pptx':
        return "📊";
      default:
        return "📄";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-2 bg-gray-800 rounded-lg h-16">
        <span className="text-gray-400">Loading document...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
      <div className="flex items-center">
        <div className="w-10 h-10 flex items-center justify-center bg-gray-700 rounded-lg mr-3">
          <span className="text-lg">{getFileIcon()}</span>
        </div>
        <div>
          <span className="text-gray-300 text-sm font-medium truncate block max-w-[160px]">
            {filename || "Unknown document"}
          </span>
          <span className="text-gray-400 text-xs uppercase">
            {getFileExtension()}
          </span>
        </div>
      </div>
      
      <div className="flex">
        {docUrl && (
          <>
            <a 
              href={docUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-full bg-gray-700 hover:bg-gray-600 text-white mr-2"
              title="View document"
            >
              <FiEye size={16} />
            </a>
            <a 
              href={docUrl}
              download={filename}
              className="p-1.5 rounded-full bg-gray-700 hover:bg-gray-600 text-white"
              title="Download document"
            >
              <FiDownload size={16} />
            </a>
          </>
        )}
        {!docUrl && (
          <span className="text-gray-400 text-xs">Not available</span>
        )}
      </div>
    </div>
  );
};

export default DocumentView;