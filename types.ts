export interface Word {
  id: number;
  word: string;
}

export interface BandConfig {
  id: number;
  minRank: number;
  maxRank: number;
  ratio: number; // Percentage of total questions allocated to this band (0.0 - 1.0)
  sparsityFactor: number; // Damping factor for sparse knowledge in high bands (0.0 - 1.0)
}

export interface TestMode {
  id: 'quick' | 'standard' | 'accurate';
  label: string;
  totalQuestions: number;
  description: string;
  estimatedTime: string;
  icon: string;
}

export type LearnerType = 'ACADEMIC' | 'IMMERSION' | 'BALANCED' | 'BEGINNER';

export interface RadarStats {
  survival: number;   // Band 1-2
  formal: number;     // Band 3-4
  culture: number;    // Band 5-6
  literary: number;   // Band 7-8
  complexity: number; // Jukugo Accuracy
}

export interface TestResult {
  totalPredicted: number;
  jlptLevel: string;
  cefrLevel: string;
  ageEquivalent: string;
  literacyDescription: string;
  learnerType: LearnerType;
  radarStats: RadarStats;
  details: {
    bandId: number;
    totalInBand: number;
    knownInBand: number;
    predictedInBand: number;
  }[];
}

export type AppState = 'WELCOME' | 'MODE_SELECT' | 'LOADING' | 'TEST' | 'RESULTS';