import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { SmarterOrdering } from './components/SmarterOrdering';
import { BetterWaits } from './components/BetterWaits';
import { DiscoveryEngine } from './components/DiscoveryEngine';
import { ConnectPeople } from './components/ConnectPeople';
import { UnderstandTheRoom } from './components/UnderstandTheRoom';
import { PredictiveDemand } from './components/PredictiveDemand';
import { ArchitectureBlueprint } from './components/ArchitectureBlueprint';
import { OrderTrayDrawer } from './components/OrderTrayDrawer';
import { CafeSoundtrackGenerator } from './components/CafeSoundtrackGenerator';
import { LiveVoiceBarista } from './components/LiveVoiceBarista';
import { QRCodeCheckIn } from './components/QRCodeCheckIn';

import { AuthProvider, useAuth } from './context/AuthContext';
import { db, handleFirestoreError, OperationType } from './firebase';
import { doc, setDoc, collection, onSnapshot, query, where } from 'firebase/firestore';

import { 
  INITIAL_MENU, 
  INITIAL_ORDERS, 
  INITIAL_PATRONS 
} from './data/mockData';
import { 
  MenuItem, 
  Order, 
  OrderItem, 
  SerendipityProfile, 
  RoomPulseData 
} from './types/cafe';
import { 
  Coffee, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Activity, 
  Layers, 
  ExternalLink 
} from 'lucide-react';

