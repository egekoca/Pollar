export interface PredictionOption {
  id: string;
  label: string;
  probability: number; // 0-100 arası yüzde
  color?: string; // Opsiyonel renk
}

export interface PredictionMarket {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  profileImageUrl?: string; // Üstte gösterilecek küçük profil resmi
  category?: string;
  volume?: string; // Örn: "$95m Vol."
  endDate?: string;
  options: PredictionOption[];
  status?: "live" | "upcoming" | "ended";
}

export const mockPredictionMarkets: PredictionMarket[] = [
  {
    id: "1",
    title: "Fed decision in December?",
    description: "What will be the Federal Reserve's decision in December?",
    profileImageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=100&h=100&fit=crop",
    category: "Economics",
    volume: "$95m Vol.",
    endDate: "2025-12-31",
    status: "upcoming",
    options: [
      { id: "opt1", label: "Rate decrease or no change", probability: 84, color: "#3b82f6" },
      { id: "opt2", label: "Rate increase", probability: 16, color: "#ef4444" },
    ],
  },
  {
    id: "2",
    title: "Super Bowl Champion 2026",
    description: "Who will win the Super Bowl in 2026?",
    profileImageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=100&h=100&fit=crop",
    category: "Sports",
    volume: "$530m Vol.",
    endDate: "2026-02-08",
    status: "upcoming",
    options: [
      { id: "opt5", label: "Kansas City", probability: 13, color: "#e11d48" },
      { id: "opt6", label: "Other team", probability: 87, color: "#0ea5e9" },
    ],
  },
  {
    id: "3",
    title: "Islam Makhachev vs Jack Della Maddalena",
    description: "UFC fight prediction",
    profileImageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop",
    category: "UFC",
    volume: "$891k Vol.",
    endDate: "2025-11-28",
    status: "live",
    options: [
      { id: "opt9", label: "Islam Makhachev", probability: 73, color: "#3b82f6" },
      { id: "opt10", label: "Jack Della Maddalena", probability: 27, color: "#ef4444" },
    ],
  },
  {
    id: "4",
    title: "Chile Presidential Election",
    description: "Who will win the presidential election?",
    profileImageUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=100&h=100&fit=crop",
    category: "Politics",
    volume: "$63m Vol.",
    endDate: "2025-12-15",
    status: "upcoming",
    options: [
      { id: "opt11", label: "José Antonio Kast", probability: 70, color: "#1e40af" },
      { id: "opt12", label: "Jeannette Jara", probability: 30, color: "#dc2626" },
    ],
  },
  {
    id: "5",
    title: "MIA Heat vs NYK Knicks (NBA)",
    description: "NBA game prediction",
    profileImageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=100&h=100&fit=crop",
    category: "NBA",
    volume: "$4m Vol.",
    endDate: "2025-11-27",
    status: "live",
    options: [
      { id: "opt14", label: "Heat", probability: 53, color: "#f97316" },
      { id: "opt15", label: "Knicks", probability: 47, color: "#f59e0b" },
    ],
  },
  {
    id: "6",
    title: "BKN Nets vs ORL Magic (NBA)",
    description: "NBA game prediction",
    profileImageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=100&h=100&fit=crop",
    category: "NBA",
    volume: "$2m Vol.",
    endDate: "2025-11-27",
    status: "live",
    options: [
      { id: "opt16", label: "Nets", probability: 52, color: "#000000" },
      { id: "opt17", label: "Magic", probability: 48, color: "#0ea5e9" },
    ],
  },
  {
    id: "7",
    title: "VAN Canucks vs CAR Hurricanes (NHL)",
    description: "NHL game prediction",
    profileImageUrl: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=100&h=100&fit=crop",
    category: "NHL",
    volume: "$951k Vol.",
    endDate: "2025-11-27",
    status: "live",
    options: [
      { id: "opt18", label: "Canucks", probability: 35, color: "#0ea5e9" },
      { id: "opt19", label: "Hurricanes", probability: 65, color: "#dc2626" },
    ],
  },
  {
    id: "8",
    title: "Tigers vs Cardinals (CFB)",
    description: "College Football prediction",
    profileImageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=100&h=100&fit=crop",
    category: "CFB",
    volume: "$4m Vol.",
    endDate: "2025-11-28",
    status: "upcoming",
    options: [
      { id: "opt20", label: "Tigers", probability: 45, color: "#f59e0b" },
      { id: "opt21", label: "Cardinals", probability: 55, color: "#dc2626" },
    ],
  },
  {
    id: "9",
    title: "Golden Gophers vs Ducks (CFB)",
    description: "College Football prediction",
    profileImageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=100&h=100&fit=crop",
    category: "CFB",
    volume: "$377k Vol.",
    endDate: "2025-11-28",
    status: "upcoming",
    options: [
      { id: "opt22", label: "Golden Gophers", probability: 4, color: "#f59e0b" },
      { id: "opt23", label: "Ducks", probability: 96, color: "#10b981" },
    ],
  },
  {
    id: "10",
    title: "Maduro out by...?",
    description: "When will Maduro leave office?",
    profileImageUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=100&h=100&fit=crop",
    category: "Politics",
    volume: "$9m Vol.",
    endDate: "2025-12-31",
    status: "upcoming",
    options: [
      { id: "opt24", label: "By end of 2025", probability: 23, color: "#3b82f6" },
      { id: "opt25", label: "2026 or later", probability: 77, color: "#60a5fa" },
    ],
  },
  {
    id: "11",
    title: "House passes Epstein disclosure bill/resolution...",
    description: "Will the House pass the Epstein disclosure bill?",
    profileImageUrl: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=100&h=100&fit=crop",
    category: "Politics",
    volume: "$338k Vol.",
    endDate: "2025-12-15",
    status: "upcoming",
    options: [
      { id: "opt27", label: "Yes", probability: 94, color: "#10b981" },
      { id: "opt28", label: "No", probability: 6, color: "#ef4444" },
    ],
  },
  {
    id: "12",
    title: "Elon Musk # tweets November 11 - November 18, 2025?",
    description: "How many tweets will Elon Musk post?",
    profileImageUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop",
    category: "Social Media",
    volume: "$5m Vol.",
    endDate: "2025-11-18",
    status: "upcoming",
    options: [
      { id: "opt29", label: "Under 300 tweets", probability: 27, color: "#3b82f6" },
      { id: "opt30", label: "300+ tweets", probability: 73, color: "#60a5fa" },
    ],
  },
  {
    id: "13",
    title: "Uniswap Cup",
    description: "Who will win the Uniswap Cup?",
    profileImageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=100&h=100&fit=crop",
    category: "Crypto",
    volume: "$1m Vol.",
    endDate: "2025-12-31",
    status: "upcoming",
    options: [
      { id: "opt32", label: "ENS", probability: 13, color: "#6366f1" },
      { id: "opt33", label: "ZKsync or Other", probability: 87, color: "#8b5cf6" },
    ],
  },
  {
    id: "14",
    title: "Will there be another US government shutdown...",
    description: "Will there be another US government shutdown before 2026?",
    profileImageUrl: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=100&h=100&fit=crop",
    category: "Politics",
    volume: "$29k Vol.",
    endDate: "2025-12-31",
    status: "upcoming",
    options: [
      { id: "opt35", label: "Yes", probability: 27, color: "#10b981" },
      { id: "opt36", label: "No", probability: 73, color: "#ef4444" },
    ],
  },
  {
    id: "15",
    title: "Chile Presidential Election 1st round winner?",
    description: "Who will win the first round?",
    profileImageUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=100&h=100&fit=crop",
    category: "Politics",
    volume: "$2m Vol.",
    endDate: "2025-12-15",
    status: "upcoming",
    options: [
      { id: "opt37", label: "Jeannette Jara", probability: 92, color: "#dc2626" },
      { id: "opt38", label: "José Antonio Kast", probability: 8, color: "#1e40af" },
    ],
  },
  {
    id: "16",
    title: "Gemini 3.0 released by...?",
    description: "When will Gemini 3.0 be released?",
    profileImageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=100&h=100&fit=crop",
    category: "Technology",
    volume: "$12m Vol.",
    endDate: "2025-12-31",
    status: "upcoming",
    options: [
      { id: "opt39", label: "By November 22", probability: 72, color: "#3b82f6" },
      { id: "opt40", label: "After November 22", probability: 28, color: "#60a5fa" },
    ],
  },
];

export const getPredictionMarketById = (id: string): PredictionMarket | undefined => {
  return mockPredictionMarkets.find((market) => market.id === id);
};

