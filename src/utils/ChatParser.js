/**
 * Mengurai konten teks mentah dari ekspor chat WhatsApp menjadi struktur JSON.
 * Fungsi ini menangani pesan multi-baris dan mengidentifikasi semua peserta chat.
 *
 * @param {string} rawText Konten teks mentah dari file .txt.
 * @returns {{messages: Array<object>, participants: Array<string>}|null} 
 * Sebuah objek berisi array 'messages' dan array 'participants' (nama pengirim unik).
 * Mengembalikan null jika input tidak valid.
 */
export const parseWhatsAppChat = (rawText) => {
    if (!rawText || typeof rawText !== 'string') {
        console.error("Input tidak valid, harus berupa string.");
        return null;
    }

    const messages = [];
    const participants = new Set();
    const pattern = /^(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s(\d{1,2}[.:]\d{2}) - ([^:]+): (.*)/;
    const standardPattern = /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2}:\d{2})\]\s([^:]+): (.*)/;
    
    // Regex untuk mendeteksi notifikasi sistem "menyematkan pesan"
    const pinNotificationPattern = /^(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s\d{1,2}[.:]\d{2} - .+ menyematkan pesan$/;

    // Regex untuk mendeteksi dan membersihkan indikator "pesan diedit"
    // Mencakup variasi seperti " <Pesan ini diedit>" atau di baris baru.
    const editedMessagePattern = /^(.*?)\s*(?:<Pesan ini diedit>|Pesan ini telah diedit|This message was edited|&lt;Pesan ini diedit&gt;)$/si;

    // Regex untuk deteksi media dengan teks opsional di bawahnya
    const mediaPattern = /([\w-]+\.\w+)\s+\(file terlampir\)(?:\n(.*))?/i;

    const lines = rawText.split('\n');
    let currentMessageObject = null;

    const sanitize = (str) => str.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // Helper untuk menentukan tipe media berdasarkan ekstensi file
    const getMediaType = (filename) => {
        const extension = filename.toLowerCase().split('.').pop();
        
        // Image types
        if (['png', 'jpg', 'jpeg'].includes(extension)) return 'image';
        
        // Sticker types
        if (['webp'].includes(extension)) return 'sticker';
        
        // Video types
        if (['mp4', 'mov', '3gp', 'mkv'].includes(extension)) return 'video';
        
        // Audio types
        if (['opus', 'mp3', 'wav', 'ogg', 'aac', 'm4a'].includes(extension)) return 'audio';
        
        // Common document types
        if (['docx', 'doc', 'xlsx', 'xls', 'pdf', 'ppt', 'pptx', 'csv'].includes(extension)) return 'document';
        
        // Other file types
        return 'file';
    };

    const processAndPushMessage = () => {
        if (!currentMessageObject) return;

        // 1. Cek jika pesan mengandung media
        const mediaMatch = currentMessageObject.message.match(mediaPattern);
        if (mediaMatch) {
            const fileName = mediaMatch[1];
            const messageText = mediaMatch[2] || ''; // Teks opsional setelah "file terlampir"
            
            currentMessageObject.media = {
                type: getMediaType(fileName),
                name: fileName
            };
            
            // Update pesan dengan teks setelah "file terlampir" jika ada
            currentMessageObject.message = messageText.trim();
        } else {
            // 2. Cek dan proses pesan yang diedit
            const editMatch = currentMessageObject.message.match(editedMessagePattern);
            if (editMatch) {
                currentMessageObject.message = editMatch[1].trim(); // Ambil pesan bersih
                currentMessageObject.edited = true; // Tambah properti edited
            }
        }

        // 3. Pastikan pesan tidak kosong setelah diproses atau memiliki media
        if (currentMessageObject.message.trim() !== '' || currentMessageObject.media) {
            messages.push(currentMessageObject);
        }
        
        currentMessageObject = null;
    };

    for (const line of lines) {
        const match = line.match(standardPattern) || line.match(pattern);
        const pinMatch = line.match(pinNotificationPattern);

        if (match) {
            // Ada pesan baru, proses dan simpan pesan sebelumnya
            processAndPushMessage();

            const sender = match[3].trim();
            const rawMessage = match[4].trim();

            currentMessageObject = {
                date: match[1],
                time: match[2].replace('.', ':'),
                sender: sender,
                message: sanitize(rawMessage) // Sanitasi di awal
            };
            
            participants.add(sender);

        } else if (pinMatch) {
            // Ini adalah notifikasi pin. Proses pesan sebelumnya dulu.
            processAndPushMessage();

            // Tandai pesan terakhir sebagai "pinned"
            if (messages.length > 0) {
                messages[messages.length - 1].pinned = pinMatch[1]; // Simpan tanggal pin
            }
            // Jangan buat message object baru untuk notifikasi ini

        } else if (currentMessageObject) {
            // Ini adalah baris lanjutan dari pesan saat ini
            currentMessageObject.message += '\n' + sanitize(line.trim());
        }
    }

    // Jangan lupa proses pesan terakhir di akhir file
    processAndPushMessage();

    return {
        messages: messages,
        participants: [...participants],
    };
};