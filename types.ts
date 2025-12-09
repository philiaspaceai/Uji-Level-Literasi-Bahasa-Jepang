

export interface Word {
  id: number;
  word: string;
  tags?: string; // e.g., "5", "4", etc.
}

export interface BandConfig {
  id: number;
  minRank: number;
  maxRank: number;
}

export interface DensityStat {
  bandId: number;
  startRank: number;
  endRank: number;
  known: number;
  total: number;
  density: number; // percentage 0-100
}

export interface BenchmarkMetrics {
  coverageRank: number; // Total estimated words known
  densityStats: DensityStat[];
}

export interface JlptScore {
    level: string; // N5, N4, N3, N2, N1
    score: number; // Percentage 0-100
    total: number;
    known: number;
}

export interface TestResult {
  benchmark: BenchmarkMetrics;
  jlptScores: JlptScore[];
  totalQuestions: number;
}

export type AppState = 'WELCOME' | 'LOADING' | 'TEST' | 'CALCULATING' | 'RESULTS';