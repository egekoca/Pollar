import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getVotePoolById, VotePool } from "../data/mockData";
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
  const [pool, setPool] = useState<VotePool | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [localPool, setLocalPool] = useState<VotePool | null>(null);

  useEffect(() => {
    const foundPool = id ? getVotePoolById(id) : null;
    if (foundPool) {
      setPool(foundPool);
      setLocalPool(JSON.parse(JSON.stringify(foundPool))); // Deep copy for local state
    }
  }, [id]);

  const handleVote = (optionId: string) => {
    if (!localPool) return;

    setSelectedOption(optionId);
    const updatedPool = { ...localPool };
    const optionIndex = updatedPool.options.findIndex((opt) => opt.id === optionId);

    if (optionIndex !== -1) {
      updatedPool.options[optionIndex].voteCount += 1;
      updatedPool.totalVotes += 1;

      // Recalculate percentages
      updatedPool.options.forEach((opt) => {
        opt.percentage = (opt.voteCount / updatedPool.totalVotes) * 100;
      });

      setLocalPool(updatedPool);
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
          padding: "1.5rem 2rem",
          borderBottom: "1px solid var(--border-color)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link to="/vote-pools" style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: "none" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              background: "linear-gradient(135deg, var(--color-navy) 0%, var(--color-light-blue) 100%)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              fontWeight: "bold",
              color: "var(--color-white)",
            }}
          >
            P
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--text-primary)" }}>
            Pollar
          </h1>
        </Link>
        <button
          onClick={() => navigate("/vote-pools")}
          className="button button-secondary"
        >
          Back to Pools
        </button>
      </header>

      {/* Main Content */}
      <main style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
        {/* Pool Header */}
        <div style={{ marginBottom: "2rem" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "200px 1fr",
              gap: "2rem",
              marginBottom: "2rem",
            }}
          >
            <div
              style={{
                width: "200px",
                height: "200px",
                borderRadius: "1rem",
                overflow: "hidden",
                background: "var(--bg-secondary)",
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
                  fontSize: "2.5rem",
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
                  fontSize: "1.1rem",
                  lineHeight: "1.8",
                  marginBottom: "1.5rem",
                }}
              >
                {localPool.description}
              </p>
              <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                    Total Votes
                  </div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--color-light-blue)" }}>
                    {localPool.totalVotes.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                    Starts
                  </div>
                  <div style={{ fontSize: "1rem", color: "var(--text-secondary)" }}>
                    {formatDate(localPool.startTime)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                    Ends
                  </div>
                  <div style={{ fontSize: "1rem", color: "var(--text-secondary)" }}>
                    {formatDate(localPool.endTime)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
          {/* Voting Options */}
          <div className="card">
            <h3
              style={{
                fontSize: "1.75rem",
                fontWeight: "600",
                marginBottom: "1.5rem",
                color: "var(--text-primary)",
              }}
            >
              Cast Your Vote
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {localPool.options.map((option, index) => (
                <div
                  key={option.id}
                  onClick={() => handleVote(option.id)}
                  style={{
                    padding: "1.5rem",
                    background: selectedOption === option.id ? "var(--bg-secondary)" : "var(--bg-card)",
                    border:
                      selectedOption === option.id
                        ? "2px solid var(--color-light-blue)"
                        : "1px solid var(--border-color)",
                    borderRadius: "0.75rem",
                    cursor: "pointer",
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
                        fontSize: "1.25rem",
                        fontWeight: "600",
                        color: "var(--text-primary)",
                      }}
                    >
                      {option.name}
                    </h4>
                    <span
                      style={{
                        fontSize: "1.5rem",
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
                fontSize: "1.75rem",
                fontWeight: "600",
                marginBottom: "1.5rem",
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

