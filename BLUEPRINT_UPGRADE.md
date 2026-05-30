# BLUEPRINT UPGRADE: Shrinkflation AI v2.0
## Dokumen Lengkap Perbaikan & Penambahan Fitur
### Track 2: Finance & Market Intelligence | Bright Data Integration

---

## DAFTAR ISI

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Analisis Gap & Bug Kritis](#2-analisis-gap--bug-kritis)
3. [FASE 1: Perbaikan Bug & Quick Wins](#3-fase-1-perbaikan-bug--quick-wins)
4. [FASE 2: True Agent Architecture (ADK)](#4-fase-2-true-agent-architecture-adk)
5. [FASE 3: Real Data Pipeline (Bright Data + BigQuery)](#5-fase-3-real-data-pipeline-bright-data--bigquery)
6. [FASE 4: Fitur Baru - Earnings Calendar & Stock Integration](#6-fase-4-fitur-baru---earnings-calendar--stock-integration)
7. [FASE 5: Alerts Fungsional & Notification System](#7-fase-5-alerts-fungsional--notification-system)
8. [FASE 6: Authentication & Persistensi Data](#8-fase-6-authentication--persistensi-data)
9. [FASE 7: UI/UX Enhancement & New Pages](#9-fase-7-uiux-enhancement--new-pages)
10. [FASE 8: Export & Reporting Professional](#10-fase-8-export--reporting-professional)
11. [Arsitektur Target Akhir](#11-arsitektur-target-akhir)
12. [Catatan untuk Agent Studio Google](#12-catatan-untuk-agent-studio-google)

---


## 1. RINGKASAN EKSEKUTIF

### Apa Aplikasi Ini
**Shrinkflation AI** adalah platform market intelligence yang mendeteksi praktik *shrinkflation* (mengurangi berat/ukuran produk FMCG tanpa menurunkan harga) lalu menerjemahkannya menjadi sinyal *margin expansion* untuk saham terkait (UNVR.JK, ICBP.JK, MYOR.JK, NSRGY) sebelum laporan keuangan kuartalan.

### Tema Hackathon (Track 2: Finance & Market Intelligence)
Sesuai screenshot requirement:
- **Structure live financial data into workflows**
- **Combine multi-source signals into intelligence**
- **Deliver alternative data at decision-grade frequency**
- **Give AI agents live financial context**

### Bright Data Tools yang HARUS Terintegrasi
| Tool | Kegunaan di Aplikasi Ini |
|------|-------------------------|
| **Web Scraper API** | Scrape halaman produk e-commerce (Shopee, Tokopedia, Lazada) untuk ambil harga & berat terkini |
| **SERP API** | Ambil berita terkini tentang earnings, harga bahan baku, dan kebijakan harga dari Google/Bing |
| **Web Unlocker** | Bypass anti-bot protection pada e-commerce yang sulit di-scrape |
| **Scraping Browser** | Render halaman JavaScript-heavy (SPA e-commerce) untuk data yang tidak tersedia di HTML statis |
| **MCP Server** | Hubungkan Bright Data langsung sebagai tool ke AI Agent (Gemini) via Model Context Protocol |

### Tech Stack Saat Ini
- Frontend: React 18 + TypeScript + Tailwind CSS (CDN) + Recharts + React Router (HashRouter)
- Backend: Express.js proxy server + Google ADC Authentication
- AI: Gemini 2.5 Flash via `@google/genai` SDK
- State: React Context API (in-memory, hilang saat refresh)

---


## 2. ANALISIS GAP & BUG KRITIS

### 2.1 Bug yang Harus Diperbaiki Segera

| # | Bug | File | Detail Teknis | Dampak |
|---|-----|------|--------------|--------|
| B1 | `navigate()` dipanggil saat render | `layouts/DashboardLayout.tsx` baris `if (!user) { navigate('/login'); return null; }` | Ini adalah side-effect di dalam render body. React akan warning "Cannot update during render". | Bisa crash di React strict mode, anti-pattern |
| B2 | Warna `brand-400`/`brand-500` dipakai di JSX tapi TIDAK terdefinisi lengkap di Tailwind CDN config | `index.html` — hanya mendefinisi `brand: { 500, 600 }` tapi kode menggunakan `text-brand-400` | Warna tidak muncul, elemen terlihat tanpa warna | Visual rusak di beberapa elemen |
| B3 | Secret `PROXY_HEADER` ter-commit di `.env.local` | `backend/.env.local` | Nilai `joFfwn-y1vJacdwxG0WWoHNJs8S8rNAH` terekspos publik | Keamanan, siapa saja bisa memanggil proxy |
| B4 | Tombol "Create Rule" di Alerts tidak memiliki handler/modal | `pages/Alerts.tsx` | Button hanya tampil, `onClick` tidak ada | Fitur mati total |
| B5 | Tombol hapus (Trash2) di setiap Alert Rule tidak memiliki handler | `pages/Alerts.tsx` | Button ada ikon Trash2 tapi tanpa `onClick` | Rule tidak bisa dihapus |
| B6 | `fetchInsights()` dipanggil tanpa dependency products | `pages/DashboardHome.tsx` | `useEffect` punya empty array `[]` tapi harusnya depend on `products` agar refresh saat data berubah | Insight stale setelah sync |
| B7 | Chat "system" message timestamp identik dengan user message | `pages/AgentChat.tsx` | Menggunakan `Date.now().toString()` bersamaan, bisa collision | Key React warning potensial |

### 2.2 Gap Arsitektural (Bukan Bug, tapi Kelemahan Besar)

| # | Gap | Dampak | Solusi yang Direkomendasikan |
|---|-----|--------|------------------------------|
| G1 | AI BUKAN agent sungguhan — hanya `generateContent` sekali jalan tanpa function calling/tools | AI tidak bisa memicu aksi (scrape, query DB, buat alert) | Migrasi ke ADK Agent dengan tools |
| G2 | TIDAK ADA persistensi — refresh browser = semua data hilang | Tidak production-ready | localStorage (quick) atau Firestore |
| G3 | Bright Data 100% mock — `brightDataService.ts` return hardcoded values | "Alternative data pipeline" hanya label | Implementasi Cloud Function + Bright Data API nyata |
| G4 | Login palsu — `setTimeout` 1.5s lalu set user statis | Tidak ada autentikasi sungguhan | Firebase Auth atau Google OAuth |
| G5 | Tidak ada harga saham real — ticker hanya teks | Sinyal margin tidak bisa dikorelasikan ke harga aktual | Integrasikan finance API (Yahoo Finance / Alpha Vantage) |
| G6 | Predictive Index "halusinasi" — angka 0-100 murni dikhayal LLM | Klaim AI prediktif lemah secara metodologi | Ganti dengan model deterministik atau BigQuery ML |
| G7 | Tidak ada streaming di chat — user menunggu tanpa feedback | UX lambat, tidak enterprise-grade | Gunakan `streamGenerateContent` atau `reasoningEngines:streamQuery` |
| G8 | Tailwind dari CDN — ada warning resmi untuk production | Performance, reliability | Install Tailwind sebagai devDependency |

---


## 3. FASE 1: Perbaikan Bug & Quick Wins

### 3.1 Fix B1: DashboardLayout navigate() saat render

**File:** `frontend/layouts/DashboardLayout.tsx`

**Masalah aktual (kode saat ini):**
```tsx
if (!user) {
  navigate('/login');  // SIDE EFFECT DI RENDER BODY!
  return null;
}
```

**Solusi — ganti dengan komponen `<Navigate>`:**
```tsx
import { Navigate } from 'react-router-dom';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAppContext();
  const navigate = useNavigate();

  // PERBAIKAN: Gunakan Navigate component, bukan imperative navigate()
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // ... sisa kode sama
};
```

**Mengapa:** `<Navigate>` adalah cara deklaratif React Router untuk redirect. Ini aman dipanggil di dalam render dan tidak memicu warning React.

---

### 3.2 Fix B2: Tambah warna `brand-400` di Tailwind config

**File:** `frontend/index.html`

**Masalah:** Kode JSX menggunakan `text-brand-400`, `bg-brand-400/10`, `bg-brand-500/10` tapi config hanya punya `brand: { 500, 600 }`.

**Solusi — tambahkan shade lengkap:**
```javascript
brand: {
    400: '#38bdf8', // sky-400 equivalent
    500: '#0ea5e9',
    600: '#0284c7',
}
```

---

### 3.3 Fix B3: Hapus secret dari repo

**Langkah:**
1. Tambah `backend/.env.local` ke `.gitignore`
2. Buat `backend/.env.example` dengan placeholder:
   ```
   PROXY_HEADER = "GENERATE_YOUR_OWN_RANDOM_STRING"
   ```
3. Generate ulang PROXY_HEADER value setelah commit

---

### 3.4 Fix B4 & B5: Alerts — Create Rule Modal & Delete Handler

**File:** `frontend/pages/Alerts.tsx`

**Tambahkan ke `AppContext.tsx`:**
```tsx
// Di interface AppState, tambah:
addAlertRule: (rule: AlertRule) => void;
deleteAlertRule: (id: string) => void;

// Di AppProvider, implementasi:
const addAlertRule = (rule: AlertRule) => setAlertRules(prev => [...prev, rule]);
const deleteAlertRule = (id: string) => {
  if (window.confirm("Delete this rule?")) {
    setAlertRules(prev => prev.filter(r => r.id !== id));
  }
};
```

**UI Modal untuk Create Rule di `Alerts.tsx`:**
- Tambah state `isCreateModalOpen`
- Modal berisi form: Rule Name (text), Condition (dropdown: Weight Drop > X%, Price Increase > X%, Ticker = X & Shrinkflation Detected), Action (dropdown: Email, Slack Webhook, In-App Notification)
- Tombol "Create Rule" membuka modal
- Tombol Trash2 memanggil `deleteAlertRule(rule.id)`

---

### 3.5 Fix B6: Dashboard insights depend on products

**File:** `frontend/pages/DashboardHome.tsx`

```tsx
useEffect(() => {
  fetchInsights();
}, [fetchInsights]); // fetchInsights sudah useCallback dengan dep [products]
```

---

### 3.6 Quick Win: localStorage Persistensi Dasar

**File:** `frontend/context/AppContext.tsx`

**Implementasi:**
```tsx
// Helper functions
const loadFromStorage = <T,>(key: string, fallback: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch { return fallback; }
};

const saveToStorage = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Ganti useState initial values:
const [products, setProducts] = useState<Product[]>(() => loadFromStorage('sai_products', INITIAL_PRODUCTS));
const [brightDataApiKey, setBrightDataApiKey] = useState(() => loadFromStorage('sai_bdkey', ''));
const [alertRules, setAlertRules] = useState<AlertRule[]>(() => loadFromStorage('sai_rules', INITIAL_RULES));

// Tambah useEffect untuk auto-save:
useEffect(() => { saveToStorage('sai_products', products); }, [products]);
useEffect(() => { saveToStorage('sai_bdkey', brightDataApiKey); }, [brightDataApiKey]);
useEffect(() => { saveToStorage('sai_rules', alertRules); }, [alertRules]);
```

**Kegunaan:** Data produk, API key, dan rules tidak hilang saat refresh browser.

---


## 4. FASE 2: True Agent Architecture (ADK)

### 4.1 Konsep: Mengapa Harus Berubah

**Arsitektur LAMA (sekarang):**
```
User Chat → generateContent(prompt + injected context) → teks respons
```
Masalah: AI hanya bisa "bicara", tidak bisa melakukan aksi. Konteks disuntik manual ke prompt.

**Arsitektur BARU (Agent dengan Function Calling):**
```
User Chat → reasoningEngines:streamQuery → ADK Agent (deployed di Agent Engine)
                ├── tool: get_tracked_products()        → Baca dari Firestore/BigQuery
                ├── tool: scrape_live_price(url)        → Panggil Cloud Function → Bright Data
                ├── tool: search_market_news(query)     → Bright Data SERP API
                ├── tool: get_stock_quote(ticker)       → Finance API
                ├── tool: calculate_margin_impact(...)   → Kalkulasi deterministik (bukan tebakan)
                ├── tool: create_alert(rule)            → Simpan rule ke Firestore
                └── tool: generate_report(products)     → Buat PDF report
```

**Keuntungan:**
- AI bisa benar-benar MELAKUKAN aksi, bukan hanya bicara
- Kalkulasi margin DETERMINISTIK (bukan hallucination)
- Data selalu real-time karena diambil saat dibutuhkan
- Streaming response via `streamQuery`

### 4.2 Implementasi ADK Agent (Python)

**Buat file baru:** `agent/shrinkflation_agent.py`

```python
import google.adk as adk
from google.adk.agents import Agent
from google.adk.tools import FunctionTool
from google.cloud import firestore, bigquery

# ============================================================
# TOOL DEFINITIONS (Function Calling)
# ============================================================

def get_tracked_products() -> dict:
    """Retrieve all tracked FMCG products from the database.
    
    Returns:
        dict: Contains 'products' list with each product having fields:
              name, brand, category, targetTicker, historicalPrice,
              historicalWeight, unit, currentPrice, currentWeight, status
    """
    db = firestore.Client()
    docs = db.collection('products').stream()
    products = []
    for doc in docs:
        products.append(doc.to_dict())
    return {"products": products}


def scrape_live_price(product_url: str) -> dict:
    """Scrape live price and weight data from an e-commerce URL using Bright Data.
    
    Args:
        product_url: The full e-commerce URL to scrape (Shopee, Tokopedia, etc.)
    
    Returns:
        dict: Contains 'price' (float, USD), 'weight' (float), 'unit' (str),
              'scraped_at' (str ISO timestamp), 'proxy_used' (str)
    """
    import requests
    
    BRIGHT_DATA_API_KEY = get_secret("BRIGHT_DATA_API_KEY")
    
    response = requests.post(
        "https://api.brightdata.com/datasets/v3/scrape",
        headers={"Authorization": f"Bearer {BRIGHT_DATA_API_KEY}"},
        json={
            "url": product_url,
            "format": "json",
            "zone": "web_unlocker"  # Gunakan Web Unlocker untuk bypass anti-bot
        }
    )
    
    data = response.json()
    return {
        "price": data.get("price"),
        "weight": data.get("weight"),
        "unit": data.get("unit", "g"),
        "scraped_at": datetime.now().isoformat(),
        "proxy_used": data.get("proxy_info", "residential")
    }


def search_market_news(query: str, ticker: str = "") -> dict:
    """Search for latest market news, earnings reports, and FMCG industry updates
    using Bright Data SERP API.
    
    Args:
        query: Search query string (e.g., "Unilever Q2 2026 earnings shrinkflation")
        ticker: Optional stock ticker to focus the search
    
    Returns:
        dict: Contains 'results' list with title, snippet, url, published_date
    """
    import requests
    
    BRIGHT_DATA_API_KEY = get_secret("BRIGHT_DATA_API_KEY")
    
    search_query = f"{query} {ticker}" if ticker else query
    
    response = requests.post(
        "https://api.brightdata.com/serp/google/search",
        headers={"Authorization": f"Bearer {BRIGHT_DATA_API_KEY}"},
        json={
            "query": search_query,
            "num_results": 5,
            "country": "id",  # Indonesia focus
            "language": "en"
        }
    )
    
    results = response.json().get("organic_results", [])
    return {
        "results": [
            {
                "title": r.get("title"),
                "snippet": r.get("snippet"),
                "url": r.get("link"),
                "published_date": r.get("date", "Unknown")
            }
            for r in results[:5]
        ]
    }


def get_stock_quote(ticker: str) -> dict:
    """Get current stock price and basic financials for a given ticker symbol.
    
    Args:
        ticker: Stock ticker symbol (e.g., 'UNVR.JK', 'ICBP.JK', 'NSRGY')
    
    Returns:
        dict: Contains 'ticker', 'price', 'change_percent', 'market_cap',
              'pe_ratio', 'last_updated'
    """
    import yfinance as yf
    
    stock = yf.Ticker(ticker)
    info = stock.info
    
    return {
        "ticker": ticker,
        "price": info.get("currentPrice", 0),
        "change_percent": info.get("regularMarketChangePercent", 0),
        "market_cap": info.get("marketCap", 0),
        "pe_ratio": info.get("trailingPE", 0),
        "currency": info.get("currency", "IDR"),
        "last_updated": datetime.now().isoformat()
    }


def calculate_margin_impact(
    historical_price: float,
    historical_weight: float,
    current_price: float,
    current_weight: float,
    unit: str
) -> dict:
    """Calculate the margin expansion impact from shrinkflation deterministically.
    This is a pure mathematical calculation, NOT an AI guess.
    
    Args:
        historical_price: Original product price (USD)
        historical_weight: Original product weight/volume
        current_price: Current product price (USD)
        current_weight: Current product weight/volume
        unit: Unit of measurement (g, ml, kg, L)
    
    Returns:
        dict: Contains shrinkflation_percentage, margin_expansion_percentage,
              old_price_per_unit, new_price_per_unit, signal_strength
    """
    if historical_weight <= 0 or current_weight <= 0:
        return {"error": "Invalid weight values"}
    
    old_ppu = historical_price / historical_weight
    new_ppu = current_price / current_weight
    
    shrinkflation_pct = ((historical_weight - current_weight) / historical_weight) * 100
    margin_expansion_pct = ((new_ppu - old_ppu) / old_ppu) * 100
    
    # Signal strength: deterministic scoring based on magnitude
    if margin_expansion_pct > 15:
        signal_strength = "STRONG_BUY_SIGNAL"
    elif margin_expansion_pct > 8:
        signal_strength = "MODERATE_SIGNAL"
    elif margin_expansion_pct > 3:
        signal_strength = "WEAK_SIGNAL"
    else:
        signal_strength = "NO_SIGNAL"
    
    return {
        "shrinkflation_percentage": round(shrinkflation_pct, 2),
        "margin_expansion_percentage": round(margin_expansion_pct, 2),
        "old_price_per_unit": round(old_ppu, 4),
        "new_price_per_unit": round(new_ppu, 4),
        "unit": f"USD/{unit}",
        "signal_strength": signal_strength,
        "is_shrinkflation": current_weight < historical_weight and current_price >= historical_price
    }


def create_alert_rule(
    rule_name: str,
    condition_type: str,
    threshold: float,
    action_type: str,
    target_ticker: str = ""
) -> dict:
    """Create a new automated alert rule in the system.
    
    Args:
        rule_name: Human-readable name for the rule
        condition_type: One of 'weight_drop', 'price_increase', 'margin_expansion'
        threshold: Numeric threshold percentage (e.g., 5.0 means > 5%)
        action_type: One of 'email', 'slack_webhook', 'in_app'
        target_ticker: Optional ticker to scope the rule to
    
    Returns:
        dict: Contains 'rule_id', 'status', 'message'
    """
    db = firestore.Client()
    rule_ref = db.collection('alert_rules').document()
    
    rule_data = {
        "id": rule_ref.id,
        "name": rule_name,
        "condition_type": condition_type,
        "threshold": threshold,
        "action_type": action_type,
        "target_ticker": target_ticker,
        "active": True,
        "created_at": datetime.now().isoformat()
    }
    
    rule_ref.set(rule_data)
    
    return {
        "rule_id": rule_ref.id,
        "status": "created",
        "message": f"Alert rule '{rule_name}' created successfully"
    }


# ============================================================
# AGENT DEFINITION
# ============================================================

AGENT_INSTRUCTION = """You are 'Shrinkflation AI', an enterprise-grade financial 
market intelligence analyst specializing in FMCG sector margin analysis (Year 2026).

YOUR ROLE:
You help hedge fund analysts and portfolio managers detect hidden margin expansions 
in FMCG companies by analyzing shrinkflation patterns (reducing product size while 
maintaining price).

CAPABILITIES (use these tools actively):
1. get_tracked_products() - Always check the database first
2. scrape_live_price(url) - Get real-time price/weight from e-commerce
3. search_market_news(query, ticker) - Find latest earnings news and industry updates
4. get_stock_quote(ticker) - Get current stock price and fundamentals
5. calculate_margin_impact(...) - Run deterministic margin calculations
6. create_alert_rule(...) - Set up automated monitoring rules

ANALYSIS METHODOLOGY:
- ALWAYS use calculate_margin_impact() for numbers. NEVER invent percentages.
- Cross-reference shrinkflation signals with stock price movements
- Cite sources from search_market_news() when discussing earnings
- Provide actionable investment signals (STRONG_BUY, MODERATE, WEAK, NO_SIGNAL)

COMMUNICATION STYLE:
- Professional, sharp English typical of a hedge fund research analyst
- Lead with the signal/conclusion, then provide supporting analysis
- Use bullet points for clarity
- Always mention relevant ticker symbols
"""

shrinkflation_agent = Agent(
    model="gemini-2.5-flash",
    name="shrinkflation_analyst",
    instruction=AGENT_INSTRUCTION,
    tools=[
        FunctionTool(get_tracked_products),
        FunctionTool(scrape_live_price),
        FunctionTool(search_market_news),
        FunctionTool(get_stock_quote),
        FunctionTool(calculate_margin_impact),
        FunctionTool(create_alert_rule),
    ]
)
```

### 4.3 Deploy ke Agent Engine

```python
# agent/deploy.py
from google.cloud import aiplatform

aiplatform.init(project="bigquery-datasciences", location="us-central1")

from google.adk.agents import Agent
from agent.shrinkflation_agent import shrinkflation_agent

# Deploy
remote_agent = aiplatform.Agent.create(
    agent=shrinkflation_agent,
    display_name="shrinkflation-ai-agent",
    description="FMCG margin intelligence agent with Bright Data integration"
)

print(f"Agent Engine ID: {remote_agent.resource_name}")
# Output: projects/bigquery-datasciences/locations/us-central1/reasoningEngines/XXXXX
```

### 4.4 Frontend: Hubungkan ke Agent Engine (streamQuery)

**File baru:** `frontend/services/agentService.ts`

```typescript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });

const AGENT_ENGINE_ID = 'YOUR_REASONING_ENGINE_ID'; // dari deploy.py output
const PROJECT_ID = 'bigquery-datasciences';
const LOCATION = 'us-central1';

export const queryAgent = async (
  userMessage: string,
  sessionId: string,
  onChunk: (text: string) => void
): Promise<void> => {
  
  // Endpoint streamQuery sudah didukung oleh proxy backend Anda!
  const url = `https://${LOCATION}-aiplatform.googleapis.com/v1beta1/projects/${PROJECT_ID}/locations/${LOCATION}/reasoningEngines/${AGENT_ENGINE_ID}:streamQuery`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: {
        messages: [{ role: "user", content: userMessage }],
        session_id: sessionId
      }
    })
  });

  // Stream reading
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  
  while (reader) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value, { stream: true });
    onChunk(chunk);
  }
};
```

**Kegunaan:** Chat sekarang berkomunikasi dengan agent yang bisa memicu tools secara real-time, dan responsnya di-stream ke UI (efek "mengetik").

---


## 5. FASE 3: Real Data Pipeline (Bright Data + BigQuery)

### 5.1 Cloud Function: Bright Data Scraper (Menggantikan Mock)

**Tujuan:** Menggantikan `brightDataService.ts` yang 100% mock dengan Cloud Function nyata.

**File baru:** `cloud-functions/scrape-product/index.js`

```javascript
const functions = require('@google-cloud/functions-framework');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const { BigQuery } = require('@google-cloud/bigquery');

const secretClient = new SecretManagerServiceClient();
const bigquery = new BigQuery();

async function getSecret(name) {
  const [version] = await secretClient.accessSecretVersion({
    name: `projects/bigquery-datasciences/secrets/${name}/versions/latest`
  });
  return version.payload.data.toString();
}

functions.http('scrapeProduct', async (req, res) => {
  // CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  
  const { url, product_id } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const apiKey = await getSecret('BRIGHT_DATA_API_KEY');
    
    // === STRATEGI 1: Web Scraper API (untuk e-commerce terkenal) ===
    // Bright Data punya collector bawaan untuk Shopee, Tokopedia, dll
    const scraperResponse = await fetch('https://api.brightdata.com/datasets/v3/trigger', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        dataset_id: 'gd_SHOPEE_PRODUCTS', // Dataset ID dari Bright Data console
        url: url,
        format: 'json'
      })
    });
    
    // === STRATEGI 2: Web Unlocker (fallback jika Scraper gagal) ===
    if (!scraperResponse.ok) {
      const unlockerResponse = await fetch('https://api.brightdata.com/request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          zone: 'web_unlocker',
          url: url,
          format: 'raw'
        })
      });
      
      // Parse HTML response untuk extract price & weight
      const html = await unlockerResponse.text();
      // ... parsing logic (atau gunakan Scraping Browser untuk JS-heavy pages)
    }

    const data = await scraperResponse.json();
    
    // Simpan snapshot ke BigQuery untuk time-series history
    await bigquery.dataset('shrinkflation').table('price_snapshots').insert([{
      product_id: product_id,
      url: url,
      price: data.price,
      weight: data.weight,
      unit: data.unit || 'g',
      currency: data.currency || 'IDR',
      scraped_at: new Date().toISOString(),
      source: 'bright_data_scraper'
    }]);

    res.status(200).json({
      price: data.price,
      weight: data.weight,
      unit: data.unit || 'g',
      scraped_at: new Date().toISOString(),
      proxy_info: 'Bright Data Residential'
    });

  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

