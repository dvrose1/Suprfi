// ABOUTME: Formatting utilities for display values

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
