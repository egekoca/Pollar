// NFT Collection configurations
export interface NFTCollection {
  name: string;
  type: string; // Full type string (e.g., "0x...::popkins_nft::Popkins")
  packageId: string; // Package ID
  moduleName: string; // Module name
  structName: string; // Struct name
  imageUrl?: string; // Optional image URL for the collection
  description?: string; // Optional description
  tradeportUrl?: string; // TradePort marketplace URL for buying NFTs
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
    tradeportUrl: "https://www.tradeport.xyz/sui/collection/0xb908f3c6fea6865d32e2048c520cdfe3b5c5bbcebb658117c41bad70f52b7ccc%3A%3Apopkins_nft%3A%3APopkins?bottomTab=trades&tab=items",
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
    name: "Sui Workshop",
    type: "0x22739e8c5f587927462590822f418a673e6435fe8a427f892132ab160a72fd83::simple_nft::SimpleNFT",
    packageId: "0x22739e8c5f587927462590822f418a673e6435fe8a427f892132ab160a72fd83",
    moduleName: "simple_nft",
    structName: "SimpleNFT",
    description: "Sui Workshop NFT Collection",
    imageUrl: "/suiworkshop.png",
    theme: {
      backgroundGradient: "linear-gradient(180deg, #0a0e27 0%, #1a1f3a 30%, #2a2f4a 60%, #0a0e27 100%)",
      backgroundImages: [
        "/suiworkshop.png",
        "https://cdn.prod.website-files.com/6683c774a6e7a5003c5889c3/6763f7b7b0899fd3cffe2b3d_6763f572866fbd04f1767cbb_sui_banner_backpack_exchange.jpeg",
        "https://cryptopotato.com/tr/wp-content/uploads/2025/05/Sui_Header_1717037160BNVlLeLycn.jpg",
        "https://99bitcoins.com/tr/wp-content/uploads/sites/7/2025/05/kapak-resmi-2-15.png",
      ],
      primaryColor: "#4fc3f7",
      secondaryColor: "#29b6f6",
      overlayOpacity: 0.15,
    },
  },
  {
    name: "SUI TURKIYE",
    type: "0x0000000000000000000000000000000000000000000000000000000000000000::sui_turkiye::SuiTurkiye", // TODO: Update with actual type
    packageId: "0x0000000000000000000000000000000000000000000000000000000000000000", // TODO: Update with actual package ID
    moduleName: "sui_turkiye",
    structName: "SuiTurkiye",
    description: "SUI TURKIYE Community NFT Collection",
    imageUrl: "/suitrbutton.png",
    theme: {
      backgroundGradient: "linear-gradient(90deg, #010713 0%, #010713 30%, #080c19 40%, #2A0511 50%, #600512 60%, #9A020D 75%, #D3000C 100%)", // Analiz edilmiş gradient: koyu lacivert %30-40'a kadar devam ediyor, sonra koyu bordo, sağda parlak kırmızı
      backgroundImages: [
        "https://pbs.twimg.com/media/G6hdHDuXgAAMe2X?format=jpg&name=medium",
        "https://pbs.twimg.com/media/GyOVjY4WEAAb4jd?format=jpg&name=small",
        "https://pbs.twimg.com/media/GrdSd1cW0AAWiFZ?format=jpg&name=medium",
        "https://pbs.twimg.com/media/Gql9AFkWkAA_Vf5?format=png&name=medium",
        "/suitr.jpg",
      ],
      primaryColor: "#dc2626", // Red
      secondaryColor: "#1e3a8a", // Dark navy blue
      overlayOpacity: 0.15,
    },
  },
  {
    name: "Tallys",
    type: "0x75888defd3f392d276643932ae204cd85337a5b8f04335f9f912b6291149f423::nft::Tally",
    packageId: "0x75888defd3f392d276643932ae204cd85337a5b8f04335f9f912b6291149f423",
    moduleName: "nft",
    structName: "Tally",
    description: "Tallys NFT Collection",
    tradeportUrl: "https://www.tradeport.xyz/sui/collection/0x75888defd3f392d276643932ae204cd85337a5b8f04335f9f912b6291149f423%3A%3Anft%3A%3ATally?bottomTab=trades&tab=items",
    theme: {
      backgroundGradient: "linear-gradient(180deg, #1a1a2e 0%, #16213e 30%, #0f3460 60%, #1a1a2e 100%)",
      backgroundImages: [
        "https://img.tradeport.gg/?url=https%3A%2F%2Ftradeport.mypinata.cloud%2Fipfs%2Fbafybeif4wzfdje322lsouuwfjuu4hia7jdkmw7pjs2kkxwkzge7ozunfgy%3FpinataGatewayToken%3D5Uc_j2QFWW75kVPmXB6eWCJ0aVZmc4o9QAq5TiuPfMHZQLKa_VNL3uaXj5NKrq0w%26img-width%3D700%26img-height%3D700%26img-fit%3Dcover%26img-quality%3D80%26img-onerror%3Dredirect%26img-fit%3Dpad%26img-format%3Dwebp&profile=39f29b4d-02ca-4157-a034-2686ee4a0e0f&mime-type=io%2Fipfs%2Fbafybeif4wzfdje322lsouuwfjuu4hia7jdkmw7pjs2kkxwkzge7ozunfgy",
        "https://img.tradeport.gg/?url=https%3A%2F%2Ftradeport.mypinata.cloud%2Fipfs%2Fbafybeifqhxgosi5aw6krqqjacpvwjplnoevw5ahyzvtbdg4y33mrqkne3q%3FpinataGatewayToken%3D5Uc_j2QFWW75kVPmXB6eWCJ0aVZmc4o9QAq5TiuPfMHZQLKa_VNL3uaXj5NKrq0w%26img-width%3D700%26img-height%3D700%26img-fit%3Dcover%26img-quality%3D80%26img-onerror%3Dredirect%26img-fit%3Dpad%26img-format%3Dwebp&profile=39f29b4d-02ca-4157-a034-2686ee4a0e0f&mime-type=io%2Fipfs%2Fbafybeifqhxgosi5aw6krqqjacpvwjplnoevw5ahyzvtbdg4y33mrqkne3q",
        "https://img.tradeport.gg/?url=https%3A%2F%2Ftradeport.mypinata.cloud%2Fipfs%2Fbafybeies2tsig2xklsu2y3k5nwu2zqopx45pntlch4p5ci6lnpufkwnjam%3FpinataGatewayToken%3D5Uc_j2QFWW75kVPmXB6eWCJ0aVZmc4o9QAq5TiuPfMHZQLKa_VNL3uaXj5NKrq0w%26img-width%3D700%26img-height%3D700%26img-fit%3Dcover%26img-quality%3D80%26img-onerror%3Dredirect%26img-fit%3Dpad%26img-format%3Dwebp&profile=39f29b4d-02ca-4157-a034-2686ee4a0e0f&mime-type=io%2Fipfs%2Fbafybeies2tsig2xklsu2y3k5nwu2zqopx45pntlch4p5ci6lnpufkwnjam",
        "https://img.tradeport.gg/?url=https%3A%2F%2Ftradeport.mypinata.cloud%2Fipfs%2Fbafybeidwrszhottxl7uip3zjvfqqozs2ozv6rvgtgykwpz7u7luxq6mduu%3FpinataGatewayToken%3D5Uc_j2QFWW75kVPmXB6eWCJ0aVZmc4o9QAq5TiuPfMHZQLKa_VNL3uaXj5NKrq0w%26img-width%3D700%26img-height%3D700%26img-fit%3Dcover%26img-quality%3D80%26img-onerror%3Dredirect%26img-fit%3Dpad%26img-format%3Dwebp&profile=39f29b4d-02ca-4157-a034-2686ee4a0e0f",
        "https://img.tradeport.gg/?url=https%3A%2F%2Ftradeport.mypinata.cloud%2Fipfs%2Fbafybeiame7uxod64pfonq4zjckvett62tuqy4s3j66v2t3lwz7t25x2ihu%3FpinataGatewayToken%3D5Uc_j2QFWW75kVPmXB6eWCJ0aVZmc4o9QAq5TiuPfMHZQLKa_VNL3uaXj5NKrq0w%26img-width%3D700%26img-height%3D700%26img-fit%3Dcover%26img-quality%3D80%26img-onerror%3Dredirect%26img-fit%3Dpad%26img-format%3Dwebp&profile=39f29b4d-02ca-4157-a034-2686ee4a0e0f",
        "https://img.tradeport.gg/?url=https%3A%2F%2Ftradeport.mypinata.cloud%2Fipfs%2Fbafybeieb22ssu2cvtvjv3b6okfvsrtsuifaemcquc34yku25wa3v7xtsey%3FpinataGatewayToken%3D5Uc_j2QFWW75kVPmXB6eWCJ0aVZmc4o9QAq5TiuPfMHZQLKa_VNL3uaXj5NKrq0w%26img-width%3D700%26img-height%3D700%26img-fit%3Dcover%26img-quality%3D80%26img-onerror%3Dredirect%26img-fit%3Dpad%26img-format%3Dwebp&profile=39f29b4d-02ca-4157-a034-2686ee4a0e0f",
      ],
      primaryColor: "#10b981",
      secondaryColor: "#34d399",
      overlayOpacity: 0.12,
    },
  },
  {
    name: "Pawtato Heroes",
    type: "0x0000000000000000000000000000000000000000000000000000000000000000::pawtato_heroes::PawtatoHero", // TODO: Update with actual type
    packageId: "0x0000000000000000000000000000000000000000000000000000000000000000", // TODO: Update with actual package ID
    moduleName: "pawtato_heroes",
    structName: "PawtatoHero",
    description: "Pawtato Heroes NFT Collection",
    tradeportUrl: "https://www.tradeport.xyz/sui/collection/pawtato-heroes?bottomTab=trades&tab=items",
    theme: {
      backgroundGradient: "linear-gradient(180deg, #1a2e1a 0%, #2d4a2d 30%, #1a3d1a 60%, #1a2e1a 100%)",
      backgroundImages: [
        "https://img.tradeport.gg/?url=https%3A%2F%2Fimg.pawtato.app%2Fhero%2F25233.png&profile=d8b9bf7b-5f08-4b49-8bbf-81871e35c8ea&mime-type=png",
        "https://img.tradeport.gg/?url=https%3A%2F%2Fimg.pawtato.app%2Fhero%2F28879.png&profile=d8b9bf7b-5f08-4b49-8bbf-81871e35c8ea&mime-type=png",
        "https://img.tradeport.gg/?url=https%3A%2F%2Fimg.pawtato.app%2Fhero%2F13915.png&profile=d8b9bf7b-5f08-4b49-8bbf-81871e35c8ea&mime-type=png",
        "https://img.tradeport.gg/?url=https%3A%2F%2Fimg.pawtato.app%2Fhero%2F29310.png&profile=d8b9bf7b-5f08-4b49-8bbf-81871e35c8ea&mime-type=png",
        "https://img.tradeport.gg/?url=https%3A%2F%2Fimg.pawtato.app%2Fhero%2F18083.png&profile=d8b9bf7b-5f08-4b49-8bbf-81871e35c8ea&mime-type=png",
        "https://img.tradeport.gg/?url=https%3A%2F%2Fimg.pawtato.app%2Fhero%2F22331.png&profile=d8b9bf7b-5f08-4b49-8bbf-81871e35c8ea&mime-type=png",
      ],
      primaryColor: "#84cc16", // Lime green for potato theme
      secondaryColor: "#a3e635",
      overlayOpacity: 0.12,
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

