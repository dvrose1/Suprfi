// ABOUTME: Formatting utilities for display values
// ABOUTME: Includes currency, service type, and other display formatting

/**
 * Formats a number as US currency with commas.
 * Only shows decimals if there are actual cents (e.g., $1,234 or $1,234.56)
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '$0';
  
  const hasCents = amount % 1 !== 0;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(amount);
}

/**
 * Formats a service type for display
 * HVAC should always be uppercase, others are capitalized
 */
export function formatServiceType(serviceType: string | null | undefined): string {
  if (!serviceType) return '';
  
  const lower = serviceType.toLowerCase();
  if (lower === 'hvac') return 'HVAC';
  
  // Capitalize first letter of each word
  return serviceType
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
