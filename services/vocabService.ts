

import { API_KEY, API_URL, BANDS, STAGE_PARAMS } from '../constants';
import { Word, TestResult, BenchmarkMetrics, DensityStat, JlptScore } from '../types';

// Helper to shuffle array
function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

// Data Fetching (largely unchanged, but crucial)
export async function fetchWords(ids: number[]): Promise<Map<number, Word>> {
  if (ids.length === 0) return new Map();

  const BATCH_SIZE = 50;
  const wordMap = new Map<number, Word>();
  const wordsToQueryForJlpt: string[] = [];

  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batch = ids.slice(i, i + BATCH_SIZE);
    const filter = `id=in.(${batch.join(',')})`;
    const url = `${API_URL}/rest/v1/bccwj?select=id,word&${filter}`;

    let response;
    try {
        response = await fetch(url, {
            method: 'GET',
            headers: { 'apikey': API_KEY, 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Network error while fetching BCCWJ words:', error);
        throw new Error('Gagal terhubung ke server kosakata. Periksa koneksi internet Anda.');
    }

    if (!response.ok) {
        console.error(`BCCWJ data fetch failed with status: ${response.status}`);
        throw new Error('Gagal mengambil data kosakata BCCWJ');
    }

    const data: Word[] = await response.json();
    data.forEach(w => {
        wordMap.set(w.id, w);
        wordsToQueryForJlpt.push(w.word);
    });
  }

  if (wordsToQueryForJlpt.length > 0) {
    const jlptWordMap = new Map<string, string>();
    const JLPT_QUERY_BATCH_SIZE = 25; // Smaller batch to prevent URL length issues

    for (let i = 0; i < wordsToQueryForJlpt.length; i += JLPT_QUERY_BATCH_SIZE) {
        const batch = wordsToQueryForJlpt.slice(i, i + JLPT_QUERY_BATCH_SIZE);
        const jlptFilter = `word=in.(${batch.map(w => `"${w.replace(/"/g, '""')}"`).join(',')})`;
        const jlptUrl = `${API_URL}/rest/v1/jlpt?select=word,tags&${jlptFilter}`;
        
        try {
            const jlptResponse = await fetch(jlptUrl, {
                method: 'GET',
                headers: { 'apikey': API_KEY, 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' }
            });
            if (jlptResponse.ok) {
                const jlptData: { word: string, tags: string }[] = await jlptResponse.json();
                jlptData.forEach(item => jlptWordMap.set(item.word, item.tags));
            } else {
                console.warn(`JLPT sub-batch fetch failed with status: ${jlptResponse.status}`);
            }
        } catch (error) {
            console.error('Network error fetching JLPT tags sub-batch:', error);
            // Do not throw; continue so the test isn't interrupted by non-critical data failure.
        }
    }
    
    for (const word of wordMap.values()) {
        if (jlptWordMap.has(word.word)) {
            word.tags = jlptWordMap.get(word.word);
        }
    }
  }

  return wordMap;
}

// --- WORD VALIDATION (CORRECTED) ---
function isValidWord(w: string | undefined): boolean {
    if (!w) return false;
    
    // Filter out basic symbols and Arabic numerals
    if (w.includes(':') || w.includes('：') || w.includes('・') || w.includes('％')) return false;
    if (/[0-9０-９]/.test(w)) return false;

    // Filter out patterns of numbers + counters (e.g., 六十二年度, 三日目)
    const kanjiNumerals = '一二三四五六七八九十百千万億兆〇';
    const counterPattern = /^[一二三四五六七八九十百千万億兆〇]+(年度|日目|時間|分|秒|回|番|月|日|年|人|円|階|号)$/;
    if (counterPattern.test(w)) {
        return false;
    }

    // Filter out words that are ONLY numerals
    if (w.length >= 2) {
        let allNumerals = true;
        for (const char of w) {
            if (!kanjiNumerals.includes(char)) {
                allNumerals = false;
                break;
            }
        }
        if (allNumerals) {
            return false;
        }
    }

    return true; // Katakana is allowed, Jukugo rule is removed.
}


// --- STAGED TEST LOGIC (ROBUST VERSION) ---

export async function fetchStagedBatch(
  startBandId: number,
  excludedIds: Set<number>,
  count: number = STAGE_PARAMS.BATCH_SIZE
): Promise<{
  queue: { id: number, bandId: number }[],
  map: Map<number, Word>
}> {
  let currentBandId = startBandId;
  const finalQueue: { id: number, bandId: number }[] = [];
  const finalMap = new Map<number, Word>();

  while (finalQueue.length < count && currentBandId <= BANDS.length) {
    const band = BANDS.find(b => b.id === currentBandId)!;
    const needed = count - finalQueue.length;
    
    const range = band.maxRank - band.minRank + 1;
    const candidateIds = new Set<number>();
    
    // Increase attempts to find valid words
    const maxBandAttempts = Math.max(needed * 10, 100);
    let bandAttempts = 0;
    // We aim for more candidates to account for filtering
    while(candidateIds.size < needed * 3 && bandAttempts < maxBandAttempts) {
        const randomId = band.minRank + Math.floor(Math.random() * range);
        if (!excludedIds.has(randomId) && !candidateIds.has(randomId)) {
            candidateIds.add(randomId);
        }
        bandAttempts++;
    }

    if (candidateIds.size > 0) {
        const wordMap = await fetchWords(Array.from(candidateIds));
        
        // ** CRITICAL FIX **: Relaxed filtering.
        // The old filter was too strict, removing valid Katakana and non-Jukugo words.
        const validWords = Array.from(wordMap.keys())
            .map(id => ({ id, bandId: currentBandId }))
            .filter(item => {
                const w = wordMap.get(item.id)?.word;
                return isValidWord(w); // Use the corrected, simpler validation.
            });
        
        for (const item of validWords) {
            if (finalQueue.length < count) {
                finalQueue.push(item);
                finalMap.set(item.id, wordMap.get(item.id)!);
                excludedIds.add(item.id);
            } else {
                break;
            }
        }
    }
    
    // If we still haven't found enough words, move to the next band.
    if (finalQueue.length < count) {
        currentBandId++;
    }
  }

  return { queue: shuffle(finalQueue), map: finalMap };
}

// --- NEW: RETRY WRAPPER ---
export async function fetchStagedBatchWithRetry(
  startBandId: number,
  excludedIds: Set<number>,
  count: number = STAGE_PARAMS.BATCH_SIZE,
  onRetryAttempt?: (attempt: number, maxRetries: number) => void
): Promise<{
  queue: { id: number, bandId: number }[],
  map: Map<number, Word>
}> {
  let lastError: Error | null = null;
  const maxRetries = 7;
  let delay = 1000; // Start with 1 second

  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await fetchStagedBatch(startBandId, excludedIds, count);
      return result; // Success
    } catch (error) {
      lastError = error as Error;
      if (onRetryAttempt) {
        onRetryAttempt(i + 1, maxRetries);
      }
      console.warn(`Attempt ${i + 1} to fetch data failed. Retrying in ${delay / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }

  console.error("All retry attempts failed. The server might be down or your connection is unstable.");
  throw lastError; // Throw the last captured error after all retries fail
}


// --- FINAL CALCULATION (SIMPLIFIED) ---

export function calculateTestResult(
  history: { id: number, bandId: number, isKnown: boolean }[],
  wordMap: Map<number, Word>
): TestResult {
  let coverageRank = 0;

  const densityStats: DensityStat[] = BANDS.map(band => {
      const itemsInBand = history.filter(h => h.bandId === band.id);
      const total = itemsInBand.length;
      if (total === 0) {
        return { bandId: band.id, startRank: band.minRank, endRank: band.maxRank, known: 0, total: 0, density: 0 };
      }
      
      const known = itemsInBand.filter(h => h.isKnown).length;
      const density = Math.round((known / total) * 100);
      const bandSize = band.maxRank - band.minRank + 1;
      
      coverageRank += Math.round((density / 100) * bandSize);
      
      return {
        bandId: band.id,
        startRank: band.minRank,
        endRank: band.maxRank,
        known,
        total,
        density,
      };
  });
  
  const benchmark: BenchmarkMetrics = { coverageRank, densityStats };
  
  // JLPT Score Calculation
  const jlptLevels = ['N5', 'N4', 'N3', 'N2', 'N1'];
  const jlptStats: Record<string, { total: number, known: number }> = jlptLevels.reduce((acc, level) => ({...acc, [level]: {total: 0, known: 0}}), {});

  history.forEach(item => {
    const wordData = wordMap.get(item.id);
    if (wordData?.tags) {
        const jlptKey = `N${String(wordData.tags).trim()}`;
        if (jlptStats[jlptKey]) {
            jlptStats[jlptKey].total++;
            if (item.isKnown) {
                jlptStats[jlptKey].known++;
            }
        }
    }
  });

  const jlptScores: JlptScore[] = jlptLevels.map(level => {
      const stats = jlptStats[level];
      return { level, score: stats.total > 0 ? Math.round((stats.known / stats.total) * 100) : 0, total: stats.total, known: stats.known };
  });

  // --- NEW JLPT Score Sanity Check ---
  
  // Rule 1: Must have a minimum vocabulary size to qualify for higher JLPT levels.
  const MIN_COVERAGE_FOR_HIGHER_JLPT = 3500;
  if (benchmark.coverageRank <= MIN_COVERAGE_FOR_HIGHER_JLPT) {
      jlptScores.forEach(score => {
          if (['N3', 'N2', 'N1'].includes(score.level)) {
              score.score = 0;
          }
      });
  }

  // Rule 2: If foundation (N5/N4) is weak, nullify higher level scores to prevent misleading chart spikes.
  const n5 = jlptScores.find(s => s.level === 'N5');
  const n4 = jlptScores.find(s => s.level === 'N4');
  const MIN_SAMPLES_FOR_JLPT_PROFICIENCY = 3;
  const PROFICIENCY_SCORE_THRESHOLD = 60;

  const isN5Proficient = n5 && n5.score >= PROFICIENCY_SCORE_THRESHOLD && n5.total >= MIN_SAMPLES_FOR_JLPT_PROFICIENCY;
  const isN4Proficient = n4 && n4.score >= PROFICIENCY_SCORE_THRESHOLD && n4.total >= MIN_SAMPLES_FOR_JLPT_PROFICIENCY;

  if (!isN5Proficient || !isN4Proficient) {
    jlptScores.forEach(score => {
      if (['N3', 'N2', 'N1'].includes(score.level)) {
        score.score = 0;
      }
    });
  }

  return {
    benchmark,
    jlptScores,
    totalQuestions: history.length,
  };
}