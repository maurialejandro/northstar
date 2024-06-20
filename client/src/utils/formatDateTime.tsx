export function formatDateTime(dateString: string | null): string {
  const date = new Date(dateString!);

  // Options for formatting date and time
  const formatOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };

  // Format the date and time using Intl.DateTimeFormat
  return new Intl.DateTimeFormat('en-US', formatOptions).format(date);
}
