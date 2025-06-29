import { useState } from 'react';
import { FiImage, FiFileText, FiLink, FiX } from 'react-icons/fi';
import MediaRenderer from './media/MediaRenderer';

function MediaGallery({ isOpen, onClose, media, docs, links, mediaMap }) {
  const [activeTab, setActiveTab] = useState('media');

  if (!isOpen) return null;

  const renderContent = () => {
    switch (activeTab) {
      case 'media':
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {media.length > 0 ? media.map((msg, index) => (
              <div key={index} className="w-full h-32 bg-gray-700 rounded-lg overflow-hidden">
                 <MediaRenderer media={msg.media} zipEntries={mediaMap} />
              </div>
            )) : <p className="col-span-full text-center text-gray-400">Tidak ada media.</p>}
          </div>
        );
      case 'docs':
        return (
            <div className="space-y-2">
                {docs.length > 0 ? docs.map((msg, index) => (
                    <div key={index} className="bg-gray-700 p-2 rounded-lg">
                        <MediaRenderer media={msg.media} zipEntries={mediaMap} />
                    </div>
                )) : <p className="text-center text-gray-400">Tidak ada dokumen.</p>}
            </div>
        );
      case 'links':
        return (
            <div className="space-y-2">
                {links.length > 0 ? links.map((link, index) => (
                    <a href={link} key={index} target="_blank" rel="noopener noreferrer" className="block bg-gray-700 p-3 rounded-lg hover:bg-gray-600 truncate text-cyan-400">
                        {link}
                    </a>
                )) : <p className="text-center text-gray-400">Tidak ada tautan.</p>}
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 animate-fade-in">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl h-[80vh] m-4 flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h3 className="text-xl font-bold">Galeri Media</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><FiX size={24} /></button>
        </div>
        <div className="border-b border-gray-700">
          <nav className="flex space-x-1 p-2">
            <button onClick={() => setActiveTab('media')} className={`px-4 py-2 rounded-md flex items-center gap-2 ${activeTab === 'media' ? 'bg-cyan-600 text-white' : 'hover:bg-gray-700'}`}>
              <FiImage /> Media
            </button>
            <button onClick={() => setActiveTab('docs')} className={`px-4 py-2 rounded-md flex items-center gap-2 ${activeTab === 'docs' ? 'bg-cyan-600 text-white' : 'hover:bg-gray-700'}`}>
              <FiFileText /> Dokumen
            </button>
            <button onClick={() => setActiveTab('links')} className={`px-4 py-2 rounded-md flex items-center gap-2 ${activeTab === 'links' ? 'bg-cyan-600 text-white' : 'hover:bg-gray-700'}`}>
              <FiLink /> Tautan
            </button>
          </nav>
        </div>
        <div className="p-4 overflow-y-auto flex-grow">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default MediaGallery;