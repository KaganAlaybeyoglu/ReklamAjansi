export interface StaffGrade {
  id: string;
  name: string;
  pay_rate: number;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Staff {
  id: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  staff_type: 'creative' | 'administrative';
  grade_id?: string;
  hire_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  postal_code: string;
  country: string;
  staff_contact_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  client_id: string;
  name: string;
  description: string;
  budget: number;
  start_date?: string;
  end_date?: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface Advert {
  id: string;
  campaign_id: string;
  title: string;
  description: string;
  format: 'video' | 'print' | 'digital' | 'social' | 'billboard' | 'radio';
  production_status: 'concept' | 'in_production' | 'review' | 'approved' | 'completed';
  production_notes: string;
  cost: number;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ConceptNote {
  id: string;
  campaign_id: string;
  created_by: string;
  title: string;
  content: string;
  is_shared: boolean;
  created_at: string;
  updated_at: string;
}
