import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, RefreshCw, Search, Edit2, Trash2, ExternalLink, AlertCircle, X, Download, Link as LinkIcon, Loader2, Sparkles } from 'lucide-react';
import { fetchLiveProductData } from '../services/brightDataService';
import { extractProductDataFromUrl } from '../services/aiService';
import { Product } from '../types';

export const ProductsCRUD: React.FC = () => {
  const { products, addProduct, deleteProduct, updateProduct, brightDataApiKey, addScrapingLog, addNotification } = useAppContext();
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '', brand: '', category: '', targetTicker: '', historicalPrice: 0, historicalWeight: 0, unit: 'g', url: ''
  });

  // URL Extraction State
  const [inputUrl, setInputUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.targetTicker.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSync = async (id: string, url: string) => {
    setIsSyncing(id);
    setSyncError(null);
    try {
      const liveData = await fetchLiveProductData(url, brightDataApiKey);
      
      // Record successful scraping log
      addScrapingLog({
        id: Date.now().toString(),
        url: url,
        status: 200,
        timestamp: new Date(),
        proxy: 'Dynamic Residential IP'
      });

      if (liveData) {
        let newStatus: 'monitoring' | 'shrinkflation_detected' | 'stable' = 'stable';
        const product = products.find(p => p.id === id);
        
        if (product && liveData.weight < product.historicalWeight && liveData.price >= product.historicalPrice) {
            newStatus = 'shrinkflation_detected';
            
            // Trigger Notification if status changed to shrinkflation
            if (product.status !== 'shrinkflation_detected') {
              const oldPpu = product.historicalPrice / product.historicalWeight;
              const newPpu = liveData.price / liveData.weight;
              const marginExpansion = (((newPpu - oldPpu) / oldPpu) * 100).toFixed(1);
              
              addNotification({
                id: Date.now().toString(),
                title: `Shrinkflation Detected: ${product.name}`,
                message: `Weight dropped from ${product.historicalWeight}${product.unit} to ${liveData.weight}${product.unit}. Margin expansion estimated at +${marginExpansion}%.`,
                timestamp: new Date(),
                type: 'warning'
              });
            }
        }

        updateProduct(id, {
          currentPrice: liveData.price,
          currentWeight: liveData.weight,
          lastChecked: new Date().toISOString().split('T')[0],
          status: newStatus
        });
      }
    } catch (error: any) {
      console.error("Sync failed", error);
      setSyncError(`Failed to sync product: ${error.message}`);
      
      // Record failed scraping log
      addScrapingLog({
        id: Date.now().toString(),
        url: url,
        status: 500,
        timestamp: new Date(),
        proxy: 'Failed / Blocked'
      });
    } finally {
      setIsSyncing(null);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setInputUrl('');
    setExtractionError(null);
    setFormData({ name: '', brand: '', category: '', targetTicker: '', historicalPrice: 0, historicalWeight: 0, unit: 'g', url: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingId(product.id);
    setInputUrl('');
    setExtractionError(null);
    setFormData({ 
      name: product.name, 
      brand: product.brand, 
      category: product.category, 
      targetTicker: product.targetTicker, 
      historicalPrice: product.historicalPrice, 
      historicalWeight: product.historicalWeight, 
      unit: product.unit, 
      url: product.url 
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to remove this product from the pipeline?")) {
      deleteProduct(id);
    }
  };

  const handleExtractUrl = async () => {
    if (!inputUrl.trim()) return;
    
    setIsExtracting(true);
    setExtractionError(null);
    
    try {
      const extractedData = await extractProductDataFromUrl(inputUrl);
      
      if (extractedData) {
        setFormData({
          name: extractedData.name,
          brand: extractedData.brand,
          category: extractedData.category,
          targetTicker: extractedData.targetTicker,
          historicalPrice: extractedData.price,
          historicalWeight: extractedData.weight,
          unit: extractedData.unit,
          url: inputUrl
        });
      } else {
        setExtractionError("AI could not extract data from this URL. Please fill the form manually.");
        setFormData(prev => ({ ...prev, url: inputUrl }));
      }
    } catch (error) {
      console.error("Extraction error:", error);
      setExtractionError("An error occurred during AI extraction. Please fill manually.");
      setFormData(prev => ({ ...prev, url: inputUrl }));
    } finally {
      setIsExtracting(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateProduct(editingId, formData);
    } else {
      const newProduct: Product = {
        ...(formData as Product),
        id: Date.now().toString(),
        lastChecked: 'Not synced',
        status: 'monitoring'
      };
      addProduct(newProduct);
    }
    setIsModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Brand', 'Category', 'Ticker', 'Historical Price (USD)', 'Historical Weight', 'Unit', 'Live Price (USD)', 'Live Weight', 'Status', 'Last Checked'];
    const csvContent = [
      headers.join(','),
      ...products.map(p => [
        p.id, 
        `"${p.name}"`, 
        `"${p.brand}"`, 
        `"${p.category}"`, 
        p.targetTicker,
        p.historicalPrice, 
        p.historicalWeight, 
        p.unit,
        p.currentPrice || '', 
        p.currentWeight || '', 
        p.status, 
        p.lastChecked
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `shrinkflation_data_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-950 relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Alternative Data Pipeline</h1>
          <p className="text-slate-400">Manage FMCG products tracked via Bright Data Web Scraper.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExportCSV}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors border border-slate-700"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button 
            onClick={openAddModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {syncError && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 text-rose-400">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm">{syncError}</div>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-850">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="text-sm text-slate-400">
            Bright Data API: {brightDataApiKey ? <span className="text-emerald-400">Configured</span> : <span className="text-rose-400">Missing Key</span>}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-slate-900/50 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">Product & Ticker</th>
                <th className="px-6 py-4 font-medium">Historical Baseline</th>
                <th className="px-6 py-4 font-medium">Live Data (Bright Data)</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-200">{product.name}</div>
                      <div className="text-xs text-slate-500 mt-1">{product.brand} • <span className="text-brand-400">{product.targetTicker}</span></div>
                    </td>
                    <td className="px-6 py-4">
                      <div>${product.historicalPrice.toFixed(2)}</div>
                      <div className="text-xs text-slate-500 mt-1">{product.historicalWeight}{product.unit}</div>
                    </td>
                    <td className="px-6 py-4">
                      {product.currentPrice ? (
                        <>
                          <div className={product.currentPrice > product.historicalPrice ? 'text-amber-400' : ''}>
                            ${product.currentPrice.toFixed(2)}
                          </div>
                          <div className={`text-xs mt-1 ${product.currentWeight && product.currentWeight < product.historicalWeight ? 'text-amber-400 font-bold' : 'text-slate-500'}`}>
                            {product.currentWeight}{product.unit}
                          </div>
                          <div className="text-[10px] text-slate-600 mt-1">Updated: {product.lastChecked}</div>
                        </>
                      ) : (
                        <span className="text-slate-600 italic">Not synced yet</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        product.status === 'shrinkflation_detected' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        product.status === 'stable' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {product.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleSync(product.id, product.url)}
                          disabled={isSyncing === product.id}
                          className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors disabled:opacity-50"
                          title="Sync with Bright Data"
                        >
                          <RefreshCw className={`w-4 h-4 ${isSyncing === product.id ? 'animate-spin' : ''}`} />
                        </button>
                        <a href={product.url} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-brand-400 hover:bg-brand-400/10 rounded-lg transition-colors" title="View Source">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button onClick={() => openEditModal(product)} className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors" title="Edit Product">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors" title="Delete Product">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-800 shrink-0">
              <h2 className="text-xl font-bold text-white">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {/* AI Extraction Section (Only show when adding new) */}
              {!editingId && (
                <div className="mb-8 p-5 bg-slate-800/50 border border-slate-700 rounded-xl">
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" /> AI Auto-Extract from URL
                  </h3>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="url" 
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        placeholder="Paste e-commerce URL here (e.g., https://shopee.ph/...)" 
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={handleExtractUrl}
                      disabled={isExtracting || !inputUrl.trim()}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                    >
                      {isExtracting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Extract Data'}
                    </button>
                  </div>
                  {extractionError && (
                    <p className="text-xs text-rose-400 mt-2">{extractionError}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-3">
                    Paste a URL and let Gemini AI automatically infer the product details, brand, and target ticker symbol. You can review and edit the extracted data below before saving.
                  </p>
                </div>
              )}

              <form id="product-form" onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Product Name</label>
                    <input required type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-slate-200 focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Brand</label>
                    <input required type="text" value={formData.brand || ''} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-slate-200 focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
                    <input required type="text" value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-slate-200 focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Target Ticker (e.g., UNVR.JK, LOGI)</label>
                    <input required type="text" value={formData.targetTicker || ''} onChange={e => setFormData({...formData, targetTicker: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-slate-200 focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Historical Price (USD)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                      <input required type="number" min="0" step="0.01" value={formData.historicalPrice === 0 ? '' : formData.historicalPrice} onChange={e => setFormData({...formData, historicalPrice: e.target.value ? Number(e.target.value) : 0})} className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-7 pr-3 text-slate-200 focus:outline-none focus:border-emerald-500" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-slate-400 mb-1">Historical Weight/Volume</label>
                      <input required type="number" min="0" step="0.01" value={formData.historicalWeight === 0 ? '' : formData.historicalWeight} onChange={e => setFormData({...formData, historicalWeight: e.target.value ? Number(e.target.value) : 0})} className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-slate-200 focus:outline-none focus:border-emerald-500" />
                    </div>
                    <div className="w-24">
                      <label className="block text-xs font-medium text-slate-400 mb-1">Unit</label>
                      <select value={formData.unit || 'g'} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-slate-200 focus:outline-none focus:border-emerald-500">
                        <option value="g">g</option>
                        <option value="ml">ml</option>
                        <option value="kg">kg</option>
                        <option value="L">L</option>
                        <option value="unit">unit</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1">E-commerce URL (For Bright Data)</label>
                    <input required type="url" value={formData.url || ''} onChange={e => setFormData({...formData, url: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-slate-200 focus:outline-none focus:border-emerald-500" />
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-slate-800 shrink-0 flex justify-end gap-3 bg-slate-850">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors">Cancel</button>
              <button type="submit" form="product-form" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors">Save Product</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
