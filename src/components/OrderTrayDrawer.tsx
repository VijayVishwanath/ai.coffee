import React from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Zap, 
  Clock, 
  ShieldCheck, 
  CheckCircle2,
  Coffee
} from 'lucide-react';
import { OrderItem } from '../types/cafe';

interface OrderTrayDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: OrderItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
  isDispatching: boolean;
}

export const OrderTrayDrawer: React.FC<OrderTrayDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  isDispatching,
}) => {
  if (!isOpen) return null;

  const totalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalPrepMinutes = items.reduce((acc, item) => Math.max(acc, item.prepMinutes), 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-stone-900 border-l border-stone-800 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-6 border-b border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-serif font-bold text-stone-100">
                  Guest Order Tray
                </h2>
                <span className="text-xs text-stone-400 font-mono">
                  {items.length} {items.length === 1 ? 'item' : 'items'} ready for craft
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white rounded-xl bg-stone-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="p-6 overflow-y-auto space-y-4 flex-1 scrollbar-thin">
            {items.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center space-y-3 text-stone-400">
                <Coffee className="w-12 h-12 text-stone-600 stroke-1" />
                <p className="text-sm font-serif">Your order tray is empty</p>
                <p className="text-xs text-stone-500 max-w-xs">
                  Ask Aura to suggest a brew, or tap any drink from the menu or flavor wheel to add it here.
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-3 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-stone-100 text-sm font-serif">
                        {item.name}
                      </h3>
                      <span className="text-xs font-mono font-bold text-amber-400 mt-0.5 block">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1.5 text-stone-500 hover:text-rose-400 rounded-lg hover:bg-stone-800 transition-all"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {item.customizations && item.customizations.length > 0 && (
                    <div className="flex flex-wrap gap-1 text-[11px] text-stone-400">
                      {item.customizations.map((c, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-stone-800 text-stone-300 font-mono text-[10px]"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-stone-850">
                    <span className="text-[11px] text-stone-500 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-stone-400" />
                      Prep: ~{item.prepMinutes}m
                    </span>

                    <div className="flex items-center gap-2 bg-stone-900 border border-stone-800 rounded-xl px-2 py-1">
                      <button
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="text-stone-400 hover:text-white p-0.5"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono text-xs font-bold text-stone-200 px-1">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="text-stone-400 hover:text-white p-0.5"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Action */}
          {items.length > 0 && (
            <div className="p-6 border-t border-stone-800 bg-stone-950/80 space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-stone-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-stone-200">${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-stone-400">
                  <span>Estimated Total Prep</span>
                  <span className="font-mono text-amber-400">~{totalPrepMinutes + 1.5} mins</span>
                </div>
                <div className="flex items-center justify-between text-stone-400">
                  <span>Target Station</span>
                  <span className="font-mono text-emerald-400">Bar 1 (Synesso Hydra)</span>
                </div>
                <div className="flex items-center justify-between text-sm font-bold text-stone-100 pt-2 border-t border-stone-800">
                  <span>Total Due</span>
                  <span className="font-mono text-lg text-amber-400">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200 font-mono flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Dispatches event to Pub/Sub & Spanner TrueTime ledger</span>
              </div>

              <button
                onClick={onCheckout}
                disabled={isDispatching}
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-amber-500/20"
              >
                {isDispatching ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-stone-950 border-t-transparent animate-spin"></div>
                    <span>Dispatching to Google Cloud Event Mesh...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Place Order & Dispatch to Event Mesh</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
