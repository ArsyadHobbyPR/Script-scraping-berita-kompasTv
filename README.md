# 📰 Kompas TV Unofficial API

API tidak resmi untuk mengambil berita terbaru dari Kompas TV. API ini dirancang menggunakan Node.js dan melakukan scraping berita secara otomatis setiap 5 menit di latar belakang (*background job*). Data kemudian disimpan ke MongoDB Atlas untuk memastikan akses yang super cepat dan stabil.

Dibuat dan dikembangkan oleh: **Arsyad** 🚀

---

## 🌐 Base URL
URL utama dari API ini di server *production*:
```https://api-berita-kompas.onrender.com/```

🚀 Panduan Endpoint API
​1. Cek Status Server
​Method: GET
​Endpoint: /
​Fungsi: Menampilkan status server, koneksi database, dan pesan sambutan.
​2. Ambil Semua Berita Terkini
​Method: GET
​Endpoint: /api/berita
​Fungsi: Menampilkan seluruh berita terbaru dari semua kategori yang berhasil di-scrap.
​3. Filter Berita Berdasarkan Kategori
​Method: GET
​Endpoint: /api/berita?kategori={nama_kategori}
​Fungsi: Mencari berita berdasarkan kategori spesifik. Pencarian ini tidak case-sensitive (huruf besar/kecil tidak masalah).
​📌 Daftar Kategori yang Bisa Dicari:
​Gunakan kata kunci di bawah ini pada parameter ?kategori=:
​nasional (Berita dalam negeri)
​internasional (Berita luar negeri)
​ekonomi (Berita ekonomi & bisnis)
​olahraga (Berita seputar dunia olahraga)
​hiburan (Berita entertainment & selebriti)
​kesehatan (Berita kesehatan)
​tekno (Berita teknologi & gadget)
​Contoh Penggunaan Link:
https://api-berita-kompas.onrender.com/api/berita?kategori=olahraga
​📦 Contoh Format Balasan (Response)
​Ketika kamu mengakses endpoint berita, API akan membalas dengan format JSON yang rapi seperti ini:

{
  "status": "Sukses",
  "total_data": 25,
  "data": [
    {
      "tipe": "Olahraga",
      "judul": "Timnas Indonesia Berhasil Menang Telak di Kandang Lawan",
      "link": "[https://www.kompas.tv/olahraga/](https://www.kompas.tv/olahraga/)...",
      "thumb": "[https://img.kompas.tv/](https://img.kompas.tv/)...",
      "durasi": "02:15"
    }
  ]
}

🛠️ Teknologi yang Digunakan
​Backend: Node.js & Express.js
​Scraping: Axios & Cheerio
​Database: MongoDB Atlas (Mongoose)
​Deployment: Render.com
​💻 Cara Menjalankan Secara Lokal (Untuk Developer)
​Jika ingin mengembangkan API ini di komputermu sendiri (Localhost):

1.Clone repository ini
git clone [https://github.com/ArsyadHobbyPR/Script-scraping-berita-kompasTv.git](https://github.com/ArsyadHobbyPR/Script-scraping-berita-kompasTv.git)
2. Install semua library
npm install
3. Konfigurasi Database
Buat file bernama .env di folder utama dan isi dengan link MongoDB kamu:
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/kompas_db
PORT=3000
4. Jalankan server
node index.js
5. Akses di browser melalui http://localhost:3000