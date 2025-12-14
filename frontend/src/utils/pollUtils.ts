import { getAllPolls, getPollById, findVoteRegistryByPollId, getVoteRegistry } from "./blockchain";
import { useSuiClient } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { VotePool, VoteOption } from "../data/mockData";
import { contractConfig } from "../config/contractConfig";

/**
 * Blockchain'den okunan poll'u VotePool formatına dönüştürür
 */
export async function convertBlockchainPollToVotePool(
  client: any,
  blockchainPoll: {
    pollId: string;
    owner: string;
    creator?: string; // Optional creator field
    name: string;
    description: string;
    image_url: string;
    start_date: string;
    end_date: string;
    nft_collection_type: string;
    is_private?: boolean; // Optional: if true, only NFT holders can see this poll
    options: Array<{
      id: string;
      name: string;
      image_url: string;
    }>;
  }
): Promise<VotePool> {
  // Get VoteRegistry for this poll
  let voteData = null;
  try {
    const voteRegistryId = await findVoteRegistryByPollId(client, blockchainPoll.pollId);
    if (voteRegistryId) {
      voteData = await getVoteRegistry(client, voteRegistryId);
    }
  } catch (error) {
    console.warn(`Could not fetch VoteRegistry for poll ${blockchainPoll.pollId}:`, error);
  }

  const totalVotes = voteData?.option_votes.reduce((sum: number, count: number) => sum + count, 0) || 0;
  
  const options: VoteOption[] = blockchainPoll.options.map((opt, index) => {
    const voteCount = voteData?.option_votes[index] || 0;
    const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
    
    return {
      id: opt.id,
      name: opt.name,
      image: opt.image_url || undefined,
      voteCount,
      percentage,
    };
  });

  // Sort options by vote count (descending) for display
  const sortedOptions = [...options].sort((a, b) => b.voteCount - a.voteCount);

  return {
    id: blockchainPoll.pollId,
    name: blockchainPoll.name,
    description: blockchainPoll.description,
    image: blockchainPoll.image_url,
    startTime: blockchainPoll.start_date,
    endTime: blockchainPoll.end_date,
    options: sortedOptions,
    totalVotes,
    nft_collection_type: blockchainPoll.nft_collection_type,
    is_private: blockchainPoll.is_private || false, // Default to false if not present (for backward compatibility)
    creator: blockchainPoll.creator, // Poll creator address
    history: [
      {
        timestamp: blockchainPoll.start_date,
        options: sortedOptions.map((opt) => ({
          optionId: opt.id,
          percentage: opt.percentage,
        })),
      },
    ],
  };
}

/**
 * Tüm poll'ları blockchain'den okumak için React Query hook
 * Real-time updates için event'leri dinler
 */
export function useBlockchainPolls() {
  const client = useSuiClient();
  const subscriptionRef = useRef<(() => void) | null>(null);

  const query = useQuery({
    queryKey: ["blockchain-polls"],
    queryFn: async () => {
      const polls = await getAllPolls(client);
      // VoteRegistry verilerini de çek
      const pollsWithVotes = await Promise.all(
        polls.map((poll) => convertBlockchainPollToVotePool(client, poll))
      );
      return pollsWithVotes;
    },
    refetchInterval: 60000, // 60 saniyede bir fallback yenileme (daha az sıklıkla)
    refetchOnWindowFocus: false, // Pencere focus olduğunda otomatik yenileme yapma
    refetchOnMount: true, // Sadece component mount olduğunda yenile
  });

  // Subscribe to events for real-time updates
  useEffect(() => {
    const packageId = contractConfig.packageId;
    if (!packageId || !client) {
      return;
    }

    // Sadece bir kez log yaz (subscription zaten kurulmuşsa tekrar kurma)
    if (subscriptionRef.current) {
      return; // Subscription zaten aktif
    }

    console.log("🎧 Setting up event subscriptions for real-time vote updates...");

    let voteUnsubscribe: (() => void) | null = null;

    const setupSubscriptions = async () => {
      try {
        // Use subscribeEvent if available, otherwise use polling
        const clientAny = client as any;
        
        if (clientAny.subscribeEvent) {
          // Sui SDK event subscription
          try {
            // Subscribe to UserVoteMinted events (votes)
            voteUnsubscribe = await clientAny.subscribeEvent({
              filter: {
                MoveEventType: `${packageId}::${contractConfig.moduleName}::UserVoteMinted`,
              },
              onMessage: (event: any) => {
                console.log("🗳️ New vote cast event received:", event);
                // Refetch polls when a vote is cast
                setTimeout(() => {
                  query.refetch();
                  console.log("Poll data refetched after vote event");
                }, 2000); // Wait 2 seconds for transaction to finalize
              },
            });

            console.log("✅ Vote event subscription active for real-time updates");
            subscriptionRef.current = () => {
              if (voteUnsubscribe) voteUnsubscribe();
            };
          } catch (subError: any) {
            // WebSocket bağlantı hatalarını sessizce yok say, polling kullan
            if (subError?.message?.includes("WebSocket") || subError?.message?.includes("wss://")) {
              console.log("⚠️ WebSocket connection unavailable, using polling instead");
            } else {
              console.warn("⚠️ Event subscription not supported, using polling:", subError);
            }
          }
        } else {
          // Fallback: Use shorter polling interval if event subscription is not available
          console.log("⚠️ Event subscription API not available, using polling");
        }
      } catch (error) {
        console.error("❌ Error setting up event subscriptions:", error);
      }
    };

    setupSubscriptions();

    // Cleanup on unmount
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current();
        subscriptionRef.current = null;
      }
      if (voteUnsubscribe) voteUnsubscribe();
    };
  }, [client]); // query'i dependency'den çıkardık, sadece client'a bağlı

  return query;
}

export const getVoteRegistryByPoll = async (client: any, pollId: string): Promise<string> =>
{
  try {
    // Vite replaces import.meta.env.VITE_POLL_REGISTRY_ID at build time
    const pollRegistryId = import.meta.env.VITE_POLL_REGISTRY_ID as string;
    if (!pollRegistryId) {
      console.error("VITE_POLL_REGISTRY_ID is not configured in environment variables");
      return "";
    }

    let hasNextPage = true;
    let cursor = null;

    // Search all dynamic fields with pagination
    while (hasNextPage) 
    {
      const response: any = await client.getDynamicFields({
        parentId: pollRegistryId,
        cursor: cursor,
        limit: 50
      });

      const found = response.data.find(
        (field: any) => field.name.value === pollId
      );  

      if (found) 
      {
        const object = await client.getObject(
        {
          id: found.objectId,
          options: 
          {
            showContent: true
          }
        });

        if (object.data?.content?.dataType === 'moveObject') 
          {
          const fields = object.data.content.fields as any;
          return fields.value || "";
        }
        return "";
      }

      hasNextPage = response.hasNextPage;
      cursor = response.nextCursor;
    }

    return "";
    
  } 
  catch (error) 
  {
    console.error('Error searching for user:', error);
    throw error;
  }
}

/**
 * Belirli bir poll'u blockchain'den okumak için React Query hook
 */
export function useBlockchainPoll(pollId: string | undefined) {
  const client = useSuiClient();

  return useQuery({
    queryKey: ["blockchain-poll", pollId],
    queryFn: async () => {
      if (!pollId) return null;
      const poll = await getPollById(client, pollId);
      if (!poll) return null;
      return await convertBlockchainPollToVotePool(client, poll);
    },
    enabled: !!pollId,
    refetchInterval: 20000, // 20 saniyede bir fallback yenileme
  });
}

