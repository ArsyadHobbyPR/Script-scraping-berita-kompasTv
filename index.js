// index.js
const { scrapeKompas } = require('./lib/scraper');
const fs = require('fs');

async function startTask() {
    console.log("Menjalankan scraping...");
    try {
        const data = await scrapeKompas();
        fs.writeFileSync('kompas_full.json', JSON.stringify(data, null, 2));
        console.log(`Berhasil simpan ${data.length} data pada ${new Date().toLocaleTimeString()}`);
    } catch (err) {
        console.error("Gagal:", err.message);
    }
}

// Menjalankan setiap 15 detik (15000 milidetik)
setInterval(startTask, 15000);

// Jalankan pertama kali saat script dimulai
startTask();
