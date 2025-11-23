import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useCurrentAccount, useWallets, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { getUserProfile, saveUserProfile, UserProfile } from "../utils/userProfile";
import { contractConfig } from "../config/contractConfig";
import PillNav from "../components/PillNav";
import { gsap } from "gsap";
import "../styles/theme.css";

const CreateProfilePage = () => {
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const wallets = useWallets();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const logoRef = useRef<HTMLImageElement>(null);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogoHover = () => {
    if (logoRef.current) {
      gsap.to(logoRef.current, {
        rotate: 360,
        duration: 0.6,
        ease: "power3.easeOut",
      });
    }
  };

  useEffect(() => {
    // If no wallet connected, redirect to login
    if (!account?.address) {
      navigate("/login");
      return;
    }

    // If profile already exists, redirect to vote pools
    const existingProfile = getUserProfile(account.address);
    if (existingProfile) {
      navigate("/vote-pools");
    }
  }, [account, navigate]);

  // Ortak profil oluşturma fonksiyonu
  const createProfileOnChain = (usernameToUse: string, avatarUrlToUse: string) => {
    setError("");
    setIsSubmitting(true);

    if (!account?.address) {
      setError("Wallet not connected");
      setIsSubmitting(false);
      return;
    }

    // Check if package ID is configured
    if (!contractConfig.packageId) {
      setError("Contract package ID is not configured. Please set VITE_PACKAGE_ID in .env file.");
      setIsSubmitting(false);
      return;
    }

    // Check if this is an Enoki wallet
    const enokiWallet = wallets.find((wallet) =>
      wallet.accounts.some(
        (acc) => acc.address === account.address && wallet.name.toLowerCase().includes("enoki")
      )
    );

    try {
      // Create transaction to call mint_user
      const tx = new Transaction();

      // Call the mint_user entry function
      // mint_user(name: String, icon_url: String, ctx: &mut TxContext)
      tx.moveCall({
        target: `${contractConfig.packageId}::${contractConfig.moduleName}::${contractConfig.functionNames.mintUser}`,
        arguments: [
          tx.pure.string(usernameToUse),
          tx.pure.string(avatarUrlToUse),
        ],
      });

      // Execute the transaction
      signAndExecute(
        {
          transaction: tx,
        } as any,
        {
          onSuccess: (result) => {
            console.log("User created successfully:", result);
            
            // Find the created User object ID from the result
            let userObjectId: string | undefined;
            
            const resultAny = result as any;
            if (resultAny.objectChanges) {
              const createdUser = resultAny.objectChanges.find(
                (change: any) => 
                  change.type === "created" && 
                  change.objectType?.includes("::User")
              );
              
              if (createdUser && createdUser.objectId) {
                userObjectId = createdUser.objectId;
              }
            }
            
            if (!userObjectId && resultAny.effects?.created) {
              const created = resultAny.effects.created;
              if (Array.isArray(created) && created.length > 0) {
                userObjectId = created[0].reference?.objectId;
              }
            }

            // Save profile to localStorage
            const newProfile: UserProfile = {
              walletAddress: account.address,
              username: usernameToUse,
              avatarUrl: avatarUrlToUse,
              authMethod: enokiWallet ? "google" : "wallet",
              ...(userObjectId && { userObjectId }),
            };

            saveUserProfile(newProfile);

            // Redirect to vote pools after successful profile creation
            navigate("/vote-pools");
          },
          onError: (error) => {
            console.error("Failed to create user on blockchain:", error);
            
            const errorMessage = error.message || String(error);
            
            if (errorMessage.includes("EInvalidNameLength")) {
              setError("Username must be between 3 and 100 characters");
            } else if (errorMessage.includes("EInvalidIconUrlLength")) {
              setError("Avatar URL must be between 7 and 1000 characters");
            } else {
              setError(`Failed to create user: ${errorMessage}. Please try again.`);
            }
            
            setIsSubmitting(false);
          },
        }
      );
    } catch (error) {
      console.error("Failed to create profile:", error);
      setError(`Failed to create profile: ${error instanceof Error ? error.message : String(error)}`);
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    const trimmedUsername = username.trim();
    const trimmedAvatarUrl = avatarUrl.trim();

    if (!trimmedUsername) {
      setError("Username is required");
      return;
    }

    if (trimmedUsername.length < 3 || trimmedUsername.length > 100) {
      setError("Username must be between 3 and 100 characters");
      return;
    }

    if (!trimmedAvatarUrl) {
      setError("Avatar URL is required");
      return;
    }

    if (trimmedAvatarUrl.length < 7 || trimmedAvatarUrl.length > 1000) {
      setError("Avatar URL must be between 7 and 1000 characters");
      return;
    }

    createProfileOnChain(trimmedUsername, trimmedAvatarUrl);
  };

  const handleSkip = () => {
    if (!account?.address) return;
    
    // Varsayılan değerler
    const defaultUsername = `User_${account.address.slice(-4)}`;
    const defaultAvatarUrl = "/suilogo.jpg"; // Local public file
    
    createProfileOnChain(defaultUsername, defaultAvatarUrl);
  };

  // No longer needed, we show full address now
  // const formatAddress = (address: string) => {
  //   return `${address.slice(0, 8)}...${address.slice(-8)}`;
  // };

  if (!account?.address) {
    return null;
  }

  const isEnokiWallet = wallets.some((wallet) =>
    wallet.accounts.some(
      (acc) => acc.address === account.address && wallet.name.toLowerCase().includes("enoki")
    )
  );

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
          position: "sticky",
          top: 0,
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
            activeHref="/create-profile"
            baseColor="#000000"
            pillColor="#ffffff"
            hoveredPillTextColor="#ffffff"
            pillTextColor="#000000"
          />
        </div>

        {/* Sağ Taraf - Boş bırakıyoruz (Sadece logo ve menü olsun istendi) */}
        <div style={{ width: "clamp(32px, 5vw, 40px)" }}></div>
      </header>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          width: "100%",
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "clamp(2rem, 5vw, 4rem) clamp(1.5rem, 3vw, 2rem)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "clamp(2rem, 5vw, 6rem)",
          flexWrap: "wrap",
        }}
      >
        {/* Left Column - Form */}
        <div 
          style={{ 
            flex: "1 1 480px",
            maxWidth: "600px",
            width: "100%",
            animation: "fadeIn 0.6s ease-out",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: "800",
              marginBottom: "1rem",
              background: "linear-gradient(135deg, #ffffff 0%, #93c5fd 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              lineHeight: 1.2,
            }}
          >
            Join the Party!
          </h2>
          <p
            style={{
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: "clamp(1rem, 1.2vw, 1.15rem)",
              marginBottom: "2.5rem",
              lineHeight: 1.6,
            }}
          >
            Create your Pollar profile to start voting, creating pools, and earning rewards with the community.
          </p>

          <div 
            className="glass-panel"
            style={{ 
              width: "100%",
              padding: "2.5rem",
              background: "rgba(15, 23, 42, 0.6)",
              backdropFilter: "blur(12px)",
              borderRadius: "24px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "0 20px 50px -12px rgba(0, 0, 0, 0.5)",
            }}
          >
            {error && (
              <div
                style={{
                  padding: "1rem",
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  borderRadius: "12px",
                  color: "#fca5a5",
                  marginBottom: "1.5rem",
                  fontSize: "0.95rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Wallet Address (Read-only) */}
              <div style={{ marginBottom: "1.75rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.75rem",
                    color: "rgba(255, 255, 255, 0.9)",
                    fontWeight: "600",
                    fontSize: "0.9rem",
                    letterSpacing: "0.02em",
                  }}
                >
                  Connected Wallet
                </label>
                <div 
                  style={{ 
                    display: "flex", 
                    gap: "0.75rem", 
                    alignItems: "center",
                    padding: "0.875rem 1rem",
                    background: "rgba(0, 0, 0, 0.3)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    position: "relative",
                  }}
                >
                  <div 
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#4ade80",
                      boxShadow: "0 0 10px #4ade80",
                      flexShrink: 0,
                    }}
                  />
                  <input
                    type="text"
                    value={`${account.address.slice(0, 20)}...${account.address.slice(-4)}`}
                    readOnly
                    style={{
                      flex: "1",
                      background: "transparent",
                      border: "none",
                      color: "rgba(255, 255, 255, 0.6)",
                      fontSize: "0.95rem",
                      fontFamily: "monospace",
                      outline: "none",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(account.address);
                      const btn = document.activeElement as HTMLElement;
                      const originalText = btn.textContent;
                      btn.textContent = "Copied!";
                      setTimeout(() => {
                        if (btn) btn.textContent = "Copy";
                      }, 2000);
                    }}
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: "6px",
                      color: "rgba(255, 255, 255, 0.8)",
                      padding: "0.25rem 0.75rem",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                    }}
                  >
                    Copy
                  </button>
                </div>
              </div>

              {/* Username */}
              <div style={{ marginBottom: "1.75rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.75rem",
                    color: "rgba(255, 255, 255, 0.9)",
                    fontWeight: "600",
                    fontSize: "0.9rem",
                    letterSpacing: "0.02em",
                  }}
                >
                  Choose Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. CryptoKing"
                  required
                  minLength={3}
                  style={{
                    width: "100%",
                    padding: "1rem 1.25rem",
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    color: "#ffffff",
                    fontSize: "1rem",
                    transition: "all 0.2s ease",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#60a5fa";
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                    e.currentTarget.style.boxShadow = "0 0 0 4px rgba(96, 165, 250, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Avatar URL */}
              <div style={{ marginBottom: "2.5rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.75rem",
                    color: "rgba(255, 255, 255, 0.9)",
                    fontWeight: "600",
                    fontSize: "0.9rem",
                    letterSpacing: "0.02em",
                  }}
                >
                  Avatar URL
                </label>
                <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://..."
                      required
                      style={{
                        width: "100%",
                        padding: "1rem 1.25rem",
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "12px",
                        color: "#ffffff",
                        fontSize: "1rem",
                        transition: "all 0.2s ease",
                        outline: "none",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#60a5fa";
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                        e.currentTarget.style.boxShadow = "0 0 0 4px rgba(96, 165, 250, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    />
                    <p style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.4)", marginTop: "0.5rem" }}>
                      Paste a direct link to your profile image
                    </p>
                  </div>
                  
                  {/* Avatar Preview */}
                  <div 
                    style={{ 
                      width: "60px", 
                      height: "60px", 
                      borderRadius: "50%", 
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "2px solid rgba(255, 255, 255, 0.1)",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Preview"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="create-profile-btn"
                  style={{
                    width: "100%",
                    padding: "1.1rem",
                    fontSize: "1.1rem",
                    fontWeight: "700",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "14px",
                    boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 20px 35px -10px rgba(59, 130, 246, 0.5)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting) {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 10px 25px -5px rgba(59, 130, 246, 0.4)";
                    }
                  }}
                >
                  {isSubmitting ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                      <span className="loading-spinner" />
                      Creating Profile...
                    </div>
                  ) : (
                    "Create Profile & Start Voting"
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={isSubmitting}
                  style={{
                    width: "100%",
                    padding: "0.8rem",
                    fontSize: "0.95rem",
                    fontWeight: "600",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    background: "transparent",
                    color: "rgba(255, 255, 255, 0.6)",
                    border: "none",
                    transition: "all 0.2s ease",
                    textDecoration: "underline",
                    textUnderlineOffset: "4px",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) {
                      e.currentTarget.style.color = "#ffffff";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting) {
                      e.currentTarget.style.color = "rgba(255, 255, 255, 0.6)";
                    }
                  }}
                >
                  Skip & Use Defaults (You can edit later)
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column - Image */}
        <div 
          style={{ 
            flex: "1 1 400px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            maxWidth: "650px",
          }}
        >
          <img 
            src="/friends.png" 
            alt="Pollar Friends" 
            style={{ 
              width: "100%", 
              height: "auto", 
              objectFit: "contain",
              filter: "drop-shadow(0 0 30px rgba(59, 130, 246, 0.2))",
              animation: "float-gentle 6s ease-in-out infinite",
            }} 
          />
        </div>
      </main>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: #ffffff;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CreateProfilePage;

