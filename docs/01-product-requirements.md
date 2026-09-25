# 01 - Product Requirements

## MVP Scope

### Parent Account
Parents must be able to:
- Register with email and password
- Login / Logout
- Manage their profile (name, email, avatar)
- Manage multiple child profiles
- View their orders

### Child Profiles
A parent can create multiple children. Each child has:
- Name (required)
- Date of birth (required)
- Age (calculated from DOB - never stored)
- Gender (optional)
- Profile photo (optional)
- Created date

Architecture: One parent -> Many children

### Product & Order System
A learning product can represent:
- Activity book
- Workbook
- Learning kit
- Digital learning product (future)

Product attributes:
- Name
- Description
- Age range (min/max months)
- Product image
- Price
- Active/inactive status
- Skills covered (many-to-many via product_skills)
- Activities (one-to-many)

Order attributes:
- Parent (FK)
- Order date
- Payment status (pending, paid, failed, refunded)
- Delivery status (pending, shipped, delivered)
- Order items (line items with product + quantity)
- Child assignment per order item

### Learning Framework
Skill categories (stored as data, not hardcoded):
- Fine Motor Skills
- Language and Communication
- Early Numeracy
- Cognitive Skills
- Problem Solving
- Creativity
- Pre-writing
- Sensory Exploration
- Social and Emotional Learning

### Age/Stage Model
Stored as data:
- 0-6 months
- 6-12 months
- 1-2 years
- 2-3 years
- 3-4 years
- 4-5 years

### Activities
Each product contains multiple activities. Activity attributes:
- Name
- Description
- Product (FK)
- Skills (many-to-many via activity_skills)
- Age range (min/max months)
- Difficulty (1-5)
- Sequence/order number
- Estimated duration (minutes)
- Instructions
- Active/inactive status
- Created/updated timestamps

### Child Progress
Track activity completion per child:
- Child -> Activity -> Completed (boolean + timestamp)
- Calculate overall progress: completed / assigned
- Calculate skill-level progress per child

### Parent Dashboard
After login, parent sees:
- All children (with ages, quick stats)
- Ability to switch between children
- Per-child dashboard showing:
  - Name and age
  - Overall learning progress
  - Skill-area progress
  - Recently completed activities
  - Assigned products
  - Recommended next activities
  - AI Coach entry point

### AI Learning Coach (Phase 6)
The HoneyBee Coach helps parents:
- Understand what to practise next
- Which activities are age-appropriate
- How to use an activity
- What skills are being practised
- What products may be relevant next

AI constraints:
- Must not present as doctor/psychologist/diagnostician
- Must not diagnose developmental conditions
- Must frame guidance as educational recommendations only
- Must use structured application data - never invent products or progress

## Out of Scope (MVP)
- Native mobile app
- Push notifications
- WhatsApp integration
- Daily learning plans
- AI-generated activities
- Photo-based activity verification
- Voice interaction
- Multilingual support
- School/teacher accounts
- Learning reports/certificates
- Subscription plans
