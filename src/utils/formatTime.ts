import { formatDistanceToNow } from "date-fns";

// Format timestamps to human readable format
export const formatTime = (timestamp: number) => {
  if (!timestamp) return "N/A";
  const formatted = formatDistanceToNow(new Date(timestamp * 1000), {
    addSuffix: true,
  });
  return formatted === "less than a minute ago" ? "just now" : formatted;
};
