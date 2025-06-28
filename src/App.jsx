// src/App.jsx

import { useCallback, useState } from 'react';
import * as zip from '@zip.js/zip.js';
import { parseWhatsAppChat } from './utils/ChatParser';
import { mapMediaFilesToEntries } from './utils/zipHelper';

import FileUpload from './components/FileUpload';
import UserSelection from './components/UserSelection';
import ChatView from './components/ChatView';
import SettingsPanel from './components/SettingsPanel';
import FileSelection from './components/media/FileSelection'; // <- Impor komponen baru

function App() {
    const [parsedData, setParsedData] = useState(null);
    const [foundTextFiles, setFoundTextFiles] = useState([]); // <- State baru untuk menyimpan file .txt dari zip
    const [currentUser, setCurrentUser] = useState(null);
    const [error, setError] = useState('');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // <- State untuk loading
    const [zipEntries, setZipEntries] = useState(null);
    const [mediaMap, setMediaMap] = useState({});

    const resetState = () => {
        setParsedData(null);
        setFoundTextFiles([]);
        setZipEntries(null);
        setMediaMap({});
        setCurrentUser(null);
        setError('');
        setIsSettingsOpen(false);
        setIsLoading(false);
    };

    const processTextContent = (textContent) => {
        const result = parseWhatsAppChat(textContent);
        if (result && result.messages.length > 0) {
            setParsedData(result);
            setError('');
        } else {
            throw new Error("Gagal mem-parsing file. Pastikan formatnya benar dan file tidak kosong.");
        }
    };

    const handleFileAccepted = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        resetState();
        setIsLoading(true);

        try {
            if (file.type === 'application/zip' || file.name.endsWith('.zip')) {
                const zipReader = new zip.ZipReader(new zip.BlobReader(file));
                const entries = await zipReader.getEntries();
                setZipEntries(entries); // Store all ZIP entries
                
                const textFiles = entries.filter(entry => !entry.directory && entry.filename.endsWith('.txt'));

                if (textFiles.length === 0) {
                    throw new Error("Tidak ada file .txt yang ditemukan di dalam arsip .zip.");
                } else if (textFiles.length === 1) {
                    const textContent = await textFiles[0].getData(new zip.TextWriter());
                    const parsedResult = parseWhatsAppChat(textContent);
                    
                    if (parsedResult) {
                        // Map media files to entries
                        const mediaMapping = mapMediaFilesToEntries(entries, parsedResult.messages);
                        setMediaMap(mediaMapping);
                        setParsedData(parsedResult);
                    } else {
                        throw new Error("Gagal mem-parsing file. Pastikan formatnya benar dan file tidak kosong.");
                    }
                } else {
                    // Jika ada lebih dari 1 file .txt, tampilkan pilihan
                    setFoundTextFiles(textFiles);
                }
                
                // Jangan tutup zipReader di sini jika file akan dibaca nanti
            } else {
                const textContent = await file.text();
                processTextContent(textContent);
            }
        } catch (err) {
            console.error(err);
            setError(err.message || "Terjadi kesalahan saat memproses file.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleFileSelect = async (fileEntry) => {
        if (!fileEntry) return;

        setIsLoading(true);
        setError('');
        setFoundTextFiles([]); // Kosongkan pilihan file

        try {
            const textContent = await fileEntry.getData(new zip.TextWriter());
            const parsedResult = parseWhatsAppChat(textContent);
            
            if (parsedResult) {
                // Map media files to entries if we have zip entries
                if (zipEntries) {
                    const mediaMapping = mapMediaFilesToEntries(zipEntries, parsedResult.messages);
                    setMediaMap(mediaMapping);
                }
                setParsedData(parsedResult);
            } else {
                throw new Error("Gagal mem-parsing file. Pastikan formatnya benar dan file tidak kosong.");
            }
        } catch (err) {
            console.error(err);
            setError(err.message || "Gagal membaca file yang dipilih.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUserSelect = (selectedUser) => {
        setCurrentUser(selectedUser);
    };

    const toggleSettingsPanel = () => {
        setIsSettingsOpen(prev => !prev);
    };

    const renderMainContent = () => {
        if (isLoading) {
            return <p className="text-xl text-gray-300">Memproses file...</p>;
        }
        if (error) {
             return (
                <>
                    <p className="text-red-400 mb-4 bg-red-900/50 p-3 rounded-lg">{error}</p>
                    <button onClick={resetState} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg">Coba Lagi</button>
                </>
             )
        }
        if (foundTextFiles.length > 0) {
            return <FileSelection textFiles={foundTextFiles} onSelect={handleFileSelect} onCancel={resetState} />;
        }
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
                        onReset={resetState}
                        onToggleSettings={toggleSettingsPanel}
                        mediaEntries={mediaMap}
                    />
                    {isSettingsOpen && <SettingsPanel onClose={toggleSettingsPanel} />}
                </div>
            );
        }
        if (parsedData) {
            return <UserSelection participants={parsedData.participants} onSelect={handleUserSelect} />;
        }
        return (
            <>
                <header className="text-center mb-8 max-w-3xl">
                    <h1 className="text-4xl md:text-5xl font-bold mb-2">WHATSAPP CHAT VIEWER</h1>
                    <p className="text-gray-400 text-lg">
                        Upload file .zip atau .txt untuk melihat chat dalam format gelembung.
                    </p>
                </header>
                <FileUpload onFileAccepted={handleFileAccepted} />
            </>
        );
    };
    
    const isInitialState = !parsedData && !currentUser && foundTextFiles.length === 0 && !isLoading && !error;

    return (
        <div className={`bg-[#1e1e1e] min-h-screen text-white font-sans flex flex-col items-center p-4 transition-all duration-300 ${isInitialState ? 'justify-center' : 'justify-start pt-12'}`}>
            <main className="w-full max-w-7xl flex flex-col items-center">
                {renderMainContent()}
            </main>
        </div>
    );
}

export default App;