### 5.2 BigQuery Schema: Historical Price Snapshots

**Dataset:** `bigquery-datasciences.shrinkflation`

**Tabel: `price_snapshots`**
```sql
CREATE TABLE shrinkflation.price_snapshots (
  snapshot_id STRING NOT NULL DEFAULT (GENERATE_UUID()),
  product_id STRING NOT NULL,
  url STRING,
  price FLOAT64 NOT NULL,
  weight FLOAT64 NOT NULL,
  unit STRING DEFAULT 'g',
  currency STRING DEFAULT 'IDR',
  price_usd FLOAT64,  -- Converted via exchange rate
  scraped_at TIMESTAMP NOT NULL,
  source STRING,  -- 'bright_data_scraper', 'manual', 'web_unlocker'
  
  -- Partitioning untuk query time-series yang efisien
) PARTITION BY DATE(scraped_at)
  CLUSTER BY product_id, url;
```

**Tabel: `products`**
```sql
CREATE TABLE shrinkflation.products (
  id STRING NOT NULL,
  name STRING NOT NULL,
  brand STRING NOT NULL,
  category STRING,
  target_ticker STRING,
  historical_price FLOAT64,
  historical_weight FLOAT64,
  unit STRING,
  url STRING,
  status STRING DEFAULT 'monitoring',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);
```