function CafeApp() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'order' | 'waits' | 'discovery' | 'connect' | 'room' | 'soundtrack' | 'checkin' | 'demand' | 'architecture'
  >('order');

  const [menu, setMenu] = useState<MenuItem[]>(INITIAL_MENU);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [patrons, setPatrons] = useState<SerendipityProfile[]>(INITIAL_PATRONS);
  const [checkedInCount, setCheckedInCount] = useState<number>(18);
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLiveVoiceOpen, setIsLiveVoiceOpen] = useState(false);
  const [isDispatchingOrder, setIsDispatchingOrder] = useState(false);
  const [activeFlavorFilter, setActiveFlavorFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [roomPulse, setRoomPulse] = useState<RoomPulseData>({
    vibe: 'Productive & Focused',
    sentimentScore: 0.88,
    crowdDensity: 'Moderate',
    acousticComfort: '64 dB - Optimal for café conversation & study',
    ambientDecibels: 64,
    baristaAlerts: [
      'Bar 2: Oat milk carton depletion estimated in 12 mins (Pub/Sub trigger sent)',
      'Acoustic level optimal: Background playlist tempo aligned with afternoon lull',
      'Table seating: Zone B communal tables have 3 open seats',
    ],
    musicSuggestion: 'Acoustic Indie & Neo-Soul (65 bpm)',
    lastUpdated: 'Just now',
  });

  // Listen to user's orders from Firestore if authenticated
  useEffect(() => {
    if (!currentUser) return;

    try {
      const q = query(collection(db, 'orders'), where('userId', '==', currentUser.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const userOrders: Order[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: data.id,
              customerName: data.customerName || 'You',
              items: [
                {
                  id: 'item-1',
                  name: data.itemsSummary || 'Specialty Coffee Order',
                  price: data.totalAmount || 5.0,
                  quantity: 1,
                  customizations: ['Artisan Craft'],
                  prepMinutes: 3,
                  category: 'espresso',
                },
              ],
              totalAmount: data.totalAmount,
              status: data.status,
              placedAt: data.placedAt,
              estimatedReadyAt: data.estimatedReadyAt,
              assignedBaristaStation: data.assignedBaristaStation || 'Bar 1',
              eventTraceId: data.eventTraceId || 'gcp-trace-live',
            };
          });

          // Merge with initial demo orders
          setOrders((prev) => {
            const nonUser = prev.filter((o) => o.customerName !== 'You (Mobile Guest)' && !userOrders.some((u) => u.id === o.id));
            return [...userOrders, ...nonUser];
          });
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'orders');
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn('Firestore orders sync note:', e);
    }
  }, [currentUser]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleAddToCart = (item: OrderItem) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.name === item.name && JSON.stringify(i.customizations) === JSON.stringify(item.customizations));
      if (existing) {
        return prev.map((i) =>
          i === existing ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prev, item];
    });
    showToast(`Added "${item.name}" to Order Tray`);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as OrderItem[]
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    setIsDispatchingOrder(true);
    const orderNum = Math.floor(8920 + Math.random() * 80);
    const orderId = `ORD-${orderNum}`;
    const traceId = `gcp-trace-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}`;
    const totalAmount = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
    const placedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const estReadyTime = new Date(Date.now() + 4 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newOrder: Order = {
      id: orderId,
      customerName: currentUser?.displayName || 'You (Mobile Guest)',
      items: [...cartItems],
      totalAmount,
      status: 'queued',
      placedAt: placedTime,
      estimatedReadyAt: estReadyTime,
      assignedBaristaStation: 'Bar 1 (Synesso Hydra)',
      eventTraceId: traceId,
    };

    // Persist to Firebase Firestore if user is authenticated
    if (currentUser) {
      try {
        await setDoc(doc(db, 'orders', orderId), {
          id: orderId,
          userId: currentUser.uid,
          customerName: currentUser.displayName || 'Guest',
          totalAmount,
          status: 'queued',
          placedAt: placedTime,
          estimatedReadyAt: estReadyTime,
          assignedBaristaStation: 'Bar 1 (Synesso Hydra)',
          eventTraceId: traceId,
          itemsSummary: cartItems.map((i) => `${i.quantity}x ${i.name}`).join(', '),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `orders/${orderId}`);
      }
    }

    setTimeout(() => {
      setOrders((prev) => [newOrder, ...prev]);
      setCartItems([]);
      setIsDispatchingOrder(false);
      setIsCartOpen(false);
      setActiveTab('waits');
      showToast(`Order ${orderId} saved to Firestore & dispatched to Pub/Sub event mesh!`);
    }, 1200);
  };

  const handleAdvanceOrderStatus = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          let nextStatus: Order['status'] = order.status;
          if (order.status === 'received') nextStatus = 'queued';
          else if (order.status === 'queued') nextStatus = 'brewing';
          else if (order.status === 'brewing') nextStatus = 'ready';
          else if (order.status === 'ready') nextStatus = 'completed';

          return { ...order, status: nextStatus };
        }
        return order;
      })
    );
  };

  const handleResetDemoOrders = () => {
    setOrders(INITIAL_ORDERS);
    showToast('Reset sample order tickets to initial state');
  };

  const handleAddPatron = (patron: SerendipityProfile) => {
    setPatrons((prev) => [patron, ...prev]);
    showToast(`You joined the room at ${patron.tableZone}!`);
  };

  const handleSelectFlavorFilter = (flavor: string) => {
    setActiveFlavorFilter(flavor);
    setActiveTab('order');
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-stone-950 antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 border border-amber-500/50 text-stone-100 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartItems={cartItems}
        setIsCartOpen={setIsCartOpen}
        activeOrdersCount={orders.filter((o) => o.status !== 'completed').length}
        onOpenLiveVoice={() => setIsLiveVoiceOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'order' && (
          <SmarterOrdering
            menu={menu}
            onAddToCart={handleAddToCart}
            activeFilter={activeFlavorFilter}
          />
        )}

        {activeTab === 'waits' && (
          <BetterWaits
            orders={orders}
            onAdvanceOrderStatus={handleAdvanceOrderStatus}
            onResetDemoOrders={handleResetDemoOrders}
            checkedInCount={checkedInCount}
            onNavigateToQRCheckIn={() => setActiveTab('checkin')}
          />
        )}

        {activeTab === 'discovery' && (
          <DiscoveryEngine
            menu={menu}
            onAddToCart={handleAddToCart}
            onSelectFlavorFilter={handleSelectFlavorFilter}
          />
        )}

        {activeTab === 'connect' && (
          <ConnectPeople
            patrons={patrons}
            onAddPatron={handleAddPatron}
          />
        )}

        {activeTab === 'room' && (
          <UnderstandTheRoom
            roomPulse={roomPulse}
            onUpdatePulse={setRoomPulse}
          />
        )}

        {activeTab === 'soundtrack' && (
          <CafeSoundtrackGenerator
            currentRoomVibe={roomPulse.vibe}
          />
        )}

        {activeTab === 'checkin' && (
          <QRCodeCheckIn
            onCheckInUpdated={(cnt) => setCheckedInCount(cnt)}
          />
        )}

        {activeTab === 'demand' && (
          <PredictiveDemand />
        )}

        {activeTab === 'architecture' && (
          <ArchitectureBlueprint />
        )}
      </main>

      {/* Live Voice Barista Modal (gemini-3.8-live) */}
      <LiveVoiceBarista
        isOpen={isLiveVoiceOpen}
        onClose={() => setIsLiveVoiceOpen(false)}
      />

      {/* Guest Order Tray Drawer */}
      <OrderTrayDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
        isDispatching={isDispatchingOrder}
      />

      {/* Footer */}
      <footer className="bg-stone-900/90 border-t border-stone-800 py-8 px-4 text-xs text-stone-400 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-amber-600/30 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Coffee className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-stone-200 font-serif">The Café Companion</span>
              <span className="text-stone-500 ml-2">Firebase Auth & Firestore Connected</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-stone-400 font-mono text-[11px]">
            <span>Google Cloud Run</span>
            <span>•</span>
            <span>Gemini 3.8 Live API</span>
            <span>•</span>
            <span>Lyria 3 Music</span>
            <span>•</span>
            <span>Firebase Firestore</span>
            <span>•</span>
            <span>Prometheus</span>
          </div>

          <div className="text-stone-500 text-[11px]">
            Active Region: asia-east1 • 99.999% SLA High Availability
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CafeApp />
    </AuthProvider>
  );
}
