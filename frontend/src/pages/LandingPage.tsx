import { Link } from "react-router-dom";
import "../styles/theme.css";

const LandingPage = () => {
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
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
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
        </div>
        <Link to="/vote-pools" className="button button-primary">
          Go Voting
        </Link>
      </header>

      {/* Hero Section */}
      <section
        style={{
          padding: "4rem 2rem",
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "4rem",
          alignItems: "center",
          minHeight: "calc(100vh - 80px)",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "3.5rem",
              fontWeight: "800",
              marginBottom: "1.5rem",
              lineHeight: "1.2",
              background: "linear-gradient(135deg, var(--color-white) 0%, var(--color-light-blue) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Decentralized Voting System
          </h2>
          <p
            style={{
              fontSize: "1.25rem",
              color: "var(--text-secondary)",
              marginBottom: "2rem",
              lineHeight: "1.8",
            }}
          >
            A transparent, secure, and decentralized voting platform built on blockchain technology.
            Create polls, participate in decisions, and track results in real-time. Trust the power
            of decentralized consensus.
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Link to="/vote-pools" className="button button-primary" style={{ fontSize: "1.1rem", padding: "1rem 2rem" }}>
              Start Voting
            </Link>
            <Link to="/vote-pools" className="button button-secondary" style={{ fontSize: "1.1rem", padding: "1rem 2rem" }}>
              Explore Polls
            </Link>
          </div>
          <p style={{ marginTop: "1.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
            No signup required to participate
          </p>
        </div>
        <div
          style={{
            background: "linear-gradient(135deg, var(--color-navy) 0%, var(--color-black-light) 100%)",
            borderRadius: "1rem",
            padding: "2rem",
            height: "400px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundImage: "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: "0.5rem",
              opacity: 0.3,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: "4rem",
              color: "var(--color-light-blue)",
              opacity: 0.8,
            }}
          >
            ✓
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        style={{
          padding: "4rem 2rem",
          background: "var(--bg-secondary)",
          borderTop: "1px solid var(--border-color)",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h3
            style={{
              textAlign: "center",
              fontSize: "2.5rem",
              marginBottom: "3rem",
              color: "var(--text-primary)",
            }}
          >
            Why Choose Pollar?
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "2rem",
            }}
          >
            <div className="card">
              <h4 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "var(--color-light-blue)" }}>
                Decentralized
              </h4>
              <p style={{ color: "var(--text-secondary)", lineHeight: "1.8" }}>
                Built on blockchain technology for maximum transparency and security. Every vote is
                immutable and verifiable.
              </p>
            </div>
            <div className="card">
              <h4 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "var(--color-light-blue)" }}>
                Real-time Results
              </h4>
              <p style={{ color: "var(--text-secondary)", lineHeight: "1.8" }}>
                Watch results update in real-time as votes are cast. Track voting trends with
                interactive charts and graphs.
              </p>
            </div>
            <div className="card">
              <h4 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "var(--color-light-blue)" }}>
                Easy to Use
              </h4>
              <p style={{ color: "var(--text-secondary)", lineHeight: "1.8" }}>
                Create polls in seconds. No complicated setup or technical knowledge required.
                Start voting immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        style={{
          padding: "3rem 2rem",
          textAlign: "center",
          borderTop: "1px solid var(--border-color)",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <p style={{ color: "var(--text-muted)", marginBottom: "2rem", fontSize: "0.9rem" }}>
            TRUSTED BY THOUSANDS OF USERS WORLDWIDE
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "4rem",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--color-light-blue)" }}>
                10K+
              </div>
              <div style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>Active Users</div>
            </div>
            <div>
              <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--color-light-blue)" }}>
                50K+
              </div>
              <div style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>Vote Pools</div>
            </div>
            <div>
              <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--color-light-blue)" }}>
                500K+
              </div>
              <div style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>Total Votes</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

