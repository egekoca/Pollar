export interface VoteOption {
  id: string;
  name: string;
  image?: string;
  voteCount: number;
  percentage: number;
}

export interface VotePool {
  id: string;
  name: string;
  description: string;
  image: string;
  options: VoteOption[];
  startTime: string;
  endTime: string;
  totalVotes: number;
  nft_collection_type?: string;
  is_private?: boolean;
  creator?: string;
  history: {
    timestamp: string;
    options: {
      optionId: string;
      percentage: number;
    }[];
  }[];
}


