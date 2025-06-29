import { FiX } from 'react-icons/fi';

function SettingsPanel({ onClose }) {
  return (
    <div className="fixed top-0 right-0 h-full z-20 bg-gray-800 w-full max-w-xs rounded-l-xl shadow-lg p-4 flex flex-col animate-slide-in-right md:relative md:rounded-xl md:h-auto md:z-auto">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Pengaturan</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white"><FiX size={24} /></button>
      </div>
      <div className="space-y-4 text-gray-300">
        <div>
          <label htmlFor="search" className="block text-sm font-medium mb-1">Pencarian Pesan</label>
          <input type="text" id="search" placeholder="Cari..." className="w-full bg-gray-700 rounded-md p-2 border border-transparent focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
        </div>
        <div>
          <p className="block text-sm font-medium mb-1">Tema</p>
          <div className="flex gap-2">
            <button className="w-8 h-8 rounded-full bg-cyan-600 ring-2 ring-white"></button>
            <button className="w-8 h-8 rounded-full bg-purple-600"></button>
            <button className="w-8 h-8 rounded-full bg-green-600"></button>
          </div>
        </div>
        <p className="text-xs text-center text-gray-500 pt-4">Fitur lainnya akan segera hadir!</p>
      </div>
    </div>
  );
}

export default SettingsPanel;
