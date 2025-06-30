// src/components/media/MediaRenderer.jsx

import ImageView from './ImageView';
import StickerView from './StickerView';
import VideoView from './VideoView';
import AudioView from './AudioView';
import DocumentView from './DocumentView';
import FileView from './FileView';

const MediaRenderer = ({ media, zipEntries = null, displayMode = 'bubble' }) => {
  if (!media) return null;
  
  const { type, name } = media;
  
  // Get the media file directly from zipEntries if it's an object (mediaMap)
  let mediaFile = null;
  
  if (zipEntries) {
    // Check if zipEntries is an object (mediaMap from App.jsx)
    if (!Array.isArray(zipEntries) && typeof zipEntries === 'object') {
      mediaFile = zipEntries[name]; // Get directly from the map
    } 
    // If it's an array, use find method as before
    else if (Array.isArray(zipEntries)) {
      mediaFile = zipEntries.find(entry => entry.filename.includes(name));
    }
  }
  
  switch (type) {
    case 'image':
      return <ImageView filename={name} file={mediaFile} displayMode={displayMode} />;
    
    case 'sticker':
      return <StickerView filename={name} file={mediaFile} />;
    
    case 'video':
      return <VideoView filename={name} file={mediaFile} displayMode={displayMode} />;
    
    case 'audio':
      return <AudioView filename={name} file={mediaFile} />;
    
    case 'document':
      return <DocumentView filename={name} file={mediaFile} />;
    
    case 'file':
    default:
      return <FileView filename={name} file={mediaFile} />;
  }
};

export default MediaRenderer;