import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { NFT_COLLECTIONS, NFTCollection } from "../config/nftCollections";
import { supabase } from "../utils/supabase";
import "../styles/theme.css";

const ADMIN_ADDRESS = "0x0ba252d960dede1ad8b3cc8a297130cacd581b7d745cf45ae7fe5897ca7a09bb";

interface WhitelistData {
  [collectionType: string]: string[]; // collectionType -> array of wallet addresses
}

// Get collection logo path
const getCollectionLogo = (collectionName: string): string => {
  switch (collectionName) {
    case "Popkins":
      return "/popkins.png";
    case "Tallys":
      return "/tallys.png";
    case "Pawtato Heroes":
      return "/PawtatoHeroes.png";
    case "Sui Workshop":
      return "/suilogo.jpg";
    case "SUI TURKIYE":
      return "/suitr.jpg";
    default:
      return "";
  }
};

const AdminPanelPage = () => {
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const [whitelists, setWhitelists] = useState<WhitelistData>({});
  const [selectedCollection, setSelectedCollection] = useState<NFTCollection | null>(null);
  const [newWalletAddress, setNewWalletAddress] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Load whitelists from Supabase
  const loadWhitelists = async () => {
    try {
      const { data, error } = await supabase
        .from('whitelist_entries')
        .select('collection_type, wallet_address');

      if (error) {
        console.error("Error loading whitelists:", error);
        // Fallback to localStorage if Supabase fails
        const saved = localStorage.getItem("admin_whitelists");
        if (saved) {
          try {
            setWhitelists(JSON.parse(saved));
          } catch (e) {
            console.error("Error loading from localStorage:", e);
          }
        }
        return;
      }

      // Group by collection_type
      const grouped: WhitelistData = {};
      data?.forEach((entry) => {
        if (!grouped[entry.collection_type]) {
          grouped[entry.collection_type] = [];
        }
        grouped[entry.collection_type].push(entry.wallet_address);
      });
      setWhitelists(grouped);
    } catch (error) {
      console.error("Error loading whitelists:", error);
    }
  };

  // Check if user is admin
  useEffect(() => {
    if (account?.address) {
      const isAdmin = account.address.toLowerCase() === ADMIN_ADDRESS.toLowerCase();
      if (!isAdmin) {
        navigate("/");
      } else {
        setIsLoading(false);
        loadWhitelists();
      }
    } else {
      setIsLoading(false);
    }
  }, [account, navigate]);

  const handleAddWallet = async () => {
    if (!selectedCollection || !newWalletAddress.trim()) return;

    const address = newWalletAddress.trim();
    // Basic address validation
    if (!address.startsWith("0x") || address.length < 10) {
      alert("Invalid wallet address format");
      return;
    }

    const collectionType = selectedCollection.type;
    const currentList = whitelists[collectionType] || [];
    
    if (currentList.includes(address)) {
      alert("This wallet is already in the whitelist");
      return;
    }

    // Save to Supabase
    try {
      const { error } = await supabase
        .from('whitelist_entries')
        .insert({
          collection_type: collectionType,
          wallet_address: address,
        });

      if (error) {
        console.error("Error adding wallet to Supabase:", error);
        alert("Failed to add wallet. Please try again.");
        return;
      }

      // Update local state
      setWhitelists({
        ...whitelists,
        [collectionType]: [...currentList, address],
      });
      setNewWalletAddress("");
    } catch (error) {
      console.error("Error adding wallet:", error);
      alert("Failed to add wallet. Please try again.");
    }
  };

  const handleRemoveWallet = async (collectionType: string, address: string) => {
    try {
      const { error } = await supabase
        .from('whitelist_entries')
        .delete()
        .eq('collection_type', collectionType)
        .eq('wallet_address', address);

      if (error) {
        console.error("Error removing wallet from Supabase:", error);
        alert("Failed to remove wallet. Please try again.");
        return;
      }

      // Update local state
      const currentList = whitelists[collectionType] || [];
      setWhitelists({
        ...whitelists,
        [collectionType]: currentList.filter((addr) => addr !== address),
      });
    } catch (error) {
      console.error("Error removing wallet:", error);
      alert("Failed to remove wallet. Please try again.");
    }
  };

  const handleCollectionClick = (collection: NFTCollection) => {
    setSelectedCollection(collection);
  };

  const handleBackToGallery = () => {
    setSelectedCollection(null);
  };

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        background: "var(--bg-primary)",
        color: "var(--text-primary)"
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!account || account.address.toLowerCase() !== ADMIN_ADDRESS.toLowerCase()) {
    return null; // Will redirect
  }

  // Gallery View - Show all NFT collections
  if (!selectedCollection) {
    return (
      <div style={{ 
        minHeight: "100vh",
        background: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}>
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
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <button
            onClick={() => navigate("/vote-pools")}
            style={{
              padding: "0.75rem 1.5rem",
              background: "transparent",
              color: "var(--text-primary)",
              border: "1.5px solid var(--color-light-blue)",
              borderRadius: "0.5rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--color-light-blue)";
              e.currentTarget.style.color = "#000000";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
          >
            ← Back to Pools
          </button>
          <h1 style={{ 
            fontSize: "clamp(1.2rem, 2.5vw, 1.8rem)",
            fontWeight: "700",
            margin: 0,
          }}>
            Admin Panel
          </h1>
          <div style={{ width: "120px" }}></div> {/* Spacer for centering */}
        </header>

        <div style={{ 
          padding: "clamp(2rem, 5vw, 4rem)",
        }}>
          <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
            <h2 style={{ 
              fontSize: "clamp(1.5rem, 3vw, 2rem)",
              marginBottom: "2rem",
              textAlign: "center",
              fontWeight: "600"
            }}>
              NFT Collection Whitelist Management
            </h2>
          
          <p style={{ 
            textAlign: "center", 
            marginBottom: "3rem",
            color: "var(--text-muted)",
            fontSize: "1.1rem"
          }}>
            Select an NFT collection to manage whitelist for poll creation
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "2rem",
            marginTop: "2rem"
          }}>
            {NFT_COLLECTIONS.map((collection) => {
              const whitelistCount = whitelists[collection.type]?.length || 0;
              return (
                <div
                  key={collection.type}
                  onClick={() => handleCollectionClick(collection)}
                  style={{
                    background: "var(--bg-secondary)",
                    borderRadius: "1rem",
                    padding: "1.5rem",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    border: "2px solid transparent",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-light-blue)";
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 8px 12px rgba(0, 0, 0, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "transparent";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
                  }}
                >
                  <div style={{
                    width: "100%",
                    height: "200px",
                    borderRadius: "0.5rem",
                    marginBottom: "1rem",
                    overflow: "hidden",
                    background: collection.theme?.backgroundGradient || "var(--bg-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    {(() => {
                      const logoPath = getCollectionLogo(collection.name);
                      return logoPath ? (
                        <img 
                          src={logoPath} 
                          alt={collection.name}
                          style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            objectFit: "contain"
                          }}
                        />
                      ) : (
                        <div style={{ 
                          fontSize: "3rem",
                          color: "var(--text-muted)"
                        }}>
                          🖼️
                        </div>
                      );
                    })()}
                  </div>
                  
                  <h3 style={{
                    fontSize: "1.5rem",
                    fontWeight: "700",
                    marginBottom: "0.5rem"
                  }}>
                    {collection.name}
                  </h3>
                  
                  {collection.description && (
                    <p style={{
                      color: "var(--text-muted)",
                      marginBottom: "1rem",
                      fontSize: "0.9rem"
                    }}>
                      {collection.description}
                    </p>
                  )}
                  
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem",
                    background: "var(--bg-primary)",
                    borderRadius: "0.5rem",
                    fontSize: "0.9rem"
                  }}>
                    <span style={{ color: "var(--text-muted)" }}>Whitelist:</span>
                    <span style={{ 
                      fontWeight: "600",
                      color: "var(--color-light-blue)"
                    }}>
                      {whitelistCount} wallet{whitelistCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          </div>
        </div>
      </div>
    );
  }

  // Detail View - Show whitelist for selected collection
  const currentWhitelist = whitelists[selectedCollection.type] || [];

  return (
    <div style={{ 
      minHeight: "100vh",
      background: "var(--bg-primary)",
      color: "var(--text-primary)",
    }}>
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
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <button
          onClick={handleBackToGallery}
          style={{
            padding: "0.75rem 1.5rem",
            background: "transparent",
            color: "var(--text-primary)",
            border: "1.5px solid var(--color-light-blue)",
            borderRadius: "0.5rem",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--color-light-blue)";
            e.currentTarget.style.color = "#000000";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--text-primary)";
          }}
        >
          ← Back to Collections
        </button>
        <h1 style={{ 
          fontSize: "clamp(1.2rem, 2.5vw, 1.8rem)",
          fontWeight: "700",
          margin: 0,
        }}>
          {selectedCollection.name} - Whitelist
        </h1>
        <button
          onClick={() => navigate("/vote-pools")}
          style={{
            padding: "0.75rem 1.5rem",
            background: "transparent",
            color: "var(--text-primary)",
            border: "1.5px solid var(--color-light-blue)",
            borderRadius: "0.5rem",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--color-light-blue)";
            e.currentTarget.style.color = "#000000";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--text-primary)";
          }}
        >
          Back to Pools
        </button>
      </header>

      <div style={{ 
        padding: "clamp(2rem, 5vw, 4rem)",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{
            background: "var(--bg-secondary)",
            borderRadius: "1rem",
            padding: "2rem",
            marginBottom: "2rem"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "1.5rem",
              marginBottom: "2rem"
            }}>
            {(() => {
              const logoPath = getCollectionLogo(selectedCollection.name);
              return logoPath ? (
                <div style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "0.5rem",
                  overflow: "hidden",
                  background: selectedCollection.theme?.backgroundGradient || "var(--bg-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  <img 
                    src={logoPath} 
                    alt={selectedCollection.name}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain"
                    }}
                  />
                </div>
              ) : null;
            })()}
            <div>
              <h2 style={{
                fontSize: "2rem",
                fontWeight: "700",
                marginBottom: "0.5rem"
              }}>
                {selectedCollection.name}
              </h2>
              {selectedCollection.description && (
                <p style={{
                  color: "var(--text-muted)",
                  fontSize: "1rem"
                }}>
                  {selectedCollection.description}
                </p>
              )}
            </div>
            </div>

            <div style={{
              borderTop: "1px solid var(--bg-primary)",
              paddingTop: "2rem"
            }}>
              <h3 style={{
                fontSize: "1.5rem",
                fontWeight: "600",
                marginBottom: "1rem"
              }}>
                Whitelist Management
              </h3>
              <p style={{
                color: "var(--text-muted)",
                marginBottom: "1.5rem",
                fontSize: "0.9rem"
              }}>
                Add wallet addresses that can create polls for this NFT collection. 
                These wallets don't need to own the NFT to create polls.
              </p>

              <div style={{
                display: "flex",
                gap: "1rem",
                marginBottom: "2rem",
                flexWrap: "wrap"
              }}>
                <input
                  type="text"
                  value={newWalletAddress}
                  onChange={(e) => setNewWalletAddress(e.target.value)}
                  placeholder="Enter wallet address (0x...)"
                  style={{
                    flex: "1",
                    minWidth: "300px",
                    padding: "0.75rem 1rem",
                    background: "var(--bg-primary)",
                    color: "var(--text-primary)",
                    border: "1.5px solid var(--color-light-blue)",
                    borderRadius: "0.5rem",
                    fontSize: "1rem",
                  }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleAddWallet();
                    }
                  }}
                />
                <button
                  onClick={handleAddWallet}
                  style={{
                    padding: "0.75rem 2rem",
                    background: "var(--color-light-blue)",
                    color: "#000000",
                    border: "none",
                    borderRadius: "0.5rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "0.9";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                >
                  Add Wallet
                </button>
              </div>

              <div>
                <h4 style={{
                  fontSize: "1.2rem",
                  fontWeight: "600",
                  marginBottom: "1rem"
                }}>
                  Whitelisted Wallets ({currentWhitelist.length})
                </h4>
              
              {currentWhitelist.length === 0 ? (
                <p style={{
                  color: "var(--text-muted)",
                  padding: "2rem",
                  textAlign: "center",
                  background: "var(--bg-primary)",
                  borderRadius: "0.5rem"
                }}>
                  No wallets in whitelist yet. Add wallets above to allow them to create polls for this collection.
                </p>
              ) : (
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem"
                }}>
                  {currentWhitelist.map((address, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "1rem",
                        background: "var(--bg-primary)",
                        borderRadius: "0.5rem",
                        border: "1px solid var(--bg-primary)"
                      }}
                    >
                      <code style={{
                        color: "var(--text-primary)",
                        fontSize: "0.9rem",
                        wordBreak: "break-all"
                      }}>
                        {address}
                      </code>
                      <button
                        onClick={() => handleRemoveWallet(selectedCollection.type, address)}
                        style={{
                          padding: "0.5rem 1rem",
                          background: "transparent",
                          color: "#ef4444",
                          border: "1.5px solid #ef4444",
                          borderRadius: "0.5rem",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                          marginLeft: "1rem",
                          flexShrink: 0
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#ef4444";
                          e.currentTarget.style.color = "#ffffff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "#ef4444";
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanelPage;

