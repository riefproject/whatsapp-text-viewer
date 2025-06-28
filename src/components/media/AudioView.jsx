import React, { useState, useRef } from 'react';
import { FiMusic, FiPlay, FiPause, FiDownload } from 'react-icons/fi';
import { createObjectURL } from '../../utils/zipHelper';

const AudioView = ({ filename, file }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  React.useEffect(() => {
    const loadAudio = async () => {
      if (file) {
        try {
          const url = await createObjectURL(file);
          setAudioUrl(url);
        } catch (error) {
          console.error("Failed to load audio:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    
    loadAudio();
    
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [file, filename]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressClick = (e) => {
    if (audioRef.current && progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      audioRef.current.currentTime = pos * duration;
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-2 bg-gray-800 rounded-lg h-16">
        <span className="text-gray-400">Loading audio...</span>
      </div>
    );
  }

  if (!audioUrl) {
    return (
      <div className="flex items-center space-x-2 bg-gray-800 p-3 rounded-lg">
        <FiMusic className="text-gray-400" size={20} />
        <span className="text-gray-300 text-sm truncate">
          {filename || "Audio not available"}
        </span>
      </div>
    );
  }

  return (
    <div className="media-container">
      <div className="flex flex-col bg-gray-800 p-3 rounded-lg">
        <div className="flex items-center mb-2">
          <button 
            onClick={togglePlay}
            className="p-2 mr-2 rounded-full bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            {isPlaying ? <FiPause size={18} /> : <FiPlay size={18} />}
          </button>
          <div className="flex-grow">
            <span className="text-gray-300 text-sm font-medium truncate block">
              {filename}
            </span>
            <div className="flex items-center text-xs text-gray-400 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span className="mx-1">/</span>
              <span>{formatTime(duration || 0)}</span>
            </div>
          </div>
          <a 
            href={audioUrl} 
            download={filename}
            className="p-1.5 rounded-full bg-gray-700 hover:bg-gray-600 text-white"
            title="Download audio"
          >
            <FiDownload size={16} />
          </a>
        </div>

        <div 
          ref={progressRef}
          className="bg-gray-700 h-1.5 rounded-full cursor-pointer"
          onClick={handleProgressClick}
        >
          <div 
            className="bg-cyan-500 h-full rounded-full"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          ></div>
        </div>

        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          onLoadedMetadata={handleLoadedMetadata}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
};

export default AudioView;