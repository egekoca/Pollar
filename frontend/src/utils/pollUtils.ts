import { getAllPolls, getPollById } from "./blockchain";
import { useSuiClient } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import { VotePool, VoteOption } from "../data/mockData";

/**
 * Blockchain'den okunan poll'u VotePool formatına dönüştürür
 */
export function convertBlockchainPollToVotePool(
  blockchainPoll: {
    pollId: string;
    owner: string;
    name: string;
    description: string;
    image_url: string;
    start_date: string;
    end_date: string;
    options: Array<{
      id: string;
      name: string;
      image_url: string;
    }>;
  },
  voteRegistry?: {
    totalVotes: number;
    optionVotes: Record<string, number>;
  }
): VotePool {
  const totalVotes = voteRegistry?.totalVotes || 0;
  
  const options: VoteOption[] = blockchainPoll.options.map((opt) => {
    const voteCount = voteRegistry?.optionVotes[opt.id] || 0;
    const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
    
    return {
      id: opt.id,
      name: opt.name,
      image: opt.image_url || undefined,
      voteCount,
      percentage,
    };
  });

  return {
    id: blockchainPoll.pollId,
    name: blockchainPoll.name,
    description: blockchainPoll.description,
    image: blockchainPoll.image_url,
    startTime: blockchainPoll.start_date,
    endTime: blockchainPoll.end_date,
    options,
    totalVotes,
    history: [
      {
        timestamp: blockchainPoll.start_date,
        options: options.map((opt) => ({
          optionId: opt.id,
          percentage: opt.percentage,
        })),
      },
    ],
  };
}

/**
 * Tüm poll'ları blockchain'den okumak için React Query hook
 */
export function useBlockchainPolls() {
  const client = useSuiClient();

  return useQuery({
    queryKey: ["blockchain-polls"],
    queryFn: async () => {
      const polls = await getAllPolls(client);
      return polls.map((poll) => convertBlockchainPollToVotePool(poll));
    },
    refetchInterval: 10000, // 10 saniyede bir yenile
  });
}

export const getVoteRegistryByPoll = async (client: any, pollId: string): Promise<string> =>
{
  try {
    const pollRegistryId = import.meta.env.VITE_POLL_REGISTRY_ID;
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
      return convertBlockchainPollToVotePool(poll);
    },
    enabled: !!pollId,
    refetchInterval: 10000,
  });
}

