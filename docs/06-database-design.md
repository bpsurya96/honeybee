# 06 - Database Design

## Design Principles
- Every parent-owned table has a user_id column linked to auth.users
- RLS policies enforce data isolation between parents
- No progress percentages stored - always calculated from completion data
- Age is never stored - always calculated from date_of_birth
- Timestamps on every table (created_at, updated_at)

## Core Entities

### profiles
Extension of auth.users for parent profile data.
```
id          uuid PK FK auth.users.id
full_name   text
avatar_url  text
created_at  timestamptz
updated_at  timestamptz
```
RLS: user can only read/write their own row.

### children
```
id              uuid PK
parent_id       uuid FK profiles.id
name            text NOT NULL
date_of_birth   date NOT NULL
gender          text CHECK (male, female, prefer_not_to_say)
avatar_url      text
created_at      timestamptz
updated_at      timestamptz
```
RLS: parent can only access children where parent_id = auth.uid()

### age_stages
Reference table - no RLS needed (read-only by all).
```
id              uuid PK
label           text (e.g. "0-6 months")
min_months      integer
max_months      integer
description     text
display_order   integer
```

### skill_categories
Reference table.
```
id              uuid PK
name            text (e.g. "Fine Motor Skills")
description     text
icon            text
colour          text
display_order   integer
active          boolean
```

### skills
```
id                  uuid PK
category_id         uuid FK skill_categories.id
name                text
description         text
age_stage_id        uuid FK age_stages.id
display_order       integer
active              boolean
```

### products
```
id              uuid PK
name            text
slug            text UNIQUE
description     text
image_url       text
price           numeric(10,2)
age_min_months  integer
age_max_months  integer
active          boolean
created_at      timestamptz
updated_at      timestamptz
```
No parent-level RLS - products are global catalogue.

### product_skills (join table)
```
product_id      uuid FK products.id
skill_id        uuid FK skills.id
PRIMARY KEY (product_id, skill_id)
```

### activities
```
id              uuid PK
product_id      uuid FK products.id
name            text
description     text
instructions    text
age_min_months  integer
age_max_months  integer
difficulty      integer CHECK (1-5)
sequence_order  integer
duration_mins   integer
active          boolean
created_at      timestamptz
updated_at      timestamptz
```

### activity_skills (join table)
```
activity_id     uuid FK activities.id
skill_id        uuid FK skills.id
PRIMARY KEY (activity_id, skill_id)
```

### orders
```
id              uuid PK
parent_id       uuid FK profiles.id
status          text CHECK (pending, paid, failed, refunded)
delivery_status text CHECK (pending, processing, shipped, delivered)
subtotal        numeric(10,2)
total           numeric(10,2)
payment_ref     text
created_at      timestamptz
updated_at      timestamptz
```
RLS: parent can only access their own orders.

### order_items
```
id              uuid PK
order_id        uuid FK orders.id
product_id      uuid FK products.id
quantity        integer
unit_price      numeric(10,2)
created_at      timestamptz
```
RLS: accessible if the parent owns the order.

### child_products (assignment of product to child)
```
id              uuid PK
child_id        uuid FK children.id
order_item_id   uuid FK order_items.id
assigned_at     timestamptz
active          boolean
```
This is the correct model: Parent -> Order -> Product -> Child Assignment.
RLS: parent can only access where parent owns child.

### child_activities (activity completion tracking)
```
id              uuid PK
child_id        uuid FK children.id
activity_id     uuid FK activities.id
completed       boolean DEFAULT false
completed_at    timestamptz
notes           text
duration_mins   integer
created_at      timestamptz
updated_at      timestamptz
UNIQUE (child_id, activity_id)
```
RLS: parent can only access their own children's records.

### learning_sessions
```
id              uuid PK
child_id        uuid FK children.id
started_at      timestamptz
ended_at        timestamptz
notes           text
activities_done uuid[] (array of activity_ids)
```

### ai_conversations
```
id              uuid PK
parent_id       uuid FK profiles.id
child_id        uuid FK children.id
title           text
created_at      timestamptz
updated_at      timestamptz
```
RLS: parent can only see their own conversations.

### ai_messages
```
id              uuid PK
conversation_id uuid FK ai_conversations.id
role            text CHECK (user, assistant, system)
content         text
created_at      timestamptz
```

### recommendations
```
id              uuid PK
child_id        uuid FK children.id
recommended_activity_id uuid FK activities.id
recommended_product_id  uuid FK products.id (nullable)
reason          text
score           numeric
generated_at    timestamptz
viewed          boolean
clicked         boolean
```
RLS: parent can only see recommendations for their children.

## Indexes
- children: parent_id
- child_activities: child_id, activity_id, (child_id, completed)
- activities: product_id, age_min_months, age_max_months
- orders: parent_id
- ai_conversations: parent_id, child_id

## Migration Strategy
All schema changes via Supabase migrations (supabase/migrations/).
Never alter prod schema manually.
