import React from 'react';
import Header from './components/Header';
import GCPDashboardView from './components/GCPDashboardView';

export default function App() {
  return (
    <div className="min-h-screen bg-[#080b12] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Ambient background lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-blue-600/[0.05] rounded-full blur-[140px]"></div>
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-indigo-600/[0.04] rounded-full blur-[140px]"></div>
        <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-emerald-600/[0.04] rounded-full blur-[140px]"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <GCPDashboardView />
        </main>
      </div>
    </div>
  );
}
