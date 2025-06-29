import { useCallback, useState, useMemo, useEffect } from 'react';
import * as zip from '@zip.js/zip.js';
import { parseWhatsAppChat } from './utils/ChatParser';
import { mapMediaFilesToEntries } from './utils/zipHelper';

import FileUpload from './components/FileUpload';
import UserSelection from './components/UserSelection';
import ChatView from './components/ChatView';
import SettingsPanel from './components/SettingsPanel';
import FileSelection from './components/media/FileSelection';
import ChatStatsModal from './components/ChatStatsModal';
import MediaGallery from './components/MediaGallery';

function App() {
    const [parsedData, setParsedData] = useState(null);
    const [foundTextFiles, setFoundTextFiles] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [error, setError] = useState('');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [zipEntries, setZipEntries] = useState(null);
    const [mediaMap, setMediaMap] = useState({});

    // State untuk fitur baru
    const [searchTerm, setSearchTerm] = useState('');
    const [theme, setTheme] = useState('dark');
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);

    // State khusus untuk navigasi pencarian
    const [searchResults, setSearchResults] = useState([]); // Menyimpan index pesan yang cocok
    const [currentResultIndex, setCurrentResultIndex] = useState(-1); // Index dari searchResults

    // State untuk navigasi tanggal
    const [targetDateIndex, setTargetDateIndex] = useState(-1);

    // Reset semua state ke kondisi awal
    const resetState = () => {
        setParsedData(null);
        setFoundTextFiles([]);
        setZipEntries(null);
        setMediaMap({});
        setCurrentUser(null);
        setError('');
        setIsSettingsOpen(false);
        setIsLoading(false);
        setSearchTerm('');
        setSearchResults([]);
        setCurrentResultIndex(-1);
        setTargetDateIndex(-1);
        setIsStatsModalOpen(false);
        setIsGalleryOpen(false);
    };

    // Fungsi untuk menjalankan pencarian
    const handleFind = () => {
        if (!parsedData || !searchTerm) {
            setSearchResults([]);
            setCurrentResultIndex(-1);
            return;
        }
        const results = parsedData.messages
            .map((msg, index) => msg.message.toLowerCase().includes(searchTerm.toLowerCase()) ? index : -1)
            .filter(index => index !== -1);
        
        setSearchResults(results);
        if (results.length > 0) {
            // UBAH DI SINI: Mulai dari hasil terakhir (terbaru)
            setCurrentResultIndex(results.length - 1);
        } else {
            setCurrentResultIndex(-1);
        }
    };

    // Fungsi untuk navigasi hasil pencarian
    const navigateResults = (direction) => {
        if (searchResults.length === 0) return;
        const newIndex = currentResultIndex + direction;
        if (newIndex >= 0 && newIndex < searchResults.length) {
            setCurrentResultIndex(newIndex);
        }
    };

    // Fungsi untuk navigasi ke tanggal tertentu
    const handleGoToDate = (targetDate) => {
        if (!parsedData || !targetDate) return;
        
        // Validasi format date picker (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(targetDate)) {
            alert('Format tanggal tidak valid. Silakan pilih tanggal yang benar.');
            return;
        }
        
        // Konversi dari format YYYY-MM-DD (date picker) ke format WhatsApp
        const dateParts = targetDate.split('-');
        if (dateParts.length !== 3) {
            alert('Format tanggal tidak valid. Silakan pilih tanggal yang benar.');
            return;
        }
        
        const [year, month, day] = dateParts;
        
        // Validasi bahwa semua bagian ada dan valid
        if (!year || !month || !day) {
            alert('Format tanggal tidak valid. Silakan pilih tanggal yang benar.');
            return;
        }
        
        // Format tanggal yang benar untuk WhatsApp: DD/MM/YY
        const targetFormattedDate = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year.slice(-2)}`;
        
        // Debug: tampilkan format yang dicari
        console.log('Mencari tanggal dengan format:', targetFormattedDate);
        
        // Cari pesan pertama yang cocok dengan format tersebut
        const messageIndex = parsedData.messages.findIndex(msg => msg.date === targetFormattedDate);
        
        if (messageIndex !== -1) {
            console.log('Ditemukan dengan format:', targetFormattedDate);
            setTargetDateIndex(messageIndex);
        } else {
            // Jika tidak ketemu, coba pencarian yang lebih fleksibel
            const targetDay = parseInt(day);
            const targetMonth = parseInt(month);
            const targetYear = parseInt(year);
            const targetYearShort = parseInt(year.slice(-2));
            
            const flexibleIndex = parsedData.messages.findIndex(msg => {
                // Parse tanggal dari pesan
                const dateParts = msg.date.split('/');
                if (dateParts.length !== 3) return false;
                
                const msgDay = parseInt(dateParts[0]);
                const msgMonth = parseInt(dateParts[1]);
                const msgYear = parseInt(dateParts[2]);
                
                // Cocokkan hari dan bulan
                if (msgDay !== targetDay || msgMonth !== targetMonth) return false;
                
                // Cocokkan tahun (bisa format 4 digit atau 2 digit)
                return msgYear === targetYear || msgYear === targetYearShort || 
                       (msgYear < 100 && msgYear === targetYearShort) ||
                       (msgYear >= 2000 && msgYear === targetYear);
            });
            
            if (flexibleIndex !== -1) {
                setTargetDateIndex(flexibleIndex);
            } else {
                // Debug: tampilkan beberapa format tanggal yang ada di chat
                const sampleDates = [...new Set(parsedData.messages.map(msg => msg.date))].slice(0, 5);
                console.log('Sample tanggal di chat:', sampleDates);
                
                // Tampilkan pesan error yang lebih informatif
                const formattedDate = `${targetDay}/${targetMonth}/${year}`;
                alert(`Tanggal ${formattedDate} tidak ditemukan dalam chat.\n\nContoh format tanggal yang ada: ${sampleDates.join(', ')}`);
            }
        }
    };
    
    // Proses konten teks dan update state
    const processTextContent = (textContent) => {
        const result = parseWhatsAppChat(textContent);
        if (result && result.messages.length > 0) {
            setParsedData(result);
            setError('');
        } else {
            throw new Error("Gagal mem-parsing file. Pastikan formatnya benar dan file tidak kosong.");
        }
    };
    
    // Penanganan file yang di-upload
    const handleFileAccepted = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        resetState();
        setIsLoading(true);

        try {
            if (file.type === 'application/zip' || file.name.endsWith('.zip')) {
                const zipReader = new zip.ZipReader(new zip.BlobReader(file));
                const entries = await zipReader.getEntries();
                setZipEntries(entries);
                
                const textFiles = entries.filter(entry => !entry.directory && entry.filename.endsWith('.txt'));

                if (textFiles.length === 0) {
                    throw new Error("Tidak ada file .txt yang ditemukan di dalam arsip .zip.");
                } else if (textFiles.length === 1) {
                    const textContent = await textFiles[0].getData(new zip.TextWriter());
                    const parsedResult = parseWhatsAppChat(textContent);
                    
                    if (parsedResult) {
                        const mediaMapping = mapMediaFilesToEntries(entries, parsedResult.messages);
                        setMediaMap(mediaMapping);
                        setParsedData(parsedResult);
                    } else {
                        throw new Error("Gagal mem-parsing file.");
                    }
                } else {
                    setFoundTextFiles(textFiles);
                }
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
    
    // Penanganan pemilihan file dari beberapa opsi .txt
    const handleFileSelect = async (fileEntry) => {
        if (!fileEntry) return;
        setIsLoading(true);
        setError('');
        setFoundTextFiles([]);

        try {
            const textContent = await fileEntry.getData(new zip.TextWriter());
            const parsedResult = parseWhatsAppChat(textContent);
            
            if (parsedResult) {
                if (zipEntries) {
                    const mediaMapping = mapMediaFilesToEntries(zipEntries, parsedResult.messages);
                    setMediaMap(mediaMapping);
                }
                setParsedData(parsedResult);
            } else {
                throw new Error("Gagal mem-parsing file yang dipilih.");
            }
        } catch (err) {
            console.error(err);
            setError(err.message || "Gagal membaca file.");
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

    const chatStats = useMemo(() => {
        if (!parsedData) return null;
        const { messages, participants } = parsedData;
        const senderCounts = messages.reduce((acc, msg) => {
            acc[msg.sender] = (acc[msg.sender] || 0) + 1;
            return acc;
        }, {});
        
        const topSender = Object.entries(senderCounts).reduce((top, current) => {
            return current[1] > top.count ? { sender: current[0], count: current[1] } : top;
        }, { sender: '', count: 0 });

        const mediaCount = messages.reduce((acc, msg) => {
            if (msg.media) {
                 acc[msg.media.type] = (acc[msg.media.type] || 0) + 1;
            }
            return acc;
        }, { image: 0, video: 0, sticker: 0, audio: 0, document: 0, file: 0 });
        
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const linkCount = messages.reduce((count, msg) => {
            const links = msg.message.match(urlRegex);
            return count + (links ? links.length : 0);
        }, 0);

        return {
            totalMessages: messages.length,
            participantCount: participants.length,
            topSender,
            mediaCount,
            linkCount
        };
    }, [parsedData]);
    
    const galleryData = useMemo(() => {
        if (!parsedData) return { media: [], docs: [], links: [] };
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const media = parsedData.messages.filter(m => m.media && (m.media.type === 'image' || m.media.type === 'video'));
        const docs = parsedData.messages.filter(m => m.media && (m.media.type === 'document' || m.media.type === 'file' || m.media.type === 'audio'));
        const links = parsedData.messages.flatMap(m => m.message.match(urlRegex) || []);
        return { media, docs, links };
    }, [parsedData]);
    
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const renderMainContent = () => {
        if (isLoading) {
            return <p className="text-xl text-gray-300">Memproses file...</p>;
        }
        if (error) {
             return (
                <div className="text-center">
                    <p className="text-red-400 mb-4 bg-red-900/50 p-3 rounded-lg">{error}</p>
                    <button onClick={resetState} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg">Coba Lagi</button>
                </div>
             )
        }
        if (foundTextFiles.length > 0) {
            return <FileSelection textFiles={foundTextFiles} onSelect={handleFileSelect} onCancel={resetState} />;
        }
        if (parsedData && currentUser) {
            const opponentName = parsedData.participants.find(p => p !== currentUser) || 'Unknown';
            const isGroupChat = parsedData.participants.length > 2;

            return (
                <>
                    <div className="w-full flex justify-center items-start gap-6">
                        <ChatView 
                            messages={parsedData.messages}
                            currentUser={currentUser}
                            opponentName={opponentName}
                            isGroupChat={isGroupChat}
                            onReset={resetState}
                            onToggleSettings={toggleSettingsPanel}
                            mediaEntries={mediaMap}
                            searchTerm={searchTerm} 
                            searchResultIndex={searchResults[currentResultIndex]}
                            targetDateIndex={targetDateIndex}
                            onDateNavigated={() => setTargetDateIndex(-1)}
                        />
                        {isSettingsOpen && (
                            <div 
                                onClick={toggleSettingsPanel} 
                                className="fixed inset-0 bg-black/50 z-10 md:hidden"
                                aria-hidden="true"
                            />
                        )}
                        <SettingsPanel 
                            isOpen={isSettingsOpen}
                            onClose={toggleSettingsPanel}
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            onFind={handleFind}
                            onNavigate={navigateResults}
                            resultCount={searchResults.length}
                            currentResultIndex={currentResultIndex}
                            theme={theme}
                            onThemeChange={setTheme}
                            onStatsClick={() => setIsStatsModalOpen(true)}
                            onGalleryClick={() => setIsGalleryOpen(true)}
                            onGoToDate={handleGoToDate}
                        />
                    </div>
                    <ChatStatsModal 
                        isOpen={isStatsModalOpen}
                        onClose={() => setIsStatsModalOpen(false)}
                        stats={chatStats}
                    />
                    <MediaGallery
                        isOpen={isGalleryOpen}
                        onClose={() => setIsGalleryOpen(false)}
                        media={galleryData.media}
                        docs={galleryData.docs}
                        links={galleryData.links}
                        mediaMap={mediaMap}
                    />
                </>
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