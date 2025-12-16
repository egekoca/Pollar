import { useState, useEffect } from "react";
import { useSuiClient, useCurrentAccount } from "@mysten/dapp-kit";
import { getUserNftsByType, getTokenBalance } from "../utils/blockchain";
import { NFT_COLLECTIONS } from "../config/nftCollections";
import { TR_WAL_TOKEN_TYPE, SUI_TURKIYE_COLLECTION_TYPE } from "../constants/appConstants";

/**
 * Custom hook for loading user's NFT and token assets
 * @returns Object with userNftsByCollection map and trWalTokenCount
 */
export function useUserAssets() {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const [userNftsByCollection, setUserNftsByCollection] = useState<Map<string, number>>(new Map());
  const [trWalTokenCount, setTrWalTokenCount] = useState<number>(0);

  useEffect(() => {
    const loadUserAssets = async () => {
      if (!account?.address) {
        setUserNftsByCollection(new Map());
        setTrWalTokenCount(0);
        return;
      }

      const nftMap = new Map<string, number>();
      
      // Load TR_WAL token count for SUI TURKIYE
      try {
        const tokenCount = await getTokenBalance(client, account.address, TR_WAL_TOKEN_TYPE);
        setTrWalTokenCount(tokenCount);
        // SUI TURKIYE collection type için token count'u da ekle
        nftMap.set(SUI_TURKIYE_COLLECTION_TYPE, tokenCount > 0 ? 1 : 0); // Token varsa 1, yoksa 0 (görünürlük kontrolü için)
      } catch (error) {
        console.error("Error loading TR_WAL token:", error);
        setTrWalTokenCount(0);
      }
      
      // Load NFTs for other collections
      for (const collection of NFT_COLLECTIONS) {
        // SUI TURKIYE için token kontrolü yapıldı, atla
        if (collection.name === "SUI TURKIYE") {
          continue;
        }
        
        try {
          const nfts = await getUserNftsByType(client, account.address, collection.type);
          nftMap.set(collection.type, nfts.length);
        } catch (error) {
          console.error(`Error loading NFTs for ${collection.name}:`, error);
          nftMap.set(collection.type, 0);
        }
      }
      setUserNftsByCollection(nftMap);
    };

    loadUserAssets();
  }, [account?.address, client]);

  return {
    userNftsByCollection,
    trWalTokenCount,
  };
}


