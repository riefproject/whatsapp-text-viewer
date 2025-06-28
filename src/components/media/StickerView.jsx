import React, { useState, useEffect } from 'react';
import { FiStar, FiDownload } from 'react-icons/fi';
import { createObjectURL } from '../../utils/zipHelper';

const StickerView = ({ filename, file }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [stickerUrl, setStickerUrl] = useState(null);

  useEffect(() => {
    const loadSticker = async () => {
      if (!file) {
        setIsLoading(false);
        return;
      }
      
      try {
        const url = await createObjectURL(file);
        setStickerUrl(url);
      } catch (error) {
        console.error("Failed to load sticker:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSticker();
    
    return () => {
      if (stickerUrl) {
        // Safe URL revocation
        try {
          URL.revokeObjectURL(stickerUrl);
        } catch (error) {
          console.error("Error revoking object URL:", error);
        }
      }
    };
  }, [file, filename]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-2 bg-gray-800 rounded-lg h-20">
        <span className="text-gray-400">Loading sticker...</span>
      </div>
    );
  }

  if (!stickerUrl) {
    return (
      <div className="flex items-center space-x-2 bg-gray-800 p-3 rounded-lg">
        <FiStar className="text-gray-400" size={20} />
        <span className="text-gray-300 text-sm truncate">
          {filename || "Sticker not available"}
        </span>
      </div>
    );
  }

  return (
    <div className="media-container">
      <div className="relative inline-block">
        <img 
          src={stickerUrl}
          alt={filename}
          className="max-w-full rounded-lg w-32 h-32 object-contain bg-transparent"
        />
        <div className="absolute top-1 right-1">
          <a 
            href={stickerUrl} 
            download={filename}
            className="p-1 rounded-full bg-gray-800 bg-opacity-70 hover:bg-opacity-100 text-white"
            title="Download sticker"
          >
            <FiDownload size={14} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default StickerView;