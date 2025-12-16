/**
 * Application Constants
 * Centralized location for all magic numbers, hardcoded values, and configuration constants
 */

// ============================================================================
// TIMER & INTERVAL CONSTANTS
// ============================================================================

/** Countdown timer update interval in milliseconds */
export const COUNTDOWN_UPDATE_INTERVAL_MS = 1000;

/** Polling interval for blockchain queries (fallback) in milliseconds */
export const POLLING_INTERVAL_MS = 60000; // 60 seconds

/** Poll refetch interval for individual polls in milliseconds */
export const POLL_REFETCH_INTERVAL_MS = 20000; // 20 seconds

/** Delay before refetching after event received in milliseconds */
export const EVENT_REFETCH_DELAY_MS = 2000; // 2 seconds

// ============================================================================
// VOTE POWER CONSTANTS
// ============================================================================

/** Vote power thresholds for TR_WAL token holders */
export const VOTE_POWER_THRESHOLDS = {
  MIN: 1,
  LOW: 10,
  MEDIUM: 30,
  HIGH: 50,
  VERY_HIGH: 100,
} as const;

/** Vote power values based on token count */
export const VOTE_POWER_VALUES = {
  MIN: 1, // 1-10 tokens
  LOW: 2, // 11-30 tokens
  MEDIUM: 3, // 31-50 tokens
  HIGH: 4, // 51-100 tokens
  MAX: 5, // 100+ tokens
} as const;

// ============================================================================
// QUERY LIMITS
// ============================================================================

/** Default limit for event queries */
export const EVENT_QUERY_LIMIT = 100;

/** Default limit for user vote queries */
export const USER_VOTE_QUERY_LIMIT = 1000;

/** Default limit for dynamic field queries */
export const DYNAMIC_FIELD_QUERY_LIMIT = 50;

// ============================================================================
// PERCENTAGE & CALCULATION CONSTANTS
// ============================================================================

/** Percentage multiplier for calculations */
export const PERCENTAGE_MULTIPLIER = 100;

/** Milliseconds per second */
export const MS_PER_SECOND = 1000;

/** Seconds per minute */
export const SECONDS_PER_MINUTE = 60;

/** Minutes per hour */
export const MINUTES_PER_HOUR = 60;

/** Hours per day */
export const HOURS_PER_DAY = 24;

/** Milliseconds per day */
export const MS_PER_DAY = MS_PER_SECOND * SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOURS_PER_DAY;

/** Milliseconds per hour */
export const MS_PER_HOUR = MS_PER_SECOND * SECONDS_PER_MINUTE * MINUTES_PER_HOUR;

/** Milliseconds per minute */
export const MS_PER_MINUTE = MS_PER_SECOND * SECONDS_PER_MINUTE;

// ============================================================================
// TOKEN CONSTANTS
// ============================================================================

/** TR_WAL token type address */
export const TR_WAL_TOKEN_TYPE = "0xa8ad8c2720f064676856f4999894974a129e3d15386b3d0a27f3a7f85811c64a::tr_wal::TR_WAL";

/** TR_WAL token decimal places */
export const TR_WAL_DECIMAL = 9;

/** SUI TURKIYE collection type */
export const SUI_TURKIYE_COLLECTION_TYPE = "0x0000000000000000000000000000000000000000000000000000000000000000::sui_turkiye::SuiTurkiye";

// ============================================================================
// COLLECTION TYPE ADDRESSES
// ============================================================================

/** Collection type addresses in display order */
export const COLLECTION_TYPE_ADDRESSES = {
  SUI_WORKSHOP: "0x22739e8c5f587927462590822f418a673e6435fe8a427f892132ab160a72fd83::simple_nft::SimpleNFT",
  SUI_TURKIYE: SUI_TURKIYE_COLLECTION_TYPE,
  POPKINS: "0xb908f3c6fea6865d32e2048c520cdfe3b5c5bbcebb658117c41bad70f52b7ccc::popkins_nft::Popkins",
  TALLYS: "0x75888defd3f392d276643932ae204cd85337a5b8f04335f9f912b6291149f423::nft::Tally",
  PAWTATO_HEROES: "0x0000000000000000000000000000000000000000000000000000000000000000::pawtato_heroes::PawtatoHero",
} as const;

/** Collection order array for sorting */
export const COLLECTION_ORDER = [
  COLLECTION_TYPE_ADDRESSES.SUI_WORKSHOP,
  COLLECTION_TYPE_ADDRESSES.SUI_TURKIYE,
  COLLECTION_TYPE_ADDRESSES.POPKINS,
  COLLECTION_TYPE_ADDRESSES.TALLYS,
  COLLECTION_TYPE_ADDRESSES.PAWTATO_HEROES,
] as const;

// ============================================================================
// UI CONSTANTS
// ============================================================================

/** Z-index values for layered components */
export const Z_INDEX = {
  BACKGROUND: 0,
  CONTENT: 1,
  HEADER: 1000,
  NAVIGATION: 100,
  MODAL: 2000,
  TOOLTIP: 3000,
} as const;

/** Animation durations in seconds */
export const ANIMATION_DURATION = {
  FAST: 0.3,
  NORMAL: 0.6,
  SLOW: 1.0,
} as const;

/** Default background gradient */
export const DEFAULT_BACKGROUND_GRADIENT = "linear-gradient(180deg, #000000 0%, #0a1128 50%, #000000 100%)";

// ============================================================================
// POLL CONSTANTS
// ============================================================================

/** Minimum number of options required for a poll */
export const MIN_POLL_OPTIONS = 2;

/** Poll name length constraints */
export const POLL_NAME_LENGTH = {
  MIN: 3,
  MAX: 250,
} as const;

/** Poll image URL length constraints */
export const POLL_IMAGE_URL_LENGTH = {
  MIN: 7,
  MAX: 1000,
} as const;

/** Poll date string length constraints */
export const POLL_DATE_LENGTH = {
  MIN: 3,
  MAX: 100,
} as const;

// ============================================================================
// USER PROFILE CONSTANTS
// ============================================================================

/** User name length constraints */
export const USER_NAME_LENGTH = {
  MIN: 3,
  MAX: 100,
} as const;

/** User icon URL length constraints */
export const USER_ICON_URL_LENGTH = {
  MIN: 7,
  MAX: 1000,
} as const;

// ============================================================================
// RESPONSIVE BREAKPOINTS (for reference, actual values use clamp)
// ============================================================================

/** Responsive breakpoints in pixels */
export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1400,
} as const;


