import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { VotePool } from "../data/mockData";
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
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useBlockchainPoll } from "../utils/pollUtils";
import { encryptVote, decryptVotes } from "../utils/sealUtils";
import { contractConfig } from "../config/contractConfig";
import { getVoteRegistryByPoll } from "../utils/pollUtils";
import { findPollRegistry } from "../utils/blockchain";
import { findUserObjectId } from "../utils/userUtils";
import "../styles/theme.css";

const VotingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutate: signAndExecute, isPending: isVotingPending } = useSignAndExecuteTransaction();
  
  // Blockchain'den poll oku
  const { data: blockchainPoll, isLoading: isLoadingPoll } = useBlockchainPoll(id);
  
  const [pool, setPool] = useState<VotePool | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [localPool, setLocalPool] = useState<VotePool | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptError, setDecryptError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Blockchain poll'u local state'e çevir
  useEffect(() => {
    if (blockchainPoll) {
      setPool(blockchainPoll);
      setLocalPool(JSON.parse(JSON.stringify(blockchainPoll)));
    }
  }, [blockchainPoll]);

  // Şifreli oy verme fonksiyonu
  const handleVote = async (optionId: string) => {
    if (!localPool || !account?.address || !id) return;

    const optionIndex = localPool.options.findIndex((opt) => opt.id === optionId);
    if (optionIndex === -1) return;

    setSelectedOption(optionId);

    try {
      // 1. Oy verisini şifrele
      const voteData = {
        optionIndex,
        optionId,
      };

      const encryptedVoteBase64 = await encryptVote(voteData, id, client);

      // 2. Şifrelenmiş oyu localStorage'a kaydet (geçici - daha sonra backend API'ye taşınabilir)
      const votesKey = `encrypted_votes_${id}`;
      const existingVotes = JSON.parse(localStorage.getItem(votesKey) || "[]");
      existingVotes.push(encryptedVoteBase64);
      localStorage.setItem(votesKey, JSON.stringify(existingVotes));

      // 3. Blockchain'e mint_user_vote çağrısı yap (şifreli veri metadata olarak eklenebilir)
      // Not: Şifreli veri blockchain'de saklanmıyor, sadece localStorage'da
      // Gerçek implementasyonda backend API'ye gönderilebilir
      
      // Poll ve VoteRegistry'yi al
      const pollObject = await client.getObject({
        id: id,
        options: { showContent: true },
      });

      if (!pollObject.data) {
        throw new Error("Poll not found");
      }

      // PollRegistry'yi bul
      const pollRegistryId = await findPollRegistry(client);
      if (!pollRegistryId) {
        throw new Error("PollRegistry not found");
      }

      // VoteRegistry'yi bul
      const voteRegistryId = await getVoteRegistryByPoll(id, client, pollRegistryId);
      if (!voteRegistryId) {
        throw new Error("VoteRegistry not found");
      }

      // User oluştur veya al (eğer yoksa)
      // Şimdilik basit bir yaklaşım: mint_user_vote çağrısı yap
      const tx = new Transaction();

      // Option'ı bul ve kullan (poll'un options'ından)
      const pollOptions = (pollObject.data.content as any)?.fields?.options || [];
      if (!pollOptions[optionIndex]) {
        throw new Error("Option not found in poll");
      }

      const selectedPollOption = pollOptions[optionIndex];
      const optionObjectId = selectedPollOption.fields?.id?.id || selectedPollOption;

      // User object ID'sini bul
      let userObjectId = await findUserObjectId(client, account.address);
      
      // Eğer User yoksa, önce User oluştur
      if (!userObjectId) {
        // User oluşturma transaction'ı
        const userTx = new Transaction();
        userTx.moveCall({
          target: `${contractConfig.packageId}::${contractConfig.moduleName}::${contractConfig.functionNames.mintUser}`,
          arguments: [
            userTx.pure.string("User"), // Name
            userTx.pure.string("https://example.com/user.jpg"), // Icon URL
          ],
        });

        // User'ı oluştur ve sonra devam et
        await new Promise<void>((resolve, reject) => {
          signAndExecute(
            {
              transaction: userTx,
            } as any,
            {
              onSuccess: async () => {
                // User oluşturulduktan sonra User ID'sini bul
                userObjectId = await findUserObjectId(client, account.address);
                if (!userObjectId) {
                  reject(new Error("Failed to find created User"));
                } else {
                  resolve();
                }
              },
              onError: reject,
            }
          );
        });
      }

      if (!userObjectId) {
        throw new Error("User not found and could not be created");
      }

      // mint_user_vote çağrısı
      tx.moveCall({
        target: `${contractConfig.packageId}::${contractConfig.moduleName}::${contractConfig.functionNames.mintUserVote}`,
        arguments: [
          tx.object(id), // Poll
          tx.object(optionObjectId), // PollOption
          tx.object(userObjectId), // User object
          tx.object(voteRegistryId), // VoteRegistry
        ],
      });

      // Transaction'ı execute et
      signAndExecute(
        {
          transaction: tx,
        } as any,
        {
          onSuccess: () => {
            console.log("Vote submitted successfully");
            // Local state'i güncelle
            const updatedPool = { ...localPool };
            updatedPool.options[optionIndex].voteCount += 1;
            updatedPool.totalVotes += 1;
            updatedPool.options.forEach((opt) => {
              opt.percentage = (opt.voteCount / updatedPool.totalVotes) * 100;
            });
            setLocalPool(updatedPool);
          },
          onError: (error) => {
            console.error("Failed to submit vote:", error);
            setSelectedOption(null);
          },
        }
      );
    } catch (error) {
      console.error("Failed to encrypt/submit vote:", error);
      setSelectedOption(null);
    }
  };

  // Sonuçları görüntüleme (zaman kilidi kontrolü ile decrypt)
  const handleShowResults = async () => {
    if (!id || !pool) return;

    setIsDecrypting(true);
    setDecryptError(null);

    try {
      // Şifreli oyları localStorage'dan al
      const votesKey = `encrypted_votes_${id}`;
      const encryptedVotes = JSON.parse(localStorage.getItem(votesKey) || "[]");

      if (encryptedVotes.length === 0) {
        setDecryptError("No votes found to decrypt");
        setIsDecrypting(false);
        return;
      }

      // Transaction oluştur ve execute et (zaman kilidi kontrolü için)
      const executeTx = async (tx: Transaction) => {
        return new Promise((resolve, reject) => {
          signAndExecute(
            {
              transaction: tx,
            } as any,
            {
              onSuccess: resolve,
              onError: reject,
            }
          );
        });
      };

      // Decrypt işlemi (zaman kilidi kontrolü ile)
      const decryptedVotes = await decryptVotes(
        encryptedVotes,
        id,
        id, // pollObjectId
        client,
        executeTx
      );

      // Çözülmüş oyları say
      const voteCounts: Record<string, number> = {};
      decryptedVotes.forEach((vote) => {
        if (vote) {
          voteCounts[vote.optionId] = (voteCounts[vote.optionId] || 0) + 1;
        }
      });

      // Local pool'u güncelle
      const updatedPool = { ...localPool! };
      let totalVotes = 0;
      updatedPool.options.forEach((opt) => {
        opt.voteCount = voteCounts[opt.id] || 0;
        totalVotes += opt.voteCount;
      });
      updatedPool.totalVotes = totalVotes;
      updatedPool.options.forEach((opt) => {
        opt.percentage = totalVotes > 0 ? (opt.voteCount / totalVotes) * 100 : 0;
      });

      setLocalPool(updatedPool);
      setShowResults(true);
    } catch (error: any) {
      console.error("Failed to decrypt votes:", error);
      
      // Zaman kilidi hatası kontrolü
      const errorMessage = error?.message || String(error);
      if (errorMessage.includes("EVotingPeriodNotOver") || errorMessage.includes("voting period")) {
        setDecryptError("Voting results are not available yet. Please try again after the voting period ends.");
      } else {
        setDecryptError("Failed to decrypt votes. Please try again.");
      }
    } finally {
      setIsDecrypting(false);
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

  if (isLoadingPoll) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)", padding: "2rem" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <p style={{ color: "var(--text-secondary)" }}>Loading poll...</p>
        </div>
      </div>
    );
  }

  if (!pool || !localPool) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)", padding: "2rem" }}>
        <div className="container">
          <p style={{ color: "var(--text-secondary)" }}>Vote pool not found.</p>
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
          padding: "clamp(1rem, 2vw, 1.5rem) clamp(1rem, 3vw, 2rem)",
          borderBottom: "1px solid var(--border-color)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <Link to="/vote-pools" style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: "none" }}>
          <div
            style={{
              width: "clamp(32px, 5vw, 40px)",
              height: "clamp(32px, 5vw, 40px)",
              background: "linear-gradient(135deg, var(--color-navy) 0%, var(--color-light-blue) 100%)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "clamp(1.2rem, 2vw, 1.5rem)",
              fontWeight: "bold",
              color: "var(--color-white)",
            }}
          >
            P
          </div>
          <h1 style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.5rem)", fontWeight: "700", color: "var(--text-primary)" }}>
            Pollar
          </h1>
        </Link>
        <button
          onClick={() => navigate("/vote-pools")}
          className="button button-secondary"
          style={{ fontSize: "clamp(0.85rem, 1.5vw, 1rem)", padding: "clamp(0.6rem, 1.5vw, 0.75rem) clamp(1rem, 2vw, 1.5rem)" }}
        >
          Back to Pools
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "clamp(1rem, 2.5vw, 1.5rem)" }}>
              <h3
                style={{
                  fontSize: "clamp(1.5rem, 3vw, 1.75rem)",
                  fontWeight: "600",
                  color: "var(--text-primary)",
                }}
              >
                Cast Your Vote
              </h3>
              {!showResults && (
                <button
                  onClick={handleShowResults}
                  disabled={isDecrypting}
                  className="button button-primary"
                  style={{
                    fontSize: "clamp(0.85rem, 1.5vw, 1rem)",
                    padding: "clamp(0.5rem, 1.2vw, 0.65rem) clamp(1rem, 2vw, 1.25rem)",
                    cursor: isDecrypting ? "not-allowed" : "pointer",
                    opacity: isDecrypting ? 0.6 : 1,
                  }}
                >
                  {isDecrypting ? "Decrypting..." : "Show Results"}
                </button>
              )}
            </div>
            
            {decryptError && (
              <div
                style={{
                  padding: "1rem",
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "0.5rem",
                  color: "#ef4444",
                  marginBottom: "1rem",
                  fontSize: "0.9rem",
                }}
              >
                {decryptError}
              </div>
            )}
            
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {localPool.options.map((option, index) => (
                <div
                  key={option.id}
                  onClick={() => !isVotingPending && handleVote(option.id)}
                  style={{
                    padding: "1.5rem",
                    background: selectedOption === option.id ? "var(--bg-secondary)" : "var(--bg-card)",
                    border:
                      selectedOption === option.id
                        ? "2px solid var(--color-light-blue)"
                        : "1px solid var(--border-color)",
                    borderRadius: "0.75rem",
                    cursor: isVotingPending ? "not-allowed" : "pointer",
                    opacity: isVotingPending ? 0.6 : 1,
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (selectedOption !== option.id) {
                      e.currentTarget.style.borderColor = "var(--color-navy-light)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedOption !== option.id) {
                      e.currentTarget.style.borderColor = "var(--border-color)";
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
                  <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                    {option.voteCount.toLocaleString()} votes
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
    </div>
  );
};

export default VotingPage;