**Tabel: `alert_rules`**
```sql
CREATE TABLE shrinkflation.alert_rules (
  id STRING NOT NULL,
  name STRING NOT NULL,
  condition_type STRING,  -- 'weight_drop', 'price_increase', 'margin_expansion'
  threshold FLOAT64,
  action_type STRING,     -- 'email', 'slack', 'in_app'
  target_ticker STRING,
  active BOOL DEFAULT TRUE,
  created_by STRING,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);
```

### 5.3 Cloud Function: SERP API untuk Market News

**File baru:** `cloud-functions/search-news/index.js`

```javascript
functions.http('searchNews', async (req, res) => {
  const { query, ticker, country } = req.body;
  const apiKey = await getSecret('BRIGHT_DATA_API_KEY');
  
  // Bright Data SERP API
  const response = await fetch('https://api.brightdata.com/serp/req', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: `${query} ${ticker || ''}`.trim(),
      search_engine: 'google',
      country: country || 'id',
      num_results: 10,
      pages: 1
    })
  });

  const serpData = await response.json();
  
  res.status(200).json({
    results: serpData.organic?.map(r => ({
      title: r.title,
      snippet: r.description,
      url: r.link,
      published_date: r.date || null
    })) || []
  });
});
```

### 5.4 Bright Data MCP Server Integration

**Konsep:** Bright Data menyediakan MCP Server yang bisa langsung dipakai sebagai tool oleh AI Agent.

