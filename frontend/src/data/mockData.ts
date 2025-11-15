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
  nft_collection_type?: string; // NFT collection type (empty string = no NFT required)
  history: {
    timestamp: string;
    options: {
      optionId: string;
      percentage: number;
    }[];
  }[];
}

export const mockVotePools: VotePool[] = [
  {
    id: "1",
    name: "Best Programming Language 2024",
    description: "Which programming language do you think will dominate in 2024?",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop",
    startTime: "2024-01-01T00:00:00Z",
    endTime: "2024-12-31T23:59:59Z",
    totalVotes: 15234,
    options: [
      {
        id: "opt1",
        name: "TypeScript",
        image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop",
        voteCount: 5432,
        percentage: 35.6,
      },
      {
        id: "opt2",
        name: "Python",
        image: "https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?w=400&h=300&fit=crop",
        voteCount: 4890,
        percentage: 32.1,
      },
      {
        id: "opt3",
        name: "Rust",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop",
        voteCount: 3124,
        percentage: 20.5,
      },
      {
        id: "opt4",
        name: "Go",
        image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=300&fit=crop",
        voteCount: 1788,
        percentage: 11.8,
      },
    ],
    history: [
      {
        timestamp: "2024-01-01T00:00:00Z",
        options: [
          { optionId: "opt1", percentage: 30 },
          { optionId: "opt2", percentage: 35 },
          { optionId: "opt3", percentage: 20 },
          { optionId: "opt4", percentage: 15 },
        ],
      },
      {
        timestamp: "2024-06-01T00:00:00Z",
        options: [
          { optionId: "opt1", percentage: 33 },
          { optionId: "opt2", percentage: 33 },
          { optionId: "opt3", percentage: 21 },
          { optionId: "opt4", percentage: 13 },
        ],
      },
      {
        timestamp: "2024-12-01T00:00:00Z",
        options: [
          { optionId: "opt1", percentage: 35.6 },
          { optionId: "opt2", percentage: 32.1 },
          { optionId: "opt3", percentage: 20.5 },
          { optionId: "opt4", percentage: 11.8 },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "Favorite Frontend Framework",
    description: "What's your preferred frontend framework for building modern web applications?",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=400&fit=crop",
    startTime: "2024-01-15T00:00:00Z",
    endTime: "2024-12-31T23:59:59Z",
    totalVotes: 9845,
    options: [
      {
        id: "opt5",
        name: "React",
        image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop",
        voteCount: 4210,
        percentage: 42.8,
      },
      {
        id: "opt6",
        name: "Vue.js",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop",
        voteCount: 2845,
        percentage: 28.9,
      },
      {
        id: "opt7",
        name: "Angular",
        image: "https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?w=400&h=300&fit=crop",
        voteCount: 1876,
        percentage: 19.1,
      },
      {
        id: "opt8",
        name: "Svelte",
        image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=300&fit=crop",
        voteCount: 914,
        percentage: 9.2,
      },
    ],
    history: [
      {
        timestamp: "2024-01-15T00:00:00Z",
        options: [
          { optionId: "opt5", percentage: 40 },
          { optionId: "opt6", percentage: 30 },
          { optionId: "opt7", percentage: 20 },
          { optionId: "opt8", percentage: 10 },
        ],
      },
      {
        timestamp: "2024-07-01T00:00:00Z",
        options: [
          { optionId: "opt5", percentage: 41 },
          { optionId: "opt6", percentage: 29 },
          { optionId: "opt7", percentage: 20 },
          { optionId: "opt8", percentage: 10 },
        ],
      },
      {
        timestamp: "2024-12-01T00:00:00Z",
        options: [
          { optionId: "opt5", percentage: 42.8 },
          { optionId: "opt6", percentage: 28.9 },
          { optionId: "opt7", percentage: 19.1 },
          { optionId: "opt8", percentage: 9.2 },
        ],
      },
    ],
  },
  {
    id: "3",
    name: "Best Blockchain Platform",
    description: "Which blockchain platform do you think offers the best developer experience?",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=400&fit=crop",
    startTime: "2024-02-01T00:00:00Z",
    endTime: "2024-12-31T23:59:59Z",
    totalVotes: 12345,
    options: [
      {
        id: "opt9",
        name: "Sui",
        image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop",
        voteCount: 5420,
        percentage: 43.9,
      },
      {
        id: "opt10",
        name: "Ethereum",
        image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400&h=300&fit=crop",
        voteCount: 3890,
        percentage: 31.5,
      },
      {
        id: "opt11",
        name: "Solana",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop",
        voteCount: 2145,
        percentage: 17.4,
      },
      {
        id: "opt12",
        name: "Aptos",
        image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=300&fit=crop",
        voteCount: 890,
        percentage: 7.2,
      },
    ],
    history: [
      {
        timestamp: "2024-02-01T00:00:00Z",
        options: [
          { optionId: "opt9", percentage: 38 },
          { optionId: "opt10", percentage: 35 },
          { optionId: "opt11", percentage: 18 },
          { optionId: "opt12", percentage: 9 },
        ],
      },
      {
        timestamp: "2024-08-01T00:00:00Z",
        options: [
          { optionId: "opt9", percentage: 41 },
          { optionId: "opt10", percentage: 33 },
          { optionId: "opt11", percentage: 17 },
          { optionId: "opt12", percentage: 9 },
        ],
      },
      {
        timestamp: "2024-12-01T00:00:00Z",
        options: [
          { optionId: "opt9", percentage: 43.9 },
          { optionId: "opt10", percentage: 31.5 },
          { optionId: "opt11", percentage: 17.4 },
          { optionId: "opt12", percentage: 7.2 },
        ],
      },
    ],
  },
  {
    id: "4",
    name: "Best Cloud Provider",
    description: "Which cloud provider offers the best services for modern applications?",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop",
    startTime: "2024-03-01T00:00:00Z",
    endTime: "2024-12-31T23:59:59Z",
    totalVotes: 8765,
    options: [
      {
        id: "opt13",
        name: "AWS",
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop",
        voteCount: 3420,
        percentage: 39.0,
      },
      {
        id: "opt14",
        name: "Google Cloud",
        image: "https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?w=400&h=300&fit=crop",
        voteCount: 2845,
        percentage: 32.5,
      },
      {
        id: "opt15",
        name: "Azure",
        image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop",
        voteCount: 1890,
        percentage: 21.6,
      },
      {
        id: "opt16",
        name: "DigitalOcean",
        image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=300&fit=crop",
        voteCount: 610,
        percentage: 6.9,
      },
    ],
    history: [
      {
        timestamp: "2024-03-01T00:00:00Z",
        options: [
          { optionId: "opt13", percentage: 42 },
          { optionId: "opt14", percentage: 30 },
          { optionId: "opt15", percentage: 22 },
          { optionId: "opt16", percentage: 6 },
        ],
      },
      {
        timestamp: "2024-09-01T00:00:00Z",
        options: [
          { optionId: "opt13", percentage: 40 },
          { optionId: "opt14", percentage: 31 },
          { optionId: "opt15", percentage: 22 },
          { optionId: "opt16", percentage: 7 },
        ],
      },
      {
        timestamp: "2024-12-01T00:00:00Z",
        options: [
          { optionId: "opt13", percentage: 39.0 },
          { optionId: "opt14", percentage: 32.5 },
          { optionId: "opt15", percentage: 21.6 },
          { optionId: "opt16", percentage: 6.9 },
        ],
      },
    ],
  },
];

export const getVotePoolById = (id: string): VotePool | undefined => {
  return mockVotePools.find((pool) => pool.id === id);
};

export const addVotePool = (
  name: string,
  description: string,
  image: string,
  options: { name: string; image: string }[],
  startTime: string,
  endTime: string
): VotePool => {
  const newId = (mockVotePools.length + 1).toString();
  const voteOptions: VoteOption[] = options.map((opt, index) => ({
    id: `opt${newId}-${index + 1}`,
    name: opt.name,
    image: opt.image || undefined,
    voteCount: 0,
    percentage: 0,
  }));

  const newPool: VotePool = {
    id: newId,
    name,
    description,
    image,
    options: voteOptions,
    startTime,
    endTime,
    totalVotes: 0,
    history: [
      {
        timestamp: startTime,
        options: voteOptions.map((opt) => ({
          optionId: opt.id,
          percentage: 0,
        })),
      },
    ],
  };

  mockVotePools.push(newPool);
  return newPool;
};

