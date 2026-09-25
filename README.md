# HoneyBee Learning ??

> **A Parent-Focused Personalised Learning Journey for Young Children (Ages 0-5)**

HoneyBee Learning is a modern, premium web application built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase**. It helps parents track their children's development, manage activity kits, and receive AI-driven parenting advice.

---

## ?? Key Features

1. **Parent & Child Profiles**
   - Secure parent authentication using Supabase.
   - Manage multiple child profiles with custom avatars, DOB, and specific learning tracks.
2. **Product Catalog & Activities**
   - Browse age-appropriate developmental kits.
   - Activities mapped to distinct skill categories (Cognitive, Motor, Social, etc.).
3. **Child Assignment Engine**
   - Purchase kits (Orders) and assign them directly to a specific child's library.
4. **Learning Progress & Skills Tracking**
   - Parents can mark activities as "Complete".
   - Real-time **Radar/Spiderweb Charts** visually map the child's skill mastery.
5. **AI Coach (Powered by Gemini)**
   - RAG-powered chat interface that knows the parent's children, their ages, and suggests age-appropriate, offline activities and parenting advice.

---

## ?? Tech Stack

- **Framework**: Next.js 16 (React 19)
- **Styling**: Tailwind CSS, Lucide Icons, Recharts (Radar charts)
- **Database & Auth**: Supabase (PostgreSQL)
- **AI**: Vercel AI SDK + Google Gemini 2.5 Pro
- **Language**: TypeScript

---

## ?? Getting Started

### 1. Prerequisites
- Node.js >= 20.x
- A Supabase Project (Database + Auth setup)
- A Google Gemini API Key

### 2. Environment Setup
Copy the example environment file and fill in your credentials:
```bash
cp .env.example .env.local
```

Ensure you have the following populated in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Database Seeding
To populate the database with the initial products, activities, and skills, run the seed script:
*(Make sure your `.env.local` has the `SUPABASE_SERVICE_ROLE_KEY`)*
```bash
node scripts/seed.js
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## ?? Testing the Application (Dev Tools)

If you are testing the app locally and want to skip the Stripe integration, navigate to the **Orders** page (`/orders`). 
If you have no orders, click the **"Seed Demo Order (Dev)"** button. This will automatically inject a paid order into your account so you can immediately assign kits to your children and track their progress!

---

## ?? UI/UX Philosophy
HoneyBee Learning employs a warm, playful, yet premium aesthetic. We use **Amber** and **Emerald** brand colours, soft rounded corners (`rounded-3xl`), subtle box shadows, and dynamic micro-animations to create a delightful experience for parents.

