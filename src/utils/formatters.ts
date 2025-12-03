// Format decimal numbers
export const formatMetric = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'N/A';
  return value.toFixed(4);
};

// Format percentage
export const formatPercent = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'N/A';
  return `${(value * 100).toFixed(2)}%`;
};

// Format time duration
export const formatDuration = (duration: string | null | undefined): string => {
  if (!duration) return 'N/A';
  // Parse PostgreSQL interval format
  const match = duration.match(/(\d+):(\d+):(\d+)/);
  if (match) {
    const [_, hours, minutes, seconds] = match;
    if (hours !== '00') return `${hours}h ${minutes}m`;
    if (minutes !== '00') return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  }
  return duration;
};

// Format date
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// Get improvement color class
export const getImprovementColor = (value: number): string => {
  if (value > 0) return 'text-green-600';
  if (value < 0) return 'text-red-600';
  return 'text-gray-600';
};