import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { findVoteRegistryByPollId, getVoteRegistry, getPollById, getUserNftsByType, createSealedVoteTransaction, createSealedVoteWithNftTransaction, getTokenBalance, calculateTrWalVotePower } from "../utils/blockchain";
import { VotePool, VoteOption } from "../data/mockData";
import { gsap } from "gsap";
import PillNav from "../components/PillNav";
import { getCollectionByType } from "../config/nftCollections";
import { saveUserVote } from "../utils/supabase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import pollarWalkVideo from "/pollar-walk.mp4";
import huggingVideo from "/hugging.mp4";
import "../styles/theme.css";

const VotingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutate: signAndExecute, isPending: isVoting } = useSignAndExecuteTransaction();
  const logoRef = useRef<HTMLImageElement>(null);

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [voteRegistryId, setVoteRegistryId] = useState<string | null>(null);
  const [localPool, setLocalPool] = useState<VotePool | null>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [pollData, setPollData] = useState<any>(null);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [userNfts, setUserNfts] = useState<Array<{ objectId: string; type: string }>>([]);
  const [selectedNftId, setSelectedNftId] = useState<string | null>(null);
  const [trWalTokenCount, setTrWalTokenCount] = useState<number>(0);

  const pollRequiresNft = !!(pollData?.nft_collection_type && pollData.nft_collection_type.length > 0);
  const isSuiTurkiyePoll = pollData?.nft_collection_type === "0x0000000000000000000000000000000000000000000000000000000000000000::sui_turkiye::SuiTurkiye";
  const nftCountForPoll = pollRequiresNft ? userNfts.length : 0;
  
  // Vote power calculation:
  // - Public polls = 1
  // - SUI TURKIYE polls = TR_WAL token count based (1-10: 1, 11-30: 2, 31-50: 30, 51-100: 40)
  // - Other NFT-gated polls = NFT count squared
  const derivedVotePower = pollRequiresNft
    ? isSuiTurkiyePoll
      ? calculateTrWalVotePower(trWalTokenCount)
      : nftCountForPoll > 0
        ? nftCountForPoll * nftCountForPoll
        : 0
    : 1;

  const handleLogoHover = () => {
    if (logoRef.current) {
      gsap.to(logoRef.current, {
        rotate: 360,
        duration: 0.6,
        ease: "power3.easeOut",
      });
    }
  };

  // Poll ve VoteRegistry'yi yükle
  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      setError("");

      try {
        // Read poll first
        const poll = await getPollById(client, id);
        if (!poll) {
          setError("Poll not found");
          setIsLoading(false);
          return;
        }

        // Check if poll is private and user has access
        // is_private is now stored on-chain in the Poll struct
        // Sadece gerçekten private olan poll'ları kontrol et (is_private === true)
        const isPrivate = poll.is_private === true;
        const isSuiTurkiye = poll.nft_collection_type === "0x0000000000000000000000000000000000000000000000000000000000000000::sui_turkiye::SuiTurkiye";
        
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
              const trWalTokenType = "0xa8ad8c2720f064676856f4999894974a129e3d15386b3d0a27f3a7f85811c64a::tr_wal::TR_WAL";
              const tokenCount = await getTokenBalance(client, account.address, trWalTokenType);
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
        const vrId = await findVoteRegistryByPollId(client, id);
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
          const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
          
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
  }, [id, client, account?.address]);

  // Load user NFTs if poll requires NFT
  // Special case: SUI TURKIYE polls use TR_WAL token instead of NFT
  useEffect(() => {
    const loadUserAssets = async () => {
      if (!account?.address || !pollData?.nft_collection_type || pollData.nft_collection_type.length === 0) {
        setUserNfts([]);
        setTrWalTokenCount(0);
        return;
      }

      try {
        // Check if this is a SUI TURKIYE poll
        const isSuiTurkiye = pollData.nft_collection_type === "0x0000000000000000000000000000000000000000000000000000000000000000::sui_turkiye::SuiTurkiye";
        
        if (isSuiTurkiye) {
          // For SUI TURKIYE polls, check for TR_WAL token balance
          const trWalTokenType = "0xa8ad8c2720f064676856f4999894974a129e3d15386b3d0a27f3a7f85811c64a::tr_wal::TR_WAL";
          const tokenCount = await getTokenBalance(client, account.address, trWalTokenType);
          setTrWalTokenCount(tokenCount);
          setUserNfts([]); // NFT gerekmiyor
        } else {
          // For other polls, use the poll's NFT collection type
          const nfts = await getUserNftsByType(client, account.address, pollData.nft_collection_type);
          setUserNfts(nfts);
          setTrWalTokenCount(0);
          if (nfts.length > 0) {
            setSelectedNftId(nfts[0].objectId); // Auto-select first NFT
          }
        }
      } catch (error) {
        console.error("Error loading user assets:", error);
        setUserNfts([]);
        setTrWalTokenCount(0);
      }
    };

    loadUserAssets();
  }, [account?.address, pollData?.nft_collection_type, client]);

  const handleVote = async (optionIndex: number) => {
    if (!account?.address) {
      setError("Please connect your wallet");
      return;
    }

    if (!id) {
      setError("Poll ID not found");
      return;
    }

    if (!voteRegistryId) {
      setError("VoteRegistry not found. Poll may not be registered with VoteRegistry yet.");
      return;
    }

    if (isVoting) {
      return; // Vote transaction is already in progress
    }

    if (hasVoted) {
      setError("You have already voted in this poll. Each user can only vote once.");
      return;
    }

    setError("");
    setSelectedOption(optionIndex);

    if (pollRequiresNft) {
      if (isSuiTurkiyePoll) {
        // SUI TURKIYE polls require TR_WAL token
        if (trWalTokenCount === 0) {
          setError("This poll requires TR_WAL token. You don't own any TR_WAL tokens.");
          setSelectedOption(null);
          return;
        }
      } else {
        // Other polls require NFT
        if (userNfts.length === 0) {
          setError("This poll requires an NFT from the collection. You don't own any NFTs from this collection.");
          setSelectedOption(null);
          return;
        }
        
        if (!selectedNftId) {
          setError("Please select an NFT to vote with.");
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
            id,
            optionIndex,
            votePower,
            voteRegistryId,
            pollData.nft_collection_type,
            selectedNftId
          );
        } else {
          // For public polls or SUI TURKIYE polls (token-based), use regular sealed vote
          tx = await createSealedVoteTransaction(client, id, optionIndex, votePower, voteRegistryId);
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
            if (account?.address && id) {
              try {
                await saveUserVote(account.address, id);
                console.log("Vote saved to database");
              } catch (error) {
                console.error("Error saving vote to database:", error);
                // Don't block the flow if database save fails
              }
            }
            
            // Show success modal with video
            setShowSuccessModal(true);
            
            // Get transaction digest and wait for transaction completion
            const transactionDigest = result.digest;
            if (transactionDigest) {
              try {
                // Wait for transaction completion (maximum 10 seconds)
                await client.waitForTransaction({
                  digest: transactionDigest,
                  timeout: 10000,
                  pollInterval: 500,
                });
                console.log("Transaction completed:", transactionDigest);
              } catch (waitError) {
                console.warn("Transaction wait error (continuing):", waitError);
              }
            }

            // Re-read VoteRegistry (with retries) and refresh poll data
            const refreshVoteData = async (retries = 3): Promise<void> => {
              if (!voteRegistryId || !id) {
                return;
              }

              for (let attempt = 1; attempt <= retries; attempt++) {
                try {
                  // Wait a bit (for blockchain data to update)
                  await new Promise(resolve => setTimeout(resolve, attempt * 1000));

                  // Re-fetch poll data to ensure we have the latest image URL
                  const poll = await getPollById(client, id);
                  const voteData = await getVoteRegistry(client, voteRegistryId);
                  
                  console.log(`VoteData (attempt ${attempt}):`, voteData);
                  
                  if (voteData && poll) {
                    const totalVotes = voteData.option_votes.reduce((sum: number, count: number) => sum + count, 0);
                    const options: VoteOption[] = poll.options.map((opt: any, idx: number) => {
                      const voteCount = voteData.option_votes[idx] || 0;
                      const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
                      return {
                        id: opt.id,
                        name: opt.name,
                        image: opt.image_url || undefined,
                        voteCount,
                        percentage,
                      };
                    });

                    setPollData(poll); // Update pollData with fresh data
                    setLocalPool({
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
                    });
                    setSelectedOption(null);
                    setHasVoted(true);
                    console.log("Vote data updated successfully!");
                    return; // Success, exit
                  }
                } catch (err) {
                  console.error(`Refresh error (attempt ${attempt}):`, err);
                  if (attempt === retries) {
                    // If last attempt fails, inform user
                    setError("Vote submitted but data could not be updated. Please refresh the page.");
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
              setHasVoted(true); // Update frontend state
            } else if (errorStr.includes("EInvalidOptionIndex") || errorStr.includes("14")) {
              errorMessage = "Invalid option index";
            } else if (errorStr.includes("EInvalidVoteRegistry") || errorStr.includes("9")) {
              errorMessage = "VoteRegistry does not belong to this poll";
            } else {
              errorMessage = error.message || errorStr || "An error occurred while voting";
            }
            
            setError(errorMessage);
            setSelectedOption(null);
          },
        }
      );
    } catch (error: any) {
      console.error("Vote error:", error);
      setError(error.message || "An error occurred while voting");
      setSelectedOption(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get theme for poll's NFT collection
  const pollCollection = pollData?.nft_collection_type 
    ? getCollectionByType(pollData.nft_collection_type)
    : null;
  
  const theme = pollCollection?.theme;
  // Always use dark background like other pages
  const defaultBackground = "linear-gradient(180deg, #000000 0%, #0a1128 50%, #000000 100%)";
  const backgroundGradient = defaultBackground; // Keep dark background, NFT theme only affects NFT images

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#000000", padding: "2rem", position: "relative" }}>
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          justifyContent: "center", 
          minHeight: "80vh",
          gap: "1.5rem",
          position: "relative",
          zIndex: 1
        }}>
          <video
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: "clamp(200px, 30vw, 400px)",
              height: "auto",
              maxWidth: "100%",
            }}
          >
            <source src={pollarWalkVideo} type="video/mp4" />
          </video>
          {/* Loading metinleri kaldırıldı */}
        </div>
      </div>
    );
  }

  if (error && !localPool) {
    return (
      <div style={{ minHeight: "100vh", background: backgroundGradient, padding: "2rem", position: "relative" }}>
        <div className="container" style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          <p style={{ color: "#ef4444", fontSize: "1.2rem", marginBottom: "1rem" }}>Error: {error}</p>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
            Poll ID: {id}
          </p>
          <Link to="/vote-pools" className="button button-primary" style={{ marginTop: "1rem" }}>
            Go Back
          </Link>
        </div>
      </div>
    );
  }

  if (!localPool) {
    return (
      <div style={{ minHeight: "100vh", background: backgroundGradient, padding: "2rem", position: "relative" }}>
        <div className="container" style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          <p style={{ color: "var(--text-secondary)" }}>Vote pool not found.</p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.5rem" }}>
            Poll ID: {id}
          </p>
          <Link to="/vote-pools" className="button button-primary" style={{ marginTop: "1rem" }}>
            Back to Vote Pools
          </Link>
        </div>
      </div>
    );
  }

  // Prepare chart data from history
  const chartData = localPool.history.map((entry) => {
    const dataPoint: any = {
      date: new Date(entry.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    };
    entry.options.forEach((opt) => {
      const option = localPool.options.find((o) => o.id === opt.optionId);
      if (option) {
        dataPoint[option.name] = opt.percentage;
      }
    });
    return dataPoint;
  });

  // Add current state to chart data
  const currentDataPoint: any = {
    date: "Now",
  };
  localPool.options.forEach((opt) => {
    currentDataPoint[opt.name] = opt.percentage;
  });
  chartData.push(currentDataPoint);

  const colors = ["#3b82f6", "#87ceeb", "#60a5fa", "#93c5fd"];

  return (
    <div 
      style={{ 
        minHeight: "100vh", 
        background: backgroundGradient,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Character Images - Left and Right Sides (For Public polls and Hero) */}
      {(!pollData?.nft_collection_type || 
        pollData.nft_collection_type.length === 0) && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
          {/* Left Side Characters */}
          <div
            className="character-side-left"
            style={{
              position: "absolute",
              left: "clamp(0.5rem, 2vw, 2rem)",
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              flexDirection: "column",
              gap: "clamp(1rem, 2vw, 2rem)",
            }}
          >
            <img
              src="/pollarpng.png"
              alt="Pollar Character"
              className="character-card"
              style={{
                width: "clamp(80px, 12vw, 200px)",
                height: "clamp(80px, 12vw, 200px)",
                objectFit: "contain",
                borderRadius: "16px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                transform: "rotate(-3deg)",
                background: "rgba(0, 0, 0, 0.2)",
              }}
            />
            <img
              src="/sealpng.png"
              alt="Seal Character"
              className="character-card"
              style={{
                width: "clamp(80px, 12vw, 200px)",
                height: "clamp(80px, 12vw, 200px)",
                objectFit: "contain",
                borderRadius: "16px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                transform: "rotate(3deg)",
                background: "rgba(0, 0, 0, 0.2)",
              }}
            />
          </div>

          {/* Right Side Characters */}
          <div
            className="character-side-right"
            style={{
              position: "absolute",
              right: "clamp(0.5rem, 2vw, 2rem)",
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              flexDirection: "column",
              gap: "clamp(1rem, 2vw, 2rem)",
            }}
          >
            <img
              src="/walruspng.png"
              alt="Walrus Character"
              className="character-card"
              style={{
                width: "clamp(80px, 12vw, 200px)",
                height: "clamp(80px, 12vw, 200px)",
                objectFit: "contain",
                borderRadius: "16px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                transform: "rotate(3deg)",
                background: "rgba(0, 0, 0, 0.2)",
              }}
            />
            <img
              src="/friends.png"
              alt="Friends Character"
              className="character-card"
              style={{
                width: "clamp(80px, 12vw, 200px)",
                height: "clamp(80px, 12vw, 200px)",
                objectFit: "contain",
                borderRadius: "16px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                transform: "rotate(-3deg)",
                background: "rgba(0, 0, 0, 0.2)",
              }}
            />
          </div>
        </div>
      )}

      {/* Background NFT Images - Left and Right Sides (Only for Popkins and Tallys) */}
      {theme?.backgroundImages && theme.backgroundImages.length > 0 && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 0,
              pointerEvents: "none",
              overflow: "hidden",
            }}
          >
            {/* Left Side NFTs */}
            <div
              className="nft-side-left"
              style={{
                position: "absolute",
                left: "clamp(0.5rem, 2vw, 2rem)",
                top: "50%",
                transform: "translateY(-50%)",
                display: "flex",
                flexDirection: "column",
                gap: "clamp(1rem, 2vw, 2rem)",
              }}
            >
              {theme.backgroundImages.slice(0, 3).map((imageUrl, index) => (
                <div
                  key={`left-${index}`}
                  className="nft-card"
                  style={{
                    width: "clamp(80px, 12vw, 200px)",
                    height: "clamp(80px, 12vw, 200px)",
                    backgroundImage: `url(${imageUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    borderRadius: "16px",
                    filter: "blur(1.5px)",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    transform: `rotate(${index * 3 - 3}deg)`,
                  }}
                />
              ))}
            </div>

            {/* Right Side NFTs */}
            <div
              className="nft-side-right"
              style={{
                position: "absolute",
                right: "clamp(0.5rem, 2vw, 2rem)",
                top: "50%",
                transform: "translateY(-50%)",
                display: "flex",
                flexDirection: "column",
                gap: "clamp(1rem, 2vw, 2rem)",
              }}
            >
              {theme.backgroundImages.slice(3, 6).map((imageUrl, index) => (
                <div
                  key={`right-${index}`}
                  className="nft-card"
                  style={{
                    width: "clamp(80px, 12vw, 200px)",
                    height: "clamp(80px, 12vw, 200px)",
                    backgroundImage: `url(${imageUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    borderRadius: "16px",
                    filter: "blur(1.5px)",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    transform: `rotate(${index * -3 + 3}deg)`,
                  }}
                />
              ))}
            </div>
          </div>
          <style>{`
            @media (max-width: 1024px) {
              .nft-side-left,
              .nft-side-right,
              .character-side-left,
              .character-side-right {
                display: none !important;
              }
              .main-content-responsive {
                padding-left: clamp(1rem, 3vw, 2rem) !important;
                padding-right: clamp(1rem, 3vw, 2rem) !important;
              }
            }
            @media (min-width: 1025px) and (max-width: 1400px) {
              .nft-card,
              .character-card {
                width: clamp(100px, 10vw, 150px) !important;
                height: clamp(100px, 10vw, 150px) !important;
              }
              .main-content-responsive {
                padding-left: clamp(1rem, calc(10vw + 2rem), calc(150px + 3rem)) !important;
                padding-right: clamp(1rem, calc(10vw + 2rem), calc(150px + 3rem)) !important;
              }
            }
            @media (min-width: 1401px) {
              .main-content-responsive {
                padding-left: clamp(2rem, calc(12vw + 2rem), calc(200px + 4rem)) !important;
                padding-right: clamp(2rem, calc(12vw + 2rem), calc(200px + 4rem)) !important;
              }
            }
          `}</style>
        </>
      )}
      
      <div style={{ position: "relative", zIndex: 1 }}>
      {/* Header */}
      <header
        style={{
          padding: "clamp(0.35rem, 0.7vw, 0.5rem) clamp(1rem, 2.5vw, 1.5rem)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          position: "fixed",
          width: "100%",
          boxSizing: "border-box",
          top: 0,
          left: 0,
          zIndex: 1000,
          backdropFilter: "blur(10px)",
          background: "rgba(0, 0, 0, 0.05)",
        }}
      >
        {/* Sol Taraf - Logo + Proje İsmi */}
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <img 
            ref={logoRef}
            src="/pollar-logo.png" 
            alt="Pollar Logo" 
            onMouseEnter={handleLogoHover}
            style={{
              width: "clamp(40px, 6vw, 50px)", 
              height: "clamp(40px, 6vw, 50px)",
              borderRadius: "8px",
              cursor: "pointer",
            }} 
          />
          <h1 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: "700", color: "var(--text-primary)", fontFamily: "'Bevellier', sans-serif" }}>
            POLLAR
          </h1>
        </Link>

        {/* Orta - PillNav */}
        <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", zIndex: 100 }}>
          <PillNav
            logo="/pollar-logo.png"
            logoAlt="Pollar Logo"
            items={[
              { label: 'Home', href: '/' },
              { label: 'Pools', href: '/vote-pools' },
              { label: 'Pricing', href: '/#pricing' },
            ]}
            activeHref={id ? `/voting/${id}` : undefined}
            baseColor="transparent"
            pillColor="#ffffff"
            hoveredPillTextColor="#ffffff"
            pillTextColor="#000000"
            hoverCircleColor="#000000"
          />
        </div>

        {/* Sağ Taraf - Back to Pools Butonu */}
        <button
          onClick={() => navigate("/vote-pools")}
          style={{ 
            textDecoration: "none",
            display: "inline-block",
            transition: "all 0.3s ease",
            cursor: "pointer",
            lineHeight: "0",
            borderRadius: "0.5rem",
            overflow: "hidden",
            border: "none",
            background: "transparent",
            padding: "0",
          }}
        >
          <img 
            src="/back-to-pools.png" 
            alt="Back to Pools" 
            style={{
              width: "clamp(90px, 12vw, 140px)",
              height: "auto",
              objectFit: "cover",
              display: "block",
              borderRadius: "0.5rem",
            }}
          />
        </button>
      </header>

      {/* Main Content */}
      <main 
        className="main-content-responsive"
        style={{ 
          padding: "clamp(1rem, 3vw, 2rem)",
          paddingTop: "clamp(6rem, 10vw, 8rem)",
          paddingLeft: "clamp(1rem, calc(12vw + 2rem), calc(200px + 4rem))",
          paddingRight: "clamp(1rem, calc(12vw + 2rem), calc(200px + 4rem))",
          maxWidth: "1400px", 
          margin: "0 auto", 
          position: "relative",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Pool Header */}
        <div style={{ marginBottom: "clamp(1.5rem, 3vw, 2rem)" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
              gap: "clamp(1rem, 3vw, 2rem)",
              marginBottom: "clamp(1.5rem, 3vw, 2rem)",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "200px",
                aspectRatio: "1",
                borderRadius: "1rem",
                overflow: "hidden",
                background: "var(--bg-secondary)",
                margin: "0 auto",
              }}
            >
              <img
                src={localPool.image}
                alt={localPool.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                <h2
                  style={{
                    fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                    fontWeight: "700",
                    margin: 0,
                    color: "var(--text-primary)",
                    flex: 1,
                  }}
                >
                  {localPool.name}
                </h2>
                <button
                  onClick={() => {
                    const fromCollection = searchParams.get("fromCollection");
                    // Eğer fromCollection parametresi varsa, o collection'a yönlendir
                    if (fromCollection && fromCollection.trim() !== "") {
                      navigate(`/vote-pools?collection=${encodeURIComponent(fromCollection)}`);
                    } else {
                      // Eğer yoksa, genel vote-pools sayfasına git
                      navigate("/vote-pools");
                    }
                  }}
                  style={{
                    background: "transparent",
                    border: "1px solid var(--border-color)",
                    borderRadius: "0.5rem",
                    padding: "0.5rem 1rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    color: "var(--text-primary)",
                    fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--bg-secondary)";
                    e.currentTarget.style.borderColor = "var(--color-light-blue)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.borderColor = "var(--border-color)";
                  }}
                >
                  <span>←</span>
                  <span>Back</span>
                </button>
              </div>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "clamp(1rem, 2vw, 1.1rem)",
                  lineHeight: "1.8",
                  marginBottom: "1.5rem",
                }}
              >
                {localPool.description}
              </p>
              <div style={{ display: "flex", gap: "clamp(1rem, 3vw, 2rem)", flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: "clamp(0.75rem, 1.5vw, 0.85rem)", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                    Total Votes
                  </div>
                  <div style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.5rem)", fontWeight: "bold", color: "var(--color-light-blue)" }}>
                    {localPool.totalVotes.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "clamp(0.75rem, 1.5vw, 0.85rem)", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                    Starts
                  </div>
                  <div style={{ fontSize: "clamp(0.9rem, 1.8vw, 1rem)", color: "var(--text-secondary)" }}>
                    {formatDate(localPool.startTime)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "clamp(0.75rem, 1.5vw, 0.85rem)", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                    Ends
                  </div>
                  <div style={{ fontSize: "clamp(0.9rem, 1.8vw, 1rem)", color: "var(--text-secondary)" }}>
                    {formatDate(localPool.endTime)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div 
          className="voting-layout-responsive"
          style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "clamp(1.5rem, 3vw, 2rem)", alignItems: "start" }}
        >
          {/* Chart - Left Section */}
          <div className="card" style={{
            background: "linear-gradient(135deg, rgba(30, 58, 138, 0.1) 0%, rgba(27, 27, 27, 0.95) 100%)",
            border: "1px solid rgba(96, 165, 250, 0.2)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(96, 165, 250, 0.1)",
          }}>
            <div style={{ marginBottom: "clamp(1.5rem, 3vw, 2rem)" }}>
            <h3
              style={{
                fontSize: "clamp(1.5rem, 3vw, 1.75rem)",
                  fontWeight: "700",
                  marginBottom: "0.5rem",
                color: "var(--text-primary)",
                  background: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Voting Trends
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "clamp(0.9rem, 1.5vw, 1rem)" }}>
                Track how votes have changed over time
              </p>
            </div>
            <div style={{
              background: "rgba(0, 0, 0, 0.2)",
              borderRadius: "0.75rem",
              padding: "1rem",
              border: "1px solid rgba(255, 255, 255, 0.05)",
            }}>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="rgba(255, 255, 255, 0.1)" 
                    strokeOpacity={0.3}
                  />
                  <XAxis 
                    dataKey="date" 
                    stroke="var(--text-secondary)"
                    style={{ fontSize: "0.875rem" }}
                    tick={{ fill: "var(--text-muted)" }}
                  />
                  <YAxis 
                    stroke="var(--text-secondary)" 
                    domain={[0, 100]}
                    style={{ fontSize: "0.875rem" }}
                    tick={{ fill: "var(--text-muted)" }}
                    label={{ value: "Percentage (%)", angle: -90, position: "insideLeft", fill: "var(--text-muted)", style: { fontSize: "0.875rem" } }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(27, 27, 27, 0.95)",
                      border: "1px solid rgba(96, 165, 250, 0.3)",
                      borderRadius: "0.75rem",
                      color: "var(--text-primary)",
                      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
                      padding: "0.75rem 1rem",
                    }}
                    labelStyle={{ color: "var(--text-primary)", fontWeight: "600", marginBottom: "0.5rem" }}
                    itemStyle={{ color: "var(--text-secondary)", padding: "0.25rem 0" }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: "1rem" }}
                    iconType="line"
                    formatter={(value) => <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>{value}</span>}
                  />
                  {localPool.options.map((option, index) => (
                    <Line
                      key={option.id}
                      type="monotone"
                      dataKey={option.name}
                      stroke={colors[index % colors.length]}
                      strokeWidth={3}
                      dot={{ fill: colors[index % colors.length], r: 5, strokeWidth: 2, stroke: "rgba(0, 0, 0, 0.2)" }}
                      activeDot={{ r: 7, stroke: colors[index % colors.length], strokeWidth: 2, fill: "#fff" }}
                      strokeDasharray={index === 0 ? "0" : "5 5"}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Voting Options - Right Section */}
          <div style={{ display: "flex", flexDirection: "column", gap: "clamp(1.5rem, 3vw, 2rem)" }}>
            {!account?.address && (
              <div
                style={{
                  padding: "1rem",
                  background: "rgba(59, 130, 246, 0.1)",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                  borderRadius: "0.5rem",
                  color: "var(--color-light-blue)",
                  fontSize: "0.9rem",
                }}
              >
                Please connect your wallet to vote. You can view details and results.
              </div>
            )}
            {hasVoted && account?.address && (
              <div
                style={{
                  padding: "1rem",
                  background: "rgba(251, 191, 36, 0.1)",
                  border: "1px solid rgba(251, 191, 36, 0.3)",
                  borderRadius: "0.5rem",
                  color: "#fbbf24",
                  fontSize: "0.9rem",
                }}
              >
                You have already voted in this poll. Thank you!
              </div>
            )}
            {error && (
              <div
                style={{
                  padding: "1rem",
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "0.5rem",
                  color: "#ef4444",
                }}
              >
                {error}
              </div>
            )}
            
            {/* NFT info (if poll requires NFT) */}
            {pollRequiresNft && account?.address && (
              <>
                {isSuiTurkiyePoll ? (
                  trWalTokenCount === 0 ? (
                    <div
                      style={{
                        padding: "1rem",
                        background: "rgba(59, 130, 246, 0.1)",
                        border: "1px solid rgba(59, 130, 246, 0.3)",
                        borderRadius: "0.5rem",
                        color: "#ef4444",
                        fontSize: "0.9rem",
                      }}
                    >
                      You don't own any TR_WAL tokens. You cannot vote in this poll.
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: "0.85rem 1rem",
                        background: "rgba(15, 23, 42, 0.6)",
                        border: "1px solid rgba(148, 163, 184, 0.3)",
                        borderRadius: "0.5rem",
                        color: "var(--text-primary)",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                      }}
                    >
                      TR_WAL tokens: <span style={{ color: "#34d399" }}>{trWalTokenCount}</span> | Vote power: <span style={{ color: "#34d399" }}>{derivedVotePower}</span>
                    </div>
                  )
                ) : (
                  nftCountForPoll === 0 ? (
                    <div
                      style={{
                        padding: "1rem",
                        background: "rgba(59, 130, 246, 0.1)",
                        border: "1px solid rgba(59, 130, 246, 0.3)",
                        borderRadius: "0.5rem",
                        color: "#ef4444",
                        fontSize: "0.9rem",
                      }}
                    >
                      You don't own any NFTs from this collection. You cannot vote in this poll.
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: "0.85rem 1rem",
                        background: "rgba(15, 23, 42, 0.6)",
                        border: "1px solid rgba(148, 163, 184, 0.3)",
                        borderRadius: "0.5rem",
                        color: "var(--text-primary)",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                      }}
                    >
                      Vote power in this poll:{" "}
                      <span style={{ color: "#34d399" }}>{derivedVotePower}</span>
                    </div>
                  )
                )}
              </>
            )}
            
            <div style={{ 
              display: "flex", 
              flexDirection: "column",
              gap: "1rem" 
            }}>
              {localPool.options.map((option, index) => {
                const isSelected = selectedOption === index;
                const isDisabled = !account?.address || isVoting || hasVoted;
                
                // Calculate percentage difference for color logic
                const maxPercentage = Math.max(...localPool.options.map(opt => opt.percentage));
                const minPercentage = Math.min(...localPool.options.map(opt => opt.percentage));
                const percentageDiff = maxPercentage - option.percentage;
                const totalDiff = maxPercentage - minPercentage;
                
                // Color logic: açık ara öndeki yeşil, gerideki kırmızı, denkse turuncu
                let percentageColor = "#60a5fa"; // default blue
                if (totalDiff > 0) {
                  const diffRatio = percentageDiff / totalDiff;
                  if (diffRatio === 0) {
                    // Açık ara öndeki
                    percentageColor = "#10b981"; // green
                  } else if (diffRatio > 0.3) {
                    // Gerideki
                    percentageColor = "#ef4444"; // red
                  } else {
                    // Denkse (yakın)
                    percentageColor = "#f59e0b"; // orange/amber
                  }
                }
                
                return (
                <div
                  key={option.id}
                  onClick={() => {
                    if (!account?.address) {
                      setError("Please connect your wallet to vote");
                      return;
                    }
                    if (hasVoted) {
                      setError("You have already voted in this poll.");
                      return;
                    }
                    if (!isVoting) {
                      handleVote(index);
                    }
                  }}
                  style={{
                    padding: "1.25rem",
                    background: isSelected 
                      ? "linear-gradient(135deg, rgba(96, 165, 250, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%)"
                      : "rgba(27, 27, 27, 0.6)",
                    border: isSelected
                      ? "2px solid rgba(96, 165, 250, 0.6)"
                      : "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "0.875rem",
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    opacity: isDisabled ? 0.6 : 1,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: isSelected 
                      ? "0 4px 20px rgba(96, 165, 250, 0.3), 0 0 0 1px rgba(96, 165, 250, 0.2)"
                      : "0 2px 8px rgba(0, 0, 0, 0.2)",
                  }}
                  onMouseEnter={(e) => {
                    if (isDisabled) return;
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = "rgba(96, 165, 250, 0.5)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 6px 20px rgba(96, 165, 250, 0.25)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.2)";
                    }
                  }}
                >
                  {/* Selected Indicator */}
                  {isSelected && (
                    <div style={{
                      position: "absolute",
                      top: "0.75rem",
                      right: "0.75rem",
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 1,
                      boxShadow: "0 0 10px rgba(96, 165, 250, 0.6)",
                    }}>
                      <span style={{ color: "#fff", fontSize: "0.875rem" }}>✓</span>
                    </div>
                  )}

                  {/* Option Header with Image and Info */}
                  <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", alignItems: "flex-start" }}>
                  {option.image && (
                    <div
                      style={{
                          width: "80px",
                          height: "80px",
                          minWidth: "80px",
                          borderRadius: "0.75rem",
                        overflow: "hidden",
                        background: "var(--bg-secondary)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          flexShrink: 0,
                      }}
                    >
                      <img
                        src={option.image}
                        alt={option.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                            transition: "transform 0.3s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (!isDisabled) {
                              e.currentTarget.style.transform = "scale(1.1)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                        }}
                      />
                    </div>
                  )}
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem", gap: "1rem" }}>
                    <h4
                      style={{
                        fontSize: "clamp(1.1rem, 2vw, 1.25rem)",
                            fontWeight: "700",
                        color: "var(--text-primary)",
                            flex: 1,
                            lineHeight: "1.3",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                      }}
                    >
                      {option.name}
                    </h4>
                        <div style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          gap: "0.25rem",
                          flexShrink: 0,
                        }}>
                    <span
                      style={{
                              fontSize: "clamp(1.5rem, 3vw, 2rem)",
                              fontWeight: "800",
                              color: percentageColor,
                              lineHeight: "1",
                      }}
                    >
                      {option.percentage.toFixed(1)}%
                    </span>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            {option.voteCount.toLocaleString()} {option.voteCount === 1 ? "vote" : "votes"}
                  </div>
                        </div>
                      </div>
                      
                      {/* Enhanced Progress Bar */}
                  <div
                    style={{
                      height: "10px",
                          background: "rgba(255, 255, 255, 0.05)",
                          borderRadius: "9999px",
                      overflow: "hidden",
                          position: "relative",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <div
                      style={{
                        width: `${option.percentage}%`,
                        height: "100%",
                        background: `linear-gradient(90deg, ${percentageColor} 0%, ${percentageColor}CC 100%)`,
                        transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                        borderRadius: "9999px",
                        boxShadow: `0 0 8px ${percentageColor}40, inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
                        position: "relative",
                      }}
                    >
                          {/* Shine effect */}
                          <div style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: "50%",
                            background: "linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, transparent 100%)",
                            borderRadius: "9999px",
                          }} />
                  </div>
                    </div>
                    </div>
                  </div>
                  
                  {/* Status Messages */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: "1.5rem" }}>
                    <div style={{ flex: 1 }} />
                    {!account?.address && (
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                        Connect wallet to vote
                      </div>
                    )}
                    {isVoting && isSelected && (
                      <div style={{ 
                        fontSize: "0.8rem", 
                        color: "#60a5fa",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}>
                        <div style={{
                          width: "12px",
                          height: "12px",
                          border: "2px solid #60a5fa",
                          borderTopColor: "transparent",
                          borderRadius: "50%",
                          animation: "spin 0.8s linear infinite",
                        }} />
                        Processing...
                      </div>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Success Modal with Video */}
      {showSuccessModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1rem",
          }}
          onClick={() => setShowSuccessModal(false)}
        >
          <div
            style={{
              position: "relative",
              maxWidth: "90vw",
              maxHeight: "90vh",
              backgroundColor: "var(--bg-card)",
              borderRadius: "1rem",
              padding: "1rem",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowSuccessModal(false)}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "rgba(0, 0, 0, 0.5)",
                border: "none",
                borderRadius: "50%",
                width: "2.5rem",
                height: "2.5rem",
                color: "white",
                fontSize: "1.5rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10000,
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(0, 0, 0, 0.8)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(0, 0, 0, 0.5)";
              }}
            >
              ×
            </button>

            {/* Video */}
            <video
              src={huggingVideo}
              autoPlay
              loop
              muted
              style={{
                width: "100%",
                maxWidth: "800px",
                height: "auto",
                borderRadius: "0.5rem",
                display: "block",
              }}
            />
            
            {/* Success Message */}
            <div
              style={{
                textAlign: "center",
                marginTop: "1rem",
                color: "var(--text-primary)",
                fontSize: "1.25rem",
                fontWeight: "600",
              }}
            >
              Thank you for voting! 🎉
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default VotingPage;

