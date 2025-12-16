import { useMemo } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { VotePool } from "../types/poll";
import { PollStatus, filterPollsByStatus } from "../utils/pollHelpers";
import { SUI_TURKIYE_COLLECTION_TYPE } from "../constants/appConstants";

interface UsePollFilteringOptions {
  allPools: VotePool[];
  selectedCollectionType: string | null;
  selectedFilter: PollStatus;
  userNftsByCollection: Map<string, number>;
  trWalTokenCount: number;
}

/**
 * Custom hook for filtering polls by collection, visibility, and status
 * @param options - Filtering options
 * @returns Filtered pools array
 */
export function usePollFiltering({
  allPools,
  selectedCollectionType,
  selectedFilter,
  userNftsByCollection,
  trWalTokenCount,
}: UsePollFilteringOptions): VotePool[] {
  const account = useCurrentAccount();

  const filteredPools = useMemo(() => {
    // Filter by collection type
    let pools = selectedCollectionType === null
      ? allPools // Show all polls when "All Polls" is selected
      : allPools.filter((pool) => pool.nft_collection_type === selectedCollectionType);
    
    // Filter by visibility (private polls only visible to NFT/token holders and poll creator)
    pools = pools.filter((pool) => {
      // Sadece gerçekten private olan poll'ları filtrele (is_private === true)
      // is_private false, undefined veya null ise, poll public'tir ve herkese gösterilir
      const isPrivate = pool.is_private === true;
      const isSuiTurkiye = pool.nft_collection_type === SUI_TURKIYE_COLLECTION_TYPE;
      
      if (isPrivate && pool.nft_collection_type && pool.nft_collection_type.length > 0) {
        // Private poll: show if user owns NFT/token OR is the poll creator
        const isCreator = account?.address && pool.creator?.toLowerCase() === account.address.toLowerCase();
        if (isCreator) {
          return true;
        }
        
        if (isSuiTurkiye) {
          // SUI TURKIYE private polls require TR_WAL token
          return trWalTokenCount > 0;
        } else {
          // Other private polls require NFT
          const nftCount = userNftsByCollection.get(pool.nft_collection_type) || 0;
          return nftCount > 0;
        }
      }
      
      // Public poll (is_private === false, undefined, veya null) veya public NFT-gated poll: show to everyone
      return true;
    });

    // Filter by status (active, upcoming, ended)
    return filterPollsByStatus(pools, selectedFilter);
  }, [allPools, selectedCollectionType, selectedFilter, userNftsByCollection, trWalTokenCount, account?.address]);

  return filteredPools;
}


