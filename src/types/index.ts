// ============================================================
// HoneyBee Learning Â— Core TypeScript Types
// ============================================================

// ----- Database Row Types -----

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Child {
  id: string
  parent_id: string
  name: string
  date_of_birth: string // ISO date string YYYY-MM-DD
  gender: 'male' | 'female' | 'prefer_not_to_say' | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface AgeStage {
  id: string
  label: string
  min_months: number
  max_months: number
  description: string | null
  display_order: number
}

export interface SkillCategory {
  id: string
  name: string
  description: string | null
  icon: string | null
  colour: string | null
  display_order: number
  active: boolean
}

export interface Skill {
  id: string
  category_id: string
  name: string
  description: string | null
  age_stage_id: string | null
  display_order: number
  active: boolean
  // joined
  category?: SkillCategory
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  price: number
  age_min_months: number
  age_max_months: number
  active: boolean
  created_at: string
  updated_at: string
  // joined
  skills?: Skill[]
  activities?: Activity[]
}

export interface Activity {
  id: string
  product_id: string
  name: string
  description: string | null
  instructions: string | null
  age_min_months: number
  age_max_months: number
  difficulty: number // 1-5
  sequence_order: number
  duration_mins: number | null
  active: boolean
  created_at: string
  updated_at: string
  // joined
  skills?: Skill[]
  product?: Product
}

export interface Order {
  id: string
  parent_id: string
  status: 'pending' | 'paid' | 'failed' | 'refunded'
  delivery_status: 'pending' | 'processing' | 'shipped' | 'delivered'
  subtotal: number
  total: number
  payment_ref: string | null
  created_at: string
  updated_at: string
  // joined
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  created_at: string
  // joined
  product?: Product
  child_assignment?: ChildProduct
}

export interface ChildProduct {
  id: string
  child_id: string
  order_item_id: string
  assigned_at: string
  active: boolean
}

export interface ChildActivity {
  id: string
  child_id: string
  activity_id: string
  completed: boolean
  completed_at: string | null
  notes: string | null
  duration_mins: number | null
  created_at: string
  updated_at: string
  // joined
  activity?: Activity
}

// ----- Computed/Application Types -----

export interface ChildWithAge extends Child {
  age_months: number
  age_display: string // e.g. "3 years 8 months"
  age_stage?: AgeStage
}

export interface SkillProgress {
  category: SkillCategory
  completed: number
  total: number
  percentage: number
}

export interface ChildDashboardData {
  child: ChildWithAge
  overall_progress: {
    completed: number
    total: number
    percentage: number
  }
  skill_progress: SkillProgress[]
  recent_completions: ChildActivity[]
  assigned_products: Product[]
  recommended_activities: Activity[]
}

// ----- API Response Types -----

export interface ApiSuccess<T> {
  data: T
  meta?: {
    count?: number
    page?: number
    per_page?: number
  }
}

export interface ApiError {
  error: string
  code?: string
  details?: unknown
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

// ----- Form Types -----

export interface CreateChildForm {
  name: string
  date_of_birth: string
  gender?: 'male' | 'female' | 'prefer_not_to_say'
}

export interface UpdateChildForm extends CreateChildForm {
  id: string
}

export interface UpdateProfileForm {
  full_name: string
}