**Konfigurasi di ADK Agent:**
```python
from google.adk.tools import McpTool

# Bright Data MCP Server sebagai tool tambahan di agent
bright_data_mcp = McpTool(
    server_url="https://mcp.brightdata.com/v1",
    api_key=get_secret("BRIGHT_DATA_API_KEY"),
    tools=["web_scraper", "serp_search", "web_unlocker"]
)

# Tambahkan ke agent
shrinkflation_agent = Agent(
    model="gemini-2.5-flash",
    name="shrinkflation_analyst",
    instruction=AGENT_INSTRUCTION,
    tools=[
        FunctionTool(get_tracked_products),
        FunctionTool(calculate_margin_impact),
        FunctionTool(get_stock_quote),
        FunctionTool(create_alert_rule),
        bright_data_mcp,  # MCP Server Bright Data
    ]
)
```

**Keuntungan MCP Server:**
- Agent bisa langsung memanggil Bright Data tanpa Cloud Function perantara
- Mengurangi latensi (1 hop vs 2 hop)
- Bright Data menangani retry, proxy rotation, dll secara otomatis

### 5.5 Update Frontend: `brightDataService.ts` Nyata

```typescript
// frontend/services/brightDataService.ts — VERSI PRODUKSI

const CLOUD_FUNCTION_BASE = 'https://asia-southeast2-bigquery-datasciences.cloudfunctions.net';

export const fetchLiveProductData = async (
  productUrl: string,
  productId: string
): Promise<{ price: number; weight: number; unit: string; scraped_at: string }> => {
  
  const response = await fetch(`${CLOUD_FUNCTION_BASE}/scrapeProduct`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: productUrl, product_id: productId })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Scraping failed: ${response.status}`);
  }

  return response.json();
};

export const searchMarketNews = async (
  query: string,
  ticker?: string
): Promise<{ results: Array<{ title: string; snippet: string; url: string }> }> => {
  
  const response = await fetch(`${CLOUD_FUNCTION_BASE}/searchNews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, ticker })
  });

  if (!response.ok) throw new Error('News search failed');
  return response.json();
};
```

---


## 6. FASE 4: Fitur Baru — Earnings Calendar & Stock Integration

### 6.1 Halaman Baru: Earnings Calendar

**Route:** `/app/earnings`  
**Nav Label:** "Earnings Calendar"  
**Ikon:** `CalendarDays` dari lucide-react

**Tujuan:** Menampilkan kalender tanggal rilis laporan keuangan perusahaan yang di-track, dikaitkan dengan kekuatan sinyal shrinkflation yang terdeteksi.

**UI Detail:**

```
┌─────────────────────────────────────────────────────────────────┐
│ Earnings Calendar                                                │
│ Track upcoming earnings dates and correlate with shrinkflation   │
│ signals for maximum alpha generation.                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐              │
│ │ NEXT 7 DAYS  │ │ NEXT 30 DAYS │ │ SIGNAL READY │              │
│ │     2        │ │      5       │ │     3        │              │
│ │ Earnings Due │ │ Earnings Due │ │ With Signals │              │
│ └──────────────┘ └──────────────┘ └──────────────┘              │
│                                                                   │
│ ┌───────────────────────────────────────────────────────────┐    │
│ │ Timeline View (horizontal scrollable)                      │    │
│ │                                                            │    │
│ │  TODAY        +7d          +14d         +30d               │    │
│ │    │           │            │            │                 │    │
│ │    ▼           ▼            ▼            ▼                 │    │
│ │  ┌────┐     ┌────┐      ┌────┐                            │    │
│ │  │UNVR│     │ICBP│      │MYOR│                            │    │
│ │  │.JK │     │.JK │      │.JK │                            │    │
│ │  │🟢  │     │🟡  │      │🔴  │                            │    │
│ │  └────┘     └────┘      └────┘                            │    │
│ │  Strong     Moderate     No Signal                         │    │
│ └───────────────────────────────────────────────────────────┘    │
│                                                                   │
│ ┌───────────────────────────────────────────────────────────┐    │
│ │ Detailed Earnings Table                                    │    │
│ │ ┌──────┬──────────┬───────────┬──────────┬─────────────┐  │    │
│ │ │Ticker│ Company  │ Earn Date │ Days Left│ Signal      │  │    │
│ │ ├──────┼──────────┼───────────┼──────────┼─────────────┤  │    │
│ │ │UNVR  │ Unilever │ Jun 15    │    12    │ STRONG 🟢   │  │    │
│ │ │ICBP  │ Indofood │ Jun 22    │    19    │ MODERATE 🟡 │  │    │
│ │ │MYOR  │ Mayora   │ Jul 05    │    32    │ WEAK 🟠     │  │    │
│ │ │NSRGY │ Nestle   │ Jul 18    │    45    │ NO DATA ⚪  │  │    │
│ │ └──────┴──────────┴───────────┴──────────┴─────────────┘  │    │
│ └───────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

**Data Source untuk Earnings Dates:**
- Bright Data SERP API: search `"{ticker} earnings date 2026 Q2"`
- Atau Yahoo Finance API: `yfinance.Ticker(ticker).calendar`

**Implementasi Backend (Tool untuk Agent):**
```python
def get_earnings_calendar(tickers: list[str]) -> dict:
    """Get upcoming earnings dates for given tickers.
    
    Args:
        tickers: List of ticker symbols ['UNVR.JK', 'ICBP.JK']
    
    Returns:
        dict with earnings_dates list containing ticker, company, date, days_until
    """
    import yfinance as yf
    
    results = []
    for ticker in tickers:
        stock = yf.Ticker(ticker)
        calendar = stock.calendar
        if calendar and 'Earnings Date' in calendar:
            earn_date = calendar['Earnings Date'][0]
            days_until = (earn_date - datetime.now()).days
            results.append({
                "ticker": ticker,
                "company": stock.info.get("shortName", ticker),
                "earnings_date": earn_date.isoformat(),
                "days_until": days_until
            })
    
    return {"earnings_dates": results}
```

**Frontend Type:**
```typescript
// Tambah di types.ts
export interface EarningsEvent {
  ticker: string;
  company: string;
  earningsDate: string;  // ISO date
  daysUntil: number;
  signalStrength: 'strong' | 'moderate' | 'weak' | 'none';
  marginExpansion?: number;
}
```

### 6.2 Stock Price Widget di Dashboard

**Komponen baru:** `frontend/components/StockTicker.tsx`

**UI:** Horizontal scrolling ticker bar di atas dashboard showing real-time prices:
```
┌────────────────────────────────────────────────────────────────────┐
│ UNVR.JK ▲ 2,450 (+1.2%) │ ICBP.JK ▼ 11,800 (-0.3%) │ MYOR ▲ ... │
└────────────────────────────────────────────────────────────────────┘
```

**Data:** Panggil `get_stock_quote()` tool via Cloud Function endpoint, cache 5 menit.

### 6.3 Korelasi Chart: Shrinkflation Signal vs Stock Price

**Lokasi:** Halaman `CompetitorIntel.tsx` — tambah chart baru di bawah existing charts.

**Tipe Chart:** Dual-axis line chart (Recharts `ComposedChart`)
- Axis kiri: Stock price (line, warna hijau)
- Axis kanan: Margin expansion % (bar, warna amber)
- X-axis: Waktu (dari BigQuery `price_snapshots`)

**Kegunaan:** Menunjukkan apakah deteksi shrinkflation berkorelasi dengan kenaikan harga saham (validasi hipotesis).

---


## 7. FASE 5: Alerts Fungsional & Notification System

### 7.1 Create Rule Modal (Menggantikan tombol mati)

**File:** `frontend/pages/Alerts.tsx`

**UI Modal Detail:**
```
┌─────────────────────────────────────────────────────┐
│ ✕  Create New Alert Rule                            │
├─────────────────────────────────────────────────────┤
│                                                      │
│ Rule Name:                                           │
│ ┌─────────────────────────────────────────────────┐ │
│ │ e.g., "Major UNVR Shrinkflation Alert"         │ │
│ └─────────────────────────────────────────────────┘ │
│                                                      │
│ Condition Type:                                      │
│ ┌─────────────────────────────────────────────────┐ │
│ │ ▼ Weight Drop Exceeds Threshold                │ │
│ │   - Weight Drop > X%                            │ │
│ │   - Price Increase > X%                         │ │
│ │   - Margin Expansion > X%                       │ │
│ │   - Any Shrinkflation on Ticker                 │ │
│ └─────────────────────────────────────────────────┘ │
│                                                      │
│ Threshold (%):                                       │
│ ┌─────────┐                                         │
│ │ 5.0     │                                         │
│ └─────────┘                                         │
│                                                      │
│ Target Ticker (optional):                            │
│ ┌─────────────────────────────────────────────────┐ │
│ │ UNVR.JK (leave empty for all tickers)          │ │
│ └─────────────────────────────────────────────────┘ │
│                                                      │
│ Action When Triggered:                               │
│ ┌─────────────────────────────────────────────────┐ │
│ │ ▼ Email to Analyst Team                        │ │
│ │   - Email (requires SendGrid config)            │ │
│ │   - Slack Webhook                               │ │
│ │   - In-App Notification Only                    │ │
│ └─────────────────────────────────────────────────┘ │
│                                                      │
│ [If Email selected:]                                 │
│ Recipient Email:                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ analyst@hedgefund.com                           │ │
│ └─────────────────────────────────────────────────┘ │
│                                                      │
│ [If Slack selected:]                                 │
│ Webhook URL:                                         │
│ ┌─────────────────────────────────────────────────┐ │
│ │ https://hooks.slack.com/services/...            │ │
│ └─────────────────────────────────────────────────┘ │
│                                                      │
│         [Cancel]  [Create Rule]                      │
└─────────────────────────────────────────────────────┘
```

### 7.2 Rule Evaluation Engine (Cloud Function)

**File:** `cloud-functions/evaluate-alerts/index.js`

**Trigger:** Cloud Scheduler setiap 15 menit, ATAU setelah setiap scrape selesai.

```javascript
functions.http('evaluateAlerts', async (req, res) => {
  const bigquery = new BigQuery();
  
  // 1. Ambil semua active rules
  const [rules] = await bigquery.query(`
    SELECT * FROM shrinkflation.alert_rules WHERE active = TRUE
  `);
  
  // 2. Untuk setiap rule, cek condition terhadap data terbaru
  for (const rule of rules) {
    const [snapshots] = await bigquery.query(`
      SELECT 
        p.name, p.target_ticker, p.historical_weight, p.historical_price,
        s.weight as current_weight, s.price as current_price
      FROM shrinkflation.products p
      JOIN shrinkflation.price_snapshots s ON p.id = s.product_id
      WHERE s.scraped_at = (SELECT MAX(scraped_at) FROM shrinkflation.price_snapshots WHERE product_id = p.id)
      ${rule.target_ticker ? `AND p.target_ticker = '${rule.target_ticker}'` : ''}
    `);
    
    for (const product of snapshots) {
      let triggered = false;
      let value = 0;
      
      switch (rule.condition_type) {
        case 'weight_drop':
          value = ((product.historical_weight - product.current_weight) / product.historical_weight) * 100;
          triggered = value > rule.threshold;
          break;
        case 'price_increase':
          value = ((product.current_price - product.historical_price) / product.historical_price) * 100;
          triggered = value > rule.threshold;
          break;
        case 'margin_expansion':
          const oldPpu = product.historical_price / product.historical_weight;
          const newPpu = product.current_price / product.current_weight;
          value = ((newPpu - oldPpu) / oldPpu) * 100;
          triggered = value > rule.threshold;
          break;
      }
      
      if (triggered) {
        await fireAction(rule, product, value);
      }
    }
  }
  
  res.status(200).json({ status: 'evaluation_complete' });
});

async function fireAction(rule, product, value) {
  // Log notification ke Firestore
  const db = admin.firestore();
  await db.collection('notifications').add({
    rule_id: rule.id,
    rule_name: rule.name,
    product_name: product.name,
    ticker: product.target_ticker,
    triggered_value: value,
    timestamp: new Date(),
    type: 'warning'
  });
  
  // Kirim berdasarkan action_type
  switch (rule.action_type) {
    case 'email':
      await sendEmail(rule.recipient_email, rule, product, value);
      break;
    case 'slack':
      await sendSlackWebhook(rule.webhook_url, rule, product, value);
      break;
    case 'in_app':
      // Sudah tersimpan di Firestore, frontend akan polling/listen
      break;
  }
}
```

### 7.3 Real-time Notifications di Frontend

**Implementasi:** Firestore onSnapshot listener

```typescript
// frontend/services/notificationService.ts
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

const app = initializeApp({ /* firebase config */ });
const db = getFirestore(app);

export const subscribeToNotifications = (
  userId: string,
  onNewNotification: (notif: AppNotification) => void
) => {
  const q = query(
    collection(db, 'notifications'),
    orderBy('timestamp', 'desc'),
    limit(20)
  );
  
  return onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const data = change.doc.data();
        onNewNotification({
          id: change.doc.id,
          title: `Alert: ${data.rule_name}`,
          message: `${data.product_name} (${data.ticker}) - ${data.triggered_value.toFixed(1)}% detected`,
          timestamp: data.timestamp.toDate(),
          type: data.type
        });
      }
    });
  });
};
```

**UI Enhancement — Notification Bell di Sidebar:**
- Badge merah dengan count unread notifications
- Dropdown panel saat diklik
- Sound notification (optional toggle di Settings)

---


## 8. FASE 6: Authentication & Persistensi Data

### 8.1 Firebase Authentication (Menggantikan Login Palsu)

**Tujuan:** Menggantikan `setTimeout → set user statis` dengan Google OAuth nyata.

**Setup Firebase:**
1. Buat project Firebase / gunakan project GCP `bigquery-datasciences`
2. Enable Authentication → Sign-in method → Google
3. Tambah authorized domain

**File baru:** `frontend/services/authService.ts`

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "bigquery-datasciences.firebaseapp.com",
  projectId: "bigquery-datasciences",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Restrict ke domain tertentu (enterprise)
provider.setCustomParameters({ hd: 'hedgefund.com' }); // Optional: hanya izinkan domain ini

export const loginWithGoogle = async (): Promise<{
  id: string; name: string; email: string; avatar: string; role: 'analyst' | 'admin';
}> => {
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  
  return {
    id: user.uid,
    name: user.displayName || 'Analyst',
    email: user.email || '',
    avatar: user.photoURL || 'https://picsum.photos/200',
    role: 'analyst' // Bisa ditentukan dari Firestore user profile
  };
};

export const logoutUser = async () => {
  await signOut(auth);
};

export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
```

