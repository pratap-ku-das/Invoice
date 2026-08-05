import { Package, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MobileProductCardM3Props {
  product: {
    _id: string;
    name: string;
    sellingPrice: number;
    currentStock: number;
    minStockLevel?: number;
    unit?: string;
    sku?: string;
  };
}

export function MobileProductCardM3({ product }: MobileProductCardM3Props) {
  const navigate = useNavigate();
  const isLowStock =
    typeof product.minStockLevel === 'number' &&
    product.currentStock <= product.minStockLevel;

  return (
    <div
      onClick={() => navigate(`/app/products/${product._id}`)}
      className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900 active:scale-98 transition"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
            isLowStock
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
              : 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300'
          }`}
        >
          <Package className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h4 className="truncate text-sm font-extrabold text-slate-900 dark:text-slate-100">{product.name}</h4>
          <div className="text-xs text-slate-400 font-medium">SKU: {product.sku || 'N/A'}</div>
          {isLowStock && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-3 w-3" /> Low Stock Warning
            </div>
          )}
        </div>
      </div>

      <div className="text-right shrink-0">
        <div className="text-sm font-black text-slate-900 dark:text-slate-100">
          ₹{(product.sellingPrice || 0).toLocaleString('en-IN')}
        </div>
        <div
          className={`text-xs font-bold ${
            isLowStock ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
          }`}
        >
          {product.currentStock} {product.unit || 'units'}
        </div>
      </div>
    </div>
  );
}
