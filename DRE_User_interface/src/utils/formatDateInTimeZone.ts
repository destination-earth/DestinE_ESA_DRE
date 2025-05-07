export const formatDateInTimezone = (
  dateString: string,
  timezoneOffset = 0,
) => {
  // Create a date object
  const date = new Date(dateString);

  // Get the current timezone offset in minutes and add the desired offset
  const offsetInMs =
    (date.getTimezoneOffset() + timezoneOffset * 60) * 60 * 1000;

  // Adjust the date based on the offset
  const adjustedDate = new Date(date.getTime() + offsetInMs);

  // Format the adjusted date using date-fns or native JavaScript
  return adjustedDate.toISOString().replace("T", " ").split(".")[0]; // Basic format example
};
