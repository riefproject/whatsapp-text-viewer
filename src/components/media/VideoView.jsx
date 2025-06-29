import React, { useState, useRef, useEffect } from 'react';
import { FiVideo, FiDownload, FiMaximize2, FiMinimize2, FiPlay, FiPause } from 'react-icons/fi';
import { createObjectURL } from '../../utils/zipHelper';

const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds === 0) return '0:00';
  const date = new Date(seconds * 1000);
  const hh = date.getUTCHours();
  const mm = date.getUTCMinutes();
  const ss = date.getUTCSeconds().toString().padStart(2, '0');
  if (hh) {
    return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
  }
  return `${mm}:${ss}`;
};

const VideoView = ({ filename, file }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef(null);
  const progressRef = useRef(null);

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
      const { videoWidth, videoHeight, duration } = videoRef.current;
      setVideoDimensions({
        width: videoWidth,
        height: videoHeight
      });
      setDuration(duration);
    }
  };

  const toggleExpanded = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handlePlayPause = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleSeek = (e) => {
    if (videoRef.current) {
      const seekTime = e.target.value;
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    if(videoRef.current) {
      videoRef.current.currentTime = 0;
    }
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
    borderRadius: '0.5rem',
  };

  return (
    <div className="media-container w-full">
      <div className={`${!isTooTall ? 'rounded-lg bg-gray-900' : ''} overflow-hidden`} style={videoContainerStyle}>
        <video 
          ref={videoRef}
          src={videoUrl}
          style={videoStyle}
          className={`${!isTooTall ? 'rounded-lg' : ''} cursor-pointer`}
          preload="metadata"
          onLoadedMetadata={handleVideoMetadataLoaded}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleVideoEnd}
          onClick={handlePlayPause}
        />
        
        {/* Custom Controls Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end pointer-events-none">
          {/* Top buttons */}
          <div className="absolute top-2 right-2 flex space-x-1 z-10 pointer-events-auto">
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

          {/* Center Play Button */}
          {!isPlaying && (
            <div className="flex-grow flex items-center justify-center">
              <button 
                onClick={handlePlayPause} 
                className="p-4 bg-gray-500 bg-opacity-50 rounded-full text-white pointer-events-auto hover:bg-opacity-75 transition-opacity"
              >
                <FiPlay size={24} className="ml-1" />
              </button>
            </div>
          )}

          {/* Bottom Controls */}
          <div className="p-2 bg-gradient-to-t from-black/60 to-transparent pointer-events-auto">
            <div className="flex items-center gap-2 text-white text-xs">
              <button onClick={handlePlayPause} className="p-1">
                {isPlaying ? <FiPause size={16} /> : <FiPlay size={16} />}
              </button>
              <span>{formatTime(currentTime)}</span>
              <input
                ref={progressRef}
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer  accent-cyan-500"
              />
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoView;