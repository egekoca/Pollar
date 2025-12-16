import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit";
import CreateVotePoolModal from "../components/CreateVotePoolModal";
import { getUserProfile, UserProfile } from "../utils/userProfile";
import { useBlockchainPolls } from "../utils/pollUtils";
import { NFT_COLLECTIONS, getUniqueCollectionTypes, getCollectionByType } from "../config/nftCollections";
import { useUserAssets } from "../hooks/useUserAssets";
import { usePollFiltering } from "../hooks/usePollFiltering";
import { useCountdown } from "../hooks/useCountdown";
import { PollStatus } from "../utils/pollHelpers";
import { getBackgroundGradient } from "../utils/pollHelpers";
import { COLLECTION_ORDER } from "../constants/appConstants";
import VotePoolHeader from "../components/VotePoolHeader";
import VotePoolFilters from "../components/VotePoolFilters";
import VotePoolContent from "../components/VotePoolContent";
import BackgroundCharacters from "../components/BackgroundCharacters";
import BackgroundNFTs from "../components/BackgroundNFTs";
import "../styles/theme.css";

const VotePoolPage = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const [searchParams] = useSearchParams();
  const [selectedCollectionType, setSelectedCollectionType] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<PollStatus>("active");

  // Check URL parameter for collection type on mount
  useEffect(() => {
    const collectionParam = searchParams.get("collection");
    if (collectionParam && collectionParam.trim() !== "") {
      setSelectedCollectionType(collectionParam);
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("collection");
      const newUrl = newSearchParams.toString() 
        ? `${window.location.pathname}?${newSearchParams.toString()}`
        : window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    } else {
      setSelectedCollectionType(null);
    }
  }, [searchParams]);

  // Blockchain'den poll'ları oku
  const { data: allPools = [], isLoading: isLoadingPools, refetch } = useBlockchainPolls();

  // Custom hooks
  const { userNftsByCollection, trWalTokenCount } = useUserAssets();
  const { formatCountdown } = useCountdown();

  // Filter pools using custom hook
  const pools = usePollFiltering({
    allPools,
    selectedCollectionType,
    selectedFilter,
    userNftsByCollection,
    trWalTokenCount,
  });

  // Get unique collection types from all polls
  const uniqueCollectionTypesFromPolls = getUniqueCollectionTypes(allPools);
  const allCollectionTypes = NFT_COLLECTIONS.map(col => col.type);
  const uniqueCollectionTypesUnsorted = Array.from(new Set([...uniqueCollectionTypesFromPolls, ...allCollectionTypes]));
  const validCollectionTypesUnsorted = uniqueCollectionTypesUnsorted.filter((type) => !!getCollectionByType(type));

  // Sort collections in desired order
  const uniqueCollectionTypes = validCollectionTypesUnsorted.sort((a, b) => {
    const indexA = COLLECTION_ORDER.indexOf(a as typeof COLLECTION_ORDER[number]);
    const indexB = COLLECTION_ORDER.indexOf(b as typeof COLLECTION_ORDER[number]);
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return 0;
  });

  const handleCreateVotePool = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (account?.address) {
        const profile = await getUserProfile(account.address);
        if (profile) {
          setUserProfile(profile);
        } else {
          navigate("/create-profile");
        }
      } else {
        setUserProfile(null);
      }
    };
    loadProfile();
  }, [account?.address, navigate]);

  const handlePollCreated = () => {
    refetch();
  };

  const handlePollClick = (pollId: string) => {
    if (selectedCollectionType) {
      navigate(`/voting/${pollId}?fromCollection=${encodeURIComponent(selectedCollectionType)}`);
    } else {
      navigate(`/voting/${pollId}`);
    }
  };

  const handleLogout = () => {
    disconnect();
    setUserProfile(null);
  };

  // Get theme and background for selected collection
  const selectedCollection = selectedCollectionType 
    ? getCollectionByType(selectedCollectionType)
    : null;
  const theme = selectedCollection?.theme;
  const backgroundGradient = getBackgroundGradient(selectedCollectionType);

  // Buy button for collection
  const buyButton = selectedCollectionType ? (() => {
    const collection = getCollectionByType(selectedCollectionType);
    if (collection && collection.tradeportUrl) {
      return (
        <a
          href={collection.tradeportUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            padding: "0.55rem 1.25rem",
            background: collection.name === "Popkins" 
              ? "linear-gradient(135deg, rgba(255, 165, 0, 0.8), rgba(50, 205, 50, 0.8))"
              : collection.name === "Tallys"
              ? "linear-gradient(135deg, rgba(255, 20, 147, 0.8), rgba(255, 99, 71, 0.8))"
              : collection.name === "Pawtato Heroes"
              ? "linear-gradient(135deg, rgba(132, 204, 22, 0.8), rgba(163, 230, 53, 0.8))"
              : "var(--color-light-blue)",
            color: "#000000",
            border: "none",
            borderRadius: "0.5rem",
            fontWeight: "700",
            fontSize: "clamp(0.85rem, 1.4vw, 1rem)",
            cursor: "pointer",
            textDecoration: "none",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
            minWidth: "150px",
            textAlign: "center",
            whiteSpace: "nowrap",
            lineHeight: 1.1,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.3)";
          }}
        >
          Buy {collection.name}
        </a>
      );
    }
    return null;
  })() : null;

  return (
    <div 
      style={{ 
        minHeight: "100vh", 
        background: backgroundGradient,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Character Images - Left and Right Sides (For All Polls) */}
      {!selectedCollectionType && <BackgroundCharacters />}

      {/* Background NFT Images - Left and Right Sides (Only for collections with theme) */}
      {theme?.backgroundImages && theme.backgroundImages.length > 0 && (
        <BackgroundNFTs theme={theme} collectionName={selectedCollection?.name} />
      )}
      
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <VotePoolHeader
          userProfile={userProfile}
          onCreateVotePool={handleCreateVotePool}
          onLogout={handleLogout}
        />

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
          {/* Filters */}
          <VotePoolFilters
            selectedCollectionType={selectedCollectionType}
            uniqueCollectionTypes={uniqueCollectionTypes}
            selectedFilter={selectedFilter}
            trWalTokenCount={trWalTokenCount}
            onCollectionChange={setSelectedCollectionType}
            onFilterChange={setSelectedFilter}
            buyButton={buyButton}
          />

          {/* Content */}
          <VotePoolContent
            selectedCollectionType={selectedCollectionType}
            isLoading={isLoadingPools}
            pools={pools}
            formatCountdown={formatCountdown}
            onPollClick={handlePollClick}
            onCreateVotePool={handleCreateVotePool}
            userProfile={userProfile}
          />
        </main>

        {/* Create Vote Pool Modal */}
        <CreateVotePoolModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSuccess={handlePollCreated}
        />
      </div>
    </div>
  );
};

export default VotePoolPage;
