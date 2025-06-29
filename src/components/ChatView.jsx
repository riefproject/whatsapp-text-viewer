import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { GroupedVirtuoso } from 'react-virtuoso';
import { FiSettings, FiLogOut } from 'react-icons/fi';
import ConfirmationModal from './ConfirmationModal';
import MediaRenderer from './media/MediaRenderer';

const SENDER_COLORS = ['#34D399', '#FBBF24', '#60A5FA', '#F472B6', '#A78BFA', '#F87171', '#4ADE80', '#2DD4BF'];

const getColorForSender = (senderName) => {
  if (!senderName) return SENDER_COLORS[0];
  let hash = 0;
  for (let i = 0; i < senderName.length; i++) {
    hash = senderName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash % SENDER_COLORS.length);
  return SENDER_COLORS[index];
};

const messageCache = new Map();

const formatMessage = (text, isMe, searchTerm) => {
    const cacheKey = `${text}-${isMe}-${searchTerm || ''}`;
    if (messageCache.has(cacheKey)) {
        return messageCache.get(cacheKey);
    }

    let formattedText = String(text);
    // Sanitasi dasar untuk mencegah injeksi HTML yang tidak diinginkan
    formattedText = formattedText.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // Hanya highlight jika ada searchTerm
    if (searchTerm) {
        const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        formattedText = formattedText.replace(regex, '<mark class="bg-yellow-400 text-black rounded px-1">$1</mark>');
    }

    formattedText = formattedText.replace(/```([\s\S]+?)```/g, '<pre class="bg-gray-900 p-2 my-1 rounded-md font-mono text-sm whitespace-pre-wrap break-words"><code>$1</code></pre>');
    formattedText = formattedText.replace(/`([^`]+)`/g, '<code class="bg-gray-700 px-1 rounded-md font-mono text-sm">$1</code>');
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


const GroupHeader = ({ date }) => {
  return (
    <div style={{ backgroundColor: 'transparent' }} className="flex justify-center py-2" data-date={date}>
      <div className="bg-gray-700 px-3 py-1 rounded-lg text-xs text-gray-300 shadow-md">
        {date}
      </div>
    </div>
  );
};

const ChatBubble = ({ message, isMe, isGroupChat, mediaEntries, searchTerm }) => {
  const bubbleClasses = isMe ? 'bg-cyan-600 self-end' : 'bg-gray-600 self-start';
  
  const formattedMessage = useMemo(() => ({ 
    __html: formatMessage(message.message, isMe, searchTerm) 
  }), [message.message, isMe, searchTerm]);

  const senderColor = useMemo(() => getColorForSender(message.sender), [message.sender]);
  const hasMedia = message.media != null;

  return (
    <div className="p-1 px-3 flex flex-col">
       <div className={`chat-bubble ${hasMedia ? 'w-full' : 'w-fit'} max-w-[75%] md:max-w-[65%] mb-1 p-3 rounded-xl ${bubbleClasses}`}>
        {isGroupChat && !isMe && message.showSenderName && <p className={`${hasMedia ? 'pb-2' : ''} font-bold text-sm`} style={{ color: senderColor }}>{message.sender}</p>}
        
        {message.media && (
          <div className="mb-2 w-full media-container-wrapper">
            <MediaRenderer 
              media={message.media} 
              zipEntries={mediaEntries}
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
        
        <div className="flex justify-end items-center mt-2 text-xs">
          <p className={isMe ?'text-gray-200' : 'text-gray-400'}>{message.time}</p>
        </div>
      </div>
    </div>
  );
};

// Main ChatView Component
function ChatView({ messages, currentUser, opponentName, isGroupChat, onReset, onToggleSettings, mediaEntries, searchTerm, searchResultIndex }) {
  const virtuosoRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Group messages by date
  const { groupCounts, dateGroups, flattenedMessages } = useMemo(() => {
    if (!messages || messages.length === 0) {
      return { groupCounts: [], dateGroups: [], flattenedMessages: [] };
    }
    
    const groups = [];
    const dateGroupsMap = new Map();
    let currentGroup = null;
    
    messages.forEach((msg) => {
      if (!dateGroupsMap.has(msg.date)) {
        currentGroup = { date: msg.date, messages: [] };
        groups.push(currentGroup);
        dateGroupsMap.set(msg.date, currentGroup);
      } else {
        currentGroup = dateGroupsMap.get(msg.date);
      }
      currentGroup.messages.push(msg);
    });
    
    const dateGroups = groups.map(g => g.date);
    const groupCounts = groups.map(g => g.messages.length);
    const initialFlattened = groups.flatMap(g => g.messages);

    const processedMessages = initialFlattened.map((message, index, allMessages) => {
      const prevMessage = index > 0 ? allMessages[index - 1] : null;
      const showSenderName = !prevMessage || prevMessage.sender !== message.sender || prevMessage.date !== message.date;
      return { ...message, showSenderName };
    });
    
    return { groupCounts, dateGroups, flattenedMessages: processedMessages };
  }, [messages]);

  // Efek untuk auto-scroll ke hasil pencarian
  useEffect(() => {
    if (searchResultIndex !== undefined && searchResultIndex !== -1 && virtuosoRef.current) {
        virtuosoRef.current.scrollToIndex({
            index: searchResultIndex,
            align: 'center',
            behavior: 'smooth',
        });
    }
  }, [searchResultIndex]);

  // Scroll to bottom on initial load
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
        searchTerm={searchTerm}
      />
    );
  }, [flattenedMessages, currentUser, isGroupChat, mediaEntries, searchTerm]);

  const groupRenderer = useCallback((index) => (
    <GroupHeader date={dateGroups[index]} />
  ), [dateGroups]);
  
  const totalMessageCount = useMemo(() => {
      return messages.length;
  }, [messages]);
  
  if (totalMessageCount === 0) {
    return (
      <>
        <div className="w-full h-svh max-w-2xl p-1 rounded-2xl bg-gradient-to-tr from-[#c4e07b] to-[#136880] flex-grow">
          <div className="bg-[#2a2a2a] rounded-xl h-[85vh] flex flex-col">
            <header className="flex justify-between items-center p-4 border-b border-gray-700">
              <h2 className="text-lg font-bold text-gray-200 truncate">{displayName}</h2>
              <div className="flex items-center gap-4">
                <button onClick={onToggleSettings} className="text-gray-400 hover:text-white transition-colors">
                  <FiSettings size={20} />
                </button>
                <button onClick={() => setIsModalOpen(true)} className="text-gray-400 hover:text-white transition-colors">
                  <FiLogOut size={20} />
                </button>
              </div>
            </header>
            <div className="flex-grow flex items-center justify-center text-center px-4">
                <p className="text-gray-400">Tidak ada pesan untuk ditampilkan.</p>
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
            <h2 className="text-lg font-bold text-gray-200 truncate">{displayName}</h2>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {totalMessageCount} pesan
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
              overscan={200}
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