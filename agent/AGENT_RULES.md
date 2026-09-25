# Agent Rules — HoneyBee Learning

## MANDATORY: Read These Files First

Before beginning any significant development task, always read:
1. /agent/AGENT_RULES.md (this file)
2. /agent/CURRENT_STATUS.md
3. /docs/00-project-overview.md
4. /docs/05-technical-architecture.md

## General Rules

### Architecture
- Never make large architectural changes without checking the documentation
- Never delete existing functionality without understanding its purpose
- Never introduce unnecessary dependencies
- Prefer simple, maintainable architecture
- Check /docs/15-decision-log.md before making a significant architectural decision

### Code Quality
- Follow TypeScript strict mode
- Use reusable components
- Keep business logic separate from UI (use services layer)
- Handle loading, error, and empty states in every UI component
- No magic strings or hardcoded IDs
- No hardcoded user data or progress values

### Security
- Never hardcode sensitive credentials
- Never expose API keys to the browser
- Use environment variables for all secrets
- Validate user input at API boundary (Zod)
- Apply least-privilege principles
- Always check ownership before returning or modifying data
- Design with RLS in mind from day one

### Database
- Keep database access centralised (services layer)
- Never scatter direct DB queries throughout components
- Never store derived values (age, progress %) directly
- Age: always calculated from date_of_birth
- Progress: always calculated from completion data

### AI
- Do not invent data, products, activities, or learning outcomes
- Keep AI recommendations grounded in structured application data
- Context builder must validate its own output before passing to AI
- AI has no direct database access - all context is prepared by the app

### Documentation
- Update /agent/CURRENT_STATUS.md after every major task
- Update /agent/TODO.md after completing or adding tasks
- Record architectural decisions in /docs/15-decision-log.md
- Keep /docs/06-database-design.md in sync with actual schema

## Working Style

1. Read documentation first
2. Determine current phase from CURRENT_STATUS.md
3. Check TODO.md
4. Implement the smallest logical unit of work
5. Run lint/tests/build
6. Fix errors
7. Update documentation
8. Continue to the next logical task

## When to Ask the User

Ask ONLY when:
- A business decision is genuinely ambiguous
- Multiple architectural choices have materially different consequences
- Required credentials or configuration are missing
- A destructive action requires confirmation (e.g., deleting production data)
- A requirement cannot reasonably be inferred

Do NOT ask the user for direction when the answer is in the roadmap or TODO.

## Definition of Done

A feature is complete when:
- [ ] Code implemented
- [ ] UI implemented (where applicable)
- [ ] Database schema implemented (where applicable)
- [ ] Input validation implemented
- [ ] Security/ownership checks in place
- [ ] Loading, error, empty states handled
- [ ] Tests written (where applicable)
- [ ] Lint passes
- [ ] Build passes
- [ ] Documentation updated
- [ ] TODO.md updated
- [ ] CURRENT_STATUS.md updated

## Phase Order

Always follow the defined phase order:
Phase 0 -> Phase 1 -> Phase 2 -> Phase 3 -> Phase 4 -> Phase 5 -> Phase 6 -> Phase 7 -> Phase 8 -> Phase 9

Do not skip phases or implement Phase N+2 features while Phase N is incomplete.
