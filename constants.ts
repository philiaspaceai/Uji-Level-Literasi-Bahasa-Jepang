import { BandConfig } from './types';

// BANDS configuration defines the rank ranges for each stage.
export const BANDS: BandConfig[] = [
  { id: 1, minRank: 1, maxRank: 1000 },       // Core (N5)
  { id: 2, minRank: 1001, maxRank: 3000 },    // Basic (N4)
  { id: 3, minRank: 3001, maxRank: 8000 },    // Intermediate (N3)
  { id: 4, minRank: 8001, maxRank: 15000 },  // Advanced (N2/N1)
  { id: 5, minRank: 15001, maxRank: 25000 },  // Native (High Literacy)
  { id: 6, minRank: 25001, maxRank: 40000 },  // Expert (Academic)
  { id: 7, minRank: 40001, maxRank: 55000 },  // Master (Specialist)
  { id: 8, minRank: 55001, maxRank: 70000 }   // Legend (Ultra Rare)
];

export const STAGE_PARAMS = {
  BATCH_SIZE: 10, // Number of words on screen at once
  MAX_REFRESH_PER_BAND: 6, // User gets 5 refreshes, the 6th one ends the test.
  WORDS_PER_BAND_TO_ADVANCE: 30, // Number of known words to trigger next difficulty band seamlessly.
};

export const API_URL = "https://xxnsvylzzkgcnubaegyv.supabase.co";
export const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4bnN2eWx6emtnY251YmFlZ3l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MDE0MjcsImV4cCI6MjA3OTk3NzQyN30.x0wz0v_qqvg6riMipKMr3IM30YnGaGs1b9uMvJRGG5M";