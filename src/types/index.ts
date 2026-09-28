// ============================================================
// HoneyBee Learning - Core TypeScript Types
// ============================================================

// ----- Database Row Types -----

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  ai_credits: number
  created_at: string
  updated_at: string
}

export interface AdminUser {
  user_id: string
  created_at: string
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
  name: string
  min_months: number
  max_months: number
  description: string | null
  created_at: string
}

export interface LearningArea {
  id: string
  name: string
  description: string | null
  active: boolean
  display_order: number
  created_at: string
}

export interface Skill {
  id: string
  learning_area_id: string
  name: string
  description: string | null
  created_at: string
  // joined
  learning_area?: LearningArea
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  min_age_months: number
  max_age_months: number
  active: boolean
  created_at: string
  updated_at: string
  // joined
  skills?: Skill[]
  activities?: Activity[]
  images?: ProductImage[]
}

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  alt_text: string | null
  display_order: number
  is_primary: boolean
  created_at: string
}

export interface Activity {
  id: string
  product_id: string
  title: string
  description: string | null
  display_order: number
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
  status: string
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  delivery_status: string
  mobile_number?: string | null
  delivery_address?: string | null
  delivery_city?: string | null
  delivery_state?: string | null
  delivery_pincode?: string | null
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
  is_gift: boolean
  recipient_child_id?: string | null
  created_at: string
  // joined
  product?: Product
  recipient_child?: Child
}

export interface AiCreditTransaction {
  id: string
  parent_id: string
  order_id?: string | null
  amount: number
  reason: string
  status: string
  created_at: string
}

export interface ChildProduct {
  id: string
  child_id: string
  product_id: string
  order_item_id: string
  active: boolean
  created_at: string
  updated_at: string
  // joined
  product?: Product
}

export interface ChildActivity {
  child_id: string
  activity_id: string
  completed: boolean
  completed_at: string | null
  duration_mins: number | null
  notes: string | null
  created_at: string
  updated_at: string
  // joined
  activity?: Activity
}

export interface AiConversation {
  id: string
  parent_id: string
  child_id?: string | null
  title: string | null
  created_at: string
  updated_at: string
}

export interface AiMessage {
  id: string
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  created_at: string
}

// ----- Computed/Application Types -----

export interface ChildWithAge extends Child {
  age_months: number
  age_display: string // e.g. "3 years 8 months"
  age_stage?: AgeStage
}

export interface LearningAreaProgress {
  learning_area: LearningArea
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
  learning_area_progress: LearningAreaProgress[]
  recent_completions: ChildActivity[]
  assigned_products: Product[]
  recommended_activities: Activity[]
}

// ----- Cart Types -----
export interface CartItem {
  product: Product
  quantity: number
  is_gift: boolean
  recipient_child_id?: string | null
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
