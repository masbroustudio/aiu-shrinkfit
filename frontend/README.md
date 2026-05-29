# 🎯 Shrinkflation AI - Enterprise Market Intelligence

**AITema Hackathon: Track 2 - Finance & Market Intelligence**
*Specific Category: Alternative Data Pipelines & Pre-earnings Intelligence*

Shrinkflation AI is an enterprise-grade market intelligence platform designed for financial analysts, hedge funds, and investment managers. This platform utilizes AI and Alternative Data to detect shrinkflation practices (reducing product size/weight while maintaining price) in FMCG companies in real-time, which is then converted into gross margin expansion signals before quarterly earnings reports are released.

---

## 🚀 Architecture & Tech Stack

*   **Frontend:** React 18, TypeScript, Tailwind CSS (Enterprise UI/UX).
*   **Data Visualization:** Recharts (Bar, Line, Radar, Scatter, Area, Pie charts).
*   **AI Engine:** Google Vertex AI (`@google/genai` SDK) using the **Gemini 2.5 Flash** model.
*   **Alternative Data Pipeline:** Bright Data Web Scraper API / Web Unlocker (Simulated via Cloud Function architecture).
*   **Icons:** Lucide React.

---

## 📋 Key Features & Page Structure (Current Implementation)

Here are all the implementations completed in this platform:

### 1. Landing Page (`/`)
*   Modern and professional design typical of enterprise applications (Year 2026).
*   Dynamic background blob animations and glassmorphism effects.
*   Explanation of methodology (Alternative Data, Stealth Margin Calculator, Predictive AI).

### 2. Authentication (`/login`)
*   Simulated login using Google Workspace (SSO).
*   Secure and elegant UI/UX.

### 3. BI Dashboard (`/app/dashboard`)
*   **Dynamic Metrics:** All metrics (Total Tracked, Active Alerts, Avg Est. Margin Expansion, Top Shrinking Category) are calculated dynamically based on the real-time state of the product database. No mock data is used.
*   **AI Insights Panel:** Automated summary (3 bullet points) from Gemini AI based on real-time data in the application state. Includes a refresh button.
*   **Dynamic Data Visualization:** 
    *   Bar chart (Shrinkflation by Category) aggregates data dynamically.
    *   Line chart (Est. Margin Expansion by Ticker) calculates margin impact dynamically based on historical vs live price-per-unit.

### 4. AI Analyst Agent (`/app/chat`)
*   Interactive chat interface with **Gemini 2.5 Flash**.
*   AI has full context of the product database (historical vs live).
*   Capable of detecting shrinkflation and outputting structured JSON rendered into the **Signal Dashboard** (visual UI on the right panel).
*   ✨ **Web Search Grounding:** Toggle to enable real-time Google search. AI can search for the latest news or earnings reports and will include reference source URLs at the end of its answer.
*   ✨ **Quick Prompts (Templates):** Template buttons so users don't have to type manually.
*   ✨ **Export Report:** Ability to download AI analysis conversation results into a `.txt` format.
*   ✨ **Persistent Chat:** Chat history is not lost when navigating between pages.

### 5. Data Pipeline / Products CRUD (`/app/products`)
*   FMCG product data management table (Kopi ABC, Sabun XYZ, Susu Bear Brand, etc.).
*   Displays comparison of Historical Baseline vs Live Data.
*   Automatic status indicators (Monitoring, Shrinkflation Detected, Stable).
*   **Bright Data Integration:** Sync button to pull live data (equipped with smart simulation fallback if blocked by CORS in the browser).
*   ✨ **Add & Edit Product:** Interactive UI Modal to add new products or edit existing product data.
*   ✨ **Export CSV:** Button to download the entire product database (historical & live) into CSV format for processing in Excel/financial models.

### 6. Competitor Intel (`/app/competitors`)
*   Dashboard page dedicated to analyzing competitor strategies (Unilever, Indofood, Nestle).
*   **Strategic Positioning Matrix:** Uses a Radar Chart to compare Pricing Power, Volume Retention, Margin Expansion, etc.
*   **Price Per Unit (PPU) Comparison:** Bar Chart comparing historical vs live PPU among competitors.

### 7. Scraping Network (`/app/network`)
*   Dedicated page to monitor the health of the Alternative Data infrastructure (Bright Data).
*   Displays Success Rate, Bandwidth Used, and Active Proxies metrics.
*   Area Chart visualization for Request Volume & Error Rate.
*   Donut Chart visualization for Proxy type distribution (Residential, Datacenter, Mobile).
*   Live Extraction Logs table to monitor scraping status in real-time.

### 8. Alerts & Triggers (`/app/alerts`)
*   Page to configure automated notifications.
*   Users can enable/disable rules (e.g., "Send email if Weight Drop > 5%").
*   Displays Recent Triggers log recording market anomalies detected by the system.

### 9. Settings & API (`/app/settings`)
*   API Key management for Bright Data (stored in local state).
*   Status indicator for Google Vertex AI Engine (explaining that the API Key is securely managed via Environment Variables `process.env.API_KEY` according to enterprise standards).
