import { API_KEY, API_URL, BANDS, CEFR_LEVELS, JLPT_LEVELS, AGE_EQUIVALENTS, LITERACY_DESCRIPTIONS } from '../constants';
import { Word, TestResult, LearnerType, RadarStats } from '../types';

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

// Fetch words from Supabase using REST API
export async function fetchWords(idsObj: { id: number, bandId: number }[]): Promise<Map<number, Word>> {
  // Extract just the IDs
  const ids = idsObj.map(o => o.id);
  
  if (ids.length === 0) return new Map();

  // Supabase REST ID limit might be around ~2048 chars in URL, or limited by GET.
  // We batch them.
  const BATCH_SIZE = 50;
  const wordMap = new Map<number, Word>();

  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batch = ids.slice(i, i + BATCH_SIZE);
    const filter = `id=in.(${batch.join(',')})`;
    const url = `${API_URL}/rest/v1/jpdb?select=id,word&${filter}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': API_KEY,
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Gagal mengambil data kosakata');
    }

    const data: Word[] = await response.json();
    data.forEach(w => wordMap.set(w.id, w));
  }

  return wordMap;
}

// NEW: Prepare Session with Jukugo Filtering
// This function handles generation, fetching, and filtering in one go.
export async function prepareTestSession(totalQuestions: number): Promise<{
  queue: { id: number, bandId: number }[],
  map: Map<number, Word>
}> {
  let candidatesToFetch: { id: number, bandId: number }[] = [];
  
  // 1. Generate Candidates (Buffer Strategy)
  BANDS.forEach(band => {
    const targetCount = Math.round(totalQuestions * band.ratio);
    
    // For Band 1-2 (Basic), we take exact amount.
    // For Band 3+ (Intermediate+), we take 4x buffer to filter for Jukugo.
    const multiplier = band.id >= 3 ? 4 : 1; 
    const countToFetch = targetCount * multiplier;
    
    const range = band.maxRank - band.minRank + 1;
    const usedIndices = new Set<number>();
    
    // Safety check in case range is smaller than request
    const actualCount = Math.min(countToFetch, range);
    
    for (let i = 0; i < actualCount; i++) {
      let r;
      do {
        r = Math.floor(Math.random() * range);
      } while (usedIndices.has(r));
      usedIndices.add(r);
      
      candidatesToFetch.push({
        id: band.minRank + r,
        bandId: band.id
      });
    }
  });

  // 2. Fetch All Candidates
  const wordMap = await fetchWords(candidatesToFetch);

  // 3. Filter and Assemble Final Queue
  let finalQueue: { id: number, bandId: number }[] = [];

  // Regex for "Jukugo" (Compound Words): Contains 2 or more consecutive Kanji
  // Unicode Range for CJK Unified Ideographs: \u4e00-\u9faf
  const jukugoRegex = /[\u4e00-\u9faf]{2,}/;

  BANDS.forEach(band => {
    const targetCount = Math.round(totalQuestions * band.ratio);
    
    // Get all fetched words for this band
    const bandCandidates = candidatesToFetch
      .filter(item => item.bandId === band.id)
      .map(item => ({ item, wordStr: wordMap.get(item.id)?.word }));

    let selectedForBand: { id: number, bandId: number }[] = [];

    if (band.id <= 2) {
      // Basic bands: Take first N (already random)
      selectedForBand = bandCandidates.slice(0, targetCount).map(c => c.item);
    } else {
      // Advanced bands: Prioritize Jukugo
      // Split into Jukugo and Others
      const jukugoWords = bandCandidates.filter(c => c.wordStr && jukugoRegex.test(c.wordStr));
      const otherWords = bandCandidates.filter(c => !c.wordStr || !jukugoRegex.test(c.wordStr));
      
      // Shuffle jukugo words to ensure variety within the buffer
      const shuffledJukugo = shuffle(jukugoWords);
      
      // Try to fill quota with Jukugo
      selectedForBand = shuffledJukugo.slice(0, targetCount).map(c => c.item);
      
      // If not enough Jukugo, fill with others
      if (selectedForBand.length < targetCount) {
        const remainingNeeded = targetCount - selectedForBand.length;
        const shuffledOthers = shuffle(otherWords);
        selectedForBand = [
            ...selectedForBand, 
            ...shuffledOthers.slice(0, remainingNeeded).map(c => c.item)
        ];
      }
    }
    
    finalQueue = [...finalQueue, ...selectedForBand];
  });

  return {
    queue: shuffle(finalQueue),
    map: wordMap
  };
}

export function calculateTestResult(
  knownIds: Set<number>, 
  allTestItems: { id: number, bandId: number }[], 
  totalQuestions: number,
  wordMap: Map<number, Word>
): TestResult {
  let totalPredicted = 0;
  
  // 1. Calculate Raw Stats per Band
  let stats = BANDS.map(band => {
    const itemsInBand = allTestItems.filter(item => item.bandId === band.id);
    const totalTested = itemsInBand.length;
    
    if (totalTested === 0) return { bandId: band.id, ratio: 0, total: 0, known: 0 };

    const knownCount = itemsInBand.filter(item => knownIds.has(item.id)).length;
    const ratio = knownCount / totalTested;
    
    return { bandId: band.id, ratio, total: totalTested, known: knownCount };
  });

  // 1.5 DETECT LEARNER TYPE (Use raw stats before cuts)
  const foundationRatio = (stats[0].ratio + stats[1].ratio + stats[2].ratio + stats[3].ratio) / 4; // Band 1-4
  const advancedRatio = (stats[4].ratio + stats[5].ratio + stats[6].ratio) / 3; // Band 5-7
  
  const scoreBand5 = stats[4].ratio; 
  const scoreBand6 = stats[5].ratio; 
  const scoreBand7 = stats[6].ratio; 

  let learnerType: LearnerType = 'BEGINNER';
  const passedBasics = stats[0].ratio > 0.5 && stats[1].ratio > 0.4; 

  if (passedBasics) {
      if (foundationRatio > 0.85 && advancedRatio > 0.50) {
          learnerType = 'BALANCED';
      }
      else if (scoreBand6 > 0.15 || scoreBand7 > 0.05 || (scoreBand5 > 0.30)) {
          learnerType = 'IMMERSION';
      }
      else if (advancedRatio / Math.max(0.1, foundationRatio) > 0.40) {
          learnerType = 'IMMERSION';
      }
      else {
          learnerType = 'ACADEMIC';
      }
  }

  // 2. "The Guillotine" Logic (Hard Cut-off)
  const FAILURE_THRESHOLD = 0.3; 
  let guillotineDropped = false;

  stats = stats.map(stat => {
    if (guillotineDropped) {
        return { ...stat, ratio: 0, known: 0 }; 
    }
    if (stat.bandId >= 3 && stat.ratio < FAILURE_THRESHOLD) {
        guillotineDropped = true;
    }
    return stat;
  });

  // 3. Volatility Damping
  let volatilityDamping = 1.0;
  if (totalQuestions <= 100) {
    volatilityDamping = 0.6; 
  } else if (totalQuestions <= 200) {
    volatilityDamping = 0.85; 
  }

  // 4. Final Calculation & Details
  const details = stats.map((stat) => {
    const bandConfig = BANDS.find(b => b.id === stat.bandId)!;
    const bandSize = bandConfig.maxRank - bandConfig.minRank + 1;
    let finalRatio = stat.ratio;
    if (stat.bandId >= 4) {
      finalRatio = finalRatio * volatilityDamping;
    }
    let predictedInBand = Math.round(finalRatio * bandSize);
    totalPredicted += predictedInBand;

    return {
      bandId: stat.bandId,
      totalInBand: stat.total,
      knownInBand: stat.known,
      predictedInBand
    };
  });

  // 5. Radar Chart Stats Calculation
  // Helper to safely get accuracy of a band range
  const getAcc = (startBand: number, endBand: number) => {
    const targetStats = stats.filter(s => s.bandId >= startBand && s.bandId <= endBand);
    const totalKnown = targetStats.reduce((sum, s) => sum + s.known, 0);
    const totalQuestions = targetStats.reduce((sum, s) => sum + s.total, 0);
    if (totalQuestions === 0) return 0;
    return (totalKnown / totalQuestions) * 100;
  };

  // Complexity Calculation (Jukugo Accuracy)
  const jukugoRegex = /[\u4e00-\u9faf]{2,}/;
  const allTestedWords = allTestItems.map(item => ({ 
    ...item, 
    word: wordMap.get(item.id)?.word || '' 
  })).filter(w => w.word !== '');

  const jukugoItems = allTestedWords.filter(w => jukugoRegex.test(w.word));
  const knownJukugoCount = jukugoItems.filter(w => knownIds.has(w.id)).length;
  const complexityScore = jukugoItems.length > 0 
    ? (knownJukugoCount / jukugoItems.length) * 100 
    : 0;

  const radarStats: RadarStats = {
    survival: getAcc(1, 2),    // Band 1-2
    formal: getAcc(3, 4),      // Band 3-4
    culture: getAcc(5, 6),     // Band 5-6
    literary: getAcc(7, 8),    // Band 7-8
    complexity: complexityScore
  };

  // 6. Select Descriptions
  let literacySet = LITERACY_DESCRIPTIONS.general;
  if (learnerType === 'ACADEMIC') literacySet = LITERACY_DESCRIPTIONS.academic;
  else if (learnerType === 'IMMERSION') literacySet = LITERACY_DESCRIPTIONS.intuitive;
  else if (learnerType === 'BALANCED') literacySet = LITERACY_DESCRIPTIONS.general; 
  else literacySet = LITERACY_DESCRIPTIONS.general;

  const jlpt = JLPT_LEVELS.slice().reverse().find(l => totalPredicted >= l.threshold)?.level || 'Belum N5';
  const cefr = CEFR_LEVELS.slice().reverse().find(l => totalPredicted >= l.threshold)?.level || 'Pre-A1';
  const age = AGE_EQUIVALENTS.slice().reverse().find(l => totalPredicted >= l.threshold)?.age || 'Balita';
  const literacy = literacySet.slice().reverse().find(l => totalPredicted >= l.threshold)?.desc || 'Belum bisa membaca teks Jepang.';

  return {
    totalPredicted,
    jlptLevel: jlpt,
    cefrLevel: cefr,
    ageEquivalent: age,
    literacyDescription: literacy,
    learnerType,
    radarStats,
    details
  };
}