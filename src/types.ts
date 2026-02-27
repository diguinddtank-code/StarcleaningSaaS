export interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  zip_code?: string; // Added field
  city: string;
  service_type: string; // Relaxed from union to allow CSV values
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  people_count?: number; // Added field
  frequency: string; // Relaxed from union
  status: string; // Relaxed from union
  estimated_price: number;
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
