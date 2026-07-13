const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function scrapePopuler() {
    try {
        const { data } = await axios.get('https://www.kompas.tv/', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36' }
        });

        const $ = cheerio.load(data);
        const hasilPopuler = [];

        // Mengambil dari kedua varian (popular__item dan popular__item_one)
        $('.popular__item, .popular__item_one').each((i, el) => {
            // Menggunakan selector yang fleksibel untuk judul dan link
            const linkEl = $(el).find('a.popular__item--title, a.popular__item--title_one');
            const judul = linkEl.text().trim();
            const link = linkEl.attr('href');

            if (judul && link) {
                hasilPopuler.push({
                    judul: judul,
                    link: link,
                    kategori: "Terpopuler/Trending"
                });
            }
        });

        // Simpan ke file JSON terpisah
        fs.writeFileSync('berita_populer.json', JSON.stringify(hasilPopuler, null, 2));
        
        console.log(`Berhasil! ${hasilPopuler.length} berita populer telah disimpan ke 'berita_populer.json'`);
        console.log(hasilPopuler.slice(0, 3)); // Preview 3 data pertama

    } catch (error) {
        console.error("Gagal melakukan scraping:", error.message);
    }
}

scrapePopuler();
