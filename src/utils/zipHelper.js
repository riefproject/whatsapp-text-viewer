import * as zip from '@zip.js/zip.js';

/**
 * Creates an Object URL from a zip file entry
 * 
 * @param {Object} entry - ZIP file entry from zip.js
 * @returns {Promise<string>} - Object URL for the file
 */
export const createObjectURL = async (entry) => {
  if (!entry) throw new Error('No file entry provided');
  
  const blob = await entry.getData(new zip.BlobWriter());
  return URL.createObjectURL(blob);
};

/**
 * Searches for media files in ZIP entries that match message media references
 * 
 * @param {Array} entries - ZIP file entries from zip.js
 * @param {Array} messages - Parsed messages with media references
 * @returns {Object} - Map of media filenames to ZIP entries
 */
export const mapMediaFilesToEntries = (entries, messages) => {
  if (!entries || !messages) return {};
  
  const mediaMap = {};
  const mediaMessages = messages.filter(msg => msg.media);
  
  mediaMessages.forEach(msg => {
    if (!msg.media?.name) return;
    
    // Try to find an exact match
    const exactMatch = entries.find(entry => 
      entry.filename.endsWith(msg.media.name));
    
    if (exactMatch) {
      mediaMap[msg.media.name] = exactMatch;
    } else {
      // Try to find a partial match (filename might be in a subfolder)
      const partialMatch = entries.find(entry => 
        entry.filename.includes(msg.media.name));
      
      if (partialMatch) {
        mediaMap[msg.media.name] = partialMatch;
      }
    }
  });
  
  return mediaMap;
};