**Update `LoginPage.tsx`:**
```tsx
import { loginWithGoogle } from '../services/authService';

const handleGoogleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  
  try {
    const userData = await loginWithGoogle();
    login(userData);
    navigate('/app/dashboard');
  } catch (error: any) {
    setError(error.message || 'Login failed');
  } finally {
    setIsLoading(false);
  }
};
```

### 8.2 Firestore sebagai Database Utama

**Koleksi Structure:**

```
firestore/
├── users/
│   └── {uid}/
│       ├── name: string
│       ├── email: string
│       ├── role: 'analyst' | 'admin'
│       └── settings: { brightDataApiKey: string (encrypted), ... }
│
├── products/
│   └── {productId}/
│       ├── name: string
│       ├── brand: string
│       ├── category: string
│       ├── targetTicker: string
│       ├── historicalPrice: number
│       ├── historicalWeight: number
│       ├── unit: string
│       ├── url: string
│       ├── currentPrice: number | null
│       ├── currentWeight: number | null
│       ├── status: 'monitoring' | 'shrinkflation_detected' | 'stable'
│       ├── lastChecked: timestamp
│       └── createdBy: string (uid)
│
├── alert_rules/
│   └── {ruleId}/
│       ├── name: string
│       ├── conditionType: string
│       ├── threshold: number
│       ├── actionType: string
│       ├── targetTicker: string
│       ├── active: boolean
│       ├── webhookUrl: string (jika slack)
│       ├── recipientEmail: string (jika email)
│       └── createdBy: string (uid)
│
├── notifications/
│   └── {notifId}/
│       ├── ruleId: string
│       ├── ruleName: string
│       ├── productName: string
│       ├── ticker: string
│       ├── triggeredValue: number
│       ├── timestamp: timestamp
│       ├── type: 'warning' | 'info' | 'success'
│       └── read: boolean
│
└── chat_sessions/
    └── {sessionId}/
        ├── userId: string
        ├── createdAt: timestamp
        └── messages/ (subcollection)
            └── {msgId}/
                ├── role: 'user' | 'model' | 'system'
                ├── text: string
                ├── timestamp: timestamp
                └── groundingUrls: array
```

### 8.3 Migrasi AppContext ke Firestore

**Prinsip:** AppContext tetap ada sebagai state layer, tapi sekarang dia SYNC dengan Firestore.

```typescript
// frontend/context/AppContext.tsx — enhanced version

import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

// Di dalam AppProvider:
useEffect(() => {
  if (!user) return;
  
  // Real-time listener untuk products
  const unsubProducts = onSnapshot(
    collection(db, 'products'),
    (snapshot) => {
      const prods = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
      setProducts(prods);
    }
  );
  
  // Real-time listener untuk notifications
  const unsubNotifs = onSnapshot(
    query(collection(db, 'notifications'), orderBy('timestamp', 'desc'), limit(50)),
    (snapshot) => {
      const notifs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AppNotification));
      setNotifications(notifs);
    }
  );
  
  return () => { unsubProducts(); unsubNotifs(); };
}, [user]);

// addProduct sekarang menulis ke Firestore:
const addProduct = async (p: Omit<Product, 'id'>) => {
  await addDoc(collection(db, 'products'), { ...p, createdBy: user!.id });
  // State akan otomatis update via onSnapshot listener
};
```

---


## 9. FASE 7: UI/UX Enhancement & New Pages

### 9.1 Streaming Chat Response (Efek "Mengetik")

**File:** `frontend/pages/AgentChat.tsx` & `frontend/components/ChatInterface.tsx`

**Masalah saat ini:** User mengirim pesan → loading spinner 3-8 detik → teks muncul sekaligus. Tidak enterprise-grade.

**Solusi:** Streaming response via Server-Sent Events (SSE) atau `streamQuery`.

**Implementasi di AgentChat.tsx:**
```tsx
const handleSendMessage = useCallback(async (text: string, useWebSearch: boolean) => {
  // ... tambah user message ke state ...
  setIsTyping(true);
  
  // Buat placeholder model message yang akan di-stream
  const modelMsgId = (Date.now() + 1).toString();
  const modelMsg: Message = {
    id: modelMsgId,
    role: 'model',
    text: '',  // Mulai kosong, akan diisi bertahap
    timestamp: new Date(),
  };
  setChatMessages(prev => [...prev, modelMsg]);
  
  // Stream response
  await queryAgent(text, sessionId, (chunk: string) => {
    setChatMessages(prev => 
      prev.map(msg => 
        msg.id === modelMsgId 
          ? { ...msg, text: msg.text + chunk }
          : msg
      )
    );
  });
  
  setIsTyping(false);
}, [/* deps */]);
```

**UI Enhancement di ChatInterface.tsx:**
- Karakter muncul satu per satu (sudah otomatis karena state update per chunk)
- Cursor blinking di akhir text saat masih streaming
- Tombol "Stop Generation" muncul saat streaming

