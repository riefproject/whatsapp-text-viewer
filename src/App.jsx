import { useCallback, useState } from 'react';
import { parseWhatsAppChat } from './utils/ChatParser';

import FileUpload from './components/FileUpload';
import UserSelection from './components/UserSelection';
import ChatView from './components/ChatView';
import SettingsPanel from './components/SettingsPanel';

function App() {
    const [parsedData, setParsedData] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [error, setError] = useState('');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const handleFileAccepted = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const rawText = event.target.result;
            const result = parseWhatsAppChat(rawText);
            if (result && result.messages.length > 0) {
                setParsedData(result);
                setError('');
            } else {
                setError("Gagal mem-parsing file. Pastikan formatnya benar.");
                setParsedData(null);
            }
        };
        reader.readAsText(file);
    }, []);

    const handleUserSelect = (selectedUser) => {
        setCurrentUser(selectedUser);
    };
    
    const handleReset = () => {
        setParsedData(null);
        setCurrentUser(null);
        setError('');
        setIsSettingsOpen(false);
    };

    const toggleSettingsPanel = () => {
        setIsSettingsOpen(prev => !prev);
    }

    const renderMainContent = () => {
        if (parsedData && currentUser) {
            const opponentName = parsedData.participants.find(p => p !== currentUser) || 'Unknown';
            const isGroupChat = parsedData.participants.length > 2;

            return (
                <div className="w-full flex justify-center items-start gap-6">
                    <ChatView 
                        messages={parsedData.messages} 
                        currentUser={currentUser}
                        opponentName={opponentName}
                        isGroupChat={isGroupChat}
                        onReset={handleReset}
                        onToggleSettings={toggleSettingsPanel}
                    />
                    {isSettingsOpen && <SettingsPanel onClose={toggleSettingsPanel} />}
                </div>
            );
        }
        if (parsedData) {
            return <UserSelection participants={parsedData.participants} onSelect={handleUserSelect} />;
        }
        // Saat FileUpload ditampilkan, header juga akan ikut ditampilkan.
        // Layout centering akan menangani keduanya.
        return (
            <>
                <header className="text-center mb-8 max-w-3xl">
                    <h1 className="text-4xl md:text-5xl font-bold mb-2">WHATSAPP CHAT VIEWER</h1>
                    <p className="text-gray-400 text-lg">
                        Upload a .zip or .txt file to view the chat in a bubble-style format.
                    </p>
                </header>
                {error && <p className="text-red-400 mb-4 bg-red-900/50 p-3 rounded-lg">{error}</p>}
                <FileUpload onFileAccepted={handleFileAccepted} />
            </>
        );
    };
    
    // Cek apakah kita berada di state awal (menampilkan FileUpload)
    const isInitialState = !parsedData && !currentUser;

    return (
        // Terapkan class layout secara kondisional
        <div className={`bg-[#1e1e1e] min-h-screen text-white font-sans flex flex-col items-center p-4 ${isInitialState ? 'justify-center' : 'justify-start pt-12'}`}>
            
            {/* Jika tidak di state awal, tampilkan header di sini */}
            {!isInitialState && (
                <header className="text-center mb-8 max-w-3xl">
                    <h1 className="text-4xl md:text-5xl font-bold mb-2">WHATSAPP CHAT VIEWER</h1>
                    <p className="text-gray-400 text-lg">
                        Upload a .zip or .txt file to view the chat in a bubble-style format.
                    </p>
                </header>
            )}
            
            {/* Tampilkan error jika ada (hanya setelah state awal) */}
            {!isInitialState && error && <p className="text-red-400 mb-4 bg-red-900/50 p-3 rounded-lg">{error}</p>}
            
            <main className="w-full max-w-7xl flex flex-col items-center">
                {renderMainContent()}
            </main>
        </div>
    );
}

export default App;
