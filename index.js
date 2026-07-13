// index.js
const { scrapeKompas } = require('./lib/scraper');
const fs = require('fs');

async function startTask() {
    console.log("Menjalankan scraping...");
    try {
        const data = await scrapeKompas();
        
        // Log detail per tipe untuk melihat mana yang kosong
        const perTipe = data.reduce((acc, item) => {
            acc[item.tipe] = (acc[item.tipe] || 0) + 1;
            return acc;
        }, {});
        
        console.log("Statistik per Tipe:", perTipe);
        
        fs.writeFileSync('kompas_full.json', JSON.stringify(data, null, 2));
        console.log(`Berhasil simpan ${data.length} data pada ${new Date().toLocaleTimeString()}`);
    } catch (err) {
        console.error("Gagal:", err.message);
    }
}
// Menjadi (contoh 2 menit):
setInterval(startTask, 120000);

// Jalankan pertama kali saat script dimulai
startTask();