### 9.2 Halaman Baru: Time-Series History

**Route:** `/app/history`  
**Nav Label:** "Price History"  
**Ikon:** `History` dari lucide-react

**Tujuan:** Menampilkan grafik time-series berat & harga produk dari waktu ke waktu (dari BigQuery `price_snapshots`).

**UI:**
```
┌─────────────────────────────────────────────────────────────────┐
│ Price & Weight History                                           │
│ Time-series view of product specifications over time             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ Select Product: [▼ Kopi Sachet ABC 10s          ]               │
│ Time Range:     [7d] [30d] [90d] [1y] [All]                    │
│                                                                   │
│ ┌───────────────────────────────────────────────────────────┐    │
│ │              WEIGHT OVER TIME                              │    │
│ │  250g ─────────────────┐                                   │    │
│ │                         │                                   │    │
│ │  220g                   └─────────────────────── (now)     │    │
│ │                                                            │    │
│ │  Jan    Feb    Mar    Apr    May    Jun                    │    │
│ └───────────────────────────────────────────────────────────┘    │
│                                                                   │
│ ┌───────────────────────────────────────────────────────────┐    │
│ │              PRICE PER UNIT (USD/g) OVER TIME              │    │
│ │                                     ┌─────── $0.0068/g    │    │
│ │  $0.006/g ─────────────────────────┘                      │    │
│ │                                                            │    │
│ │  Jan    Feb    Mar    Apr    May    Jun                    │    │
│ └───────────────────────────────────────────────────────────┘    │
│                                                                   │
│ ┌──────────────────────────────────────────────────────────┐     │
│ │ Data Points Table                                         │     │
│ │ Date       | Weight | Price | PPU      | Source          │     │
│ │ 2026-01-15 | 250g   | $1.50 | $0.0060  | Bright Data    │     │
│ │ 2026-03-01 | 235g   | $1.50 | $0.0064  | Bright Data    │     │
│ │ 2026-05-20 | 220g   | $1.50 | $0.0068  | Bright Data    │     │
│ └──────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

**Data Source:** BigQuery query:
```sql
SELECT scraped_at, weight, price, (price/weight) as ppu
FROM shrinkflation.price_snapshots
WHERE product_id = @productId
ORDER BY scraped_at ASC
```

### 9.3 Dashboard Enhancement: Signal Strength Summary Cards

**Lokasi:** `DashboardHome.tsx` — tambah section baru di bawah metrics.

**UI — "Pre-Earnings Signal Board":**
```
┌─────────────────────────────────────────────────────────────────┐
│ PRE-EARNINGS INTELLIGENCE SIGNALS                                │
├──────────────────┬──────────────────┬──────────────────┐         │
│ 🟢 STRONG        │ 🟡 MODERATE      │ 🔴 NO SIGNAL     │         │
│                  │                  │                  │         │
│ UNVR.JK          │ ICBP.JK          │ NSRGY            │         │
│ +13.6% margin    │ +5.3% margin     │ Data insufficient│         │
│ Earnings: 12d    │ Earnings: 19d    │ Earnings: 45d    │         │
│                  │                  │                  │         │
│ [View Details]   │ [View Details]   │ [Sync Data]      │         │
└──────────────────┴──────────────────┴──────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

### 9.4 Chat Enhancement: Tool Execution Visualization

**Saat ini:** System message hardcoded `> Executing: queryEnterpriseDatabase()`  
**Target:** Real-time tool execution feedback dari agent.

**UI saat agent memanggil tool:**
```
┌──────────────────────────────────────────────────┐
│ 🤖 Agent is working...                           │
│                                                   │
│  ✅ get_tracked_products()         [0.3s]        │
│  ✅ scrape_live_price(shopee..)    [2.1s]        │
│  🔄 calculate_margin_impact(...)   [running]     │
│  ⏳ get_stock_quote(UNVR.JK)      [queued]      │
│                                                   │
│  ████████████░░░░░░░░ 60% complete               │
└──────────────────────────────────────────────────┘
```

**Implementasi:** Agent Engine `streamQuery` mengembalikan intermediate tool calls. Parse stream dan render sebagai step indicator.

### 9.5 Responsive Mobile Layout

**Masalah saat ini:** Sidebar 256px fixed, tidak responsive di mobile.

**Solusi:**
- Mobile (< 768px): Sidebar menjadi hamburger menu overlay
- Tablet (768px-1024px): Sidebar collapsed (hanya ikon)
- Desktop (> 1024px): Sidebar full seperti sekarang
- SignalDashboard di AgentChat: Menjadi collapsible bottom sheet di mobile

### 9.6 Dark/Light Mode Toggle

**Lokasi:** Settings page + icon di sidebar header.

**Implementasi:**
- CSS variables untuk semua warna slate-*
- localStorage preference
- Toggle switch di Settings + quick toggle icon di sidebar
- Default: dark (sesuai saat ini)

### 9.7 Onboarding Tour

**Trigger:** Pertama kali user login (cek flag `hasCompletedOnboarding` di Firestore user profile).

**Steps:**
1. "Welcome to Shrinkflation AI" — overview
2. "Data Pipeline" — cara menambah produk dan sync data
3. "AI Agent" — cara chat dan apa yang bisa dilakukan agent
4. "Alerts" — cara setup automated monitoring
5. "Earnings Calendar" — cara baca sinyal

**Library:** `react-joyride` atau custom tooltip component.

---


## 10. FASE 8: Export & Reporting Professional

### 10.1 PDF Report Generation

**Tujuan:** Buat laporan PDF berformat profesional (branding Shrinkflation AI) yang bisa dikirim ke klien/PM.

**Komponen baru:** `frontend/components/ReportGenerator.tsx`

**Isi Report:**
1. Cover page: Logo + "Shrinkflation Intelligence Report" + tanggal + analyst name
2. Executive Summary: AI-generated 3-sentence summary
3. Signal Overview Table: Semua produk dengan status & margin expansion
4. Detail per produk: Chart price-per-unit comparison
5. Earnings Calendar: Upcoming dates + signal correlation
6. Methodology Disclaimer

**Library:** `@react-pdf/renderer` atau `jspdf` + `html2canvas`

**Implementasi:**
```typescript
// frontend/services/reportService.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateIntelligenceReport = async (
  products: Product[],
  signals: ShrinkflationSignal[],
  earningsData: EarningsEvent[],
  analystName: string
): Promise<Blob> => {
  const doc = new jsPDF();
  
  // Cover Page
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 297, 'F');
  doc.setTextColor(52, 211, 153); // emerald-400
  doc.setFontSize(28);
  doc.text('SHRINKFLATION AI', 105, 100, { align: 'center' });
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text('Intelligence Report', 105, 115, { align: 'center' });
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 130, { align: 'center' });
  doc.text(`Analyst: ${analystName}`, 105, 138, { align: 'center' });
  doc.text('CONFIDENTIAL - FOR INTERNAL USE ONLY', 105, 250, { align: 'center' });
  
  // Signal Overview Table
  doc.addPage();
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text('Signal Overview', 14, 20);
  
  autoTable(doc, {
    startY: 30,
    head: [['Product', 'Ticker', 'Weight Change', 'Margin Expansion', 'Signal']],
    body: products
      .filter(p => p.status === 'shrinkflation_detected')
      .map(p => {
        const oldPpu = p.historicalPrice / p.historicalWeight;
        const newPpu = (p.currentPrice || p.historicalPrice) / (p.currentWeight || p.historicalWeight);
        const margin = ((newPpu - oldPpu) / oldPpu * 100).toFixed(1);
        const weightDrop = ((p.historicalWeight - (p.currentWeight || p.historicalWeight)) / p.historicalWeight * 100).toFixed(1);
        return [p.name, p.targetTicker, `-${weightDrop}%`, `+${margin}%`, 'DETECTED'];
      }),
    styles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
    headStyles: { fillColor: [16, 185, 129] }
  });
  
  // ... more pages ...
  
  return doc.output('blob');
};
```

**UI Trigger:**
- Tombol "Generate Report" di DashboardHome (di sebelah AI Insights panel)
- Dialog preview sebelum download
- Format: PDF (utama), juga opsi CSV (sudah ada)

### 10.2 Enhanced CSV Export

**Peningkatan dari versi saat ini:**
- Tambah kolom: `Price Per Unit (Historical)`, `Price Per Unit (Live)`, `Margin Expansion %`, `Signal Strength`
- Tambah metadata row di atas: Tanggal export, jumlah produk, disclaimer

### 10.3 Chat Export sebagai Formatted Report

**Peningkatan dari `.txt` saat ini:**
- Opsi export sebagai Markdown (`.md`) — lebih mudah dibaca
- Opsi export sebagai PDF — format profesional
- Include charts/signal dashboard sebagai gambar (via html2canvas)

---


## 11. ARSITEKTUR TARGET AKHIR

