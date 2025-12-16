import { MS_PER_DAY, MS_PER_HOUR, MS_PER_MINUTE, MS_PER_SECOND, DEFAULT_BACKGROUND_GRADIENT } from "../constants/appConstants";
import { getCollectionByType, NFTCollection } from "../config/nftCollections";
import { VotePool } from "../types/poll";

/**
 * Poll status types
 */
export type PollStatus = "active" | "upcoming" | "ended";

/**
 * Format countdown timer string
 * @param endTime - End time as ISO string
 * @param currentTime - Current time (defaults to now)
 * @returns Formatted countdown string (e.g., "2d 5h 30m" or "Ended")
 */
export function formatCountdown(endTime: string, currentTime: Date = new Date()): string {
  const endDate = new Date(endTime);
  const diff = endDate.getTime() - currentTime.getTime();

  if (diff <= 0) {
    return "Ended";
  }

  const days = Math.floor(diff / MS_PER_DAY);
  const hours = Math.floor((diff % MS_PER_DAY) / MS_PER_HOUR);
  const minutes = Math.floor((diff % MS_PER_HOUR) / MS_PER_MINUTE);
  const seconds = Math.floor((diff % MS_PER_MINUTE) / MS_PER_SECOND);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Get poll status based on current time
 * @param poll - Poll object with startTime and endTime
 * @param currentTime - Current time (defaults to now)
 * @returns Poll status: "active", "upcoming", or "ended"
 */
export function getPollStatus(poll: { startTime: string; endTime: string }, currentTime: Date = new Date()): PollStatus {
  const startDate = new Date(poll.startTime);
  const endDate = new Date(poll.endTime);

  if (currentTime < startDate) {
    return "upcoming";
  } else if (currentTime > endDate) {
    return "ended";
  } else {
    return "active";
  }
}

/**
 * Get collection theme by collection type
 * @param collectionType - Collection type string
 * @returns Collection theme or null if not found
 */
export function getCollectionTheme(collectionType: string | null): NFTCollection["theme"] | null {
  if (!collectionType) {
    return null;
  }
  const collection = getCollectionByType(collectionType);
  return collection?.theme || null;
}

/**
 * Get background gradient for a collection
 * @param collectionType - Collection type string (null for default)
 * @returns Background gradient CSS string
 */
export function getBackgroundGradient(collectionType: string | null): string {
  if (!collectionType) {
    return DEFAULT_BACKGROUND_GRADIENT;
  }

  const collection = getCollectionByType(collectionType);
  if (!collection) {
    return DEFAULT_BACKGROUND_GRADIENT;
  }

  // Custom background gradients for specific collections
  switch (collection.name) {
    case "Popkins":
      // Green (Left) -> Orange (Center) -> Pink (Right)
      return "linear-gradient(90deg, rgba(16, 185, 129, 0.8) 0%, rgba(245, 158, 11, 0.8) 50%, rgba(236, 72, 153, 0.8) 100%), linear-gradient(180deg, #000000 0%, transparent 50%, #000000 100%)";
    
    case "Tallys":
      // Pink/Magenta (Left) -> Sea Green/Teal (Right)
      return "linear-gradient(90deg, rgba(219, 39, 119, 0.8) 0%, rgba(45, 212, 191, 0.8) 100%), linear-gradient(180deg, #000000 0%, transparent 50%, #000000 100%)";
    
    case "Pawtato Heroes":
      // Dark Green (Left) -> Yellowish Orange (Center) -> Dark Red (Right)
      return "linear-gradient(90deg, rgba(21, 128, 61, 0.9) 0%, rgba(234, 179, 8, 0.9) 50%, rgba(153, 27, 27, 0.9) 100%), linear-gradient(180deg, #000000 0%, transparent 50%, #000000 100%)";
    
    case "Sui Workshop":
      // Deep Navy -> Electric Blue Glow -> Dark Navy
      return "radial-gradient(circle at 50% 30%, #1e40af 0%, #0f172a 60%, #020617 100%)";
    
    case "SUI TURKIYE":
      // Dark navy -> Dark burgundy -> Bright red
      return "linear-gradient(90deg, rgba(1, 7, 19, 0.98) 0%, rgba(1, 7, 19, 0.97) 30%, rgba(8, 12, 25, 0.96) 40%, rgba(42, 5, 17, 0.95) 50%, rgba(96, 5, 18, 0.93) 60%, rgba(154, 2, 13, 0.92) 75%, rgba(211, 0, 12, 0.95) 100%)";
    
    default:
      // Use theme's backgroundGradient if available, otherwise default
      return collection.theme?.backgroundGradient || DEFAULT_BACKGROUND_GRADIENT;
  }
}

/**
 * Check if poll is active
 * @param poll - Poll object with startTime and endTime
 * @param currentTime - Current time (defaults to now)
 * @returns True if poll is currently active
 */
export function isPollActive(poll: { startTime: string; endTime: string }, currentTime: Date = new Date()): boolean {
  return getPollStatus(poll, currentTime) === "active";
}

/**
 * Filter polls by status
 * @param polls - Array of polls
 * @param status - Status to filter by
 * @param currentTime - Current time (defaults to now)
 * @returns Filtered array of polls
 */
export function filterPollsByStatus(
  polls: VotePool[],
  status: PollStatus,
  currentTime: Date = new Date()
): VotePool[] {
  return polls.filter((poll) => getPollStatus(poll, currentTime) === status);
}

/**
 * Get title for a collection type
 * @param collectionType - Collection type string (null for default)
 * @returns Title string for the collection
 */
export function getTitleForCollection(collectionType: string | null): string {
  if (!collectionType) {
    return "ACTIVE VOTE POLLS";
  }

  const collection = getCollectionByType(collectionType);
  if (!collection) {
    return "ACTIVE VOTE POLLS";
  }

  switch (collection.name) {
    case "Popkins":
      return "POPKINS VOTE POLLS";
    case "Tallys":
      return "TALLYS VOTE POLLS";
    case "Pawtato Heroes":
      return "PAWTATO HEROES VOTE POLLS";
    case "Sui Workshop":
      return "SUI WORKSHOP VOTE POLLS";
    case "SUI TURKIYE":
      return "SUI TURKIYE VOTE POLLS";
    default:
      return "ACTIVE VOTE POLLS";
  }
}

/**
 * Get title gradient for a collection type
 * @param collectionType - Collection type string (null for default)
 * @returns Title gradient CSS string
 */
export function getTitleGradientForCollection(collectionType: string | null): string {
  if (!collectionType) {
    return "linear-gradient(90deg, #1e3a8a 0%, #2563eb 15%, #3b82f6 30%, #60a5fa 45%, #87ceeb 60%, #bae6fd 75%, #ffffff 90%, #bae6fd 100%)";
  }

  const collection = getCollectionByType(collectionType);
  if (!collection) {
    return "linear-gradient(90deg, #1e3a8a 0%, #2563eb 15%, #3b82f6 30%, #60a5fa 45%, #87ceeb 60%, #bae6fd 75%, #ffffff 90%, #bae6fd 100%)";
  }

  switch (collection.name) {
    case "Popkins":
      return "none";
    case "Tallys":
      return "linear-gradient(90deg, #ec4899 0%, #f472b6 20%, #fb7185 40%, #ef4444 60%, #dc2626 80%, #991b1b 100%)";
    case "Pawtato Heroes":
      return "linear-gradient(90deg, #10b981 0%, #22c55e 20%, #84cc16 40%, #f59e0b 60%, #f97316 80%, #dc2626 100%)";
    case "Sui Workshop":
      return "linear-gradient(90deg, #0277bd 0%, #0288d1 20%, #03a9f4 40%, #29b6f6 60%, #4fc3f7 80%, #81d4fa 100%)";
    case "SUI TURKIYE":
      return "linear-gradient(180deg, #ffffff 0%, #dc2626 100%)";
    default:
      return "linear-gradient(90deg, #1e3a8a 0%, #2563eb 15%, #3b82f6 30%, #60a5fa 45%, #87ceeb 60%, #bae6fd 75%, #ffffff 90%, #bae6fd 100%)";
  }
}

/**
 * Check if title should be graffiti styled for a collection type
 * @param collectionType - Collection type string (null for default)
 * @returns True if title should be graffiti styled
 */
export function isGraffitiStyledTitle(collectionType: string | null): boolean {
  if (!collectionType) {
    return false;
  }

  const collection = getCollectionByType(collectionType);
  if (!collection) {
    return false;
  }

  const graffitiStyledNames = ["Popkins", "Tallys", "Pawtato Heroes", "Sui Workshop", "SUI TURKIYE"];
  return graffitiStyledNames.includes(collection.name);
}

/**
 * Get graffiti inner gradient for a collection type
 * @param collectionType - Collection type string (null for default)
 * @returns Graffiti inner gradient CSS string
 */
export function getGraffitiInnerGradient(collectionType: string | null): string {
  if (!collectionType) {
    return "linear-gradient(180deg, #4ade80 20%, #f97316 80%)";
  }

  const collection = getCollectionByType(collectionType);
  if (!collection) {
    return "linear-gradient(180deg, #4ade80 20%, #f97316 80%)";
  }

  switch (collection.name) {
    case "Popkins":
      return "linear-gradient(180deg, #4ade80 20%, #f97316 80%)";
    case "Tallys":
      return "linear-gradient(180deg, #fde047 20%, #fb923c 80%)";
    case "Pawtato Heroes":
      return "linear-gradient(180deg, #ef4444 20%, #f59e0b 80%)";
    case "Sui Workshop":
      return "linear-gradient(180deg, #ffffff 20%, #3b82f6 80%)";
    case "SUI TURKIYE":
      return "linear-gradient(180deg, #ffffff 0%, #dc2626 100%)";
    default:
      return "linear-gradient(180deg, #4ade80 20%, #f97316 80%)";
  }
}

/**
 * Format date string to localized string
 * @param dateString - Date string to format
 * @returns Formatted date string (e.g., "Jan 15, 2024, 10:30 AM")
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}


