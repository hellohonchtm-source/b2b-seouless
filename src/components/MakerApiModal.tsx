import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Package, ShoppingCart, BrainCircuit } from 'lucide-react';

interface Endpoint {
  method: string;
  path: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  curl: string;
}

const endpoints: Endpoint[] = [
  {
    method: 'GET',
    path: '/api/products',
    label: 'Catalog Sync',
    description: 'Fetch all B2B catalog products including variants, pricing, and inventory.',
    icon: Package,
    color: 'text-[#9E7FFF] border-[#9E7FFF]/30 bg-[#9E7FFF]/10',
    curl: `curl -X GET https://api.nexusai.io/api/products \\
  -H "Authorization: Bearer $MAKER_API_KEY" \\
  -H "Accept: application/json"`,
  },
  {
    method: 'POST',
    path: '/api/orders',
    label: 'Order Creation',
    description: 'Create a new wholesale order with buyer, items, and quantities.',
    icon: ShoppingCart,
    color: 'text-[#38bdf8] border-[#38bdf8]/30 bg-[#38bdf8]/10',
    curl: `curl -X POST https://api.nexusai.io/api/orders \\
  -H "Authorization: Bearer $MAKER_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "buyerId": "usr_2",
    "items": [
      { "productId": "prod_1", "variantId": "var_1a", "quantity": 50 }
    ]
  }'`,
  },
  {
    method: 'POST',
    path: '/api/agents/forecast',
    label: 'AI Workflow Launch',
    description: 'Launch an autonomous AI demand-forecasting agent for a product line.',
    icon: BrainCircuit,
    color: 'text-pink-400 border-pink-500/30 bg-pink-500/10',
    curl: `curl -X POST https://api.nexusai.io/api/agents/forecast \\
  -H "Authorization: Bearer $MAKER_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "productId": "prod_1",
    "horizonDays": 30,
    "warehouseId": "wh_emea_01"
  }'`,
  },
];

export const MakerApiModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!open) return null;

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl bg-[#1a1a1a] border border-[#2F2F2F] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 bg-[#1a1a1a] border-b border-[#2F2F2F]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#9E7FFF]/20 to-[#38bdf8]/20 border border-[#9E7FFF]/30 flex items-center justify-center">
              <Terminal className="w-5 h-5 text-[#9E7FFF]" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">Maker API</h2>
              <p className="text-xs text-[#A3A3A3]">Integrate NexusAI with your commerce stack</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#262626] border border-[#2F2F2F] text-[#A3A3A3] hover:text-white hover:border-[#9E7FFF]/50 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Endpoints */}
        <div className="p-6 space-y-6">
          {endpoints.map((ep, i) => (
            <div key={i} className="rounded-2xl bg-[#171717] border border-[#2F2F2F] overflow-hidden">
              {/* Endpoint header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-[#2F2F2F]">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${ep.color}`}>
                  <ep.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${ep.color}`}>
                      {ep.method}
                    </span>
                    <code className="text-sm font-bold text-white font-mono">{ep.path}</code>
                  </div>
                  <p className="text-xs text-[#A3A3A3] mt-1">{ep.description}</p>
                </div>
              </div>

              {/* Curl block */}
              <div className="relative group">
                <button
                  onClick={() => handleCopy(ep.curl, i)}
                  className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#262626] border border-[#2F2F2F] text-xs font-bold text-[#A3A3A3] hover:text-white hover:border-[#9E7FFF]/50 transition-all z-10"
                >
                  {copiedIndex === i ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <pre className="overflow-x-auto p-5 pr-24 text-xs leading-relaxed text-[#e0e0e0] font-mono">
                  {ep.curl}
                </pre>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 px-6 py-4 bg-[#1a1a1a] border-t border-[#2F2F2F] flex items-center justify-between">
          <p className="text-xs text-[#A3A3A3]">
            Base URL: <code className="text-[#9E7FFF] font-mono">https://api.nexusai.io</code>
          </p>
          <p className="text-xs text-[#A3A3A3]">Auth: Bearer token</p>
        </div>
      </div>
    </div>
  );
};
