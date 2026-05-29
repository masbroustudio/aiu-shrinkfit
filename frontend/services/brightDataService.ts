import { Product } from '../types';

/**
 * Integrasi dengan Bright Data Web Scraper API / Web Unlocker.
 */
export const fetchLiveProductData = async (
  productUrl: string, 
  apiKey: string
): Promise<{ price: number; weight: number; unit: string } | null> => {
  
  if (!apiKey) {
    throw new Error("Bright Data API Key is missing. Please configure it in Settings.");
  }

  try {
    // PENERAPAN ENTERPRISE YANG BENAR (ARSITEKTUR HACKATHON):
    // Frontend React TIDAK BOLEH memanggil API Bright Data secara langsung karena:
    // 1. Akan terkena blokir CORS (Cross-Origin Resource Sharing) oleh browser.
    // 2. Mengekspos API Key rahasia ke publik (client-side).
    // 
    // Solusi: Frontend memanggil Google Cloud Function, lalu Cloud Function memanggil Bright Data.
    
    /* --- CONTOH KODE PRODUKSI (Jika Cloud Function sudah siap) ---
    const CLOUD_FUNCTION_URL = 'https://asia-southeast2-yourproject.cloudfunctions.net/scrape-product';
    const response = await fetch(CLOUD_FUNCTION_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}` // Opsional: untuk autentikasi ke Cloud Function
      },
      body: JSON.stringify({ url: productUrl })
    });

    if (!response.ok) throw new Error(`Cloud Function Error: ${response.status}`);
    const data = await response.json();
    return { price: data.price, weight: data.weight, unit: data.unit };
    -------------------------------------------------------------- */

    // UNTUK KEPERLUAN DEMO HACKATHON (Tanpa Backend Aktif):
    // Kita mensimulasikan delay jaringan dan respons sukses dari Cloud Function
    // asalkan user sudah memasukkan API Key di Settings.
    console.log(`[Cloud Function Mock] Meneruskan request ke Bright Data untuk: ${productUrl}`);
    return await simulateScraping(productUrl);

  } catch (error) {
    console.error("Error fetching live data:", error);
    throw error;
  }
};

// Simulasi ekstraksi data (Mock Cloud Function Response)
const simulateScraping = async (url: string) => {
  await new Promise(resolve => setTimeout(resolve, 1800)); // Simulasi latensi jaringan (Scraping butuh waktu)
  
  const urlLower = url.toLowerCase();
  if (urlLower.includes('kopi')) {
    return { price: 1.50, weight: 220, unit: 'g' }; // Skenario Shrinkflation
  } else if (urlLower.includes('sabun')) {
    return { price: 2.50, weight: 380, unit: 'ml' }; // Skenario Shrinkflation
  } else if (urlLower.includes('bear-brand')) {
    return { price: 1.05, weight: 180, unit: 'ml' }; // Skenario Shrinkflation
  } else if (urlLower.includes('logitech')) {
    return { price: 129.99, weight: 1, unit: 'unit' };
  }
  
  // Default stable case
  return { price: 10.00, weight: 100, unit: 'g' };
};
