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

/**
 * Poll ID'sinden VoteRegistry ID'sini bulur (dynamic field'dan)
 */
export const getVoteRegistryByPoll = async (
  pollId: string,
  client: any,
  pollRegistryId: string
): Promise<string> => {
  try {
    let hasNextPage = true;
    let cursor: string | null = null;

    // Search all dynamic fields with pagination
    while (hasNextPage) {
      const response = await client.getDynamicFields({
        parentId: pollRegistryId,
        cursor: cursor,
        limit: 50,
      });

      const found = response.data.find((field: any) => {
        // Dynamic field name can be different types, check based on pollId
        const nameValue = typeof field.name === "object" ? field.name.value : field.name;
        return nameValue === pollId;
      });

      if (found) {
        // VoteRegistry ID'si dynamic field'ın value'sunda
        return found.objectId;
      }

      hasNextPage = response.hasNextPage;
      cursor = response.nextCursor;
    }

    return "";
  } catch (error) {
    console.error("Error finding VoteRegistry:", error);
    throw error;
  }
};

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

