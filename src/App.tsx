import React, { useState } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Catalog } from './components/Catalog';
import { Orders } from './components/Orders';
import { AgentsHub } from './components/AgentsHub';
import { Analytics } from './components/Analytics';
import { MakerApiModal } from './components/MakerApiModal';
import { useAppData } from './hooks/useAppData';
import { ProductCatalogItem, Order } from '../types';

export default function App() {
  const {
    loading,
    error,
    source,
    authenticated,
    currentUser,
    allUsers,
    products,
    orders,
    agentTasks,
    setCurrentUser,
    addProduct,
    createNewOrder,
    addAgentTask,
  } = useAppData();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedProductForOrder, setSelectedProductForOrder] = useState<ProductCatalogItem | null>(null);
  const [makerApiOpen, setMakerApiOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#171717] text-white flex flex-col">
      <Header
        currentUser={currentUser}
        onSwitchUser={setCurrentUser}
        allUsers={allUsers}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenMakerApi={() => setMakerApiOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Data source / error banner */}
        {(loading || error) && (
          <div className={`mb-4 px-4 py-3 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
            error
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : 'bg-[#38bdf8]/10 border-[#38bdf8]/30 text-[#38bdf8]'
          }`}>
            {loading ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-ping" />
                <span>Connecting to Supabase…</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Some remote data unavailable — showing demo data. {error}</span>
              </>
            )}
          </div>
        )}

        {/* Data source indicator */}
        {!loading && !error && (
          <div className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#A3A3A3]">
            <span className={`w-2 h-2 rounded-full ${authenticated ? 'bg-emerald-400' : 'bg-[#A3A3A3]'}`} />
            <span>
              Data source: {source === 'supabase' ? 'Supabase (live)' : 'Local demo data'}
              {!authenticated && ' — sign in to connect'}
            </span>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <Dashboard
            currentUser={currentUser}
            products={products}
            orders={orders}
            agentTasks={agentTasks}
            onNavigate={setActiveTab}
            onOpenMakerApi={() => setMakerApiOpen(true)}
          />
        )}

        {activeTab === 'catalog' && (
          <Catalog
            products={products}
            currentUser={currentUser}
            onOpenOrderModal={(prod) => {
              setSelectedProductForOrder(prod);
              setActiveTab('orders');
            }}
            onAddNewProduct={addProduct}
          />
        )}

        {activeTab === 'orders' && (
          <Orders
            orders={orders}
            products={products}
            currentUser={currentUser}
            onCreateOrder={createNewOrder}
            selectedProductForOrder={selectedProductForOrder}
            onCloseOrderModal={() => setSelectedProductForOrder(null)}
          />
        )}

        {activeTab === 'agents' && (
          <AgentsHub
            tasks={agentTasks}
            onAddTask={addAgentTask}
          />
        )}

        {activeTab === 'analytics' && (
          <Analytics
            orders={orders}
            products={products}
          />
        )}
      </main>

      <MakerApiModal open={makerApiOpen} onClose={() => setMakerApiOpen(false)} />
    </div>
  );
}
