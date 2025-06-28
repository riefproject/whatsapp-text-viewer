import React, { useState } from 'react';
import { FiVideo, FiDownload, FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import { createObjectURL } from '../../utils/zipHelper';

const VideoView = ({ filename, file }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const videoRef = React.useRef(null);

  React.useEffect(() => {
    const loadVideo = async () => {
      if (file) {
        try {
          const url = await createObjectURL(file);
          setVideoUrl(url);
        } catch (error) {
          console.error("Failed to load video:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    
    loadVideo();
    
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [file, filename]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-2 bg-gray-800 rounded-lg h-48">
        <span className="text-gray-400">Loading video...</span>
      </div>
    );
  }

  if (!videoUrl) {
    return (
      <div className="flex items-center space-x-2 bg-gray-800 p-4 rounded-lg">
        <FiVideo className="text-gray-400" size={24} />
        <span className="text-gray-300 text-sm truncate">
          {filename || "Video not available"}
        </span>
      </div>
    );
  }

  return (
    <div className="media-container w-full">
      <div className="relative rounded-lg overflow-hidden bg-gray-900">
        <video 
          ref={videoRef}
          src={videoUrl}
          className={`w-full rounded-lg ${isExpanded ? 'max-h-96' : 'max-h-48'} object-contain`}
          controls
          preload="metadata"
        />
        <div className="absolute top-2 right-2 flex space-x-1">
          <button 
            onClick={toggleExpanded}
            className="p-1 rounded-full bg-gray-800 bg-opacity-70 hover:bg-opacity-100 text-white"
            title={isExpanded ? "Minimize" : "Expand"}
          >
            {isExpanded ? <FiMinimize2 size={16} /> : <FiMaximize2 size={16} />}
          </button>
          <a 
            href={videoUrl} 
            download={filename}
            className="p-1 rounded-full bg-gray-800 bg-opacity-70 hover:bg-opacity-100 text-white"
            title="Download video"
            onClick={e => e.stopPropagation()}
          >
            <FiDownload size={16} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default VideoView;