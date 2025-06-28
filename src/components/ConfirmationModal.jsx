import { FiX } from 'react-icons/fi';

function ConfirmationModal({ isOpen, onClose, onConfirm, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 animate-fade-in">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h3 className="text-xl font-bold">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><FiX size={24} /></button>
        </div>
        <div className="p-6 text-gray-300">
          {children}
        </div>
        <div className="flex justify-end gap-4 p-4 bg-gray-900/50 rounded-b-lg">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 font-semibold transition-colors"
          >
            Batal
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 font-semibold transition-colors"
          >
            Ya, Lanjutkan
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