### 11.1 Diagram Arsitektur Lengkap

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              USER (Browser)                                       │
│                                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐      │
│  │                    REACT FRONTEND (Vite + TypeScript)                    │      │
│  │                                                                         │      │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │      │
│  │  │Dashboard │ │AI Agent  │ │Pipeline  │ │Earnings  │ │History   │    │      │
│  │  │Home      │ │Chat      │ │(CRUD)    │ │Calendar  │ │TimeSeries│    │      │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘    │      │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                 │      │
│  │  │Competitor│ │Network   │ │Alerts    │ │Settings  │                 │      │
│  │  │Intel     │ │Health    │ │& Triggers│ │& API     │                 │      │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘                 │      │
│  └─────────────────────────┬───────────────────────────────────────────────┘      │
│                             │                                                      │
│                    Vertex AI Proxy Interceptor                                     │
│                             │                                                      │
└─────────────────────────────┼──────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         EXPRESS.JS PROXY BACKEND                                  │
│                                                                                   │
│  ┌────────────────┐  ┌────────────────────┐  ┌────────────────────────────┐      │
│  │ /api-proxy     │  │ /ws-proxy          │  │ Rate Limiter (100/15min)   │      │
│  │ (REST → Vertex)│  │ (WebSocket → Live) │  │ Auth: ADC + PROXY_HEADER   │      │
│  └────────┬───────┘  └────────┬───────────┘  └────────────────────────────┘      │
└───────────┼────────────────────┼─────────────────────────────────────────────────┘
            │                    │
            ▼                    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    GOOGLE CLOUD PLATFORM                                          │
│                                                                                   │
│  ┌────────────────────────────────────────────────────────────────────┐          │
│  │              VERTEX AI AGENT ENGINE (ADK)                          │          │
│  │                                                                    │          │
│  │  ┌─────────────────────────────────────────────────────────┐      │          │
│  │  │  SHRINKFLATION ANALYST AGENT (Gemini 2.5 Flash)         │      │          │
│  │  │                                                         │      │          │
│  │  │  Tools:                                                 │      │          │
│  │  │  ├── get_tracked_products()    → Firestore              │      │          │
│  │  │  ├── scrape_live_price()       → Cloud Function → BD   │      │          │
│  │  │  ├── search_market_news()      → Bright Data SERP API  │      │          │
│  │  │  ├── get_stock_quote()         → Yahoo Finance API      │      │          │
│  │  │  ├── calculate_margin_impact() → Deterministic calc     │      │          │
│  │  │  ├── create_alert_rule()       → Firestore              │      │          │
│  │  │  ├── get_earnings_calendar()   → Yahoo Finance          │      │          │
│  │  │  └── [Bright Data MCP Server]  → Direct MCP connection  │      │          │
│  │  │                                                         │      │          │
│  │  │  Memory: Agent Engine Sessions (chat persistence)       │      │          │
│  │  └─────────────────────────────────────────────────────────┘      │          │
│  └────────────────────────────────────────────────────────────────────┘          │
│                                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐           │
│  │ CLOUD FUNCTIONS  │  │ FIRESTORE        │  │ BIGQUERY             │           │
│  │                  │  │                  │  │                      │           │
│  │ scrapeProduct()  │  │ users/           │  │ price_snapshots      │           │
│  │ searchNews()     │  │ products/        │  │ (partitioned by date)│           │
│  │ evaluateAlerts() │  │ alert_rules/     │  │                      │           │
│  │ getStockQuote()  │  │ notifications/   │  │ products (master)    │           │
│  │                  │  │ chat_sessions/   │  │ alert_rules          │           │
│  └────────┬─────────┘  └──────────────────┘  └──────────────────────┘           │
│           │                                                                       │
└───────────┼───────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         BRIGHT DATA PLATFORM                                     │
│                                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│  │ Web Scraper  │  │ SERP API     │  │ Web Unlocker │  │ Scraping Browser │    │
│  │ API          │  │              │  │              │  │                  │    │
│  │              │  │ Google/Bing  │  │ Anti-bot     │  │ JS-heavy pages   │    │
│  │ Shopee       │  │ news search  │  │ bypass       │  │ (SPA rendering)  │    │
│  │ Tokopedia    │  │ earnings     │  │ CAPTCHA      │  │                  │    │
│  │ Lazada       │  │ reports      │  │ solving      │  │                  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────────┘    │
│                                                                                   │
│  ┌──────────────────────────────────────────────────────────────────────────┐    │
│  │                    MCP SERVER (Model Context Protocol)                    │    │
│  │    Direct tool integration with AI Agent — no Cloud Function needed      │    │
│  └──────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 11.2 File Structure Target

```
aiu-shrinkfit/
├── .gitignore                          # BARU: include .env.local
├── README.md                           # UPDATE: arsitektur baru
├── BLUEPRINT_UPGRADE.md                # Dokumen ini
├── package.json                        # Root workspace manager
│
├── frontend/
│   ├── index.html                      # UPDATE: Tailwind build, hapus CDN
│   ├── index.tsx
│   ├── App.tsx                         # UPDATE: tambah route /earnings, /history
│   ├── types.ts                        # UPDATE: tambah EarningsEvent, dll
│   ├── vite.config.ts
│   ├── tailwind.config.ts              # BARU: proper Tailwind config
│   ├── postcss.config.js              # BARU: PostCSS untuk Tailwind
│   ├── styles/
│   │   └── globals.css                # BARU: @tailwind directives + custom CSS
│   │
│   ├── components/
│   │   ├── ChatInterface.tsx           # UPDATE: streaming support
│   │   ├── SignalDashboard.tsx          # UPDATE: signal strength badge
│   │   ├── StockTicker.tsx             # BARU: horizontal stock price bar
│   │   ├── ToolExecutionLog.tsx        # BARU: real-time agent tool steps
│   │   ├── NotificationBell.tsx        # BARU: notification dropdown
│   │   ├── ReportGenerator.tsx         # BARU: PDF generation
│   │   └── ErrorBoundary.tsx           # BARU: graceful error handling
│   │
│   ├── context/
│   │   └── AppContext.tsx              # UPDATE: Firestore sync + localStorage fallback
│   │
│   ├── layouts/
│   │   └── DashboardLayout.tsx         # FIX: Navigate component + responsive
│   │
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── LoginPage.tsx               # UPDATE: Firebase Auth
│   │   ├── DashboardHome.tsx           # UPDATE: signal board + stock ticker
│   │   ├── AgentChat.tsx               # UPDATE: streaming + tool visualization
│   │   ├── ProductsCRUD.tsx            # UPDATE: real Bright Data integration
│   │   ├── CompetitorIntel.tsx         # UPDATE: correlation chart
│   │   ├── NetworkHealth.tsx
│   │   ├── Alerts.tsx                  # FIX: Create Rule modal + delete handler
│   │   ├── Settings.tsx                # UPDATE: more config options
│   │   ├── EarningsCalendar.tsx        # BARU: earnings dates + signals
│   │   └── PriceHistory.tsx            # BARU: time-series charts
│   │
│   └── services/
│       ├── aiService.ts                # UPDATE: agent mode support
│       ├── agentService.ts             # BARU: Agent Engine streamQuery client
│       ├── brightDataService.ts        # UPDATE: real Cloud Function calls
│       ├── authService.ts              # BARU: Firebase Authentication
│       ├── firebaseConfig.ts           # BARU: Firebase initialization
│       ├── notificationService.ts      # BARU: Firestore realtime notifications
│       └── reportService.ts            # BARU: PDF generation logic
│
├── backend/
│   ├── .env.local                      # GITIGNORED
│   ├── .env.example                    # BARU: template tanpa secrets
│   ├── package.json
│   └── server.js                       # Tetap: proxy sudah mendukung Agent Engine
│
├── agent/                              # BARU: ADK Agent (Python)
│   ├── requirements.txt
│   ├── shrinkflation_agent.py          # Agent definition + tools
│   ├── deploy.py                       # Deploy ke Agent Engine
│   └── test_agent.py                   # Local testing
│
└── cloud-functions/                    # BARU: Cloud Functions
    ├── scrape-product/
    │   ├── index.js
    │   └── package.json
    ├── search-news/
    │   ├── index.js
    │   └── package.json
    └── evaluate-alerts/
        ├── index.js
        └── package.json
```

### 11.3 Dependency Updates

**Frontend `package.json` — tambahkan:**
```json
{
  "dependencies": {
    "firebase": "^11.x",
    "jspdf": "^2.5.x",
    "jspdf-autotable": "^3.8.x",
    "react-joyride": "^2.9.x"
  },
  "devDependencies": {
    "tailwindcss": "^4.x",
    "postcss": "^8.x",
    "autoprefixer": "^10.x"
  }
}
```

**Agent `requirements.txt`:**
```
google-adk>=1.0.0
google-cloud-aiplatform>=2.0.0
google-cloud-firestore>=2.0.0
google-cloud-bigquery>=3.0.0
google-cloud-secret-manager>=2.0.0
yfinance>=0.2.0
requests>=2.31.0
```

---


## 12. CATATAN UNTUK AGENT STUDIO GOOGLE

### 12.1 Cara Memberi Instruksi ke Agent Studio agar Menyelesaikan Tahap per Tahap

Berdasarkan pengalaman Anda bahwa Agent Studio sering tidak menyelesaikan perintah bertahap, berikut strategi prompting yang efektif:

**PRINSIP UTAMA: Satu prompt = Satu file = Satu concern.**

**JANGAN lakukan ini:**
```
❌ "Buatkan seluruh aplikasi shrinkflation AI dengan 10 halaman, 
   integrasi Bright Data, Agent Engine, Firebase Auth, BigQuery, 
   dan PDF export."
```

**LAKUKAN ini — pisah per file/concern:**

---

#### Prompt 1: Setup & Configuration
```
Saya sedang membangun ulang aplikasi "Shrinkflation AI". 
Sekarang buatkan file berikut saja:

1. frontend/tailwind.config.ts — dengan konfigurasi warna: slate (850, 900, 950), 
   emerald (400, 500, 600), brand (400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7').
   Sertakan animation keyframes: blob, fadeIn, slideUp, float.

2. frontend/postcss.config.js — standard PostCSS dengan tailwindcss dan autoprefixer.

3. frontend/styles/globals.css — berisi @tailwind base/components/utilities 
   plus custom classes .glass-panel dan .glass-card (copy definisi dari index.html saat ini).

4. Update frontend/index.html — hapus <script src="cdn.tailwindcss.com"> dan 
   semua inline <script>tailwind.config</script> serta <style>. 
   Ganti dengan <link rel="stylesheet" href="./styles/globals.css">.

Jangan ubah file lain. Hanya 4 file ini.
```

