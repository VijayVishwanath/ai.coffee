export type OrderStatus = 'received' | 'queued' | 'brewing' | 'ready' | 'completed';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  customizations: string[];
  prepMinutes: number;
  flavorNotes?: string[];
  category: 'espresso' | 'filter' | 'cold' | 'tea' | 'bakery';
}

export interface Order {
  id: string;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  placedAt: string;
  estimatedReadyAt: string;
  assignedBaristaStation: string;
  eventTraceId: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: 'espresso' | 'filter' | 'cold' | 'tea' | 'bakery';
  description: string;
  flavorProfile: string;
  flavorWheelCategory: 'Fruity' | 'Floral' | 'Chocolatey' | 'Nutty' | 'Spiced' | 'Sweet';
  prepTimeMinutes: number;
  stockCount: number;
  caffeineMg: number;
  origin?: string;
  elevation?: string;
  process?: string;
  pairings: string[];
}

export interface RoomPulseData {
  vibe: string;
  sentimentScore: number;
  crowdDensity: string;
  acousticComfort: string;
  ambientDecibels: number;
  baristaAlerts: string[];
  musicSuggestion: string;
  lastUpdated: string;
}

export interface SerendipityProfile {
  id: string;
  name: string;
  avatar: string;
  role: string;
  tableZone: string;
  currentFocus: string;
  openTopics: string[];
  isOpenToChat: boolean;
  synergyScore?: number;
}

export interface DemandForecastData {
  surgePrediction: string;
  expectedHourlyOrders: number;
  hotVsColdRatio: string;
  automatedActions: string[];
  stockRisk: string;
  projectedRevenueDelta: string;
}

export interface ArchitectureNode {
  id: string;
  category: 'edge' | 'compute' | 'messaging' | 'storage' | 'ai' | 'observability';
  name: string;
  googleService: string;
  role: string;
  latencySla: string;
  scalingPolicy: string;
  status: 'healthy' | 'degraded' | 'scaling';
}

export interface CheckInRecord {
  id: string;
  userId?: string;
  customerName: string;
  tableZone: string;
  partySize: number;
  arrivalTime: string;
  status: 'active' | 'departed';
  timestamp?: string;
}

