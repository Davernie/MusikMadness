/**
 * Date formatting utilities for consistent 24-hour clock format
 */

/**
 * Formats a date to "HH:MM Month DD" format (24-hour clock)
 * Example: "23:45 June 15"
 */
export const formatDateTime = (dateInput: string | Date): string => {
  const date = new Date(dateInput);
  
  const time = date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  const dateStr = date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric'
  });
  
  return `${time} ${dateStr}`;
};

/**
 * Formats a date to "HH:MM Month DD, YYYY" format (24-hour clock)
 * Example: "23:45 June 15, 2024"
 */
export const formatDateTimeWithYear = (dateInput: string | Date): string => {
  const date = new Date(dateInput);
  
  const time = date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  const dateStr = date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  
  return `${time} ${dateStr}`;
};

/**
 * Formats a date to just the date part "Month DD, YYYY"
 * Example: "June 15, 2024"
 */
export const formatDateOnly = (dateInput: string | Date): string => {
  const date = new Date(dateInput);
  
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Formats a date to just the time part "HH:MM" (24-hour clock)
 * Example: "23:45"
 */
export const formatTimeOnly = (dateInput: string | Date): string => {
  const date = new Date(dateInput);
  
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}; 