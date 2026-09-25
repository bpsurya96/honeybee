import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes without conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculate age in months from a date of birth
 */
export function calculateAgeMonths(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth)
  const now = new Date()
  const months =
    (now.getFullYear() - dob.getFullYear()) * 12 +
    (now.getMonth() - dob.getMonth())
  return Math.max(0, months)
}

/**
 * Format age in months to a human-readable string
 * e.g. "3 years 8 months", "8 months", "1 year"
 */
export function formatAge(months: number): string {
  if (months < 1) return 'Newborn'
  if (months < 12) {
    return `${months} ${months === 1 ? 'month' : 'months'}`
  }
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12
  if (remainingMonths === 0) {
    return `${years} ${years === 1 ? 'year' : 'years'}`
  }
  return `${years} ${years === 1 ? 'year' : 'years'} ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`
}

/**
 * Format a date string to a human-readable date
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Format a currency amount
 */
export function formatCurrency(amount: number, currency = 'GBP'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Calculate progress percentage (safe division)
 */
export function calculatePercentage(completed: number, total: number): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

/**
 * Truncate text to a max length
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Get initials from a name (up to 2 characters)
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}


export function formatAgeRange(minMonths: number, maxMonths: number): string {
  if (minMonths === 0 && maxMonths === 6) return '0-6m'
  if (minMonths === 6 && maxMonths === 12) return '6-12m'
  
  const minYears = Math.floor(minMonths / 12)
  const maxYears = Math.floor(maxMonths / 12)
  
  if (minYears === maxYears) return `${minYears}y+`
  return `${minYears}-${maxYears}y`
}
