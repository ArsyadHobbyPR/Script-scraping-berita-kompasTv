// lib/scraper.js
const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeKompas() {
    try {
        const { data } = await axios.get('https://www.kompas.tv/', {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(data);
        const koleksiBerita = [];

        // 1. HEADLINE UTAMA
        const headline = $('.col-50').has('.titleheadline');
        if (headline.length) {
            koleksiBerita.push({
                tipe: "Headline Utama",
                judul: headline.find('.titleheadline > a').text().trim(),
                link: headline.find('.titleheadline > a').attr('href'),
                thumb: headline.find('.newhlBig > a > img').attr('src')
            });
        }

        // 2. HEADLINE SAMPING
        $('.exhl').each((i, el) => {
            koleksiBerita.push({
                tipe: "Headline Samping",
                judul: $(el).find('h2.titleheadlinekids > a').text().trim(),
                link: $(el).find('h2.titleheadlinekids > a').attr('href'),
                thumb: $(el).find('img.lozad').attr('data-src')
            });
        });

        // 4 & 5. TALKSHOW (Versi Fleksibel)
        $('.col-70, .col-33').each((i, el) => {
            const section = $(el).find('.ex');
            if (section.length > 0) {
                koleksiBerita.push({
                    tipe: "Talkshow",
                    judul: $(el).find('h2').first().text().trim(),
                    link: $(el).find('a').first().attr('href'),
                    thumb: $(el).find('img.lozad').attr('data-src'),
                    durasi: $(el).find('.duration').text().trim()
                });
            }
        });

        // 6. VIDEO TERPOPULER & TRENDING
        $('.popular__item, .popular__item_one').each((i, el) => {
            const linkEl = $(el).find('a');
            koleksiBerita.push({
                tipe: "Terpopuler",
                judul: linkEl.text().trim(),
                link: linkEl.attr('href'),
                thumb: null
            });
        });

        // 7. KOMPASTV SHORTS
        $('.shortsItem').each((i, el) => {
            koleksiBerita.push({
                tipe: "Shorts",
                judul: $(el).find('.shortsItem__title').text().trim(),
                link: $(el).find('a.shortsItem__link').attr('href'),
                thumb: $(el).find('img.lozad').attr('data-src')
            });
        });

        return koleksiBerita;
    } catch (error) {
        throw error;
    }
}

module.exports = { scrapeKompas };
