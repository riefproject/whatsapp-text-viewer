import React, { useState } from 'react';
import { FiImage, FiDownload, FiMaximize } from 'react-icons/fi';
import { createObjectURL } from '../../utils/zipHelper';

const ImageView = ({ filename, file }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  React.useEffect(() => {
    const loadImage = async () => {
      if (file) {
        try {
          const url = await createObjectURL(file);
          setImageUrl(url);
        } catch (error) {
          console.error("Failed to load image:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    
    loadImage();
    
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [file, filename]);

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-2 bg-gray-800 rounded-lg h-48">
        <span className="text-gray-400">Loading image...</span>
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className="flex items-center space-x-2 bg-gray-800 p-4 rounded-lg">
        <FiImage className="text-gray-400" size={24} />
        <span className="text-gray-300 text-sm truncate">
          {filename || "Image not available"}
        </span>
      </div>
    );
  }

  if (isFullscreen) {
    return (
      <div 
        className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center cursor-pointer" 
        onClick={toggleFullscreen}
      >
        <img 
          src={imageUrl} 
          className="max-w-[90vw] max-h-[90vh] object-contain" 
          alt={filename} 
        />
      </div>
    );
  }

  return (
    <div className="media-container">
      <div className="relative">
        <img 
          src={imageUrl}
          alt={filename}
          className="max-w-full rounded-lg cursor-pointer max-h-64 object-contain bg-gray-800"
          onClick={toggleFullscreen}
        />
        <div className="absolute top-2 right-2 flex space-x-1">
          <button 
            onClick={toggleFullscreen}
            className="p-1 rounded-full bg-gray-800 bg-opacity-70 hover:bg-opacity-100 text-white"
            title="View fullscreen"
          >
            <FiMaximize size={16} />
          </button>
          <a 
            href={imageUrl} 
            download={filename}
            className="p-1 rounded-full bg-gray-800 bg-opacity-70 hover:bg-opacity-100 text-white"
            title="Download image"
            onClick={e => e.stopPropagation()}
          >
            <FiDownload size={16} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default ImageView;