import React from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Cpu, 
  ArrowUpRight, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  DollarSign,
  PackageCheck,
  RefreshCw,
  Terminal
} from 'lucide-react';
import { ProductCatalogItem, Order, UserProfile, AgentTask } from '../../types';

interface DashboardProps {
  currentUser: UserProfile;
  products: ProductCatalogItem[];
  orders: Order[];
  agentTasks: AgentTask[];
  onNavigate: (tab: string) => void;
  onOpenMakerApi: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentUser,
  products,
  orders,
  agentTasks,
  onNavigate,
  onOpenMakerApi
}) => {
  const totalRevenue = orders.reduce((acc, o) => acc + o.totalAmountUSD, 0);
  const totalActiveSKUs = products.reduce((acc, p) => acc + p.variants.reduce((vAcc, v) => vAcc + v.inventoryCount, 0), 0);

  return (
    <div className="space-y-8 pb-16">
      {/* Immersive Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#262626] via-[#1c1c1c] to-[#171717] border border-[#2F2F2F] p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#9E7FFF]/15 via-[#38bdf8]/10 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#9E7FFF]/10 border border-[#9E7FFF]/30 text-[#9E7FFF] text-xs font-bold mb-6">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>AI Autonomous Agent Ecosystem Active</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
            Welcome back, <span className="bg-gradient-to-r from-[#9E7FFF] via-[#38bdf8] to-white bg-clip-text text-transparent">{currentUser.companyName}</span>
          </h1>
          <p className="text-[#A3A3A3] text-base md:text-lg mb-8 leading-relaxed">
            Your global B2B wholesale network is running at peak velocity. AI demand forecasters have synchronized 4 warehouses with zero discrepancy.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => onNavigate('catalog')}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#9E7FFF] to-[#805ad5] text-white font-bold text-sm shadow-lg shadow-[#9E7FFF]/30 hover:shadow-[#9E7FFF]/50 hover:scale-[1.02] transition-all flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Explore B2B Catalog</span>
            </button>
            <button
              onClick={() => onNavigate('agents')}
              className="px-6 py-3.5 rounded-2xl bg-[#262626] hover:bg-[#333] border border-[#2F2F2F] text-white font-bold text-sm transition-all flex items-center gap-2"
            >
              <Cpu className="w-4 h-4 text-[#38bdf8]" />
              <span>View Autonomous Agents</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Gross Wholesale Volume',
            value: `$${totalRevenue.toLocaleString()}`,
            change: '+24.8% vs last month',
            isPositive: true,
            icon: DollarSign,
            color: 'from-emerald-500/20 to-emerald-500/0 text-emerald-400 border-emerald-500/30'
          },
          {
            title: 'Active Catalog Products',
            value: products.length.toString(),
            change: '100% synced with Shopify',
            isPositive: true,
            icon: ShoppingBag,
            color: 'from-[#9E7FFF]/20 to-[#9E7FFF]/0 text-[#9E7FFF] border-[#9E7FFF]/30'
          },
          {
            title: 'Total SKU Inventory',
            value: totalActiveSKUs.toLocaleString(),
            change: 'Across 4 global hubs',
            isPositive: true,
            icon: PackageCheck,
            color: 'from-[#38bdf8]/20 to-[#38bdf8]/0 text-[#38bdf8] border-[#38bdf8]/30'
          },
          {
            title: 'Active Agent Workers',
            value: agentTasks.length.toString(),
            change: '3 agents executing',
            isPositive: true,
            icon: Cpu,
            color: 'from-pink-500/20 to-pink-500/0 text-pink-400 border-pink-500/30'
          },
        ].map((stat, i) => (
          <div key={i} className="rounded-3xl bg-[#262626]/70 backdrop-blur-xl border border-[#2F2F2F] p-6 hover:border-[#9E7FFF]/40 transition-all shadow-xl group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-[#A3A3A3] uppercase tracking-wider">{stat.title}</span>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} border flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white mb-2">{stat.value}</div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <ArrowUpRight className="w-4 h-4" />
              <span>{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Premium Maker API Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#9E7FFF]/10 via-[#262626] to-[#1c1c1c] border border-[#9E7FFF]/20 p-6 md:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-[#9E7FFF]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#9E7FFF]/20 to-[#38bdf8]/20 border border-[#9E7FFF]/30 flex items-center justify-center flex-shrink-0">
              <Terminal className="w-7 h-7 text-[#9E7FFF]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-extrabold text-white">Maker API</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#9E7FFF]/15 text-[#9E7FFF] border border-[#9E7FFF]/30 uppercase">Premium</span>
              </div>
              <p className="text-sm text-[#A3A3A3] max-w-md leading-relaxed">
                Integrate your commerce stack with NexusAI. Sync catalog, create orders, and launch AI workflows via REST API with curl-ready examples.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenMakerApi}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#9E7FFF] to-[#805ad5] text-white font-bold text-sm shadow-lg shadow-[#9E7FFF]/30 hover:shadow-[#9E7FFF]/50 hover:scale-[1.02] transition-all whitespace-nowrap"
          >
            <Terminal className="w-4 h-4" />
            <span>View API Docs</span>
          </button>
        </div>
      </div>

      {/* Two Column Layout: Recent Orders & Agent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Wholesale Orders */}
        <div className="lg:col-span-2 rounded-3xl bg-[#262626]/70 backdrop-blur-xl border border-[#2F2F2F] p-6 md:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-white">Recent Wholesale Orders</h2>
              <p className="text-xs text-[#A3A3A3]">Live B2B transaction ledger & status</p>
            </div>
            <button
              onClick={() => onNavigate('orders')}
              className="text-xs font-bold text-[#9E7FFF] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {orders.map((order) => {
              const prod = products.find(p => p.id === order.items[0]?.productId);
              return (
                <div key={order.id} className="p-4 rounded-2xl bg-[#1f1f1f] border border-[#2F2F2F] flex items-center justify-between hover:border-[#9E7FFF]/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#262626] border border-[#2F2F2F] overflow-hidden flex-shrink-0">
                      {prod?.images[0] ? (
                        <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="w-6 h-6 m-3 text-[#A3A3A3]" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">Order #{order.id}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          order.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                          order.status === 'approved' ? 'bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/30' :
                          'bg-[#9E7FFF]/10 text-[#9E7FFF] border border-[#9E7FFF]/30'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#A3A3A3] mt-0.5">
                        {prod ? prod.name : 'Multiple Items'} ({order.items.length} variants)
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-white">${order.totalAmountUSD.toLocaleString()}</p>
                    <p className="text-[10px] text-[#A3A3A3]">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Agent Activity Stream */}
        <div className="rounded-3xl bg-[#262626]/70 backdrop-blur-xl border border-[#2F2F2F] p-6 md:p-8 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-[#9E7FFF]" />
                <h2 className="text-xl font-extrabold text-white">Agentic Stream</h2>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            </div>

            <div className="space-y-4">
              {agentTasks.map((task) => (
                <div key={task.id} className="p-4 rounded-2xl bg-[#1f1f1f] border border-[#2F2F2F] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white line-clamp-1">{task.title}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      task.status === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                      task.status === 'running' ? 'bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/30 animate-pulse' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  {task.output && (
                    <p className="text-xs text-[#A3A3A3] leading-relaxed bg-[#171717] p-2.5 rounded-xl border border-[#2F2F2F]">
                      {task.output}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('agents')}
            className="w-full mt-6 py-3 rounded-2xl bg-[#1f1f1f] hover:bg-[#333] border border-[#2F2F2F] text-xs font-bold text-white transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 text-[#9E7FFF]" />
            <span>Launch New AI Workflow</span>
          </button>
        </div>
      </div>
    </div>
  );
};
