import { useState } from "react";
import { useSuiClient, useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { createSealedVoteTransaction, createSealedVoteWithNftTransaction, getPollById, getVoteRegistry, calculateTrWalVotePower } from "../utils/blockchain";
import { saveUserVote } from "../utils/supabase";
import { VotePool, VoteOption } from "../types/poll";
import { PERCENTAGE_MULTIPLIER, TRANSACTION_TIMEOUT_MS, RETRY_DELAY_MS } from "../constants/appConstants";
import { getPollStatus } from "../utils/pollHelpers";

interface UseVotingOptions {
  pollId: string | undefined;
  voteRegistryId: string | null;
  pollData: any | null;
  pollRequiresNft: boolean;
  isSuiTurkiyePoll: boolean;
  userNfts: Array<{ objectId: string; type: string }>;
  selectedNftId: string | null;
  trWalTokenCount: number;
  hasVoted: boolean;
  localPool: VotePool | null;
  onVoteSuccess: (updatedPool: VotePool) => void;
  onError: (error: string) => void;
  onShowSuccessModal: () => void;
}

interface UseVotingResult {
  handleVote: (optionIndex: number) => Promise<void>;
  isVoting: boolean;
  votingError: string;
  selectedOption: number | null;
  setSelectedOption: (option: number | null) => void;
}

/**
 * Custom hook for handling voting logic
 * @param options - Voting options including poll data, user assets, and callbacks
 * @returns Voting handler function, loading state, error state, and selected option
 */
export function useVoting({
  pollId,
  voteRegistryId,
  pollData,
  pollRequiresNft,
  isSuiTurkiyePoll,
  userNfts,
  selectedNftId,
  trWalTokenCount,
  hasVoted,
  localPool,
  onVoteSuccess,
  onError,
  onShowSuccessModal,
}: UseVotingOptions): UseVotingResult {
  const client = useSuiClient();
  const account = useCurrentAccount();
  const { mutate: signAndExecute, isPending: isVoting } = useSignAndExecuteTransaction();
  const [votingError, setVotingError] = useState<string>("");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const handleVote = async (optionIndex: number) => {
    if (!account?.address) {
      const errorMsg = "Please connect your wallet";
      setVotingError(errorMsg);
      onError(errorMsg);
      return;
    }

    if (!pollId) {
      const errorMsg = "Poll ID not found";
      setVotingError(errorMsg);
      onError(errorMsg);
      return;
    }

    if (!voteRegistryId) {
      const errorMsg = "VoteRegistry not found. Poll may not be registered with VoteRegistry yet.";
      setVotingError(errorMsg);
      onError(errorMsg);
      return;
    }

    if (isVoting) {
      return; // Vote transaction is already in progress
    }

    if (hasVoted) {
      const errorMsg = "You have already voted in this poll. Each user can only vote once.";
      setVotingError(errorMsg);
      onError(errorMsg);
      return;
    }

    // Check if poll has ended
    if (localPool) {
      const pollStatus = getPollStatus(localPool);
      if (pollStatus === "ended") {
        const errorMsg = "This poll has ended. Voting is no longer available.";
        setVotingError(errorMsg);
        onError(errorMsg);
        setSelectedOption(null);
        return;
      }
    }

    setVotingError("");
    setSelectedOption(optionIndex);

    if (pollRequiresNft) {
      if (isSuiTurkiyePoll) {
        // SUI TURKIYE polls require TR_WAL token
        if (trWalTokenCount === 0) {
          const errorMsg = "This poll requires TR_WAL token. You don't own any TR_WAL tokens.";
          setVotingError(errorMsg);
          onError(errorMsg);
          setSelectedOption(null);
          return;
        }
      } else {
        // Other polls require NFT
        if (userNfts.length === 0) {
          const errorMsg = "This poll requires an NFT from the collection. You don't own any NFTs from this collection.";
          setVotingError(errorMsg);
          onError(errorMsg);
          setSelectedOption(null);
          return;
        }
        
        if (!selectedNftId) {
          const errorMsg = "Please select an NFT to vote with.";
          setVotingError(errorMsg);
          onError(errorMsg);
          setSelectedOption(null);
          return;
        }
      }
    }

    // Calculate vote power based on poll type
    const votePower = pollRequiresNft
      ? isSuiTurkiyePoll
        ? calculateTrWalVotePower(trWalTokenCount)
        : Math.max(1, userNfts.length * userNfts.length)
      : 1;

    try {
      // Check if poll uses sealed (encrypted) voting
      // For now, we'll always use sealed voting for privacy
      // In the future, we can check VoteRegistry.is_sealed field
      const useSealedVoting = true; // Always use sealed voting for privacy
      
      // Create transaction - use sealed voting functions for privacy
      let tx;
      if (useSealedVoting) {
        // SUI TURKIYE polls use TR_WAL token (not NFT), so we use regular sealed vote without NFT
        // Other NFT-gated polls use NFT transaction
        if (pollRequiresNft && !isSuiTurkiyePoll && selectedNftId) {
          // For other NFT-gated polls, use NFT transaction
          tx = await createSealedVoteWithNftTransaction(
            client,
            pollId,
            optionIndex,
            votePower,
            voteRegistryId,
            pollData.nft_collection_type,
            selectedNftId
          );
        } else {
          // For public polls or SUI TURKIYE polls (token-based), use regular sealed vote
          tx = await createSealedVoteTransaction(client, pollId, optionIndex, votePower, voteRegistryId);
        }
      } else {
        // This should never happen as useSealedVoting is always true
        // But kept for safety
        throw new Error("Unencrypted voting is not supported. Please use sealed voting.");
      }

      // Transaction'ı gönder
      signAndExecute(
        {
          transaction: tx,
        } as any,
        {
          onSuccess: async (result: any) => {
            console.log("Vote submitted successfully!", result);
            
            // Save vote to database (only track which poll was voted on, not the option)
            if (account?.address && pollId) {
              try {
                await saveUserVote(account.address, pollId);
                console.log("Vote saved to database");
              } catch (error) {
                console.error("Error saving vote to database:", error);
                // Don't block the flow if database save fails
              }
            }
            
            // Show success modal with video
            onShowSuccessModal();
            
            // Get transaction digest and wait for transaction completion
            const transactionDigest = result.digest;
            if (transactionDigest) {
              try {
                // Wait for transaction completion (maximum 10 seconds)
                await client.waitForTransaction({
                  digest: transactionDigest,
                  timeout: TRANSACTION_TIMEOUT_MS,
                  pollInterval: 500,
                });
                console.log("Transaction completed:", transactionDigest);
              } catch (waitError) {
                console.warn("Transaction wait error (continuing):", waitError);
              }
            }

            // Re-read VoteRegistry (with retries) and refresh poll data
            const refreshVoteData = async (retries = 3): Promise<void> => {
              if (!voteRegistryId || !pollId) {
                return;
              }

              for (let attempt = 1; attempt <= retries; attempt++) {
                try {
                  // Wait a bit (for blockchain data to update)
                  await new Promise(resolve => setTimeout(resolve, attempt * RETRY_DELAY_MS));

                  // Re-fetch poll data to ensure we have the latest image URL
                  const poll = await getPollById(client, pollId);
                  const voteData = await getVoteRegistry(client, voteRegistryId);
                  
                  console.log(`VoteData (attempt ${attempt}):`, voteData);
                  
                  if (voteData && poll) {
                    const totalVotes = voteData.option_votes.reduce((sum: number, count: number) => sum + count, 0);
                    const options: VoteOption[] = poll.options.map((opt: any, idx: number) => {
                      const voteCount = voteData.option_votes[idx] || 0;
                      const percentage = totalVotes > 0 ? (voteCount / totalVotes) * PERCENTAGE_MULTIPLIER : 0;
                      return {
                        id: opt.id,
                        name: opt.name,
                        image: opt.image_url || undefined,
                        voteCount,
                        percentage,
                      };
                    });

                    const updatedPool: VotePool = {
                      id: poll.pollId,
                      name: poll.name,
                      description: poll.description,
                      image: poll.image_url,
                      startTime: poll.start_date,
                      endTime: poll.end_date,
                      options,
                      totalVotes,
                      history: localPool?.history || [
                        {
                          timestamp: poll.start_date,
                          options: options.map((opt) => ({
                            optionId: opt.id,
                            percentage: opt.percentage,
                          })),
                        },
                      ],
                    };

                    onVoteSuccess(updatedPool);
                    setSelectedOption(null);
                    console.log("Vote data updated successfully!");
                    return; // Success, exit
                  }
                } catch (err) {
                  console.error(`Refresh error (attempt ${attempt}):`, err);
                  if (attempt === retries) {
                    // If last attempt fails, inform user
                    const errorMsg = "Vote submitted but data could not be updated. Please refresh the page.";
                    setVotingError(errorMsg);
                    onError(errorMsg);
                  }
                }
              }
            };

            await refreshVoteData();
          },
          onError: (error: any) => {
            console.error("Vote error:", error);
            
            // Parse error message
            let errorMessage = "An error occurred while voting";
            const errorStr = error.message || error.toString() || "";
            
            if (errorStr.includes("EAlreadyVoted") || errorStr.includes("8")) {
              errorMessage = "You have already voted in this poll. Each user can only vote once.";
            } else if (errorStr.includes("EInvalidOptionIndex") || errorStr.includes("14")) {
              errorMessage = "Invalid option index";
            } else if (errorStr.includes("EInvalidVoteRegistry") || errorStr.includes("9")) {
              errorMessage = "VoteRegistry does not belong to this poll";
            } else {
              errorMessage = error.message || errorStr || "An error occurred while voting";
            }
            
            setVotingError(errorMessage);
            onError(errorMessage);
            setSelectedOption(null);
          },
        }
      );
    } catch (error: any) {
      console.error("Vote error:", error);
      const errorMsg = error.message || "An error occurred while voting";
      setVotingError(errorMsg);
      onError(errorMsg);
      setSelectedOption(null);
    }
  };

  return {
    handleVote,
    isVoting,
    votingError,
    selectedOption,
    setSelectedOption,
  };
}

