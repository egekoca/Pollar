import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useWallets, useCurrentAccount, useConnectWallet } from "@mysten/dapp-kit";
import GoogleSignInButton from "../components/GoogleSignInButton";
import { getUserProfile } from "../utils/userProfile";
import "../styles/theme.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const wallets = useWallets();
  const account = useCurrentAccount();
  const { mutate: connect } = useConnectWallet();
  const [isLoading, setIsLoading] = useState(false);
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Check if account is connected
    if (account?.address && !hasRedirected.current) {
      console.log("Account connected on login page:", account.address);
      
      hasRedirected.current = true;
      
      // Check profile
      const profile = getUserProfile(account.address);
      
      if (profile) {
        console.log("Profile exists, going to vote pools");
        navigate("/vote-pools", { replace: true });
      } else {
        console.log("No profile, going to create profile");
        navigate("/create-profile", { replace: true });
      }
    } else if (!account?.address) {
      hasRedirected.current = false;
    }
  }, [account?.address, navigate]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    // Google sign-in is handled by GoogleSignInButton
    // After successful connection, useEffect will handle redirect
  };

  const handleWalletConnect = async (walletName: string) => {
    setIsLoading(true);
    const wallet = wallets.find((w) => w.name === walletName);
    if (wallet) {
      try {
        connect({ wallet });
        // After connection, useEffect will handle redirect if profile exists
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        setIsLoading(false);
      }
    }
  };

  // Filter wallets - exclude Enoki/Google wallets (shown separately)
  const regularWallets = wallets.filter(
    (wallet) =>
      !wallet.name.toLowerCase().includes("enoki") &&
      !wallet.name.toLowerCase().includes("google") &&
      !wallet.name.toLowerCase().includes("zklogin")
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg-primary)" }}>
      {/* Left Section - Login Form */}
      <div
        style={{
          flex: "0 0 45%",
          background: "linear-gradient(180deg, #000000 0%, #0a1128 50%, #000000 100%)",
          padding: "3rem 4rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          minHeight: "100vh",
        }}
      >
        {/* Header */}
        <div>
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              textDecoration: "none",
              marginBottom: "3rem",
            }}
          >
            <img 
              src="/pollar-logo.png" 
              alt="Pollar Logo" 
              style={{
                width: "clamp(40px, 6vw, 50px)", 
                height: "clamp(40px, 6vw, 50px)",
                borderRadius: "8px",
              }} 
            />
            <h1 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: "700", color: "var(--text-primary)", margin: 0, fontFamily: "'Bevellier', sans-serif" }}>
              POLLAR
            </h1>
          </Link>

          {/* Navigation Tabs */}
          <div style={{ display: "flex", gap: "2rem", marginBottom: "3rem" }}>
            <Link
              to="/login"
              style={{
                fontSize: "0.95rem",
                fontWeight: "600",
                color: "var(--color-navy-light)",
                textDecoration: "none",
                borderBottom: "2px solid var(--color-navy-light)",
                paddingBottom: "0.5rem",
              }}
            >
              LOG IN
            </Link>
            <Link
              to="/login"
              style={{
                fontSize: "0.95rem",
                fontWeight: "500",
                color: "var(--text-secondary)",
                textDecoration: "none",
                paddingBottom: "0.5rem",
              }}
            >
              CREATE ACCOUNT
            </Link>
          </div>

          {/* Main Content */}
          <div>
            <h2
              style={{
                fontSize: "2.5rem",
                fontWeight: "700",
                color: "var(--text-primary)",
                marginBottom: "0.5rem",
              }}
            >
              Hi there!
            </h2>
            <p
              style={{
                fontSize: "1.1rem",
                color: "var(--text-secondary)",
                marginBottom: "2.5rem",
                lineHeight: "1.6",
              }}
            >
              Get started with Pollar, create your account and start voting on decentralized polls.
            </p>

            {/* Connect Wallet Section */}
            {regularWallets.length > 0 && (
              <div style={{ marginBottom: "2.5rem" }}>
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                    marginBottom: "1.5rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  CONNECT WALLET
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {regularWallets.map((wallet) => (
                    <button
                      key={wallet.name}
                      onClick={() => handleWalletConnect(wallet.name)}
                      disabled={isLoading}
                      style={{
                        width: "100%",
                        padding: "1rem 1.5rem",
                        background: "var(--color-white)",
                        border: "2px solid var(--color-gray-light)",
                        borderRadius: "0.75rem",
                        color: "var(--color-black)",
                        cursor: isLoading ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        transition: "all 0.3s ease",
                        fontSize: "1rem",
                        fontWeight: "500",
                      }}
                      onMouseEnter={(e) => {
                        if (!isLoading) {
                          e.currentTarget.style.borderColor = "var(--color-navy)";
                          e.currentTarget.style.background = "var(--color-gray-light)";
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isLoading) {
                          e.currentTarget.style.borderColor = "var(--color-gray-light)";
                          e.currentTarget.style.background = "var(--color-white)";
                          e.currentTarget.style.transform = "translateY(0)";
                        }
                      }}
                    >
                      {wallet.icon && (
                        <img
                          src={wallet.icon}
                          alt={wallet.name}
                          style={{ width: "32px", height: "32px" }}
                        />
                      )}
                      <span>{wallet.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Google Sign-In Section */}
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                  marginBottom: "1.5rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                OR SIGN IN WITH
              </div>

              {/* Full Google Sign-In Button */}
              <div style={{ maxWidth: "400px", margin: "0 auto" }}>
                <GoogleSignInButton onSignIn={handleGoogleSignIn} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
            English (United States)
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "1rem" }}>
            Copyright © 2025 Pollar. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Section - Visual Design */}
      <div
        style={{
          flex: "1",
          background: "var(--bg-primary)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img 
          src="/friends.png" 
          alt="Friends" 
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>
    </div>
  );
};

export default LoginPage;

