import { useParams, Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
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

  // Custom hooks
  const { pollData, localPool: pollLocalPool, voteRegistryId, hasVoted, isLoading, error: pollError } = usePollData(id);

  // Reset updatedPool when pollId changes
  useEffect(() => {
    setUpdatedPool(null);
  }, [id]);
  const { userNfts, selectedNftId, trWalTokenCount } = useUserAssetsForPoll(pollData?.nft_collection_type);
  const { formatCountdown } = useCountdown();
  
  // Use updatedPool if available, otherwise use pollLocalPool
  const localPool = updatedPool || pollLocalPool;
  const chartData = usePollChartData(localPool);

  const pollRequiresNft = !!(pollData?.nft_collection_type && pollData.nft_collection_type.length > 0);
  const isSuiTurkiyePoll = pollData?.nft_collection_type === SUI_TURKIYE_COLLECTION_TYPE;

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
    hasVoted,
    localPool: pollLocalPool,
    onVoteSuccess: (updatedPool) => {
      setUpdatedPool(updatedPool);
    },
    onError: () => {},
    onShowSuccessModal: () => setShowSuccessModal(true),
  });

  // Combine errors
  const error = pollError || votingError;

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
  const pollCollection = (!isLoading && pollData?.nft_collection_type && pollData.nft_collection_type.length > 0)
    ? getCollectionByType(pollData.nft_collection_type)
    : null;
  
  const theme = pollCollection?.theme;
  const backgroundGradient = getBackgroundGradient(pollData?.nft_collection_type || null);

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

  if (error && !pollLocalPool) {
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

  if (!pollLocalPool) {
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
      {!isLoading && pollData && (!pollData.nft_collection_type || pollData.nft_collection_type.length === 0) && (
        <BackgroundCharacters />
      )}

      {/* Background NFT Images - Left and Right Sides (For NFT collection polls) */}
      {/* Only show when pollData is loaded and matches current pollId */}
      {/* Key prop ensures component remounts when pollId changes, clearing previous NFTs */}
      {!isLoading && pollData && pollData.nft_collection_type && pollData.nft_collection_type.length > 0 && theme?.backgroundImages && theme.backgroundImages.length > 0 && (
        <BackgroundNFTs key={`${id}-${pollData.nft_collection_type}`} theme={theme} collectionName={pollCollection?.name} />
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
            localPool={pollLocalPool}
            hasVoted={hasVoted}
            error={error}
            pollRequiresNft={pollRequiresNft}
            isSuiTurkiyePoll={isSuiTurkiyePoll}
            userNfts={userNfts}
            trWalTokenCount={trWalTokenCount}
            formatCountdown={formatCountdown}
          />

          {/* Voting Options */}
          <VotingOptions
            localPool={pollLocalPool}
            selectedOption={selectedOption}
            isVoting={isVoting}
            hasVoted={hasVoted}
            onVote={handleVote}
            onError={() => {
              // Error is handled by useVoting hook
            }}
          />

          {/* Chart */}
          <VotingChart
            chartData={chartData}
            localPool={pollLocalPool}
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
