import React, { useState } from 'react';
import { 
  Compass, 
  Sparkles, 
  Check, 
  Coffee, 
  ArrowRight, 
  Award, 
  Globe, 
  MapPin, 
  Plus
} from 'lucide-react';
import { MenuItem, OrderItem } from '../types/cafe';

interface DiscoveryEngineProps {
  menu: MenuItem[];
  onAddToCart: (item: OrderItem) => void;
  onSelectFlavorFilter: (flavor: string) => void;
}

const FLAVOR_CATEGORIES = [
  {
    name: 'Fruity',
    color: 'from-rose-500 to-amber-600',
    borderColor: 'border-rose-500/50',
    textColor: 'text-rose-400',
    notes: ['White Peach', 'Wild Blueberry', 'Blackberry', 'Apricot'],
    description: 'Vibrant, bright fruit-forward cups from high-altitude anaerobic origins.',
  },
  {
    name: 'Floral',
    color: 'from-purple-500 to-pink-600',
    borderColor: 'border-purple-500/50',
    textColor: 'text-purple-400',
    notes: ['Jasmine Blossom', 'Bergamot', 'Lavender', 'Orange Blossom'],
    description: 'Ethereal, delicate tea-like washed Ethiopian and Geisha lots.',
  },
  {
    name: 'Chocolatey',
    color: 'from-amber-800 to-stone-900',
    borderColor: 'border-amber-700/50',
    textColor: 'text-amber-500',
    notes: ['Dark Cocoa 85%', 'Caramel Fudge', 'Molasses', 'Milk Chocolate'],
    description: 'Full-bodied, velvety espresso roasts with rich sweet finishes.',
  },
  {
    name: 'Nutty',
    color: 'from-amber-700 to-yellow-800',
    borderColor: 'border-amber-600/50',
    textColor: 'text-amber-400',
    notes: ['Roasted Pecan', 'Hazelnut Praline', 'Almond Butter', 'Toasted Walnut'],
    description: 'Comforting, low-acid South American and Central American micro-lots.',
  },
  {
    name: 'Spiced',
    color: 'from-red-600 to-amber-700',
    borderColor: 'border-red-500/50',
    textColor: 'text-red-400',
    notes: ['Green Cardamom', 'Ceylon Cinnamon', 'Nutmeg', 'Clove'],
    description: 'Warming spices paired harmoniously with Scandinavian morning bakes.',
  },
  {
    name: 'Sweet',
    color: 'from-emerald-600 to-teal-700',
    borderColor: 'border-emerald-500/50',
    textColor: 'text-emerald-400',
    notes: ['Honey Nectar', 'Madagascar Vanilla', 'Brown Sugar', 'Maple'],
    description: 'Smooth, naturally balanced sweetness from honey-processed cherries.',
  },
];

