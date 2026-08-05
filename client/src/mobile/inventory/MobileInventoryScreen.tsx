import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Package, Scan, AlertTriangle } from 'lucide-react';
import { MobileProductCardM3 } from '../components/MobileProductCardM3';

interface MobileInventoryScreenProps {
  products?: Array<{
    _id: string;
    name: string;
    sellingPrice: number;
    currentStock: number;
    minStockLevel?: number;
    unit?: string;
    sku?: string;
  }>;
  loading?: boolean;
}

export function MobileInventoryScreen({ products = [], loading }: MobileInventoryScreenProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  const lowStockCount = products.filter(
    (p) => typeof p.minStockLevel === 'number' && p.currentStock <= p.minStockLevel,
  ).length;

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLowStock =
      !showLowStockOnly || (typeof p.minStockLevel === 'number' && p.currentStock <= p.minStockLevel);

    return matchesSearch && matchesLowStock;
  });

  return (
    <div className="space-y-4 p-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-slate-900 dark:text-slate-100">Stock & Inventory</h1>
          <p className="text-xs text-slate-400">Total {products.length} catalog items</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/app/barcode')}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300"
            title="Scan Barcode"
          >
            <Scan className="h-5 w-5" />
          </button>
          <button
            onClick={() => navigate('/app/products/new')}
            className="flex items-center gap-1.5 rounded-2xl bg-brand-600 px-3.5 py-2 text-xs font-extrabold text-white shadow-md active:scale-95 transition"
          >
            <Plus className="h-4 w-4" /> Add Item
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search products or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-900 shadow-xs focus:border-brand-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowLowStockOnly(false)}
          className={`rounded-full px-3.5 py-1.5 text-xs font-extrabold transition-all ${
            !showLowStockOnly
              ? 'bg-brand-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          All Items ({products.length})
        </button>

        {lowStockCount > 0 && (
          <button
            onClick={() => setShowLowStockOnly(true)}
            className={`flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-extrabold transition-all ${
              showLowStockOnly
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" /> Low Stock ({lowStockCount})
          </button>
        )}
      </div>

      {/* Product List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading catalog items...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Package className="h-10 w-10 text-slate-300 mb-2" />
          <p className="text-xs font-bold text-slate-500">No catalog products found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map((p) => (
            <MobileProductCardM3 key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
