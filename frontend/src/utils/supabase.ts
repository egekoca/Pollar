import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface UserProfile {
  wallet_address: string;
  username: string;
  avatar_url: string;
  created_at?: string;
  updated_at?: string;
}

export interface WhitelistEntry {
  id?: number;
  collection_type: string;
  wallet_address: string;
  created_at?: string;
}

export interface UserVote {
  id?: number;
  wallet_address: string;
  poll_id: string;
  created_at?: string;
}

// Save user vote to database (only tracks which poll was voted on, not the option)
export const saveUserVote = async (walletAddress: string, pollId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_votes')
      .upsert({
        wallet_address: walletAddress,
        poll_id: pollId,
      }, {
        onConflict: 'wallet_address,poll_id'
      });

    if (error) {
      console.error("Error saving user vote to Supabase:", error);
      throw error;
    }
  } catch (error) {
    console.error("Failed to save user vote:", error);
  }
};

// Get user votes for a specific poll
export const getUserVote = async (walletAddress: string, pollId: string): Promise<UserVote | null> => {
  try {
    const { data, error } = await supabase
      .from('user_votes')
      .select('*')
      .eq('wallet_address', walletAddress)
      .eq('poll_id', pollId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      wallet_address: data.wallet_address,
      poll_id: data.poll_id,
      created_at: data.created_at,
    };
  } catch (error) {
    console.error("Error getting user vote:", error);
    return null;
  }
};

// Get all votes by a user
export const getUserVotes = async (walletAddress: string): Promise<UserVote[]> => {
  try {
    const { data, error } = await supabase
      .from('user_votes')
      .select('*')
      .eq('wallet_address', walletAddress)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((vote) => ({
      id: vote.id,
      wallet_address: vote.wallet_address,
      poll_id: vote.poll_id,
      created_at: vote.created_at,
    }));
  } catch (error) {
    console.error("Error getting user votes:", error);
    return [];
  }
};

