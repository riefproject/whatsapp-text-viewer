import React, { useState, useRef, useEffect } from 'react';
import { FiImage, FiDownload, FiMaximize } from 'react-icons/fi';
import { createObjectURL } from '../../utils/zipHelper';

const ImageView = ({ filename, file }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const imgRef = useRef(null);

  useEffect(() => {
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

  // Handle image load to get dimensions
  const handleImageLoad = () => {
    if (imgRef.current) {
      const { naturalWidth, naturalHeight } = imgRef.current;
      setImageDimensions({
        width: naturalWidth,
        height: naturalHeight
      });
    }
  };

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

  // Calculate aspect ratio
  const aspectRatio = imageDimensions.width / imageDimensions.height;
  const targetMaxRatio = 3 / 4.5; // Maximum allowed aspect ratio (width/height)
  
  // After scaling to max width, check if height exceeds our max ratio
  const isTooTall = aspectRatio < targetMaxRatio;
  
  // Style for image container when cropping is needed
  const imageContainerStyle = isTooTall ? {
    width: '100%',
    paddingBottom: `${(4.5/3) * 100}%`, // Target aspect ratio as padding percentage
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#1f2937', // bg-gray-800 equivalent
    borderRadius: '0.5rem', // rounded-lg
  } : {};
  
  // Style for the actual image
  const imageStyle = isTooTall ? {
    position: 'absolute',
    width: '100%',
    height: 'auto',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)', // Center the image
    objectFit: 'cover',
  } : {
    width: '100%', 
    maxHeight: '28rem', // max-h-112 (448px or 28rem)
    objectFit: 'contain',
    backgroundColor: '#1f2937', // bg-gray-800
    borderRadius: '0.5rem', // rounded-lg
  };

  if (isFullscreen) {
    return (
      <div 
        className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center cursor-pointer" 
        onClick={toggleFullscreen}
      >
        <img 
          ref={imgRef}
          src={imageUrl} 
          className="max-w-[90vw] max-h-[90vh] object-contain" 
          alt={filename}
          onLoad={handleImageLoad}
        />
      </div>
    );
  }

  return (
    <div className="media-container w-full">
      <div className="relative" style={imageContainerStyle}>
        <img 
          ref={imgRef}
          src={imageUrl}
          alt={filename}
          style={imageStyle}
          className={isTooTall ? 'cursor-pointer' : 'rounded-lg cursor-pointer bg-gray-800 w-full'}
          onClick={toggleFullscreen}
          onLoad={handleImageLoad}
        />
        <div className="absolute top-2 right-2 flex space-x-1 z-10">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
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