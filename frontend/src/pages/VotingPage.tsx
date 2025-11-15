import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { findVoteRegistryByPollId, getVoteRegistry, createVoteTransaction, getPollById } from "../utils/blockchain";
import { VotePool, VoteOption } from "../data/mockData";
import { gsap } from "gsap";
import PillNav from "../components/PillNav";
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
import "../styles/theme.css";

const VotingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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

    try {
      // Create transaction
      const tx = createVoteTransaction(id, optionIndex, voteRegistryId);

      // Transaction'ı gönder
      signAndExecute(
        {
          transaction: tx,
        } as any,
        {
          onSuccess: async (result: any) => {
            console.log("Vote submitted successfully!", result);
            
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

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)", padding: "2rem" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.2rem" }}>Loading...</p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.5rem" }}>
            Poll ID: {id}
          </p>
        </div>
      </div>
    );
  }

  if (error && !localPool) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)", padding: "2rem" }}>
        <div className="container" style={{ textAlign: "center" }}>
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
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)", padding: "2rem" }}>
        <div className="container" style={{ textAlign: "center" }}>
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
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* Header */}
      <header
        style={{
          padding: "clamp(0.35rem, 0.7vw, 0.5rem) clamp(1rem, 2.5vw, 1.5rem)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          position: "relative",
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
              width: "clamp(32px, 5vw, 40px)", 
              height: "clamp(32px, 5vw, 40px)",
              borderRadius: "8px",
              cursor: "pointer",
            }} 
          />
          <h1 style={{ fontSize: "clamp(1rem, 2vw, 1.25rem)", fontWeight: "700", color: "var(--text-primary)" }}>
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
              { label: 'Prediction Market', href: '/prediction-market' },
              { label: 'Pricing', href: '/#pricing' },
            ]}
            activeHref={id ? `/voting/${id}` : undefined}
            baseColor="#000000"
            pillColor="#ffffff"
            hoveredPillTextColor="#ffffff"
            pillTextColor="#000000"
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
      <main style={{ padding: "clamp(1rem, 3vw, 2rem)", maxWidth: "1400px", margin: "0 auto" }}>
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
              <h2
                style={{
                  fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                  fontWeight: "700",
                  marginBottom: "1rem",
                  color: "var(--text-primary)",
                }}
              >
                {localPool.name}
              </h2>
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

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))", gap: "clamp(1rem, 3vw, 2rem)" }}>
          {/* Voting Options */}
          <div className="card">
            <h3
              style={{
                fontSize: "clamp(1.5rem, 3vw, 1.75rem)",
                fontWeight: "600",
                marginBottom: "clamp(1rem, 2.5vw, 1.5rem)",
                color: "var(--text-primary)",
              }}
            >
              Cast Your Vote
            </h3>
            {!account?.address && (
              <div
                style={{
                  padding: "1rem",
                  background: "rgba(59, 130, 246, 0.1)",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                  borderRadius: "0.5rem",
                  color: "var(--color-light-blue)",
                  marginBottom: "1rem",
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
                  marginBottom: "1rem",
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
                  marginBottom: "1rem",
                }}
              >
                {error}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {localPool.options.map((option, index) => (
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
                    padding: "1.5rem",
                    background: selectedOption === index ? "var(--bg-secondary)" : "var(--bg-card)",
                    border:
                      selectedOption === index
                        ? "2px solid var(--color-light-blue)"
                        : "1px solid var(--border-color)",
                    borderRadius: "0.75rem",
                    cursor: !account?.address || isVoting || hasVoted ? "not-allowed" : "pointer",
                    opacity: !account?.address || isVoting || hasVoted ? 0.6 : 1,
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!account?.address || isVoting || hasVoted) return;
                    if (selectedOption !== index) {
                      e.currentTarget.style.borderColor = "var(--color-navy-light)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedOption !== index) {
                      e.currentTarget.style.borderColor = selectedOption === index ? "var(--color-light-blue)" : "var(--border-color)";
                    }
                  }}
                >
                  {option.image && (
                    <div
                      style={{
                        width: "100%",
                        height: "150px",
                        borderRadius: "0.5rem",
                        marginBottom: "1rem",
                        overflow: "hidden",
                        background: "var(--bg-secondary)",
                      }}
                    >
                      <img
                        src={option.image}
                        alt={option.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <h4
                      style={{
                        fontSize: "clamp(1.1rem, 2vw, 1.25rem)",
                        fontWeight: "600",
                        color: "var(--text-primary)",
                      }}
                    >
                      {option.name}
                    </h4>
                    <span
                      style={{
                        fontSize: "clamp(1.25rem, 2.5vw, 1.5rem)",
                        fontWeight: "bold",
                        color: "var(--color-light-blue)",
                      }}
                    >
                      {option.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: "10px",
                      background: "var(--bg-secondary)",
                      borderRadius: "5px",
                      overflow: "hidden",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <div
                      style={{
                        width: `${option.percentage}%`,
                        height: "100%",
                        background: `linear-gradient(90deg, ${colors[index % colors.length]} 0%, var(--color-light-blue) 100%)`,
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                      {option.voteCount.toLocaleString()} {option.voteCount === 1 ? "vote" : "votes"}
                    </div>
                    {!account?.address && (
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                        Connect wallet to vote
                      </div>
                    )}
                    {isVoting && selectedOption === index && (
                      <div style={{ fontSize: "0.75rem", color: "var(--color-light-blue)" }}>
                        Processing...
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div className="card">
            <h3
              style={{
                fontSize: "clamp(1.5rem, 3vw, 1.75rem)",
                fontWeight: "600",
                marginBottom: "clamp(1rem, 2.5vw, 1.5rem)",
                color: "var(--text-primary)",
              }}
            >
              Voting Trends
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="date" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "0.5rem",
                    color: "var(--text-primary)",
                  }}
                />
                <Legend />
                {localPool.options.map((option, index) => (
                  <Line
                    key={option.id}
                    type="monotone"
                    dataKey={option.name}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
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
              src="/hugging.mp4"
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
  );
};

export default VotingPage;

