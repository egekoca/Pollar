// NFT Collection configurations
export interface NFTCollection {
  name: string;
  type: string; // Full type string (e.g., "0x...::popkins_nft::Popkins")
  packageId: string; // Package ID
  moduleName: string; // Module name
  structName: string; // Struct name
  imageUrl?: string; // Optional image URL for the collection
  description?: string; // Optional description
}

export const NFT_COLLECTIONS: NFTCollection[] = [
  {
    name: "Popkins",
    type: "0xb908f3c6fea6865d32e2048c520cdfe3b5c5bbcebb658117c41bad70f52b7ccc::popkins_nft::Popkins",
    packageId: "0xb908f3c6fea6865d32e2048c520cdfe3b5c5bbcebb658117c41bad70f52b7ccc",
    moduleName: "popkins_nft",
    structName: "Popkins",
    description: "Popkins NFT Collection",
  },
  {
    name: "Hero",
    type: "0xc6726b1b8f40ed882c5d7b7bb2e6fec36a4f19017dd9354268068473de37464e::hero::Hero",
    packageId: "0xc6726b1b8f40ed882c5d7b7bb2e6fec36a4f19017dd9354268068473de37464e",
    moduleName: "hero",
    structName: "Hero",
    description: "Hero NFT Collection (Testnet)",
  },
];

// Helper function to get collection by type
export function getCollectionByType(type: string): NFTCollection | undefined {
  return NFT_COLLECTIONS.find((col) => col.type === type);
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

