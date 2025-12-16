import { describe, it, expect } from 'vitest';
import {
  formatCountdown,
  getPollStatus,
  getCollectionTheme,
  getBackgroundGradient,
  isPollActive,
  filterPollsByStatus,
} from '../pollHelpers';
import { VotePool } from '../../types/poll';

describe('pollHelpers', () => {
  describe('formatCountdown', () => {
    it('should return "Ended" for past dates', () => {
      const pastDate = new Date(Date.now() - 1000).toISOString();
      expect(formatCountdown(pastDate)).toBe('Ended');
    });

    it('should format days correctly', () => {
      const futureDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000).toISOString();
      const result = formatCountdown(futureDate);
      expect(result).toMatch(/\d+d \d+h \d+m/);
    });

    it('should format hours correctly', () => {
      const futureDate = new Date(Date.now() + 3 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString();
      const result = formatCountdown(futureDate);
      expect(result).toMatch(/\d+h \d+m \d+s/);
    });

    it('should format minutes correctly', () => {
      const futureDate = new Date(Date.now() + 5 * 60 * 1000 + 30 * 1000).toISOString();
      const result = formatCountdown(futureDate);
      expect(result).toMatch(/\d+m \d+s/);
    });

    it('should format seconds correctly', () => {
      const futureDate = new Date(Date.now() + 45 * 1000).toISOString();
      const result = formatCountdown(futureDate);
      expect(result).toMatch(/\d+s/);
    });
  });

  describe('getPollStatus', () => {
    it('should return "upcoming" for polls that have not started', () => {
      const poll = {
        startTime: new Date(Date.now() + 1000).toISOString(),
        endTime: new Date(Date.now() + 2000).toISOString(),
      };
      expect(getPollStatus(poll)).toBe('upcoming');
    });

    it('should return "active" for polls that are currently running', () => {
      const poll = {
        startTime: new Date(Date.now() - 1000).toISOString(),
        endTime: new Date(Date.now() + 1000).toISOString(),
      };
      expect(getPollStatus(poll)).toBe('active');
    });

    it('should return "ended" for polls that have ended', () => {
      const poll = {
        startTime: new Date(Date.now() - 2000).toISOString(),
        endTime: new Date(Date.now() - 1000).toISOString(),
      };
      expect(getPollStatus(poll)).toBe('ended');
    });
  });

  describe('getCollectionTheme', () => {
    it('should return null for null collection type', () => {
      expect(getCollectionTheme(null)).toBeNull();
    });

    it('should return null for unknown collection type', () => {
      expect(getCollectionTheme('unknown::type')).toBeNull();
    });
  });

  describe('getBackgroundGradient', () => {
    it('should return default gradient for null collection type', () => {
      const result = getBackgroundGradient(null);
      expect(result).toContain('linear-gradient');
    });

    it('should return custom gradient for Popkins', () => {
      const result = getBackgroundGradient('0xb908f3c6fea6865d32e2048c520cdfe3b5c5bbcebb658117c41bad70f52b7ccc::popkins_nft::Popkins');
      expect(result).toContain('linear-gradient');
    });
  });

  describe('isPollActive', () => {
    it('should return true for active polls', () => {
      const poll = {
        startTime: new Date(Date.now() - 1000).toISOString(),
        endTime: new Date(Date.now() + 1000).toISOString(),
      };
      expect(isPollActive(poll)).toBe(true);
    });

    it('should return false for upcoming polls', () => {
      const poll = {
        startTime: new Date(Date.now() + 1000).toISOString(),
        endTime: new Date(Date.now() + 2000).toISOString(),
      };
      expect(isPollActive(poll)).toBe(false);
    });

    it('should return false for ended polls', () => {
      const poll = {
        startTime: new Date(Date.now() - 2000).toISOString(),
        endTime: new Date(Date.now() - 1000).toISOString(),
      };
      expect(isPollActive(poll)).toBe(false);
    });
  });

  describe('filterPollsByStatus', () => {
    const mockPools: VotePool[] = [
      {
        id: '1',
        name: 'Active Poll',
        description: 'Test',
        image: '',
        startTime: new Date(Date.now() - 1000).toISOString(),
        endTime: new Date(Date.now() + 1000).toISOString(),
        options: [],
        totalVotes: 0,
        nft_collection_type: '',
        is_private: false,
        history: [],
      },
      {
        id: '2',
        name: 'Upcoming Poll',
        description: 'Test',
        image: '',
        startTime: new Date(Date.now() + 1000).toISOString(),
        endTime: new Date(Date.now() + 2000).toISOString(),
        options: [],
        totalVotes: 0,
        nft_collection_type: '',
        is_private: false,
        history: [],
      },
      {
        id: '3',
        name: 'Ended Poll',
        description: 'Test',
        image: '',
        startTime: new Date(Date.now() - 2000).toISOString(),
        endTime: new Date(Date.now() - 1000).toISOString(),
        options: [],
        totalVotes: 0,
        nft_collection_type: '',
        is_private: false,
        history: [],
      },
    ];

    it('should filter active polls', () => {
      const result = filterPollsByStatus(mockPools, 'active');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should filter upcoming polls', () => {
      const result = filterPollsByStatus(mockPools, 'upcoming');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('should filter ended polls', () => {
      const result = filterPollsByStatus(mockPools, 'ended');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('3');
    });
  });
});


