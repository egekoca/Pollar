import { useState, useEffect } from "react";
import { useSuiClient, useCurrentAccount } from "@mysten/dapp-kit";
import { findVoteRegistryByPollId, getVoteRegistry, getPollById, getUserNftsByType, getTokenBalance } from "../utils/blockchain";
import { VotePool, VoteOption } from "../types/poll";
import { TR_WAL_TOKEN_TYPE, SUI_TURKIYE_COLLECTION_TYPE, PERCENTAGE_MULTIPLIER } from "../constants/appConstants";

interface UsePollDataResult {
  pollData: any | null;
  localPool: VotePool | null;
  voteRegistryId: string | null;
  hasVoted: boolean;
  isLoading: boolean;
  error: string;
}

/**
 * Custom hook for loading poll data and VoteRegistry
 * @param pollId - Poll ID from URL params
 * @returns Poll data, local pool, vote registry ID, has voted status, loading state, and error
 */
export function usePollData(pollId: string | undefined): UsePollDataResult {
  const client = useSuiClient();
  const account = useCurrentAccount();
  
  const [voteRegistryId, setVoteRegistryId] = useState<string | null>(null);
  const [localPool, setLocalPool] = useState<VotePool | null>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [pollData, setPollData] = useState<any>(null);
  const [hasVoted, setHasVoted] = useState<boolean>(false);

  useEffect(() => {
    // Reset state when pollId changes - set loading immediately to prevent showing old data
    setIsLoading(true);
    setPollData(null);
    setLocalPool(null);
    setVoteRegistryId(null);
    setHasVoted(false);
    setError("");

    if (!pollId) {
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      setError("");

      try {
        // Read poll first
        const poll = await getPollById(client, pollId);
        if (!poll) {
          setError("Poll not found");
          setIsLoading(false);
          return;
        }

        // Check if poll is private and user has access
        // is_private is now stored on-chain in the Poll struct
        // Sadece gerçekten private olan poll'ları kontrol et (is_private === true)
        const isPrivate = poll.is_private === true;
        const isSuiTurkiye = poll.nft_collection_type === SUI_TURKIYE_COLLECTION_TYPE;
        
        if (isPrivate && poll.nft_collection_type && poll.nft_collection_type.length > 0) {
          // Private poll: check if user owns NFT/token OR is the poll creator
          if (!account?.address) {
            setError("Please connect your wallet to view this private poll.");
            setIsLoading(false);
            return;
          }

          const isCreator = poll.creator?.toLowerCase() === account.address.toLowerCase();
          if (!isCreator) {
            if (isSuiTurkiye) {
              // SUI TURKIYE private polls require TR_WAL token
              const tokenCount = await getTokenBalance(client, account.address, TR_WAL_TOKEN_TYPE);
              if (tokenCount === 0) {
                setError("This is a private poll. You must own TR_WAL token to view it.");
                setIsLoading(false);
                return;
              }
            } else {
              // Other private polls require NFT
              const userNfts = await getUserNftsByType(client, account.address, poll.nft_collection_type);
              if (userNfts.length === 0) {
                setError("This is a private poll. You must own an NFT from this collection to view it.");
                setIsLoading(false);
                return;
              }
            }
          }
        }
        // Public poll (is_private === false, undefined, veya null): herkes görebilir, kontrol yapma

        setPollData(poll);

        // Find VoteRegistry
        const vrId = await findVoteRegistryByPollId(client, pollId);
        if (!vrId) {
          console.warn("VoteRegistry not found, continuing with empty VoteRegistry");
          // VoteRegistry bulunamazsa boş VoteRegistry ile devam et
          const options: VoteOption[] = poll.options.map((opt: any) => ({
            id: opt.id,
            name: opt.name,
            image: opt.image_url || undefined,
            voteCount: 0,
            percentage: 0,
          }));

          const poolData: VotePool = {
            id: poll.pollId,
            name: poll.name,
            description: poll.description,
            image: poll.image_url,
            startTime: poll.start_date,
            endTime: poll.end_date,
            options,
            totalVotes: 0,
            history: [
              {
                timestamp: poll.start_date,
                options: options.map((opt) => ({
                  optionId: opt.id,
                  percentage: 0,
                })),
              },
            ],
          };

          setLocalPool(poolData);
          setIsLoading(false);
          return;
        }

        setVoteRegistryId(vrId);

        // Read vote data from VoteRegistry
        const voteData = await getVoteRegistry(client, vrId);
        if (!voteData) {
          console.warn("Vote data could not be retrieved, continuing with empty VoteRegistry");
          // Boş VoteRegistry ile devam et
          const options: VoteOption[] = poll.options.map((opt: any) => ({
            id: opt.id,
            name: opt.name,
            image: opt.image_url || undefined,
            voteCount: 0,
            percentage: 0,
          }));

          const poolData: VotePool = {
            id: poll.pollId,
            name: poll.name,
            description: poll.description,
            image: poll.image_url,
            startTime: poll.start_date,
            endTime: poll.end_date,
            options,
            totalVotes: 0,
            history: [
              {
                timestamp: poll.start_date,
                options: options.map((opt) => ({
                  optionId: opt.id,
                  percentage: 0,
                })),
              },
            ],
          };

          setLocalPool(poolData);
          setIsLoading(false);
          return;
        }

        // Check if user has already voted
        const userAddress = account?.address;
        let userHasVoted = false;
        if (userAddress && voteData.usersVoted) {
          userHasVoted = voteData.usersVoted.some((addr: string) => addr.toLowerCase() === userAddress.toLowerCase());
        }
        setHasVoted(userHasVoted);

        // Create pool data
        const totalVotes = voteData.option_votes.reduce((sum: number, count: number) => sum + count, 0);
        
        const options: VoteOption[] = poll.options.map((opt: any, index: number) => {
          const voteCount = voteData.option_votes[index] || 0;
          const percentage = totalVotes > 0 ? (voteCount / totalVotes) * PERCENTAGE_MULTIPLIER : 0;
          
          return {
            id: opt.id,
            name: opt.name,
            image: opt.image_url || undefined,
            voteCount,
            percentage,
          };
        });

        const poolData: VotePool = {
          id: poll.pollId,
          name: poll.name,
          description: poll.description,
          image: poll.image_url,
          startTime: poll.start_date,
          endTime: poll.end_date,
          options,
          totalVotes,
          history: [
            {
              timestamp: poll.start_date,
              options: options.map((opt) => ({
                optionId: opt.id,
                percentage: opt.percentage,
              })),
            },
          ],
        };

        setLocalPool(poolData);
      } catch (err: any) {
        console.error("Data loading error:", err);
        setError(err.message || "An error occurred while loading data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [pollId, client, account?.address]);

  return {
    pollData,
    localPool,
    voteRegistryId,
    hasVoted,
    isLoading,
    error,
  };
}

