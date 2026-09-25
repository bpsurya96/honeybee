# TODO

## Phase 0 & 1
- [x] Foundation (Complete)
- [x] Parent + Children (Complete)

## Phase 2 - Products + Activities
- [x] Product listing page with real data
- [x] Product card component
- [x] Product detail page
- [x] Activity list (within product)
- [x] Activity detail component
- [x] Skills display (badge components)
- [x] Age range display component
- [x] Verify seed data (3+ products with activities and skills)
- [x] Update CURRENT_STATUS.md

## Phase 3 - Orders
- [ ] Orders list page with real data
- [ ] Order detail page
- [ ] Order item with child assignment UI
- [ ] Assign product to child functionality
- [ ] My Library view (child's products)
- [ ] Order service (server-side)
- [ ] Seed sample orders for demo parent
- [ ] Update CURRENT_STATUS.md

## Phase 4 - Learning Progress
- [ ] Mark activity complete (button on activity detail)
- [ ] Activity completion API route
- [ ] Activity history list
- [ ] Overall progress calculation service
- [ ] Skill progress calculation service
- [ ] Child dashboard with real progress bars
- [ ] Progress bar components with animation
- [ ] Skill progress grid
- [ ] Recently completed activities list
- [ ] Seed sample completions for demo children
- [ ] Tests: progress calculation accuracy
- [ ] Update CURRENT_STATUS.md

## Phase 5 - Recommendation Engine
- [ ] Recommendation service (deterministic, no AI)
- [ ] Input: child context (age, skills, completed, owned products)
- [ ] Output: next activities, skill gaps, next products
- [ ] Dashboard: recommended next activities section
- [ ] Dashboard: next product suggestion
- [ ] Tests: recommendation engine logic
- [ ] Update CURRENT_STATUS.md

## Phase 6 - AI Coach
- [ ] AI service layer (isolated, provider-agnostic interface)
- [ ] Child context builder
- [ ] Prompt builder with system prompt and safety constraints
- [ ] AI conversations API route
- [ ] AI messages API route (with rate limiting)
- [ ] Coach chat UI
- [ ] Safety filter / response validator
- [ ] Tests: context builder produces correct context
- [ ] Tests: no cross-parent data leakage
- [ ] Update CURRENT_STATUS.md
