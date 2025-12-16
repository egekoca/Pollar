import { describe, it, expect } from 'vitest';
import {
  COUNTDOWN_UPDATE_INTERVAL_MS,
  POLLING_INTERVAL_MS,
  POLL_REFETCH_INTERVAL_MS,
  EVENT_REFETCH_DELAY_MS,
  VOTE_POWER_THRESHOLDS,
  VOTE_POWER_VALUES,
  EVENT_QUERY_LIMIT,
  USER_VOTE_QUERY_LIMIT,
  PERCENTAGE_MULTIPLIER,
  MS_PER_SECOND,
  MS_PER_MINUTE,
  MS_PER_HOUR,
  MS_PER_DAY,
  TR_WAL_TOKEN_TYPE,
  TR_WAL_DECIMAL,
  SUI_TURKIYE_COLLECTION_TYPE,
  COLLECTION_ORDER,
  Z_INDEX,
  ANIMATION_DURATION,
  DEFAULT_BACKGROUND_GRADIENT,
} from '../appConstants';

describe('appConstants', () => {
  describe('Timer Constants', () => {
    it('should have valid timer intervals', () => {
      expect(COUNTDOWN_UPDATE_INTERVAL_MS).toBe(1000);
      expect(POLLING_INTERVAL_MS).toBe(60000);
      expect(POLL_REFETCH_INTERVAL_MS).toBe(20000);
      expect(EVENT_REFETCH_DELAY_MS).toBe(2000);
    });
  });

  describe('Vote Power Constants', () => {
    it('should have valid vote power thresholds', () => {
      expect(VOTE_POWER_THRESHOLDS.MIN).toBe(1);
      expect(VOTE_POWER_THRESHOLDS.LOW).toBe(10);
      expect(VOTE_POWER_THRESHOLDS.MEDIUM).toBe(30);
      expect(VOTE_POWER_THRESHOLDS.HIGH).toBe(50);
      expect(VOTE_POWER_THRESHOLDS.VERY_HIGH).toBe(100);
    });

    it('should have valid vote power values', () => {
      expect(VOTE_POWER_VALUES.MIN).toBe(1);
      expect(VOTE_POWER_VALUES.LOW).toBe(2);
      expect(VOTE_POWER_VALUES.MEDIUM).toBe(3);
      expect(VOTE_POWER_VALUES.HIGH).toBe(4);
      expect(VOTE_POWER_VALUES.MAX).toBe(5);
    });
  });

  describe('Query Limits', () => {
    it('should have valid query limits', () => {
      expect(EVENT_QUERY_LIMIT).toBe(100);
      expect(USER_VOTE_QUERY_LIMIT).toBe(1000);
    });
  });

  describe('Calculation Constants', () => {
    it('should have valid percentage multiplier', () => {
      expect(PERCENTAGE_MULTIPLIER).toBe(100);
    });

    it('should have valid time conversion constants', () => {
      expect(MS_PER_SECOND).toBe(1000);
      expect(MS_PER_MINUTE).toBe(60000);
      expect(MS_PER_HOUR).toBe(3600000);
      expect(MS_PER_DAY).toBe(86400000);
    });
  });

  describe('Token Constants', () => {
    it('should have valid TR_WAL token type', () => {
      expect(TR_WAL_TOKEN_TYPE).toBeTruthy();
      expect(typeof TR_WAL_TOKEN_TYPE).toBe('string');
    });

    it('should have valid TR_WAL decimal', () => {
      expect(TR_WAL_DECIMAL).toBe(9);
    });

    it('should have valid SUI TURKIYE collection type', () => {
      expect(SUI_TURKIYE_COLLECTION_TYPE).toBeTruthy();
      expect(typeof SUI_TURKIYE_COLLECTION_TYPE).toBe('string');
    });
  });

  describe('Collection Order', () => {
    it('should have valid collection order array', () => {
      expect(COLLECTION_ORDER).toBeInstanceOf(Array);
      expect(COLLECTION_ORDER.length).toBeGreaterThan(0);
    });
  });

  describe('UI Constants', () => {
    it('should have valid z-index values', () => {
      expect(Z_INDEX.BACKGROUND).toBe(0);
      expect(Z_INDEX.CONTENT).toBe(1);
      expect(Z_INDEX.NAVIGATION).toBe(100);
      expect(Z_INDEX.HEADER).toBe(1000);
      expect(Z_INDEX.MODAL).toBe(2000);
      expect(Z_INDEX.TOOLTIP).toBe(3000);
    });

    it('should have valid animation durations', () => {
      expect(ANIMATION_DURATION.FAST).toBe(0.3);
      expect(ANIMATION_DURATION.NORMAL).toBe(0.6);
      expect(ANIMATION_DURATION.SLOW).toBe(1.0);
    });

    it('should have valid default background gradient', () => {
      expect(DEFAULT_BACKGROUND_GRADIENT).toBeTruthy();
      expect(typeof DEFAULT_BACKGROUND_GRADIENT).toBe('string');
      expect(DEFAULT_BACKGROUND_GRADIENT).toContain('linear-gradient');
    });
  });
});


