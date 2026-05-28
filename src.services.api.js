/**
 * API Service Layer
 * Reusable functions for all API endpoints
 * Handles data fetching, error handling, and response parsing
 */

const BASE_URL = '/api';

/**
 * Generic fetch wrapper with error handling
 */
async function apiCall(endpoint, params = {}) {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = `${BASE_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'API error');
    }

    return data;
  } catch (error) {
    console.error(`API call failed: ${endpoint}`, error);
    throw error;
  }
}

// ============================================================
// JUDGE SEARCH API
// ============================================================

export async function searchJudges(searchTerm = '', limit = 50, offset = 0) {
  return apiCall('/search/judges', {
    q: searchTerm,
    limit,
    offset,
  });
}

export async function getJudgeCount(searchTerm = '') {
  // Note: Count is included in search results via pagination.total
  const result = await searchJudges(searchTerm, 1, 0);
  return result.pagination?.total || 0;
}

// ============================================================
// ATTORNEY SEARCH API
// ============================================================

export async function searchAttorneys(
  searchTerm = '',
  firmFilter = '',
  limit = 50,
  offset = 0
) {
  return apiCall('/search/attorneys', {
    q: searchTerm,
    firm: firmFilter,
    limit,
    offset,
  });
}

export async function getAttorneyCount(searchTerm = '', firmFilter = '') {
  // Note: Count is included in search results via pagination.total
  const result = await searchAttorneys(searchTerm, firmFilter, 1, 0);
  return result.pagination?.total || 0;
}

// ============================================================
// LAW FIRMS API
// ============================================================

export async function getLawFirms(limit = 50, offset = 0) {
  return apiCall('/law-firms', {
    limit,
    offset,
  });
}

export async function getLawFirmDetail(firmName) {
  if (!firmName) {
    throw new Error('Firm name is required');
  }
  return apiCall(`/law-firms/${encodeURIComponent(firmName)}`);
}

// ============================================================
// ANALYTICS API
// ============================================================

export async function getCaseSummary() {
  return apiCall('/analytics/case-summary');
}

export async function getCaseTrends(dimension = 'court', limit = 20) {
  // Validate dimension
  if (!['court', 'casetype'].includes(dimension.toLowerCase())) {
    throw new Error('Dimension must be "court" or "casetype"');
  }

  return apiCall('/analytics/case-trends', {
    dimension,
    limit,
  });
}

// ============================================================
// SYSTEM API
// ============================================================

export async function getHealth() {
  return apiCall('/health');
}

// ============================================================
// Batch Operations (Helper Functions)
// ============================================================

/**
 * Search all data types (judges, attorneys, firms)
 */
export async function globalSearch(query, limit = 10) {
  try {
    const [judges, attorneys, firms] = await Promise.all([
      searchJudges(query, limit, 0),
      searchAttorneys(query, '', limit, 0),
      // Note: No search endpoint for firms, return empty
    ]);

    return {
      judges: judges.data,
      attorneys: attorneys.data,
      query,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Global search failed:', error);
    throw error;
  }
}

/**
 * Get all analytics data
 */
export async function getAllAnalytics() {
  try {
    const [summary, courtTrends, typeTrends] = await Promise.all([
      getCaseSummary(),
      getCaseTrends('court', 20),
      getCaseTrends('casetype', 20),
    ]);

    return {
      summary: summary.data,
      courtTrends: courtTrends.data,
      typeTrends: typeTrends.data,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Get all analytics failed:', error);
    throw error;
  }
}

export default {
  // Judge
  searchJudges,
  getJudgeCount,
  // Attorney
  searchAttorneys,
  getAttorneyCount,
  // Law Firms
  getLawFirms,
  getLawFirmDetail,
  // Analytics
  getCaseSummary,
  getCaseTrends,
  // System
  getHealth,
  // Batch
  globalSearch,
  getAllAnalytics,
};
