// NFT Collection configurations
export interface NFTCollection {
  name: string;
  type: string; // Full type string (e.g., "0x...::popkins_nft::Popkins")
  packageId: string; // Package ID
  moduleName: string; // Module name
  structName: string; // Struct name
  imageUrl?: string; // Optional image URL for the collection
  description?: string; // Optional description
  theme?: {
    backgroundGradient?: string; // CSS gradient for background
    backgroundImages?: string[]; // Array of NFT image URLs for background decoration
    primaryColor?: string; // Primary theme color
    secondaryColor?: string; // Secondary theme color
    overlayOpacity?: number; // Overlay opacity for background images (0-1)
  };
}

export const NFT_COLLECTIONS: NFTCollection[] = [
  {
    name: "Popkins",
    type: "0xb908f3c6fea6865d32e2048c520cdfe3b5c5bbcebb658117c41bad70f52b7ccc::popkins_nft::Popkins",
    packageId: "0xb908f3c6fea6865d32e2048c520cdfe3b5c5bbcebb658117c41bad70f52b7ccc",
    moduleName: "popkins_nft",
    structName: "Popkins",
    description: "Popkins NFT Collection",
    theme: {
      backgroundGradient: "linear-gradient(180deg, #1a1a2e 0%, #16213e 30%, #0f3460 60%, #1a1a2e 100%)",
      backgroundImages: [
        "https://img.tradeport.gg/?url=https%3A%2F%2Fwalrus.tusky.io%2F4b08rEfaxSI4ERKhaLPlfp4oJodrVNS_b9ym7qo5ASs&profile=a3334d93-8f63-41df-a4b9-124a4976a170",
        "https://img.tradeport.gg/?url=https%3A%2F%2Fwalrus.tusky.io%2FJQbtgh3k-VlJRLqKE3azvCGbniFql2XP-eXZ32UJYeo&profile=a3334d93-8f63-41df-a4b9-124a4976a170",
        "https://img.tradeport.gg/?url=https%3A%2F%2Fwalrus.tusky.io%2FOOGedpdAs4UOe4tEsKmjMg2VDrJtIUnrqAR7ooqLiYQ&profile=a3334d93-8f63-41df-a4b9-124a4976a170",
        "https://img.tradeport.gg/?url=https%3A%2F%2Fwalrus.tusky.io%2FCde-Hek5zO6nsSbHFEVGBc5Nihf4eeCXvWQi8cbYi6c&profile=a3334d93-8f63-41df-a4b9-124a4976a170",
        "https://img.tradeport.gg/?url=https%3A%2F%2Fwalrus.tusky.io%2FjuGW5LYCxYPYqwY4NZyEjYrDqrhQEppxzx8E86_15go&profile=a3334d93-8f63-41df-a4b9-124a4976a170",
        "https://img.tradeport.gg/?url=https%3A%2F%2Fwalrus.tusky.io%2FUZ4c8lJZaFI_SqfnVXgSOKpDWAva6HT-GjPTkrkvo4k&profile=a3334d93-8f63-41df-a4b9-124a4976a170",
      ],
      primaryColor: "#3b82f6",
      secondaryColor: "#60a5fa",
      overlayOpacity: 0.12,
    },
  },
  {
    name: "Hero",
    type: "0xc6726b1b8f40ed882c5d7b7bb2e6fec36a4f19017dd9354268068473de37464e::hero::Hero",
    packageId: "0xc6726b1b8f40ed882c5d7b7bb2e6fec36a4f19017dd9354268068473de37464e",
    moduleName: "hero",
    structName: "Hero",
    description: "Hero NFT Collection (Testnet)",
    theme: {
      backgroundGradient: "linear-gradient(180deg, #1e1e2e 0%, #2d1b3d 50%, #1e1e2e 100%)",
      primaryColor: "#8b5cf6",
      secondaryColor: "#a78bfa",
      overlayOpacity: 0.1,
    },
  },
];

// Helper function to get collection by type
export function getCollectionByType(type: string): NFTCollection | undefined {
  return NFT_COLLECTIONS.find((col) => col.type === type);
}

// Helper function to get collection by name
export function getCollectionByName(name: string): NFTCollection | undefined {
  return NFT_COLLECTIONS.find((col) => col.name === name);
}

// Helper function to get all unique collection types from polls
export function getUniqueCollectionTypes(polls: Array<{ nft_collection_type?: string }>): string[] {
  const types = new Set<string>();
  polls.forEach((poll) => {
    if (poll.nft_collection_type && poll.nft_collection_type.length > 0) {
      types.add(poll.nft_collection_type);
    }
  });
  return Array.from(types);
}

