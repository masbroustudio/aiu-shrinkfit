import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download } from 'lucide-react';
import { Product, User } from '../types';

interface Props {
  products: Product[];
  user: User | null;
  aiInsight: string;
}

export const ReportGenerator: React.FC<Props> = ({ products, user, aiInsight }) => {
  
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(52, 211, 153); // emerald-400
      doc.setFontSize(22);
      doc.text('SHRINKFLATION AI', 14, 20);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text('Enterprise Market Intelligence Report', 14, 28);
      
      // Metadata
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 50);
      doc.text(`Analyst: ${user?.name || 'System'}`, 14, 56);
      
      // AI Insights
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.text('AI Analyst Insights', 14, 70);
      doc.setFontSize(10);
      const splitInsights = doc.splitTextToSize(aiInsight, 180);
      doc.text(splitInsights, 14, 78);
      
      // Table
      const startY = 78 + (splitInsights.length * 5) + 10;
      doc.setFontSize(14);
      doc.text('Tracked Products Overview', 14, startY);
      
      // Safe invocation of autoTable
      const tableData = products.map(p => {
        let marginStr = 'N/A';
        if (p.currentWeight && p.historicalWeight && p.currentPrice) {
          const oldPpu = p.historicalPrice / p.historicalWeight;
          const newPpu = p.currentPrice / p.currentWeight;
          const margin = ((newPpu - oldPpu) / oldPpu) * 100;
          marginStr = margin > 0 ? `+${margin.toFixed(1)}%` : `${margin.toFixed(1)}%`;
        }
        return [
          p.name, 
          p.targetTicker, 
          p.status.replace('_', ' ').toUpperCase(), 
          `$${p.historicalPrice.toFixed(2)}`, 
          p.currentPrice ? `$${p.currentPrice.toFixed(2)}` : 'N/A',
          marginStr
        ];
      });

      // Use the imported autoTable function directly
      autoTable(doc, {
        startY: startY + 5,
        head: [['Product', 'Ticker', 'Status', 'Hist. Price', 'Live Price', 'Margin Impact']],
        body: tableData,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [16, 185, 129] },
        alternateRowStyles: { fillColor: [241, 245, 249] }
      });
      
      doc.save(`Shrinkflation_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF report. Please check console for details.");
    }
  };

  return (
    <button 
      onClick={handleExportPDF}
      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors border border-slate-700"
    >
      <Download className="w-4 h-4" /> Export PDF Report
    </button>
  );
};