---

#### Prompt 2: Fix Bug DashboardLayout
```
Buka file frontend/layouts/DashboardLayout.tsx.

Bug: Baris `if (!user) { navigate('/login'); return null; }` memanggil 
navigate() di dalam render body. Ini anti-pattern React.

Fix: 
- Import `Navigate` dari 'react-router-dom'
- Ganti baris tersebut dengan: `if (!user) { return <Navigate to="/login" replace />; }`
- Hapus `useNavigate()` dari atas JIKA tidak digunakan di tempat lain 
  (tapi masih dipakai di handleLogout, jadi tetap pertahankan).

Hanya ubah file ini, jangan ubah yang lain.
```

---

#### Prompt 3: Buat Types Baru
```
Buka file frontend/types.ts. Tambahkan interface berikut di akhir file 
(JANGAN hapus interface yang sudah ada):

export interface EarningsEvent {
  ticker: string;
  company: string;
  earningsDate: string;
  daysUntil: number;
  signalStrength: 'strong' | 'moderate' | 'weak' | 'none';
  marginExpansion?: number;
}

export interface StockQuote {
  ticker: string;
  price: number;
  changePercent: number;
  marketCap: number;
  peRatio: number;
  currency: string;
  lastUpdated: string;
}

export interface PriceSnapshot {
  id: string;
  productId: string;
  price: number;
  weight: number;
  unit: string;
  pricePerUnit: number;
  scrapedAt: string;
  source: string;
}

Hanya tambah di akhir file, jangan modifikasi interface yang sudah ada.
```

---

#### Prompt 4: Buat agentService.ts
```
Buat file baru: frontend/services/agentService.ts

File ini berisi fungsi untuk berkomunikasi dengan Vertex AI Agent Engine 
via streamQuery. Proxy backend sudah mendukung endpoint 
reasoningEngines:streamQuery.

Isi file:
[Copy paste exact code dari section 4.4 di blueprint ini]

Jangan ubah file lain.
```

---

#### Prompt 5: Buat halaman EarningsCalendar
```
Buat file baru: frontend/pages/EarningsCalendar.tsx

Ini halaman React yang menampilkan kalender earnings perusahaan FMCG.

Spesifikasi:
- Import: React, lucide-react (CalendarDays, TrendingUp, Clock), 
  recharts, useAppContext
- Ambil products dari context
- Hitung daysUntil earnings (untuk demo, hardcode tanggal earning per ticker)
- Tampilkan 3 metric cards: Next 7 Days, Next 30 Days, Signal Ready
- Tampilkan tabel: Ticker | Company | Earnings Date | Days Left | Signal Strength
- Signal strength ditentukan dari margin expansion: >15% = strong, >8% = moderate, >3% = weak, else none
- Styling: bg-slate-950, border-slate-800, text-slate-200 (konsisten dengan halaman lain)
- Warna signal: strong=emerald-400, moderate=amber-400, weak=orange-400, none=slate-500

Jangan ubah file lain. Setelah ini saya akan menambahkan route-nya sendiri.
```

---

#### Prompt 6: Tambah Route
```
Buka file frontend/App.tsx.

Tambahkan:
1. Import di atas: 
   import { EarningsCalendar } from './pages/EarningsCalendar';
   import { PriceHistory } from './pages/PriceHistory';

2. Tambah Route di dalam <Route path="/app"> setelah alerts:
   <Route path="earnings" element={<EarningsCalendar />} />
   <Route path="history" element={<PriceHistory />} />

Hanya tambah 2 import dan 2 Route. Jangan ubah yang lain.
```

---

### 12.2 Urutan Eksekusi yang Direkomendasikan

Berikut urutan kronologis prompt ke Agent Studio:

| Step | Prompt Focus | File yang Dihasilkan/Diubah |
|------|-------------|---------------------------|
| 1 | Tailwind setup (hapus CDN) | tailwind.config.ts, postcss.config.js, globals.css, index.html |
| 2 | Fix bug DashboardLayout | layouts/DashboardLayout.tsx |
| 3 | Fix bug Alerts (create modal + delete) | pages/Alerts.tsx, context/AppContext.tsx |
| 4 | Tambah warna brand-400 | tailwind.config.ts |
| 5 | LocalStorage persistensi | context/AppContext.tsx |
| 6 | Types baru | types.ts |
| 7 | Firebase Auth service | services/authService.ts |
| 8 | Update LoginPage | pages/LoginPage.tsx |
| 9 | Agent service (streamQuery) | services/agentService.ts |
| 10 | Update AgentChat (streaming) | pages/AgentChat.tsx |
| 11 | Buat EarningsCalendar page | pages/EarningsCalendar.tsx |
| 12 | Buat PriceHistory page | pages/PriceHistory.tsx |
| 13 | Tambah routes di App.tsx | App.tsx |
| 14 | Tambah nav items di DashboardLayout | layouts/DashboardLayout.tsx |
| 15 | Buat StockTicker component | components/StockTicker.tsx |
| 16 | Buat ErrorBoundary component | components/ErrorBoundary.tsx |
| 17 | Buat NotificationBell component | components/NotificationBell.tsx |
| 18 | Update DashboardHome (signal board) | pages/DashboardHome.tsx |
| 19 | Update brightDataService (production) | services/brightDataService.ts |
| 20 | Buat reportService (PDF) | services/reportService.ts |
| 21 | ADK Agent Python file | agent/shrinkflation_agent.py |
| 22 | Cloud Function: scrape-product | cloud-functions/scrape-product/index.js |
| 23 | Cloud Function: search-news | cloud-functions/search-news/index.js |
| 24 | Cloud Function: evaluate-alerts | cloud-functions/evaluate-alerts/index.js |
| 25 | BigQuery schema SQL | bigquery/schema.sql |

### 12.3 Tips Penting untuk Agent Studio

1. **Selalu sebutkan nama file LENGKAP** (path relatif dari root).
2. **Jangan minta >2 file dalam satu prompt** kecuali file-nya sangat pendek (<20 baris).
3. **Sertakan contoh kode EXACT** — jangan tulis "buatkan sesuatu yang mirip X". Copy-paste kode dari blueprint ini.
4. **Jika Agent Studio salah**, jangan ulangi prompt yang sama. Sebutkan SPESIFIK apa yang salah: "Di baris 15, kamu menulis X, seharusnya Y. Perbaiki hanya baris itu."
5. **Test setiap step** sebelum lanjut ke step berikutnya. Jangan stack 5 prompt tanpa verifikasi.
6. **Untuk update file existing**, selalu sebutkan: "Buka file X. JANGAN hapus kode yang sudah ada. Hanya TAMBAHKAN/UBAH bagian berikut: ..."

### 12.4 Alignment dengan Track 2 Hackathon Requirements

| Requirement dari Screenshot | Implementasi di Blueprint Ini |
|----------------------------|-------------------------------|
| "Structure live financial data into workflows" | Cloud Function pipeline: Bright Data → BigQuery → Firestore → Frontend real-time listeners |
| "Combine multi-source signals into intelligence" | Agent tools: scrape + SERP + stock quote + margin calc → unified analysis |
| "Deliver alternative data at decision-grade frequency" | Cloud Scheduler (15min interval) + real-time Firestore sync + Alerts |
| "Give AI agents live financial context" | ADK Agent dengan tools yang mengakses data hidup (bukan injeksi prompt manual) |
| "Alternative data pipelines (pricing)" | Bright Data Web Scraper API → price_snapshots BigQuery table |
| "Real-time competitive pricing" | CompetitorIntel page + PPU comparison + live sync |
| "Pre-earnings intelligence" | EarningsCalendar page + signal strength correlation |
| "Multi-source company intelligence engines" | Agent combines: Bright Data scraping + SERP news + stock prices + internal DB |
| "Bright Data: Web Scraper API" | Cloud Function `scrapeProduct` → Bright Data datasets API |
| "Bright Data: SERP API" | Cloud Function `searchNews` + Agent tool `search_market_news` |
| "Bright Data: Web Unlocker" | Fallback di `scrapeProduct` jika Scraper API gagal |
| "Bright Data: Scraping Browser" | Untuk JS-heavy e-commerce (Tokopedia SPA) — konfigurasi zone di API call |
| "Bright Data: MCP Server" | Direct integration sebagai tool di ADK Agent (lihat section 5.4) |

---

## PENUTUP

Dokumen ini mencakup **25 langkah implementasi** yang terstruktur dari bug fix sederhana hingga arsitektur agent penuh. Setiap section dirancang agar bisa di-copy langsung sebagai prompt ke Agent Studio Google.

**Prioritas jika waktu terbatas:**
1. FASE 1 (Bug fix) — 30 menit
2. FASE 2 (ADK Agent) — dampak terbesar untuk hackathon
3. FASE 3 (Bright Data real) — proof bahwa pipeline nyata
4. FASE 4 (Earnings Calendar) — differentiator dari kompetitor

**Total estimasi development:** 3-5 hari untuk developer berpengalaman, atau 7-10 hari dengan Agent Studio (karena perlu iterasi per prompt).

---
*Generated by Kiro AI — May 2026*
*Repository: masbroustudio/aiu-shrinkfit*
