import { FiX, FiInfo, FiImage, FiCalendar, FiChevronUp, FiChevronDown, FiSearch } from 'react-icons/fi';
import { useState } from 'react';

function SettingsPanel({ 
    isOpen, onClose, searchTerm, onSearchChange, onFind,
    onNavigate, resultCount, currentResultIndex,
    theme, onThemeChange, onStatsClick, onGalleryClick,
    onGoToDate // Tambahkan prop baru untuk navigasi tanggal
}) {
    const [date, setDate] = useState('');

    const handleGoToDate = () => {
        if (date && onGoToDate) {
            // Validasi format tanggal
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(date)) {
                alert('Format tanggal tidak valid. Silakan pilih tanggal yang benar.');
                return;
            }
            
            // Kirim langsung format YYYY-MM-DD ke parent
            onGoToDate(date);
        }
    };
    
    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            onFind();
        }
    };
  
    if(!isOpen) return null;

  return (
    <div className="fixed top-0 right-0 h-full z-20 bg-gray-800 w-full max-w-xs shadow-lg p-4 flex flex-col animate-slide-in-right md:relative md:rounded-xl md:h-auto md:z-auto md:max-w-sm md:h-[85vh]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Pengaturan</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white"><FiX size={24} /></button>
      </div>
      <div className="flex-grow space-y-6 text-gray-300 overflow-y-auto pr-2">
        {/* Find Chat */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium mb-1">Pencarian Pesan</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              id="search" 
              placeholder="Cari..." 
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full bg-gray-700 rounded-md p-2 border border-transparent focus:ring-2 focus:ring-cyan-500 focus:outline-none" 
            />
            <button onClick={onFind} className="p-2 bg-cyan-600 rounded-md hover:bg-cyan-500">
                <FiSearch />
            </button>
          </div>
          {resultCount > 0 && (
            <div className="flex items-center justify-between mt-2 text-sm">
                <span>{currentResultIndex + 1} dari {resultCount}</span>
                <div className="flex gap-2">
                    {/* Tombol ke atas (hasil sebelumnya / lebih lama) */}
                    <button onClick={() => onNavigate(-1)} disabled={currentResultIndex <= 0} className="p-1 bg-gray-600 rounded-md hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed">
                        <FiChevronUp />
                    </button>
                    {/* Tombol ke bawah (hasil setelahnya / lebih baru) */}
                    <button onClick={() => onNavigate(1)} disabled={currentResultIndex >= resultCount - 1} className="p-1 bg-gray-600 rounded-md hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed">
                        <FiChevronDown />
                    </button>
                </div>
            </div>
          )}
        </div>

        {/* Go To Date */}
        <div>
          <label htmlFor="date-picker" className="block text-sm font-medium mb-1">Lompat ke Tanggal</label>
          <div className="flex gap-2">
            <input 
              type="date" 
              id="date-picker" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-gray-700 rounded-md p-2 border border-transparent focus:ring-2 focus:ring-cyan-500 focus:outline-none text-white" 
            />
             <button onClick={handleGoToDate} disabled={!date} className="p-2 bg-cyan-600 rounded-md hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed">
                <FiCalendar />
             </button>
          </div>
        </div>
        
        {/* Information (Stats) */}
        <div>
            <button 
                onClick={onStatsClick}
                className="w-full flex items-center gap-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                <FiInfo className="text-cyan-400"/>
                <span>Informasi & Statistik Chat</span>
            </button>
        </div>

        {/* Media/Doc/Link */}
        <div>
            <button 
                onClick={onGalleryClick}
                className="w-full flex items-center gap-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                <FiImage className="text-emerald-400"/>
                <span>Media, Dokumen & Tautan</span>
            </button>
        </div>

        {/* Theme */}
        <div>
          <p className="block text-sm font-medium mb-2">Tema (Segera Hadir)</p>
          <div className="flex gap-3">
            <button className="w-8 h-8 rounded-full bg-cyan-600 ring-2 ring-white" title="Dark (Default)"></button>
            <button className="w-8 h-8 rounded-full bg-gray-200" title="Light (Coming Soon)"></button>
            <button className="w-8 h-8 rounded-full bg-slate-900" title="Midnight (Coming Soon)"></button>
          </div>
        </div>

      </div>
       <p className="text-xs text-center text-gray-500 pt-4 mt-auto">
          WhatsApp Chat Viewer
        </p>
    </div>
  );
}

export default SettingsPanel;