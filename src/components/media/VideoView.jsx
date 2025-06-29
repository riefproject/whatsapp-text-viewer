import React, { useState, useRef, useEffect } from 'react';
import { FiVideo, FiDownload, FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import { createObjectURL } from '../../utils/zipHelper';

const VideoView = ({ filename, file }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });
  const videoRef = useRef(null);

  useEffect(() => {
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

  const handleVideoMetadataLoaded = () => {
    if (videoRef.current) {
      const { videoWidth, videoHeight } = videoRef.current;
      setVideoDimensions({
        width: videoWidth,
        height: videoHeight
      });
    }
  };

  const toggleExpanded = (e) => {
    e.stopPropagation();
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

  // Calculate aspect ratio
  const aspectRatio = videoDimensions.width / videoDimensions.height;
  const targetMaxRatio = 3 / 4.5; // Maximum allowed aspect ratio (width/height)
  
  // After scaling to max width, check if height exceeds our max ratio
  // Don't apply the cropping when the video is expanded
  const isTooTall = !isExpanded && aspectRatio < targetMaxRatio;
  
  // Style for video container when cropping is needed
  const videoContainerStyle = isTooTall ? {
    width: '100%',
    paddingBottom: `${(4.5/3) * 100}%`, // Target aspect ratio as padding percentage
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#1f2937', // bg-gray-800 equivalent
    borderRadius: '0.5rem', // rounded-lg
  } : {
    width: '100%',
    position: 'relative',
  };
  
  // Style for the actual video
  const videoStyle = isTooTall ? {
    position: 'absolute',
    width: '100%',
    height: 'auto',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)', // Center the video
  } : {
    width: '100%',
    height: 'auto',
    maxHeight: isExpanded ? '32rem' : '28rem', // Taller when expanded
  };

  return (
    <div className="media-container w-full">
      <div className={`${!isTooTall ? 'rounded-lg bg-gray-900' : ''} overflow-hidden`} style={videoContainerStyle}>
        <video 
          ref={videoRef}
          src={videoUrl}
          style={videoStyle}
          className={`${!isTooTall ? 'rounded-lg' : ''}`}
          controls
          preload="metadata"
          onLoadedMetadata={handleVideoMetadataLoaded}
        />
        <div className="absolute top-2 right-2 flex space-x-1 z-10">
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