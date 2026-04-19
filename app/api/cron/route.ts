import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import * as cheerio from 'cheerio';

export async function GET() {
  try {
    const response = await fetch('https://www.goodreturns.in/gold-rates/', { cache: 'no-store' });
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const cityRates: any = {};

    $('.gold_silver_table tr').each((_, el) => {
      const cols = $(el).find('td');
      if (cols.length >= 3) {
        const city = $(cols[0]).text().trim();
        const price24k = parseFloat($(cols[1]).text().replace(/[^\d.]/g, ''));
        if (!isNaN(price24k)) {
          cityRates[city] = { 
            "24K": price24k, 
            "22K": Math.round(price24k * 0.916),
            "18K": Math.round(price24k * 0.75)
          };
        }
      }
    });

    await kv.set('gold_rates', cityRates);
    return NextResponse.json({ status: 'Success', updated: Object.keys(cityRates).length });

  } catch (err: any) {
    return NextResponse.json({ 
      status: 'Error', 
      message: err instanceof Error ? err.message : 'Unknown error' 
    });
  }
}
