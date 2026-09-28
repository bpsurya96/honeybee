import os, re

def r(path, old, new):
    if not os.path.exists(path): return
    with open(path, 'r', encoding='utf-8') as f:
        c = f.read()
    c = c.replace(old, new)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(c)

# Cart Page
r('src/app/(protected)/cart/page.tsx', 
  'src={item.product.image_url || ''}', 
  'src={item.product.images?.[0]?.image_url || ''}')

# Child Detail Client
r('src/app/(protected)/children/[id]/ChildDetailClient.tsx',
  'src={product.image_url || ''}',
  'src={product.images?.[0]?.image_url || ''}')
r('src/app/(protected)/children/[id]/ChildDetailClient.tsx',
  '<Icon className="w-5 h-5 text-gray-400" />',
  '')
r('src/app/(protected)/children/[id]/ChildDetailClient.tsx',
  'const Icon = (Icons as any)[area.learning_area.icon || ''Activity''] || Icons.Activity;',
  '')

# Radar Chart
r('src/components/dashboard/SkillRadarChart.tsx',
  'd.category.name', 'd.learning_area.name')

# Cart Context
r('src/context/CartContext.tsx',
  'return [...current, { product, quantity }];',
  'return [...current, { product, quantity, is_gift: false }];')
r('src/context/CartContext.tsx',
  'const existing = current.find(item => item.product?.id === product.id);',
  'const existing = current.find(item => item.product?.id === product.id && !item.is_gift);')
r('src/context/CartContext.tsx',
  'item.product?.id === product.id',
  'item.product?.id === product.id && !item.is_gift')
  
print("Done")
