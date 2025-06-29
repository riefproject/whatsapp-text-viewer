import { FiX, FiMessageSquare, FiUsers, FiAward, FiImage, FiVideo, FiFileText, FiLink } from 'react-icons/fi';

function ChatStatsModal({ isOpen, onClose, stats }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 animate-fade-in">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg m-4">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h3 className="text-xl font-bold">Statistik Chat</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><FiX size={24} /></button>
        </div>
        <div className="p-6 text-gray-300">
          {stats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-700 p-4 rounded-lg flex items-center">
                <FiMessageSquare size={24} className="mr-4 text-cyan-400" />
                <div>
                  <div className="text-sm text-gray-400">Total Pesan</div>
                  <div className="text-lg font-bold">{stats.totalMessages}</div>
                </div>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg flex items-center">
                <FiUsers size={24} className="mr-4 text-cyan-400" />
                <div>
                  <div className="text-sm text-gray-400">Partisipan</div>
                  <div className="text-lg font-bold">{stats.participantCount}</div>
                </div>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg flex items-center col-span-1 md:col-span-2">
                <FiAward size={24} className="mr-4 text-amber-400" />
                <div>
                  <div className="text-sm text-gray-400">Pengirim Terbanyak</div>
                  <div className="text-lg font-bold">{stats.topSender.sender} ({stats.topSender.count} pesan)</div>
                </div>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg flex items-center">
                <FiImage size={24} className="mr-4 text-emerald-400" />
                <div>
                  <div className="text-sm text-gray-400">Gambar</div>
                  <div className="text-lg font-bold">{stats.mediaCount.image}</div>
                </div>
              </div>
                <div className="bg-gray-700 p-4 rounded-lg flex items-center">
                <FiVideo size={24} className="mr-4 text-rose-400" />
                <div>
                    <div className="text-sm text-gray-400">Video</div>
                    <div className="text-lg font-bold">{stats.mediaCount.video}</div>
                </div>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg flex items-center">
                <FiFileText size={24} className="mr-4 text-violet-400" />
                <div>
                    <div className="text-sm text-gray-400">Dokumen</div>
                    <div className="text-lg font-bold">{stats.mediaCount.document + stats.mediaCount.file}</div>
                </div>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg flex items-center">
                <FiLink size={24} className="mr-4 text-blue-400" />
                <div>
                    <div className="text-sm text-gray-400">Total Link</div>
                    <div className="text-lg font-bold">{stats.linkCount}</div>
                </div>
              </div>
            </div>
          ) : (
            <p>Memuat statistik...</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatStatsModal;