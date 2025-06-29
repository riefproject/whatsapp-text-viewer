import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { GroupedVirtuoso } from 'react-virtuoso';
import { FiSettings, FiLogOut } from 'react-icons/fi';
import ConfirmationModal from './ConfirmationModal';
import MediaRenderer from './media/MediaRenderer';

// Daftar warna yang cerah dan mudah dibaca dengan latar belakang gelap
const SENDER_COLORS = [
  '#34D399', // emerald-400
  '#FBBF24', // amber-400
  '#60A5FA', // blue-400
  '#F472B6', // pink-400
  '#A78BFA', // violet-400
  '#F87171', // red-400
  '#4ADE80', // green-400
  '#2DD4BF', // teal-400
];

// Fungsi untuk mendapatkan warna konsisten berdasarkan nama sender
const getColorForSender = (senderName) => {
  if (!senderName) return SENDER_COLORS[0];
  let hash = 0;
  for (let i = 0; i < senderName.length; i++) {
    hash = senderName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash % SENDER_COLORS.length);
  return SENDER_COLORS[index];
};


// Cache untuk formatted messages
const messageCache = new Map();

// Memoized formatMessage dengan caching
const formatMessage = (text, isMe) => {
  const cacheKey = `${text}-${isMe}`;
  if (messageCache.has(cacheKey)) {
    return messageCache.get(cacheKey);
  }
  
  let formattedText = String(text);
  formattedText = formattedText.replace(/```([\s\S]+?)```/g, '<pre class="bg-gray-900 p-2 my-1 rounded-md font-mono text-sm whitespace-pre-wrap break-words"><code>$1</code></pre>');
  formattedText = formattedText.replace(/`([\s\S]+?)`/g, '<pre class="bg-gray-200 p-2 my-1 rounded-md font-mono text-sm whitespace-pre-wrap break-words"><code>$1</code></pre>');
  formattedText = formattedText.replace(/\*([^\s*](?:[^*]*[^\s*])?)\*/g, '<strong>$1</strong>');
  formattedText = formattedText.replace(/_([^\s_](?:[^_]*[^\s_])?)_/g, '<i>$1</i>');
  formattedText = formattedText.replace(/~([^\s~](?:[^~]*[^\s~])?)~/g, '<del>$1</del>');
  
  formattedText = formattedText.replace(
    /&lt;Media tidak disertakan&gt;|<Media tidak disertakan>|Media tidak disertakan/gi,
    `<i class="${isMe ? 'text-gray-300' : 'text-gray-400'}">Media tidak disertakan</i>`
  );
  messageCache.set(cacheKey, formattedText);
  return formattedText;
};

// Memoized komponen GroupHeader
const GroupHeader = ({ date }) => {
  return (
    <div style={{ backgroundColor: 'transparent' }} className="flex justify-center py-2">
      <div className="bg-gray-700 px-3 py-1 rounded-lg text-xs text-gray-300 shadow-md">
        {date}
      </div>
    </div>
  );
};

// Optimized ChatBubble dengan React.memo
const ChatBubble = ({ message, isMe, isGroupChat, mediaEntries }) => {
  const bubbleClasses = isMe ? 'bg-cyan-600 self-end' : 'bg-gray-600 self-start';
  
  // Memoize formatted message per message
  const formattedMessage = useMemo(() => ({ 
    __html: formatMessage(message.message, isMe) 
  }), [message.message, isMe]);

  // Dapatkan warna untuk sender
  const senderColor = useMemo(() => getColorForSender(message.sender), [message.sender]);

  // Determine if the bubble should use full width for media
  const hasMedia = message.media != null;

  return (
    <div className="p-1 px-3 flex flex-col">
      {/* Make bubbles with media wider */}
       <div className={`chat-bubble ${hasMedia ? 'w-full' : 'w-fit'} max-w-[75%] md:max-w-[65%] mb-1 p-3 rounded-xl ${bubbleClasses}`}>
        {isGroupChat && !isMe && message.showSenderName && <p className={`${hasMedia ? 'pb-2' : ''} font-bold text-sm`} style={{ color: senderColor }}>{message.sender}</p>}
        
        {/* Render media content if present */}
        {message.media && (
          <div className="mb-2 w-full media-container-wrapper">
            <MediaRenderer 
              media={message.media} 
              zipEntries={mediaEntries}
              bubbleWidth={hasMedia ? 'media-bubble-content' : ''}
            />
          </div>
        )}
        
        {message.message && (
          <div 
            className="text-white whitespace-pre-wrap" 
            style={{wordBreak: 'break-word'}} 
            dangerouslySetInnerHTML={formattedMessage} 
          />
        )}
        
        <div className="flex justify-between items-center mt-2 text-xs">
          <div className="flex gap-2">
            {message.edited && <span className="italic text-gray-400">Diedit</span>}
            {message.pinned && <span className="italic text-gray-400">Disematkan</span>}
          </div>
          <p className={isMe ?'text-gray-200' : 'text-gray-400'}>{message.time}</p>
        </div>
      </div>
    </div>
  );
};

function ChatView({ messages, currentUser, opponentName, isGroupChat, onReset, onToggleSettings, mediaEntries }) {
  const virtuosoRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sort dan filter messages dengan logic yang diperbaiki
  const sortedMessages = useMemo(() => {
    if (!messages) return [];
    
    const filtered = messages.filter(msg => msg && msg.message && msg.message.trim() !== '');
    
    // Tidak perlu sorting lagi karena ChatParser sudah memberikan urutan yang benar
    // Hanya gunakan urutan asli dari array messages
    return filtered;
  }, [messages]);

  // Group messages by date dengan mempertahankan urutan asli
  const { groupCounts, dateGroups, flattenedMessages } = useMemo(() => {
    if (!sortedMessages || sortedMessages.length === 0) {
      return { groupCounts: [], dateGroups: [], flattenedMessages: [] };
    }
    
    const groups = [];
    const dateGroupsMap = new Map();
    let currentGroup = null;
    
    // Group messages sambil mempertahankan urutan
    sortedMessages.forEach((msg, index) => {
      if (!dateGroupsMap.has(msg.date)) {
        // Buat grup baru
        currentGroup = {
          date: msg.date,
          messages: []
        };
        groups.push(currentGroup);
        dateGroupsMap.set(msg.date, currentGroup);
      } else {
        currentGroup = dateGroupsMap.get(msg.date);
      }
      
      // Tambahkan message dengan index asli untuk debugging
      currentGroup.messages.push({
        ...msg,
        originalIndex: index
      });
    });
    
    const dateGroups = groups.map(g => g.date);
    const groupCounts = groups.map(g => g.messages.length);
    const initialFlattened = groups.flatMap(g => g.messages);

    // Tambahkan logika untuk menentukan apakah nama sender harus ditampilkan
    const flattenedMessages = initialFlattened.map((message, index, allMessages) => {
      const prevMessage = index > 0 ? allMessages[index - 1] : null;
      const showSenderName = !prevMessage || prevMessage.sender !== message.sender || prevMessage.date !== message.date;
      return {
        ...message,
        showSenderName,
      };
    });
    
    return { groupCounts, dateGroups, flattenedMessages };
  }, [sortedMessages]);

  // Scroll to bottom on load
  useEffect(() => {
    if (virtuosoRef.current && flattenedMessages.length > 0) {
      setTimeout(() => {
        virtuosoRef.current.scrollToIndex({
          index: flattenedMessages.length - 1,
          behavior: 'auto'
        });
      }, 100);
    }
  }, [flattenedMessages.length]);

  const displayName = isGroupChat ? "Group Chat" : opponentName;

  // Item renderer - menggunakan flattenedMessages yang sudah terurut
  const itemRenderer = useCallback((index) => {
    const message = flattenedMessages[index];
    if (!message) return null;
    
    return (
      <ChatBubble
        key={message.id || `msg-${index}`}
        message={message}
        isMe={message.sender === currentUser}
        isGroupChat={isGroupChat}
        mediaEntries={mediaEntries}
      />
    );
  }, [flattenedMessages, currentUser, isGroupChat, mediaEntries]);

  // Group renderer
  const groupRenderer = useCallback((index) => (
    <GroupHeader date={dateGroups[index]} />
  ), [dateGroups]);

  if (sortedMessages.length === 0) {
    return (
      <>
        <div className="w-full h-svh max-w-2xl p-1 rounded-2xl bg-gradient-to-tr from-[#c4e07b] to-[#136880] flex-grow">
          <div className="bg-[#2a2a2a] rounded-xl h-[85vh] flex flex-col">
            <header className="flex justify-between items-center p-4 border-b border-gray-700">
              <h2 className="text-lg font-bold text-gray-200">{displayName}</h2>
              <div className="flex items-center gap-4">
                <button onClick={onToggleSettings} className="text-gray-400 hover:text-white transition-colors">
                  <FiSettings size={20} />
                </button>
                <button onClick={() => setIsModalOpen(true)} className="text-gray-400 hover:text-white transition-colors">
                  <FiLogOut size={20} />
                </button>
              </div>
            </header>
            <div className="flex-grow flex items-center justify-center">
              <p className="text-gray-400">No messages to display</p>
            </div>
          </div>
        </div>
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

  return (
    <>
      <div className="w-full max-w-2xl p-1 rounded-2xl bg-gradient-to-tr from-[#c4e07b] to-[#136880] flex-grow">
        <div className="bg-[#2a2a2a] rounded-xl h-[85vh] flex flex-col">
          <header className="flex justify-between items-center p-4 border-b border-gray-700">
            <h2 className="text-lg font-bold text-gray-200">{displayName}</h2>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-400">
                {sortedMessages.length} messages
              </span>
              <button onClick={onToggleSettings} className="text-gray-400 hover:text-white transition-colors">
                <FiSettings size={20} />
              </button>
              <button onClick={() => setIsModalOpen(true)} className="text-gray-400 hover:text-white transition-colors">
                <FiLogOut size={20} />
              </button>
            </div>
          </header>
          <div className="flex-grow h-0">
            <GroupedVirtuoso
              ref={virtuosoRef}
              style={{ height: '100%' }}
              groupCounts={groupCounts}
              groupContent={groupRenderer}
              itemContent={itemRenderer}
              initialTopMostItemIndex={flattenedMessages.length - 1}
              followOutput="auto"
              overscan={50}
            />
          </div>
        </div>
      </div>
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