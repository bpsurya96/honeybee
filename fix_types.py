import os
import re

def replace_in_file(path, old, new):
    if not os.path.exists(path): return
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace(old, new)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# Cart Page
replace_in_file('src/app/(protected)/cart/page.tsx', 
                'src={item.product.image_url || ''}', 
                'src={item.product.images?.[0]?.image_url || ''}')

# Child Detail Client
replace_in_file('src/app/(protected)/children/[id]/ChildDetailClient.tsx',
                'SkillCategory', 'LearningArea')
replace_in_file('src/app/(protected)/children/[id]/ChildDetailClient.tsx',
                'src={product.image_url || ''}',
                'src={product.images?.[0]?.image_url || ''}')

# Products Page
replace_in_file('src/app/(protected)/products/[id]/page.tsx',
                '{activity.name}', '{activity.title}')
replace_in_file('src/app/(protected)/products/[id]/page.tsx',
                'activity.duration_mins', 'false') # lazy hack to remove it from rendering conditionally
replace_in_file('src/app/(protected)/products/[id]/page.tsx',
                '{activity.duration_mins} mins', '')
replace_in_file('src/app/(protected)/products/[id]/page.tsx',
                'difficulty:', '/* difficulty: */')
replace_in_file('src/app/(protected)/products/[id]/page.tsx',
                'activity.difficulty', '1')

# Activity Card
replace_in_file('src/components/activities/ActivityCard.tsx',
                '{activity.name}', '{activity.title}')
replace_in_file('src/components/activities/ActivityCard.tsx',
                'activity.duration_mins', 'false')
replace_in_file('src/components/activities/ActivityCard.tsx',
                '{activity.duration_mins} mins', '')

# Dashboard Radar Chart
replace_in_file('src/components/dashboard/SkillRadarChart.tsx',
                'SkillProgress', 'LearningAreaProgress')
replace_in_file('src/components/dashboard/SkillRadarChart.tsx',
                'skill_progress', 'learning_area_progress')

# Product Card
replace_in_file('src/components/products/ProductCard.tsx',
                'product.image_url', 'product.images?.[0]?.image_url')
replace_in_file('src/components/products/ProductCard.tsx',
                'product.age_min_months', 'product.min_age_months')
replace_in_file('src/components/products/ProductCard.tsx',
                'product.age_max_months', 'product.max_age_months')

# Cart Context
replace_in_file('src/context/CartContext.tsx',
                'return [...current, { product, quantity: 1 }];',
                'return [...current, { product, quantity: 1, is_gift: false }];')
replace_in_file('src/context/CartContext.tsx',
                'const existingItem = current.find(item => item.product.id === product.id);',
                'const existingItem = current.find(item => item.product.id === product.id && item.is_gift === false);')
replace_in_file('src/context/CartContext.tsx',
                'item.product.id === product.id\n            ? { ...item, quantity: item.quantity + 1 }',
                'item.product.id === product.id && item.is_gift === false\n            ? { ...item, quantity: item.quantity + 1 }')

print("Fixes applied.")
