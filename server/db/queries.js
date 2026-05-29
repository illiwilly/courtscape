/**
 * Database Query Utilities
 * 
 * Provides SQL query builders for:
 * - Judge search
 * - Attorney search
 * - Law firm aggregation (from attorney data)
 * - Analytics queries
 */

// Table mappings from Unity Catalog
const TABLES = {
  judges: 'unicourt_judge.unicourt_3615c15a_aff8_4219_b2cc_1f645ab1a50a_samples.judge_940c070684b945d9b260e358b4a394df',
  attorneys: 'unicourt_attorney.unicourt_31e3c59b_ecde_4bd7_8903_45c248111eee_samples.attorney_revised_fae7b5d3ada34800a5df90493ffb73ad',
  analyticsByCourt: 'unicourt_analytics.unicourt_66713254_5e52_4a39_a700_a3179e821001_samples.casecountanalyticbycourt_0b0cd0feea674978ad6a5103d3ac3102',
  analyticsByCaseType: 'unicourt_analytics.unicourt_66713254_5e52_4a39_a700_a3179e821001_samples.casecountanalyticsbycasetype_2953ecc978a6472795583c285df69922',
};

/**
 * Search judges by name, status, or other criteria
 * @param {string} searchTerm - Judge name to search
 * @param {number} limit - Result limit (default 50)
 * @param {number} offset - Result offset for pagination (default 0)
 * @returns {string} SQL query
 */
export function searchJudges(searchTerm = '', limit = 50, offset = 0) {
  const whereClause = searchTerm
    ? `WHERE LOWER(name) LIKE LOWER('%${escapeSql(searchTerm)}%')`
    : '';

  return `
    SELECT 
      normjudgeid as id,
      name,
      totalcases,
      judicialstatus,
      politicalaffiliation
    FROM ${TABLES.judges}
    ${whereClause}
    ORDER BY totalcases DESC
    LIMIT ${limit} OFFSET ${offset}
  `.trim();
}

/**
 * Get total judge count (for pagination)
 * @param {string} searchTerm - Judge name to filter
 * @returns {string} SQL query
 */
export function countJudges(searchTerm = '') {
  const whereClause = searchTerm
    ? `WHERE LOWER(name) LIKE LOWER('%${escapeSql(searchTerm)}%')`
    : '';

  return `
    SELECT COUNT(*) as total
    FROM ${TABLES.judges}
    ${whereClause}
  `.trim();
}

/**
 * Search attorneys by name, status, law firm, or other criteria
 * @param {string} searchTerm - Attorney name to search
 * @param {string} firm - Filter by law firm
 * @param {number} limit - Result limit (default 50)
 * @param {number} offset - Result offset for pagination (default 0)
 * @returns {string} SQL query
 */
export function searchAttorneys(searchTerm = '', firm = '', limit = 50, offset = 0) {
  let whereClause = '';
  const conditions = [];

  if (searchTerm) {
    conditions.push(`LOWER(name) LIKE LOWER('%${escapeSql(searchTerm)}%')`);
  }

  if (firm) {
    conditions.push(`LOWER(barlawfirm) LIKE LOWER('%${escapeSql(firm)}%')`);
  }

  if (conditions.length > 0) {
    whereClause = `WHERE ${conditions.join(' AND ')}`;
  }

  return `
    SELECT 
      normattorneyid as id,
      name,
      totalcases,
      status,
      barlawfirm as firm
    FROM ${TABLES.attorneys}
    ${whereClause}
    ORDER BY totalcases DESC
    LIMIT ${limit} OFFSET ${offset}
  `.trim();
}

/**
 * Get total attorney count (for pagination)
 * @param {string} searchTerm - Attorney name to filter
 * @param {string} firm - Filter by law firm
 * @returns {string} SQL query
 */
export function countAttorneys(searchTerm = '', firm = '') {
  const conditions = [];

  if (searchTerm) {
    conditions.push(`LOWER(name) LIKE LOWER('%${escapeSql(searchTerm)}%')`);
  }

  if (firm) {
    conditions.push(`LOWER(barlawfirm) LIKE LOWER('%${escapeSql(firm)}%')`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  return `
    SELECT COUNT(*) as total
    FROM ${TABLES.attorneys}
    ${whereClause}
  `.trim();
}

/**
 * Get aggregated law firms from attorney data
 * @param {number} limit - Result limit (default 50)
 * @param {number} offset - Result offset for pagination (default 0)
 * @returns {string} SQL query
 */
export function getLawFirms(limit = 50, offset = 0) {
  return `
    SELECT 
      barlawfirm as firm,
      COUNT(DISTINCT normattorneyid) as attorneyCount,
      SUM(totalcases) as totalCases
    FROM ${TABLES.attorneys}
    WHERE barlawfirm IS NOT NULL AND barlawfirm != ''
    GROUP BY barlawfirm
    ORDER BY attorneyCount DESC
    LIMIT ${limit} OFFSET ${offset}
  `.trim();
}

/**
 * Get attorneys in a specific law firm
 * @param {string} firm - Law firm name
 * @returns {string} SQL query
 */
export function getAttorneysByFirm(firm) {
  return `
    SELECT 
      normattorneyid as id,
      name,
      totalcases,
      status,
      barlawfirm as firm
    FROM ${TABLES.attorneys}
    WHERE LOWER(barlawfirm) = LOWER('${escapeSql(firm)}')
    ORDER BY totalcases DESC
  `.trim();
}

/**
 * Get case count analytics by court
 * @returns {string} SQL query
 */
export function getCaseAnalyticsByCourt() {
  return `
    SELECT 
      courtcourtid as courtId,
      courtname as courtName,
      casecount as caseCount
    FROM ${TABLES.analyticsByCourt}
    ORDER BY casecount DESC
  `.trim();
}

/**
 * Get case count analytics by case type/area of law
 * @returns {string} SQL query
 */
export function getCaseAnalyticsByCaseType() {
  return `
    SELECT 
      casetypecaseclassid as caseTypeId,
      casetypeareaoflaw as areaOfLaw,
      casecount as caseCount
    FROM ${TABLES.analyticsByCaseType}
    ORDER BY casecount DESC
  `.trim();
}

/**
 * Escape SQL string values to prevent injection
 * @private
 */
function escapeSql(str) {
  if (!str) return '';
  return str.replace(/'/g, "''");
}

export const queryUtils = {
  searchJudges,
  countJudges,
  searchAttorneys,
  countAttorneys,
  getLawFirms,
  getAttorneysByFirm,
  getCaseAnalyticsByCourt,
  getCaseAnalyticsByCaseType,
};

export default queryUtils;
