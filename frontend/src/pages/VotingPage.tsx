import { useParams, Link } from "react-router-dom";
import { useState, useRef, useEffect, useMemo } from "react";
import { gsap } from "gsap";
import { getCollectionByType } from "../config/nftCollections";
import { SUI_TURKIYE_COLLECTION_TYPE, ANIMATION_DURATION } from "../constants/appConstants";
import { getBackgroundGradient } from "../utils/pollHelpers";
import { usePollData } from "../hooks/usePollData";
import { useUserAssetsForPoll } from "../hooks/useUserAssetsForPoll";
import { useVoting } from "../hooks/useVoting";
import { useCountdown } from "../hooks/useCountdown";
import { usePollChartData } from "../hooks/usePollChartData";
import VotingHeader from "../components/VotingHeader";
import VotingPoolHeader from "../components/VotingPoolHeader";
import VotingOptions from "../components/VotingOptions";
import VotingChart from "../components/VotingChart";
import SuccessModal from "../components/SuccessModal";
import BackgroundCharacters from "../components/BackgroundCharacters";
import BackgroundNFTs from "../components/BackgroundNFTs";
import pollarWalkVideo from "/pollar-walk.mp4";
import "../styles/theme.css";

const VotingPage = () => {
  const { id } = useParams<{ id: string }>();
  const logoRef = useRef<HTMLImageElement>(null);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [updatedPool, setUpdatedPool] = useState<any>(null);
  const [hasVotedLocal, setHasVotedLocal] = useState<boolean>(false);

  // Custom hooks
  const { pollData, localPool: pollLocalPool, voteRegistryId, hasVoted, isLoading, error: pollError } = usePollData(id);

  // Reset updatedPool and hasVotedLocal when pollId changes
  useEffect(() => {
    setUpdatedPool(null);
    setHasVotedLocal(false);
  }, [id]);
  
  // Clear updatedPool when pollLocalPool becomes null (new poll loading)
  useEffect(() => {
    if (!pollLocalPool && updatedPool) {
      setUpdatedPool(null);
    }
  }, [pollLocalPool, updatedPool]);

  // Update hasVotedLocal when hasVoted changes from hook
  useEffect(() => {
    if (hasVoted) {
      setHasVotedLocal(true);
    }
  }, [hasVoted]);
  const { userNfts, selectedNftId, trWalTokenCount } = useUserAssetsForPoll(pollData?.nft_collection_type);
  const { formatCountdown } = useCountdown();
  
  // Use updatedPool if available, otherwise use pollLocalPool
  const localPool = updatedPool || pollLocalPool;
  const chartData = usePollChartData(localPool);

  // Memoize these calculations to prevent unnecessary recalculations
  const pollRequiresNft = useMemo(() => 
    !!(pollData?.nft_collection_type && pollData.nft_collection_type.length > 0),
    [pollData?.nft_collection_type]
  );
  const isSuiTurkiyePoll = useMemo(() => 
    pollData?.nft_collection_type === SUI_TURKIYE_COLLECTION_TYPE,
    [pollData?.nft_collection_type]
  );

  // Voting hook
  const { handleVote, isVoting, votingError, selectedOption } = useVoting({
    pollId: id,
    voteRegistryId,
    pollData,
    pollRequiresNft,
    isSuiTurkiyePoll,
    userNfts,
    selectedNftId,
    trWalTokenCount,
    hasVoted: hasVoted || hasVotedLocal, // Use combined hasVoted
    localPool: pollLocalPool,
    onVoteSuccess: (updatedPool) => {
      setUpdatedPool(updatedPool);
      setHasVotedLocal(true); // Update hasVoted state after successful vote
    },
    onError: () => {},
    onShowSuccessModal: () => setShowSuccessModal(true),
  });

  // Combine errors
  const error = pollError || votingError;

  // Use combined hasVoted
  const finalHasVoted = hasVoted || hasVotedLocal;

  const handleLogoHover = () => {
    if (logoRef.current) {
      gsap.to(logoRef.current, {
        rotate: 360,
        duration: ANIMATION_DURATION.NORMAL,
        ease: "power3.easeOut",
      });
    }
  };

  // Get theme for poll's NFT collection - only when pollData is fully loaded
  // Memoized to prevent unnecessary recalculations
  const pollCollection = useMemo(() => {
    if (isLoading || !pollData?.nft_collection_type || pollData.nft_collection_type.length === 0) {
      return null;
    }
    return getCollectionByType(pollData.nft_collection_type);
  }, [isLoading, pollData?.nft_collection_type]);
  
  const theme = pollCollection?.theme;
  const backgroundGradient = useMemo(() => 
    getBackgroundGradient(pollData?.nft_collection_type || null),
    [pollData?.nft_collection_type]
  );

  if (error && !pollLocalPool && !isLoading) {
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

  // Show loading if still loading or if pool is not yet loaded
  // Also check localPool to ensure we don't show old data
  if (isLoading || !pollLocalPool || !localPool) {
    // If we're loading, show loading screen
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
          </div>
        </div>
      );
    }
    
    // If not loading but pool not found, show error
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

  return (
    <div 
      style={{ 
        minHeight: "100vh", 
        background: backgroundGradient,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Character Images - Left and Right Sides (For Public polls) */}
      {/* Only render when pollData is loaded and no collection type */}
      {pollData && !pollRequiresNft && (
        <BackgroundCharacters key="characters" />
      )}

      {/* Background NFT Images - Left and Right Sides (For NFT collection polls) */}
      {/* Only show when pollData is loaded, has collection type, and theme has images */}
      {/* Key prop ensures component remounts when pollId changes, clearing previous NFTs */}
      {pollData && pollRequiresNft && theme?.backgroundImages && theme.backgroundImages.length > 0 && (
        <BackgroundNFTs key={`${id}-${pollData.nft_collection_type}`} theme={theme} collectionName={pollCollection?.name} pollId={id} />
      )}
      
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <VotingHeader 
          logoRef={logoRef}
          handleLogoHover={handleLogoHover}
          pollId={id}
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
          {/* Pool Header */}
          <VotingPoolHeader
            localPool={localPool}
            hasVoted={finalHasVoted}
            error={error}
            pollRequiresNft={pollRequiresNft}
            isSuiTurkiyePoll={isSuiTurkiyePoll}
            userNfts={userNfts}
            trWalTokenCount={trWalTokenCount}
            formatCountdown={formatCountdown}
          />

          {/* Voting Options */}
          <VotingOptions
            localPool={localPool}
            selectedOption={selectedOption}
            isVoting={isVoting}
            hasVoted={finalHasVoted}
            onVote={handleVote}
            onError={() => {
              // Error is handled by useVoting hook
            }}
          />

          {/* Chart */}
          <VotingChart
            chartData={chartData}
            localPool={localPool}
          />
        </main>

        {/* Success Modal */}
        <SuccessModal
          show={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
        />
      </div>
    </div>
  );
};

export default VotingPage;
