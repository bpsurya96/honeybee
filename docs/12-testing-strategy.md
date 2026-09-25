# 12 - Testing Strategy

## Testing Approach
- Unit tests: Jest + React Testing Library
- Integration tests: Vitest + Supabase test client
- E2E tests: Playwright (future)
- Manual testing for UI/UX

## Test Priorities

### Authentication
- Signup with valid email/password -> success
- Signup with existing email -> error
- Login with correct credentials -> success
- Login with incorrect password -> error
- Logout -> session cleared

### Children
- Create child with name + DOB -> success
- Create child without name -> validation error
- Edit child -> updated data returned
- Delete child -> child and all associated data removed
- Multiple children: parent sees all their children
- Cross-parent: Parent A cannot see Parent B's children

### Orders
- Create order -> order with items stored
- Assign product to child -> child_products record created
- View orders -> only own orders returned
- Cross-parent: Parent A cannot access Parent B's orders

### Activities
- View activities for assigned product -> correct list
- Mark activity complete -> child_activities record updated
- Unmark activity -> record updated
- Cross-parent: Parent A cannot mark activity for Parent B's child

### Progress
- Calculate overall progress: completed/total
- Calculate skill progress per category
- Two children have independent progress records

### Recommendations
- Recommendations are from owned products only
- Recommendations are age-appropriate
- Completed activities are not recommended again

### AI Coach
- Context builder includes correct child data
- Context builder does NOT include other children's data
- AI response does not contain invented product names
- AI response does not contain invented progress percentages
- Cross-parent: Parent A cannot see Parent B's conversation

### Security
- Unauthenticated request to protected route -> 401
- Parent A token + Parent B's child ID -> 403 or 404
- Parent A token + Parent B's order ID -> 403 or 404
- SQL injection attempts -> rejected by Zod validation

## Test Data
Use separate test Supabase project or use test user accounts.
Never run tests against production database.

## Coverage Targets
- Services/business logic: 80%+
- API routes: 70%+
- UI components: key flows only
