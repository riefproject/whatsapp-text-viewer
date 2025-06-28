import { useState, useRef, useEffect, useCallback } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { FiSettings, FiLogOut } from 'react-icons/fi'; // Import ikon
import ConfirmationModal from './ConfirmationModal'; // Import modal

// Fungsi formatMessage (tetap sama)
const formatMessage = (text) => {
  let formattedText = String(text);
  formattedText = formattedText.replace(/```([\s\S]+?)```/g, '<pre class="bg-gray-900 p-2 my-1 rounded-md font-mono text-sm whitespace-pre-wrap break-words"><code>$1</code></pre>');
  formattedText = formattedText.replace(/\*([^\s*](?:[^*]*[^\s*])?)\*/g, '<strong>$1</strong>');
  formattedText = formattedText.replace(/_([^\s_](?:[^_]*[^\s_])?)_/g, '<i>$1</i>');
  formattedText = formattedText.replace(/~([^\s~](?:[^~]*[^\s~])?)~/g, '<del>$1</del>');
  return formattedText;
};

// Komponen bubble chat (styling disesuaikan)
function ChatBubble({ message, isMe, isGroupChat }) {
  const bubbleClasses = isMe ? 'bg-cyan-600 self-end' : 'bg-gray-600 self-start';
  const formattedMessage = { __html: formatMessage(message.message) };
  return (
    <div className={`chat-bubble max-w-[80%] md:max-w-[70%] w-fit mb-1 p-3 rounded-xl ${bubbleClasses}`}>
      {/* Tampilkan nama pengirim hanya jika ini group chat dan bukan pesan dari 'currentUser' */}
      {isGroupChat && !isMe && <p className="font-bold text-lime-300 text-sm">{message.sender}</p>}
      <div className="text-white whitespace-pre-wrap" style={{wordBreak: 'break-word'}} dangerouslySetInnerHTML={formattedMessage} />
      <p className="text-xs text-gray-400 mt-2 text-right">{message.date} {message.time}</p>
    </div>
  );
}

// Komponen utama untuk menampilkan chat
function ChatView({ messages, currentUser, opponentName, isGroupChat, onReset, onToggleSettings }) {
  const BATCH_SIZE = 100;
  const virtuosoRef = useRef(null);
  const [visibleMessages, setVisibleMessages] = useState([]);
  const [firstItemIndex, setFirstItemIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false); // State untuk modal

  const loadMore = useCallback(() => { /* ... (logika ini tetap sama) ... */
    const totalMessages = messages.length;
    if (visibleMessages.length >= totalMessages) return;
    const nextFirstItemIndex = Math.max(0, firstItemIndex - BATCH_SIZE);
    const newBatch = messages.slice(nextFirstItemIndex, firstItemIndex);
    setVisibleMessages(prev => [...newBatch, ...prev]);
    setFirstItemIndex(nextFirstItemIndex);
  }, [firstItemIndex, messages, visibleMessages.length]);

  useEffect(() => { /* ... (logika ini tetap sama) ... */
    const totalMessages = messages.length;
    const initialFirstIndex = Math.max(0, totalMessages - BATCH_SIZE);
    const initialMessages = messages.slice(initialFirstIndex, totalMessages);
    setVisibleMessages(initialMessages);
    setFirstItemIndex(initialFirstIndex);
  }, [messages]);

  const displayName = isGroupChat ? "Group Chat" : opponentName;

  return (
    <>
      {/* Container utama dengan border gradasi */}
      <div className="w-full max-w-2xl p-1 rounded-2xl bg-gradient-to-tr from-yellow-300 to-cyan-400 flex-grow">
        <div className="bg-[#2a2a2a] rounded-xl h-[85vh] flex flex-col">
          {/* Header Chat */}
          <header className="flex justify-between items-center p-4 border-b border-gray-700">
            <h2 className="text-lg font-bold text-gray-200">{displayName}</h2>
            <div className="flex items-center gap-4">
              <button onClick={onToggleSettings} className="text-gray-400 hover:text-white transition-colors"><FiSettings size={20} /></button>
              <button onClick={() => setIsModalOpen(true)} className="text-gray-400 hover:text-white transition-colors"><FiLogOut size={20} /></button>
            </div>
          </header>

          {/* Virtuoso Container */}
          <div className="flex-grow h-0">
            <Virtuoso
              ref={virtuosoRef}
              style={{ height: '100%' }}
              data={visibleMessages}
              firstItemIndex={firstItemIndex}
              startReached={loadMore}
              initialTopMostItemIndex={visibleMessages.length - 1}
              followOutput={'auto'}
              components={{
                Header: () => (firstItemIndex > 0 && <div className="p-4 text-center text-gray-400">Loading...</div>),
                Item: ({ children, ...props }) => (<div {...props} className="p-1 px-3 flex flex-col">{children}</div>)
              }}
              itemContent={(index, msg) => (
                <ChatBubble key={`${msg.date}-${msg.time}-${index}`} message={msg} isMe={msg.sender === currentUser} isGroupChat={isGroupChat} />
              )}
            />
          </div>
        </div>
      </div>
      
      {/* Modal Konfirmasi */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={onReset}
        title="Konfirmasi Keluar"
      >
        <p>Apakah Anda yakin ingin keluar dan memulai dari awal?</p>
      </ConfirmationModal>
    </>
  );
}

export default ChatView;
