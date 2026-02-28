export interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  zip_code?: string;
  city: string;
  service_type: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  people_count?: number;
  frequency: string;
  status: string;
  estimated_price1: string;
  estimated_price2: string;
  notes: string;
  source: string;
  created_at: string;
  updated_at: string;
  activities?: Activity[];
}

export interface Activity {
  id: number;
  lead_id: number;
  type: 'note' | 'call' | 'email' | 'status_change';
  content: string;
  created_at: string;
}

export interface Job {
  id: number;
  lead_id: number;
  date: string;
  team: string;
  amount: number;
  team_pay?: number; // Amount paid to the team
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string;
  created_at?: string;
}

export const LEAD_STATUSES = [
  { id: 'new', label: 'New Lead', color: 'bg-blue-100 text-blue-800' },
  { id: 'contacted', label: 'Contacted', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'quoted', label: 'Quoted', color: 'bg-purple-100 text-purple-800' },
  { id: 'scheduled', label: 'Scheduled', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'won', label: 'Won', color: 'bg-green-100 text-green-800' },
  { id: 'lost', label: 'Lost', color: 'bg-gray-100 text-gray-800' },
] as const;

export const SERVICE_TYPES = [
  { id: 'standard', label: 'Standard Clean' },
  { id: 'deep', label: 'Deep Clean' },
  { id: 'move-in-out', label: 'Move In/Out' },
] as const;
