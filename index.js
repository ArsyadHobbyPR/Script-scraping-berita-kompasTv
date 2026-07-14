// index.js
require('dotenv').config(); // Memanggil file .env
const express = require('express');
const mongoose = require('mongoose');
const { scrapeKompas } = require('./lib/scraper');

const app = express();
// Gunakan PORT dari hosting nanti, atau 3000 untuk lokal
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// ==============================================================
// 1. SETUP DATABASE (Mongoose)
// ==============================================================
mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Berhasil terhubung ke MongoDB"))
    .catch(err => console.error("❌ Gagal terhubung ke MongoDB:", err));

// Membuat Skema Database (Menentukan struktur data yang disimpan)
const beritaSchema = new mongoose.Schema({
    tipe: String,
    judul: String,
    link: String,
    thumb: String,
    durasi: String
}, { timestamps: true }); // Otomatis mencatat waktu kapan data disimpan

const Berita = mongoose.model('Berita', beritaSchema);

// ==============================================================
// 2. BACKGROUND JOB: Proses Scraping Otomatis
// ==============================================================
async function startTask() {
    console.log(`[${new Date().toLocaleTimeString()}] Memulai proses scraping background...`);
    try {
        const data = await scrapeKompas();
        
        if (data && data.length > 0) {
            // Karena ini API berita terkini, kita hapus data lama dan ganti dengan yang baru
            await Berita.deleteMany({});
            await Berita.insertMany(data);
            console.log(`[${new Date().toLocaleTimeString()}] ✅ Database diperbarui! Total: ${data.length} berita.`);
        }
    } catch (err) {
        console.error("❌ Gagal melakukan scraping:", err.message);
    }
}

// Jalankan scraping saat server baru hidup
startTask();
// Atur interval scraping setiap 5 menit (300000 ms)
setInterval(startTask, 300000);

// ==============================================================
// 3. REST API ROUTES
// ==============================================================
app.get('/', (req, res) => {
    res.json({
        status: "Aktif",
        database: "MongoDB Connected",
        message: "Selamat datang di Kompas TV Unofficial API (Production Version)",
        endpoint: "/api/berita"
    });
});

app.get('/api/berita', async (req, res) => {
    try {
        const keywordKategori = req.query.kategori;
        let queryDatabase = {};

        // Jika user memakai parameter ?kategori=xxx
        if (keywordKategori) {
            // $regex membuat pencarian tidak peduli huruf besar/kecil ($options: 'i')
            queryDatabase = { tipe: { $regex: keywordKategori, $options: 'i' } };
        }

        // Ambil data dari MongoDB (select('-_id -__v') digunakan agar id bawaan mongo tidak ikut terkirim)
        const dataBerita = await Berita.find(queryDatabase).select('-_id -__v -createdAt -updatedAt');

        if (dataBerita.length > 0) {
            res.status(200).json({
                status: "Sukses",
                total_data: dataBerita.length,
                data: dataBerita
            });
        } else {
            res.status(404).json({ 
                status: "Proses", 
                message: "Data belum tersedia atau kategori tidak ditemukan." 
            });
        }
    } catch (error) {
        res.status(500).json({ error: "Terjadi kesalahan pada server API." });
    }
});

// ==============================================================
// 4. JALANKAN SERVER
// ==============================================================
app.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`🚀 SERVER API BERJALAN DI PORT ${PORT}`);
    console.log(`========================================\n`);
});
