import googleTrends from "google-trends-api";

const REQUEST_TIMEOUT_MS = 10000;
const CACHE_TTL_MS = 5 * 60 * 1000;
const trendsCache = new Map();

function withTimeout(promise, timeoutMs = REQUEST_TIMEOUT_MS) {
  let timeoutId;

  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error("Google Trends request timed out")),
      timeoutMs,
    );
  });

  return Promise.race([promise, timeout]).finally(() => {
    clearTimeout(timeoutId);
  });
}

function getStartTime(timeframe) {
  const match = /^now (\d+)-(d|m|y)$/.exec(timeframe || "");
  if (!match) return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const amount = Number(match[1]);
  const unitInDays = { d: 1, m: 30, y: 365 }[match[2]];
  return new Date(Date.now() - amount * unitInDays * 24 * 60 * 60 * 1000);
}

function getCached(key) {
  const cached = trendsCache.get(key);
  if (!cached || cached.expiresAt <= Date.now()) {
    trendsCache.delete(key);
    return null;
  }

  return cached.value;
}

function setCached(key, value) {
  trendsCache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

/**
 * Get trending topics and interest data
 */
async function getTrendingTopics(keyword, timeframe = "now 1-m") {
  const normalizedKeyword = String(keyword || "").trim();
  if (!normalizedKeyword) return [];

  const cacheKey = `interest:${normalizedKeyword}:${timeframe}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const results = await withTimeout(googleTrends.interestOverTime({
      keyword: normalizedKeyword,
      startTime: getStartTime(timeframe),
      endTime: new Date(),
      granularTimeResolution: true,
    }));

    const timelineData = JSON.parse(results)?.default?.timelineData || [];
    setCached(cacheKey, timelineData);
    return timelineData;
  } catch (error) {
    console.error("Google Trends error:", error.message);
    return [];
  }
}

/**
 * Get related queries for a keyword
 */
async function getRelatedQueries(keyword) {
  const normalizedKeyword = String(keyword || "").trim();
  if (!normalizedKeyword) return [];

  const cacheKey = `related:${normalizedKeyword}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const results = await withTimeout(
      googleTrends.relatedQueries({ keyword: normalizedKeyword }),
    );

    const rankedList = JSON.parse(results)?.default?.rankedList || [];
    setCached(cacheKey, rankedList);
    return rankedList;
  } catch (error) {
    console.error("Related queries error:", error.message);
    return [];
  }
}

/**
 * Analyze trend data for competition level
 * Higher trend = higher competition
 */
function analyzeTrendCompetition(trendData) {
  if (!trendData || trendData.length === 0) return 3; // Low competition

  const avgValue =
    trendData.reduce((sum, d) => sum + parseInt(d.value || 0), 0) /
    trendData.length;

  if (avgValue > 70) return 8; // Very high competition
  if (avgValue > 50) return 7;
  if (avgValue > 30) return 5;
  if (avgValue > 10) return 4;
  return 3; // Low competition
}

export { getTrendingTopics, getRelatedQueries, analyzeTrendCompetition };
