# 03 - User Flows

## Primary User Journey

Landing Page
  -> Create Account / Login
    -> Parent Profile
      -> Create Child
        -> Child Dashboard
          -> View Purchased Products
            -> Assign Product to Child
              -> View Activities
                -> Complete Activity
                  -> Progress Updated
                    -> AI Coach
                      -> Next Recommended Activity
                        -> Recommended Product
                          -> Purchase

## First-Time User Experience

1. Land on homepage
2. Click "Get Started"
3. Create account (email + password)
4. Onboarding: "Add your first child"
5. Enter child name + date of birth
6. System calculates age stage
7. Parent sees child dashboard
8. "Start Learning" - shows available activities

## Authentication Flow

Unauthenticated user -> any protected route -> redirect to /login
After login -> redirect to /dashboard
After signup -> redirect to onboarding (add first child)
Logout -> redirect to / (landing page)

## Child Management Flow

My Children page -> Add Child button
-> Child form (name, DOB, gender optional, photo optional)
-> Save -> child appears in list
-> Click child -> child dashboard
-> Edit child -> pre-filled form
-> Delete child -> confirmation dialog

## Activity Completion Flow

Child dashboard -> Today's Activities
-> Click activity -> Activity detail
-> Parent reads instructions
-> Marks as complete
-> Progress updates immediately
-> Next recommended activity shown

## AI Coach Flow

Child dashboard -> "Ask HoneyBee Coach"
-> Chat opens with child context pre-loaded
-> Parent types question
-> AI responds with grounded recommendations
-> Parent can ask follow-up questions
-> Links to activities and products in response

## Order / Product Assignment Flow

Products page -> Product detail -> Purchase
-> Checkout -> Payment
-> Order created -> Order confirmation
-> "Assign to a child" prompt
-> Select child -> Product assigned
-> Activities unlock for that child

OR (for existing orders):
My Orders -> Order detail
-> Assign product to child