export const DiscoveryEngine: React.FC<DiscoveryEngineProps> = ({
  menu,
  onAddToCart,
  onSelectFlavorFilter,
}) => {
  const [selectedWheelCategory, setSelectedWheelCategory] = useState<string>('Floral');
  
  // Taste Quiz State
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<{
    cupStyle?: string;
    acidity?: string;
    pastry?: string;
  }>({});
  const [quizResult, setQuizResult] = useState<{
    drink: MenuItem;
    pastry: MenuItem;
    reasoning: string;
  } | null>(null);

  const matchedItems = menu.filter(
    (item) => item.flavorWheelCategory.toLowerCase() === selectedWheelCategory.toLowerCase()
  );

  const handleQuizAnswer = (key: 'cupStyle' | 'acidity' | 'pastry', value: string) => {
    const updated = { ...quizAnswers, [key]: value };
    setQuizAnswers(updated);

    if (quizStep < 2) {
      setQuizStep(quizStep + 1);
    } else {
      // Calculate pairing match
      let matchedDrink = menu[0];
      let matchedPastry = menu[6]; // Cardamom bun

      if (updated.cupStyle?.includes('Pour-Over')) {
        matchedDrink = menu.find((m) => m.category === 'filter') || menu[0];
      } else if (updated.cupStyle?.includes('Milk')) {
        matchedDrink = menu.find((m) => m.id === 'flat-white') || menu[2];
      } else if (updated.cupStyle?.includes('Cold')) {
        matchedDrink = menu.find((m) => m.id === 'cold-brew-nitro') || menu[4];
      }

      if (updated.pastry?.includes('Avocado')) {
        matchedPastry = menu.find((m) => m.id === 'avocado-sourdough') || menu[7];
      } else {
        matchedPastry = menu.find((m) => m.id === 'cardamom-bun') || menu[6];
      }

      setQuizResult({
        drink: matchedDrink,
        pastry: matchedPastry,
        reasoning: `Based on your preference for ${updated.cupStyle?.toLowerCase()} and ${updated.acidity?.toLowerCase()}, this pairing harmonizes the ${matchedDrink.flavorProfile} of the brew with the ${matchedPastry.flavorProfile} of our morning bake.`,
      });
      setQuizStep(3);
    }
  };

  const handleAddPairingToCart = () => {
    if (!quizResult) return;
    
    // Add Drink
    onAddToCart({
      id: `${quizResult.drink.id}-${Date.now()}`,
      name: quizResult.drink.name,
      price: quizResult.drink.price,
      quantity: 1,
      customizations: ['AI Quiz Pairing'],
      prepMinutes: quizResult.drink.prepTimeMinutes,
      category: quizResult.drink.category,
      flavorNotes: [quizResult.drink.flavorProfile],
    });

    // Add Pastry
    onAddToCart({
      id: `${quizResult.pastry.id}-${Date.now() + 1}`,
      name: quizResult.pastry.name,
      price: quizResult.pastry.price,
      quantity: 1,
      customizations: ['Freshly Warmed'],
      prepMinutes: quizResult.pastry.prepTimeMinutes,
      category: quizResult.pastry.category,
      flavorNotes: [quizResult.pastry.flavorProfile],
    });
  };

  const resetQuiz = () => {
    setQuizStep(0);
    setQuizAnswers({});
    setQuizResult(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-stone-800 pb-5">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Compass className="w-4 h-4" />
          </span>
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-400">
            Sensory Discovery Engine
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100 tracking-tight mt-1">
          Explore Flavor Profiles & Terroir
        </h1>
        <p className="text-xs sm:text-sm text-stone-400">
          Unpack specialty coffee nuances with our interactive Sensory Flavor Wheel and AI Palate Matching Quiz.
        </p>
      </div>

      {/* Interactive Flavor Wheel Grid */}
      <div className="bg-stone-900/80 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-serif font-bold text-stone-100">
              Interactive Coffee Flavor Wheel
            </h2>
            <p className="text-xs text-stone-400">
              Select a sensory spectrum to filter micro-lots and explore distinct cupping notes.
            </p>
          </div>
          <span className="text-xs font-mono text-amber-400 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
            Currently Viewing: {selectedWheelCategory}
          </span>
        </div>

        {/* Sensory Wheel Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {FLAVOR_CATEGORIES.map((cat) => {
            const isSelected = selectedWheelCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedWheelCategory(cat.name)}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                  isSelected
                    ? `bg-stone-850 ${cat.borderColor} shadow-lg ring-1 ring-amber-500/40`
                    : 'bg-stone-950/70 border-stone-800 hover:border-stone-700'
                }`}
              >
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${cat.color} mb-2`}></div>
                <h3 className={`text-sm font-bold font-serif ${isSelected ? cat.textColor : 'text-stone-200'}`}>
                  {cat.name}
                </h3>
                <p className="text-[10px] text-stone-400 mt-1 line-clamp-2">
                  {cat.notes.slice(0, 2).join(', ')}
                </p>
              </button>
            );
          })}
        </div>

        {/* Selected Flavor Detail & Matched Items */}
        {(() => {
          const activeCat = FLAVOR_CATEGORIES.find((c) => c.name === selectedWheelCategory) || FLAVOR_CATEGORIES[0];
          return (
            <div className="bg-stone-950/70 border border-stone-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-stone-800/80 pb-3">
                <div>
                  <h3 className={`text-base font-bold ${activeCat.textColor}`}>
                    {activeCat.name} Cupping Spectrum
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">{activeCat.description}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeCat.notes.map((note) => (
                    <span
                      key={note}
                      className="text-[11px] font-mono px-2.5 py-1 rounded bg-stone-900 text-stone-300 border border-stone-800"
                    >
                      • {note}
                    </span>
                  ))}
                </div>
              </div>

              {/* Matched Brews in this spectrum */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-stone-300 uppercase tracking-wider">
                  Featured Drinks in this Spectrum:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {matchedItems.length > 0 ? (
                    matchedItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-stone-900/90 border border-stone-800 rounded-xl p-4 flex items-start justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-stone-100 text-sm font-serif">
                              {item.name}
                            </h4>
                            <span className="text-amber-400 font-mono text-xs font-bold">
                              ${item.price.toFixed(2)}
                            </span>
                          </div>
                          <p className="text-xs text-stone-400 mt-1">{item.description}</p>
                          {item.origin && (
                            <div className="text-[11px] text-stone-500 mt-2 flex items-center gap-1 font-mono">
                              <MapPin className="w-3 h-3 text-amber-500" />
                              {item.origin} ({item.elevation})
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            onAddToCart({
                              id: `${item.id}-${Date.now()}`,
                              name: item.name,
                              price: item.price,
                              quantity: 1,
                              customizations: ['Flavor Wheel Pick'],
                              prepMinutes: item.prepTimeMinutes,
                              category: item.category,
                              flavorNotes: [item.flavorProfile],
                            });
                          }}
                          className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1 shrink-0 transition-all shadow-md"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-xs text-stone-500 italic p-3">
                      Try our single-origin pour-overs or ask Aura to prepare a custom roast within this spectrum.
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* AI Palate & Pairing Quiz */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-lg font-serif font-bold text-stone-100">
                Personalized Drink & Pastry Pairing Quiz
              </h2>
              <p className="text-xs text-stone-400">
                Answer 3 quick sensory questions to find your soulmate cup.
              </p>
            </div>
          </div>

          {quizStep > 0 && (
            <button
              onClick={resetQuiz}
              className="text-xs text-stone-400 hover:text-white underline font-mono"
            >
              Restart Quiz
            </button>
          )}
        </div>

        {/* Step 0: Question 1 */}
        {quizStep === 0 && (
          <div className="space-y-4">
            <span className="text-xs font-mono text-amber-400 uppercase tracking-wider block">
              Step 1 of 3: Preferred Brew Style
            </span>
            <h3 className="text-base font-bold text-stone-100">
              How do you love to enjoy your coffee?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'Clean Pour-Over Filter', desc: 'Light roast, intricate aromatics, black' },
                { label: 'Silky Milk Craft (Latte/Flat White)', desc: 'Velvety microfoam, creamy sweetness' },
                { label: 'Crisp Nitro Cold Brew', desc: 'Ultra-smooth, refreshing draft over ice' },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => handleQuizAnswer('cupStyle', opt.label)}
                  className="p-4 rounded-2xl bg-stone-950/70 hover:bg-stone-800/80 border border-stone-800 hover:border-amber-500/50 text-left transition-all"
                >
                  <span className="font-bold text-stone-100 text-sm block">{opt.label}</span>
                  <span className="text-xs text-stone-400 mt-1 block">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Question 2 */}
        {quizStep === 1 && (
          <div className="space-y-4">
            <span className="text-xs font-mono text-amber-400 uppercase tracking-wider block">
              Step 2 of 3: Acidity & Brightness Profile
            </span>
            <h3 className="text-base font-bold text-stone-100">
              What kind of finish makes you smile?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'Sparkling Citrus & Floral Berries', desc: 'High elevation washed African lots' },
                { label: 'Juicy Stonefruit & Wild Honey', desc: 'Anaerobic fermented Colombian Geisha' },
                { label: 'Deep Cocoa, Caramel & Pecan', desc: 'Low-acid, comforting Brazilian Cerrado' },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => handleQuizAnswer('acidity', opt.label)}
                  className="p-4 rounded-2xl bg-stone-950/70 hover:bg-stone-800/80 border border-stone-800 hover:border-amber-500/50 text-left transition-all"
                >
                  <span className="font-bold text-stone-100 text-sm block">{opt.label}</span>
                  <span className="text-xs text-stone-400 mt-1 block">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Question 3 */}
        {quizStep === 2 && (
          <div className="space-y-4">
            <span className="text-xs font-mono text-amber-400 uppercase tracking-wider block">
              Step 3 of 3: Pastry Companion
            </span>
            <h3 className="text-base font-bold text-stone-100">
              What bakery accompaniment would complete your ritual?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'Swedish Cardamom Morning Bun', desc: 'Laminated, aromatic green cardamom seeds' },
                { label: 'Flaky Almond Croissant', desc: 'Rich frangipane paste, toasted almonds' },
                { label: 'Avocado Wild Sourdough', desc: 'Savory sourdough, pickled shallot, chili crisp' },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => handleQuizAnswer('pastry', opt.label)}
                  className="p-4 rounded-2xl bg-stone-950/70 hover:bg-stone-800/80 border border-stone-800 hover:border-amber-500/50 text-left transition-all"
                >
                  <span className="font-bold text-stone-100 text-sm block">{opt.label}</span>
                  <span className="text-xs text-stone-400 mt-1 block">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Result Showcase */}
        {quizStep === 3 && quizResult && (
          <div className="bg-stone-950/80 border border-amber-500/40 rounded-2xl p-6 space-y-5 animate-in fade-in duration-300">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold font-serif text-amber-300">
                Your AI-Curated Soulmate Pairing
              </h3>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed italic bg-amber-950/20 p-3 rounded-xl border border-amber-500/20">
              "{quizResult.reasoning}"
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-stone-900 border border-stone-800">
                <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">
                  Curated Drink
                </span>
                <h4 className="text-base font-bold font-serif text-stone-100 mt-1">
                  {quizResult.drink.name}
                </h4>
                <p className="text-xs text-stone-400 mt-1">{quizResult.drink.flavorProfile}</p>
                <span className="text-sm font-mono font-bold text-amber-400 mt-2 block">
                  ${quizResult.drink.price.toFixed(2)}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-stone-900 border border-stone-800">
                <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">
                  Bakery Pairing
                </span>
                <h4 className="text-base font-bold font-serif text-stone-100 mt-1">
                  {quizResult.pastry.name}
                </h4>
                <p className="text-xs text-stone-400 mt-1">{quizResult.pastry.flavorProfile}</p>
                <span className="text-sm font-mono font-bold text-amber-400 mt-2 block">
                  ${quizResult.pastry.price.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-800">
              <div>
                <span className="text-xs text-stone-400">Total Pairing Price:</span>
                <span className="text-lg font-bold font-mono text-amber-400 ml-2">
                  ${(quizResult.drink.price + quizResult.pastry.price).toFixed(2)}
                </span>
              </div>

              <button
                onClick={handleAddPairingToCart}
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20"
              >
                <Plus className="w-4 h-4" />
                Add Curated Pair to Order Tray
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
