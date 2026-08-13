import type { Course, CountryCode } from '../types/course';

/**
 * Formats a course's price based on the resolved country code.
 * - For 'IN': Converts pricePaise -> INR (100 paise = ₹1). e.g., 199900 -> ₹1,999
 * - For 'US': Converts priceUsdCents -> USD (100 cents = $1). e.g., 3999 -> $39.99
 *
 * @param course - The course item containing pricePaise & priceUsdCents
 * @param countryCode - 'IN' or 'US'
 * @returns Formatted currency string
 */
export function formatCoursePrice(course: Course, countryCode: CountryCode): string {
  if (!course) return '';

  if (countryCode === 'IN') {
    // 100 paise = ₹1. Safe division to avoid floating point anomalies
    const rupees = Math.round(course.pricePaise) / 100;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(rupees);
  }

  // Default to US Dollars
  const dollars = course.priceUsdCents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars);
}

/**
 * Returns raw numeric value in standard units for sorting comparisons
 */
export function getComparablePrice(course: Course, countryCode: CountryCode): number {
  if (countryCode === 'IN') {
    return course.pricePaise / 100;
  }
  return course.priceUsdCents / 100;
}
