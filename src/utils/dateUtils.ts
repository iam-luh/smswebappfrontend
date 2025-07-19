
/**
 * Format date string to a more readable format
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Get date range for X days back from today
 */
export function getDateRange(days: number): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  };
}

/**
 * Get month name from month number
 */
export function getMonthName(monthNumber: number): string {
  const date = new Date();
  date.setMonth(monthNumber - 1);
  
  return date.toLocaleString('en-US', { month: 'short' });
}
