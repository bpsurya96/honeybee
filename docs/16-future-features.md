# 16 - Future Features

These features are documented but NOT currently planned for implementation.
They should be considered when making architectural decisions to avoid painting the system into a corner.

## Mobile App
- React Native / Expo app
- Same Supabase backend
- Requires: clean API layer (no Next.js-specific patterns in business logic)

## Push Notifications
- Activity reminders
- Progress milestones
- New product announcements

## WhatsApp Integration
- Send daily activity suggestions via WhatsApp
- Requires: WhatsApp Business API

## Daily Learning Plans
- AI-generated or rule-generated daily plan
- Parent sees a morning plan for their child

## AI-Generated Activities
- AI generates custom activities based on child profile
- Requires: strong grounding and safety controls

## Photo-Based Activity Verification
- Parent uploads photo of child doing activity
- AI validates completion
- Requires: image analysis capabilities

## Voice Interaction
- Parent speaks to HoneyBee Coach
- Requires: speech-to-text + text-to-speech integration

## Multilingual Support
- Hindi, Tamil, Telugu, Bengali (for Indian market)
- i18n framework required from the start if this is a near-term goal

## Multiple Countries / Currencies
- Requires: currency handling, tax, localisation

## Subscription Plans
- Monthly/annual subscription for digital access
- Requires: subscription billing integration

## School Accounts
- Teacher login
- Class management
- Student (child) progress for classroom use

## Learning Reports
- Printable PDF progress reports
- Weekly/monthly summaries

## Certificates
- Milestone completion certificates
- Requires: PDF generation

## Advanced Analytics
- Cohort analysis
- Activity engagement rates
- Skill progression trends

## Recommendation ML Models
- Replace deterministic rules with trained ML model
- Requires: sufficient training data (many users, many completions)
