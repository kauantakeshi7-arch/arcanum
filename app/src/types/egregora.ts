export interface AffinityViewModel {
  name: string;
  pct: number;
  sun: string;
  moon: string;
}

export interface VeilExchange {
  q: string;
  a: string;
}

export interface CandleViewModel {
  id: string;
  userId: string;
  by: string;
  intention: string;
  lights: number;
  lit: boolean;
}

export interface GratitudeViewModel {
  id: string;
  userId: string;
  by: string;
  guideName: string;
  testimony: string;
  flowers: number;
  sent: boolean;
  date: string;
}

export interface MarketItem {
  name: string;
  price: string;
  color: string;
}

export interface SacredPlace {
  id: string;
  name: string;
  category: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  createdBy: string;
}

