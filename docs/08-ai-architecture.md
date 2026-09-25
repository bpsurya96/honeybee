# 08 - AI Architecture

## HoneyBee Coach

The AI coach is a specialised parent-facing educational assistant.

It does NOT have direct database access.
It receives structured context from the application layer.

## Architecture

```
Parent Question
    |
    v
API Route: /api/coach/conversations/:id/messages
    |
    v
Auth check + rate limiting
    |
    v
Child Context Builder
    - child profile (name, DOB, age, gender)
    - age stage
    - assigned products
    - recent activities completed
    - skill progress summary
    - available/recommended activities
    |
    v
Recommendation Engine (deterministic)
    - recommended activities
    - skill gaps
    - next products
    |
    v
Prompt Builder
    - system prompt (HoneyBee Coach persona + safety constraints)
    - structured context (from Context Builder)
    - conversation history (last N messages)
    - parent question
    |
    v
LLM API Call (Gemini / OpenAI)
    |
    v
Response Validator
    - check for medical/diagnostic claims
    - check for invented product names
    - check for invented progress data
    |
    v
Store in ai_messages table
    |
    v
Return to parent
```

## System Prompt (HoneyBee Coach Persona)

Key constraints embedded in system prompt:
1. You are HoneyBee Coach, an educational assistant for parents of young children.
2. You help parents understand learning activities and support their child's development.
3. You MUST NOT diagnose developmental conditions.
4. You MUST NOT present as a medical or psychological professional.
5. You MUST NOT invent products, prices, or activities.
6. All product references must come from the structured context provided.
7. All progress references must come from the structured context provided.
8. Frame all guidance as educational recommendations.
9. If health concerns are raised, recommend consulting a qualified professional.
10. Keep responses clear, warm, and encouraging for parents.

## Context Builder

The context builder queries:
1. profiles - parent name
2. children - child name, DOB (calculate age), gender
3. child_products + products - owned products
4. child_activities + activities + activity_skills - completion and skills
5. skill_categories + skills - skill framework
6. recommendations - current recommendations

The context builder produces a structured object that is serialised into the prompt.
The LLM never queries the database directly.

## Recommendation Engine (Pre-AI Layer)

Must function without AI. Outputs:
- next_activities: activities not yet completed, in age range, for owned products
- skill_focus: skill categories with lowest completion rate
- next_products: products in age range not yet owned (for upsell)

Sorting: by sequence_order, then difficulty, then age appropriateness.

## LLM Provider

Initial: Google Gemini (gemini-1.5-flash or similar)
Fallback: OpenAI GPT-4o

Provider is isolated behind an interface. Switching requires changing one file.

## Safety

- Input sanitisation before sending to LLM
- Output validation before returning to client
- Conversation stored per parent - no cross-parent access
- Rate limiting: 20 messages per hour per parent
- Max context size enforced to control costs

## Cost Management

- Use efficient models for routine queries
- Cache recommendations (invalidate on activity completion)
- Limit conversation history sent to context (last 10 messages)
- Summarise long histories rather than sending full context
