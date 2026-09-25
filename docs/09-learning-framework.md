# 09 - Learning Framework

## Design Principles
- All learning data is stored in the database, not hardcoded in UI
- The framework is extensible (add categories, skills, stages at any time)
- Activities map to skills; skills map to categories
- Progress is always calculated from completion data

## Skill Categories (Initial)

1. Fine Motor Skills
   - Grasping, pinching, tracing, cutting, threading

2. Language and Communication
   - Listening, speaking, vocabulary, storytelling, pre-reading

3. Early Numeracy
   - Counting, number recognition, sorting, patterns, measurement

4. Cognitive Skills
   - Memory, attention, sequencing, categorisation, reasoning

5. Problem Solving
   - Puzzles, cause-effect, trial and error, spatial reasoning

6. Creativity
   - Art, imagination, music, open-ended play

7. Pre-writing
   - Pencil grip, line tracing, shape drawing, letter formation

8. Sensory Exploration
   - Touch, texture, sound, smell, sight activities

9. Social and Emotional Learning
   - Sharing, empathy, turn-taking, self-regulation, emotions

## Age Stages

| Stage | Age Range | Min Months | Max Months |
|-------|-----------|------------|------------|
| Newborn | 0-6 months | 0 | 5 |
| Baby | 6-12 months | 6 | 11 |
| Toddler Early | 1-2 years | 12 | 23 |
| Toddler | 2-3 years | 24 | 35 |
| Pre-schooler | 3-4 years | 36 | 47 |
| Pre-kindergarten | 4-5 years | 48 | 59 |

## Activity Framework

Each activity:
- Belongs to one product
- Has one or more skill associations (activity_skills)
- Has a recommended age range (min/max months)
- Has a difficulty level (1=easiest, 5=hardest)
- Has a sequence order within its product
- Has an estimated duration

## Progress Calculation

### Overall Progress (per child, per product)
completed_activities / total_activities_in_assigned_products

### Skill Progress (per child, per category)
count(completed activities that include a skill in this category) /
count(all assigned activities that include a skill in this category)

Never store percentages. Always calculate on demand or cache with invalidation.

## Recommendation Logic (Phase 5)

Priority order for next activity recommendation:
1. Not yet completed by this child
2. In child's age range
3. From an assigned product
4. Next in sequence order
5. Skill category with lowest completion rate (fill gaps)

For next product recommendation:
1. Products in child's current age range
2. Not yet owned by parent
3. Cover skill categories with lowest completion

## Extensibility

To add a new skill category:
1. Insert into skill_categories table
2. Insert relevant skills into skills table
3. Map activities to new skills via activity_skills
No code changes required.

To add a new age stage:
1. Insert into age_stages table
2. Update product and activity age ranges as needed
No code changes required.
