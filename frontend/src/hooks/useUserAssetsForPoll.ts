import { useState, useEffect } from "react";
import { useSuiClient, useCurrentAccount } from "@mysten/dapp-kit";
import { getUserNftsByType, getTokenBalance } from "../utils/blockchain";
import { TR_WAL_TOKEN_TYPE, SUI_TURKIYE_COLLECTION_TYPE } from "../constants/appConstants";

interface UseUserAssetsForPollResult {
  userNfts: Array<{ objectId: string; type: string }>;
  selectedNftId: string | null;
  trWalTokenCount: number;
  setSelectedNftId: (nftId: string | null) => void;
}

/**
 * Custom hook for loading user NFTs and tokens for a specific poll
 * @param pollCollectionType - NFT collection type from poll data
 * @returns User NFTs, selected NFT ID, TR_WAL token count, and setter for selected NFT
 */
export function useUserAssetsForPoll(pollCollectionType: string | null | undefined): UseUserAssetsForPollResult {
  const client = useSuiClient();
  const account = useCurrentAccount();
  
  const [userNfts, setUserNfts] = useState<Array<{ objectId: string; type: string }>>([]);
  const [selectedNftId, setSelectedNftId] = useState<string | null>(null);
  const [trWalTokenCount, setTrWalTokenCount] = useState<number>(0);

  // Load user NFTs if poll requires NFT
  // Special case: SUI TURKIYE polls use TR_WAL token instead of NFT
  useEffect(() => {
    // Reset state immediately when pollCollectionType changes to prevent showing old data
    setUserNfts([]);
    setTrWalTokenCount(0);
    setSelectedNftId(null);
    
    const loadUserAssets = async () => {
      if (!account?.address || !pollCollectionType || pollCollectionType.length === 0) {
        return;
      }

      try {
        // Check if this is a SUI TURKIYE poll
        const isSuiTurkiye = pollCollectionType === SUI_TURKIYE_COLLECTION_TYPE;
        
        if (isSuiTurkiye) {
          // For SUI TURKIYE polls, check for TR_WAL token balance
          const tokenCount = await getTokenBalance(client, account.address, TR_WAL_TOKEN_TYPE);
          setTrWalTokenCount(tokenCount);
          setUserNfts([]); // NFT gerekmiyor
          setSelectedNftId(null);
        } else {
          // For other polls, use the poll's NFT collection type
          const nfts = await getUserNftsByType(client, account.address, pollCollectionType);
          setUserNfts(nfts);
          setTrWalTokenCount(0);
          if (nfts.length > 0) {
            setSelectedNftId(nfts[0].objectId); // Auto-select first NFT
          } else {
            setSelectedNftId(null);
          }
        }
      } catch (error) {
        console.error("Error loading user assets:", error);
        setUserNfts([]);
        setTrWalTokenCount(0);
        setSelectedNftId(null);
      }
    };

    loadUserAssets();
  }, [account?.address, pollCollectionType, client]);

  return {
    userNfts,
    selectedNftId,
    trWalTokenCount,
    setSelectedNftId,
  };
}

