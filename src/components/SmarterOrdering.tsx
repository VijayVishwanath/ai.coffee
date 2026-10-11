import React, { useState } from 'react';
import { 
  Sparkles, 
  Mic, 
  MicOff, 
  Send, 
  Plus, 
  Check, 
  Flame, 
  Clock, 
  ChevronRight, 
  Coffee,
  X,
  Sliders,
  AlertCircle
} from 'lucide-react';
import { MenuItem, OrderItem } from '../types/cafe';

interface SmarterOrderingProps {
  menu: MenuItem[];
  onAddToCart: (item: OrderItem) => void;
  activeFilter?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'aura';
  text: string;
  suggestedItems?: Array<{
    name: string;
    price: number;
    quantity: number;
    customizations: string[];
    prepMinutes: number;
  }>;
  flavorProfile?: string;
  timestamp: string;
}

export const SmarterOrdering: React.FC<SmarterOrderingProps> = ({
  menu,
  onAddToCart,
  activeFilter,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(activeFilter || 'all');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'aura',
      text: "Welcome to Artisan Roast! I'm Aura, your AI café barista powered by Gemini. What kind of coffee experience or flavor profile are you craving today?",
      timestamp: 'Just now',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  // Customization Modal State
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [selectedMilk, setSelectedMilk] = useState('Oat Milk');
  const [selectedSweetness, setSelectedSweetness] = useState('Standard (Unsweetened)');
  const [selectedTemp, setSelectedTemp] = useState('Optimal Temp');
  const [extraShot, setExtraShot] = useState(false);
  const [isDecaf, setIsDecaf] = useState(false);

  // Filter menu
  const filteredMenu = menu.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory || item.flavorWheelCategory.toLowerCase() === selectedCategory.toLowerCase();
  });

  // Handle Speech Recognition
  const toggleSpeechRecognition = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use text typing.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
        handleSendMessage(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationHistory: messages.map((m) => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reach AI agent');
      }

      const data = await response.json();
      const auraMsg: ChatMessage = {
        id: `aura-${Date.now()}`,
        sender: 'aura',
        text: data.reply || "I've tailored this recommendation for you based on your taste profile.",
        suggestedItems: data.suggestedOrder,
        flavorProfile: data.flavorProfile,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, auraMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `aura-${Date.now()}`,
          sender: 'aura',
          text: "I'd love to prepare that for you! Would you like whole milk, oat milk, or black?",
          timestamp: 'Just now',
          suggestedItems: [
            {
              name: 'Artisan Flat White',
              price: 4.75,
              quantity: 1,
              customizations: ['Oat Milk'],
              prepMinutes: 2.5,
            },
          ],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSuggested = (item: {
    name: string;
    price: number;
    quantity: number;
    customizations: string[];
    prepMinutes: number;
  }) => {
    const matchedMenu = menu.find((m) => m.name.toLowerCase().includes(item.name.toLowerCase())) || menu[0];
    onAddToCart({
      id: `${matchedMenu.id}-${Date.now()}`,
      name: item.name,
      price: item.price,
      quantity: item.quantity || 1,
      customizations: item.customizations || ['Standard'],
      prepMinutes: item.prepMinutes || 3,
      category: matchedMenu.category,
      flavorNotes: [matchedMenu.flavorProfile],
    });
  };

  const handleOpenCustomizer = (item: MenuItem) => {
    setCustomizingItem(item);
    setSelectedMilk(item.category === 'bakery' ? 'N/A' : 'Oat Milk');
    setSelectedSweetness('Standard (Unsweetened)');
    setSelectedTemp('Optimal Barista Temp');
    setExtraShot(false);
    setIsDecaf(false);
  };

  const handleConfirmCustomization = () => {
    if (!customizingItem) return;

    const customizations: string[] = [];
    if (customizingItem.category !== 'bakery') {
      customizations.push(selectedMilk);
      if (selectedSweetness !== 'Standard (Unsweetened)') customizations.push(selectedSweetness);
      if (selectedTemp !== 'Optimal Barista Temp') customizations.push(selectedTemp);
      if (extraShot) customizations.push('Extra Shot (+1.00)');
      if (isDecaf) customizations.push('Decaf (Swiss Water)');
    } else {
      customizations.push('Warmed & Freshly Plated');
    }

    const price = customizingItem.price + (extraShot ? 1.0 : 0);

    onAddToCart({
      id: `${customizingItem.id}-${Date.now()}`,
      name: customizingItem.name,
      price,
      quantity: 1,
      customizations,
      prepMinutes: customizingItem.prepTimeMinutes,
      category: customizingItem.category,
      flavorNotes: [customizingItem.flavorProfile],
    });

    setCustomizingItem(null);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner / Conversational Hero */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
          {/* Left Column: Conversational AI Agent */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Sparkles className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-400">
                AI Barista Agent (Google Gemini 3.8 Flash)
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100 tracking-tight">
              Smarter Conversational Ordering
            </h1>
            <p className="text-sm text-stone-400">
              Speak or type naturally. Aura understands complex flavor preferences, dietary nuances,
              and matches drinks with artisanal pastry pairings in real time.
            </p>

            {/* Quick Starter Chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                'Floral Ethiopian pour-over + Cardamom bun',
                'Silky oat flat white, half sweet',
                'Cold brew nitro for deep focus work',
                'Ceremonial matcha with light ice',
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => {
                    setInputMessage(chip);
                    handleSendMessage(chip);
                  }}
                  className="text-xs bg-stone-800/80 hover:bg-stone-700/80 text-stone-300 hover:text-white px-3 py-1.5 rounded-full border border-stone-700 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  {chip}
                </button>
              ))}
            </div>

            {/* Chat Dialog Stream */}
            <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-4 max-h-72 overflow-y-auto space-y-3 scrollbar-thin">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-amber-600 text-stone-950 font-medium rounded-tr-none'
                        : 'bg-stone-800/90 text-stone-200 border border-stone-700/60 rounded-tl-none'
                    }`}
                  >
                    <p>{msg.text}</p>
                    {msg.flavorProfile && (
                      <div className="mt-1.5 pt-1.5 border-t border-stone-700 text-[11px] text-amber-400 font-medium flex items-center gap-1">
                        <span>Sensory Profile:</span>
                        <span className="text-stone-300">{msg.flavorProfile}</span>
                      </div>
                    )}
                  </div>

                  {/* Render Suggested Items */}
                  {msg.suggestedItems && msg.suggestedItems.length > 0 && (
                    <div className="mt-2 w-full max-w-md space-y-1.5 pl-2">
                      <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                        Suggested For Your Tray:
                      </span>
                      {msg.suggestedItems.map((sug, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-stone-900/90 border border-amber-500/30 rounded-xl p-2.5 text-xs"
                        >
                          <div>
                            <span className="font-semibold text-stone-100">{sug.name}</span>
                            <span className="text-amber-400 ml-2 font-mono font-medium">
                              ${sug.price.toFixed(2)}
                            </span>
                            <div className="text-[11px] text-stone-400">
                              {sug.customizations?.join(' • ') || 'Standard craft'}
                            </div>
                          </div>
                          <button
                            onClick={() => handleAddSuggested(sug)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold transition-all shadow-md text-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <span className="text-[10px] text-stone-500 mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-stone-400 text-xs py-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></div>
                  <span>Aura is crafting sensory recommendations...</span>
                </div>
              )}
            </div>

            {/* Input Form with Voice Button */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask Aura: 'What brew has notes of peach and honey?'"
                  className="w-full bg-stone-950/90 border border-stone-700/80 rounded-xl px-4 py-3 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-all shadow-inner"
                />
              </div>

              <button
                type="button"
                onClick={toggleSpeechRecognition}
                title={isListening ? 'Stop voice recording' : 'Voice order with microphone'}
                className={`p-3 rounded-xl border transition-all ${
                  isListening
                    ? 'bg-rose-600/90 text-white border-rose-500 animate-pulse'
                    : 'bg-stone-800 text-stone-300 hover:text-white border-stone-700 hover:bg-stone-700'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputMessage.trim()}
                className="px-4 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-bold flex items-center gap-1.5 transition-all text-xs sm:text-sm shadow-md"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
          </div>

          {/* Right Column: Dynamic Experience Highlights */}
          <div className="lg:col-span-5 bg-stone-950/60 border border-stone-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" />
                Live Barista Station Pulse
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                3 Baristas Ready
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800/80 flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-stone-200">Current Wait Window</span>
                  <p className="text-[11px] text-stone-400">Pour-over queue: 1 ahead • Espresso: 0</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold font-mono text-amber-400">~3.5 min</span>
                  <p className="text-[10px] text-emerald-400">Sub-5m SLA</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800/80 flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-stone-200">Featured Roast of the Day</span>
                  <p className="text-[11px] text-stone-400">Ethiopian Yirgacheffe Gedeo (Sun-Dried)</p>
                </div>
                <span className="text-xs font-mono font-medium px-2 py-1 bg-amber-500/15 text-amber-300 rounded border border-amber-500/30">
                  Notes: Jasmine & Blueberry
                </span>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
                <span className="font-semibold block mb-0.5 text-amber-300">💡 Pro Tip for Guests:</span>
                Order via conversational voice or explore the Flavor Wheel in the Discovery tab to pair your drink with our house-baked cardamom morning buns.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Categories Filter Tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold font-serif text-stone-100">Artisan Coffee & Bakery Menu</h2>
            <p className="text-xs text-stone-400">Handcrafted single-origins, silky microfoam, and morning bakes</p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'All Items' },
              { id: 'espresso', label: 'Espresso Bar' },
              { id: 'filter', label: 'Pour-Over Filter' },
              { id: 'cold', label: 'Cold Brew Draft' },
              { id: 'tea', label: 'Ceremonial Tea' },
              { id: 'bakery', label: 'Artisan Bakery' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-xs px-3 py-1.5 rounded-xl whitespace-nowrap transition-all font-medium ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                    : 'bg-stone-900/90 text-stone-400 hover:text-white hover:bg-stone-800 border border-stone-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMenu.map((item) => (
            <div
              key={item.id}
              className="bg-stone-900/80 hover:bg-stone-850/90 border border-stone-800 hover:border-amber-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all group shadow-lg hover:shadow-amber-950/20"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-800 text-amber-400 border border-stone-700/80">
                      {item.category.toUpperCase()}
                    </span>
                    <h3 className="text-base font-bold font-serif text-stone-100 group-hover:text-amber-300 transition-colors mt-1">
                      {item.name}
                    </h3>
                  </div>
                  <span className="text-base font-bold font-mono text-amber-400">
                    ${item.price.toFixed(2)}
                  </span>
                </div>

                <p className="text-xs text-stone-300 leading-relaxed line-clamp-2">
                  {item.description}
                </p>

                {/* Flavor Profile & Origin */}
                <div className="pt-2 border-t border-stone-800/80 flex flex-wrap gap-1.5">
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                    {item.flavorProfile}
                  </span>
                  {item.caffeineMg > 0 && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 font-mono">
                      ⚡ {item.caffeineMg}mg
                    </span>
                  )}
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 flex items-center gap-1 font-mono">
                    <Clock className="w-2.5 h-2.5 text-stone-400" />
                    ~{item.prepTimeMinutes}m
                  </span>
                </div>

                {item.pairings && item.pairings.length > 0 && (
                  <div className="text-[11px] text-stone-400">
                    <span className="text-stone-500">Pairs with: </span>
                    <span className="text-amber-200/80 italic">{item.pairings.join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-3 border-t border-stone-800 flex items-center justify-between">
                <div className="text-[11px] text-stone-500 font-mono">
                  Stock: <span className="text-emerald-400">{item.stockCount} avail</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenCustomizer(item)}
                    className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 transition-all text-xs flex items-center gap-1"
                    title="Customize milk, sweetness, and temperature"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Customize</span>
                  </button>

                  <button
                    onClick={() => {
                      onAddToCart({
                        id: `${item.id}-${Date.now()}`,
                        name: item.name,
                        price: item.price,
                        quantity: 1,
                        customizations: ['Standard Craft'],
                        prepMinutes: item.prepTimeMinutes,
                        category: item.category,
                        flavorNotes: [item.flavorProfile],
                      });
                    }}
                    className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold transition-all shadow-md text-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Item Customizer Modal */}
      {customizingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-start justify-between border-b border-stone-800 pb-4">
              <div>
                <span className="text-xs font-mono text-amber-400 uppercase tracking-wider">
                  Barista Customizer
                </span>
                <h3 className="text-xl font-bold font-serif text-stone-100">
                  {customizingItem.name}
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">{customizingItem.flavorProfile}</p>
              </div>
              <button
                onClick={() => setCustomizingItem(null)}
                className="p-2 text-stone-400 hover:text-white rounded-xl bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {customizingItem.category !== 'bakery' ? (
              <div className="space-y-4 text-xs">
                {/* Milk Options */}
                <div className="space-y-2">
                  <label className="font-semibold text-stone-300 block">Milk Choice:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Oat Milk', 'Whole Milk', 'Almond Milk'].map((milk) => (
                      <button
                        key={milk}
                        onClick={() => setSelectedMilk(milk)}
                        className={`p-2 rounded-xl border text-center transition-all ${
                          selectedMilk === milk
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500 font-bold'
                            : 'bg-stone-800/80 text-stone-400 border-stone-700 hover:bg-stone-700'
                        }`}
                      >
                        {milk}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sweetness */}
                <div className="space-y-2">
                  <label className="font-semibold text-stone-300 block">Sweetness & Syrup:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Standard (Unsweetened)', 'Vanilla Bean (50%)', 'Lavender Infusion'].map((sweet) => (
                      <button
                        key={sweet}
                        onClick={() => setSelectedSweetness(sweet)}
                        className={`p-2 rounded-xl border text-center transition-all ${
                          selectedSweetness === sweet
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500 font-bold'
                            : 'bg-stone-800/80 text-stone-400 border-stone-700 hover:bg-stone-700'
                        }`}
                      >
                        {sweet}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Temperature */}
                <div className="space-y-2">
                  <label className="font-semibold text-stone-300 block">Temperature Preference:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Optimal Barista Temp', 'Extra Hot (165°F)', 'Served Over Ice'].map((temp) => (
                      <button
                        key={temp}
                        onClick={() => setSelectedTemp(temp)}
                        className={`p-2 rounded-xl border text-center transition-all ${
                          selectedTemp === temp
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500 font-bold'
                            : 'bg-stone-800/80 text-stone-400 border-stone-700 hover:bg-stone-700'
                        }`}
                      >
                        {temp}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Shot & Decaf Add-ons */}
                <div className="pt-2 border-t border-stone-800 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                    <input
                      type="checkbox"
                      checked={extraShot}
                      onChange={(e) => setExtraShot(e.target.checked)}
                      className="rounded accent-amber-500 w-4 h-4"
                    />
                    <span>Extra Espresso Shot (+$1.00)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                    <input
                      type="checkbox"
                      checked={isDecaf}
                      onChange={(e) => setIsDecaf(e.target.checked)}
                      className="rounded accent-amber-500 w-4 h-4"
                    />
                    <span>Decaf (Swiss Water)</span>
                  </label>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-stone-800/60 border border-stone-700 text-xs text-stone-300 space-y-2">
                <p>Freshly baked this morning at 6:00 AM.</p>
                <p className="text-amber-300">We will gently warm and plate this pastry upon order confirmation.</p>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-stone-800 pt-4">
              <div>
                <span className="text-[11px] text-stone-400">Total with customizers:</span>
                <div className="text-lg font-bold font-mono text-amber-400">
                  ${(customizingItem.price + (extraShot ? 1.0 : 0)).toFixed(2)}
                </div>
              </div>

              <button
                onClick={handleConfirmCustomization}
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold transition-all shadow-lg text-sm flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Add Customized Drink
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
