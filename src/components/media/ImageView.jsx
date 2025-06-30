// src/components/media/ImageView.jsx

import React, { useState, useRef, useEffect } from 'react';
import { FiImage, FiDownload, FiMaximize } from 'react-icons/fi';
import { createObjectURL } from '../../utils/zipHelper';

const ImageView = ({ filename, file, displayMode = 'bubble' }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  
  // Ref untuk image tidak lagi diperlukan untuk mengambil dimensi, tapi kita simpan untuk handleLoad
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

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  // Tampilan layar penuh digunakan oleh kedua mode
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
        />
      </div>
    );
  }

  // Render path untuk mode 'gallery'
  if (displayMode === 'gallery') {
    return (
      <div className="w-full h-full relative group cursor-pointer bg-gray-800" onClick={toggleFullscreen}>
        {isLoading && (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400 text-xs">Memuat...</span>
          </div>
        )}
        {!isLoading && !imageUrl && (
          <div className="w-full h-full flex items-center justify-center">
            <FiImage className="text-gray-500" size={32} />
          </div>
        )}
        {imageUrl && (
          <>
            <img
              src={imageUrl}
              alt={filename}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute top-1 right-1 flex space-x-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullscreen();
                }}
                className="p-1.5 rounded-full bg-black/50 hover:bg-black/75 text-white"
                title="Lihat layar penuh"
              >
                <FiMaximize size={16} />
              </button>
              <a 
                href={imageUrl} 
                download={filename}
                className="p-1.5 rounded-full bg-black/50 hover:bg-black/75 text-white"
                title="Unduh gambar"
                onClick={e => e.stopPropagation()}
              >
                <FiDownload size={16} />
              </a>
            </div>
          </>
        )}
      </div>
    );
  }

  // --- Render path yang disempurnakan untuk mode 'bubble' (default) ---

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

  return (
    <div className="media-container w-full">
      {/* Frame yang mengontrol ukuran maksimum dan bentuk gambar */}
      <div 
        className="relative w-full max-h-[28rem] rounded-lg overflow-hidden bg-gray-800 cursor-pointer"
        onClick={toggleFullscreen}
      >
        <img 
          ref={imgRef}
          src={imageUrl}
          alt={filename}
          className="w-full h-auto object-contain" // Gunakan 'contain' agar gambar tidak terpotong, background frame akan terlihat jika rasio tidak pas
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