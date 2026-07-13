// lib/scraper.js
const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeKompas() {
    let semuaBerita = [];

    // ==============================================================
    // TAHAP 1: MENGAMBIL DATA DARI HALAMAN UTAMA (Homepage)
    // ==============================================================
    try {
        const { data: dataHome } = await axios.get('https://www.kompas.tv/', {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $home = cheerio.load(dataHome);

        // 1. HEADLINE UTAMA (Maksimal 1)
        const headline = $home('.col-50').has('.titleheadline');
        if (headline.length) {
            semuaBerita.push({
                tipe: "Headline Utama",
                judul: headline.find('.titleheadline > a').text().trim(),
                link: headline.find('.titleheadline > a').attr('href'),
                thumb: headline.find('.newhlBig > a > img').attr('src')
            });
        }

        // 2. HEADLINE SAMPING (10 Berita)
        $home('.exhl').slice(0, 10).each((i, el) => {
            semuaBerita.push({
                tipe: "Headline Samping",
                judul: $home(el).find('h2.titleheadlinekids > a').text().trim(),
                link: $home(el).find('h2.titleheadlinekids > a').attr('href'),
                thumb: $home(el).find('img.lozad').attr('data-src')
            });
        });

        // 3. TALKSHOW (10 Berita)
        const talkshows = [];
        $home('.col-70, .col-33').each((i, el) => {
            const section = $home(el).find('.ex');
            if (section.length > 0) {
                talkshows.push({
                    tipe: "Talkshow",
                    judul: $home(el).find('h2').first().text().trim(),
                    link: $home(el).find('a').first().attr('href'),
                    thumb: $home(el).find('img.lozad').attr('data-src'),
                    durasi: $home(el).find('.duration').text().trim()
                });
            }
        });
        semuaBerita.push(...talkshows.slice(0, 10));

        // 4. VIDEO TERPOPULER & TRENDING (10 Berita)
        $home('.popular__item, .popular__item_one').slice(0, 10).each((i, el) => {
            const linkEl = $home(el).find('a');
            semuaBerita.push({
                tipe: "Terpopuler",
                judul: linkEl.text().trim(),
                link: linkEl.attr('href'),
                thumb: null
            });
        });

        // 5. KOMPASTV SHORTS (10 Berita)
        $home('.shortsItem').slice(0, 10).each((i, el) => {
            semuaBerita.push({
                tipe: "Shorts",
                judul: $home(el).find('.shortsItem__title').text().trim(),
                link: $home(el).find('a.shortsItem__link').attr('href'),
                thumb: $home(el).find('img.lozad').attr('data-src')
            });
        });

    } catch (error) {
        console.error("Gagal mengambil data Halaman Utama:", error.message);
    }

    // ==============================================================
    // TAHAP 2: MENGAMBIL DATA DARI 10 KATEGORI (Nasional, Olahraga, dll)
    // ==============================================================
    const kategoriList = [
        'nasional', 'info-publik', 'ekonomi', 'regional', 
        'internasional', 'olahraga', 'lifestyle', 
        'otomotif', 'entertainment', 'video'
    ];

    for (const kategori of kategoriList) {
        try {
            const url = `https://www.kompas.tv/${kategori}`;
            const { data } = await axios.get(url, {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            const $ = cheerio.load(data);
            const koleksiKategori = [];

            $('h2, h3').each((i, el) => {
                // 1. Membersihkan Judul
                const rawJudul = $(el).text().trim();
                const judul = rawJudul.split('\n')[0].trim();
                
                // 2. Mencari Link
                let link = $(el).find('a').attr('href');
                if (!link) link = $(el).closest('a').attr('href');

                // 3. Mencari Thumbnail dengan Fallback
                let thumb = null;
                const kontainer = $(el).closest('div, article, li');
                const imgNode = kontainer.find('img');
                
                if (imgNode.length) {
                    thumb = imgNode.attr('data-src') || imgNode.attr('src');
                }

                if (!thumb && link) {
                    const imgFallback = $(`a[href="${link}"] img`);
                    if (imgFallback.length) {
                        thumb = imgFallback.attr('data-src') || imgFallback.attr('src');
                    }
                }

                // 4. Validasi & Push
                if (judul && judul.length > 15 && link) {
                    // Format penulisan tipe kategori
                    let namaKategori = kategori;
                    if(namaKategori === 'info-publik') {
                        namaKategori = 'Info-publik';
                    } else {
                        namaKategori = kategori.charAt(0).toUpperCase() + kategori.slice(1);
                    }
                    
                    koleksiKategori.push({
                        tipe: `Berita ${namaKategori}`,
                        judul: judul,
                        link: link,
                        thumb: thumb || null
                    });
                }
            });

            // 5. Menghapus Duplikat
            const dataUnik = [];
            const judulTersimpan = new Set();
            for (const berita of koleksiKategori) {
                if (!judulTersimpan.has(berita.judul)) {
                    judulTersimpan.add(berita.judul);
                    dataUnik.push(berita);
                }
            }

            // Gabungkan 20 data unik per kategori ke array utama
            semuaBerita.push(...dataUnik.slice(0, 20));

            // 6. Jeda 1 detik antar request agar aman dari blokir
            await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
            console.error(`Gagal mengambil kategori ${kategori}:`, error.message);
            continue; 
        }
    }

    return semuaBerita;
}

module.exports = { scrapeKompas };
