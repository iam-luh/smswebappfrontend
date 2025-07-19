
/**
 * Converts an array of objects to a CSV string
 * @param data Array of objects to convert to CSV
 * @returns CSV string
 */
export const convertToCSV = (data: Record<string, unknown>[]): string => {
  if (data.length === 0) return '';
  
  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV header row
  const headerRow = headers.join(',');
  
  // Create CSV rows for data
  const rows = data.map(obj => {
    return headers.map(header => {
      // Handle values that might contain commas or quotes
      const value = obj[header] === null || obj[header] === undefined ? '' : obj[header];
      const valueStr = String(value).replace(/"/g, '""'); // Escape double quotes by doubling them
      
      // Wrap in quotes if value contains commas, quotes, or newlines
      return /[",\n\r]/.test(valueStr) ? `"${valueStr}"` : valueStr;
    }).join(',');
  });
  
  // Combine header row and data rows
  return [headerRow, ...rows].join('\n');
};

/**
 * Downloads data as a CSV file
 * @param data Array of objects to convert to CSV
 * @param filename Name of the file to download (without extension)
 */
export const downloadCSV = (data: Record<string, unknown>[], filename: string): void => {
  const csvString = convertToCSV(data);
  
  // Create blob from CSV string
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link
  const link = document.createElement('a');
  
  // Create object URL
  const url = URL.createObjectURL(blob);
  
  // Setup link properties
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  // Add link to document, click it, then remove it
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
