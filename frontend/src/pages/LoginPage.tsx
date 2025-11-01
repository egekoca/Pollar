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
          background: "var(--color-white)",
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
              display: "inline-flex",
              alignItems: "center",
              gap: "0.75rem",
              textDecoration: "none",
              marginBottom: "3rem",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                background: "linear-gradient(135deg, var(--color-navy) 0%, var(--color-light-blue) 100%)",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.75rem",
                fontWeight: "bold",
                color: "var(--color-white)",
              }}
            >
              P
            </div>
            <h1
              style={{
                fontSize: "1.75rem",
                fontWeight: "700",
                color: "var(--color-black)",
                margin: 0,
              }}
            >
              Pollar
            </h1>
          </Link>

          {/* Navigation Tabs */}
          <div style={{ display: "flex", gap: "2rem", marginBottom: "3rem" }}>
            <Link
              to="/login"
              style={{
                fontSize: "0.95rem",
                fontWeight: "600",
                color: "var(--color-navy)",
                textDecoration: "none",
                borderBottom: "2px solid var(--color-navy)",
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
                color: "var(--color-gray)",
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
                color: "var(--color-black)",
                marginBottom: "0.5rem",
              }}
            >
              Hi there!
            </h2>
            <p
              style={{
                fontSize: "1.1rem",
                color: "var(--color-gray)",
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
                    color: "var(--color-gray)",
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
                  color: "var(--color-gray)",
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
          <div style={{ fontSize: "0.85rem", color: "var(--color-gray)", marginBottom: "0.5rem" }}>
            English (United States)
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--color-gray-light)", marginTop: "1rem" }}>
            Copyright © 2025 Pollar. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Section - Visual Design */}
      <div
        style={{
          flex: "1",
          background: "linear-gradient(135deg, var(--color-navy) 0%, var(--color-black-light) 100%)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Geometric Pattern Overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: `
              repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.05) 35px, rgba(255,255,255,.05) 70px),
              repeating-linear-gradient(-45deg, transparent, transparent 35px, rgba(255,255,255,.05) 35px, rgba(255,255,255,.05) 70px)
            `,
          }}
        />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "3rem", maxWidth: "500px" }}>
          <div
            style={{
              fontSize: "6rem",
              color: "var(--color-light-blue)",
              opacity: 0.8,
              marginBottom: "2rem",
            }}
          >
            ✓
          </div>
          <h2
            style={{
              fontSize: "2.5rem",
              fontWeight: "700",
              color: "var(--color-white)",
              marginBottom: "1rem",
            }}
          >
            Decentralized Voting
          </h2>
          <p
            style={{
              fontSize: "1.2rem",
              color: "var(--color-light-blue)",
              lineHeight: "1.8",
            }}
          >
            Transparent, secure, and trustless voting powered by blockchain technology
          </p>
        </div>

        {/* Decorative Shapes */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            right: "10%",
            width: "100px",
            height: "100px",
            border: "2px solid var(--color-light-blue)",
            borderRadius: "20px",
            opacity: 0.2,
            transform: "rotate(45deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "15%",
            left: "15%",
            width: "150px",
            height: "150px",
            border: "2px solid var(--color-light-blue)",
            borderRadius: "50%",
            opacity: 0.15,
          }}
        />
      </div>
    </div>
  );
};

export default LoginPage;

