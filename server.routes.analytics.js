/**
 * Analytics Routes
 * 
 * GET /api/analytics/case-summary - Case statistics by court and case type
 * GET /api/analytics/case-trends - Case count trends (requires data transformation)
 */

import express from 'express';
import db from '../server.db.connection.js';
import queries from '../server.db.queries.js';

const router = express.Router();

/**
 * GET /api/analytics/case-summary
 * Get aggregated case statistics by court and case type
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     byCourt: [{ courtId, courtName, caseCount }, ...],
 *     byCaseType: [{ caseTypeId, areaOfLaw, caseCount }, ...],
 *     summary: {
 *       totalCases: number,
 *       totalCourts: number,
 *       totalCaseTypes: number
 *     }
 *   }
 * }
 */
router.get('/case-summary', async (req, res) => {
  try {
    // Get analytics by court
    const courtSql = queries.getCaseAnalyticsByCourt();
    const courtData = await db.executeQuery(courtSql);

    // Get analytics by case type
    const caseTypeSql = queries.getCaseAnalyticsByCaseType();
    const caseTypeData = await db.executeQuery(caseTypeSql);

    // Calculate summary statistics
    const totalCasesByCount = (data) =>
      data.reduce((sum, row) => sum + (row.caseCount || 0), 0);

    const summary = {
      totalCases: totalCasesByCount(courtData),
      totalCourts: courtData.length,
      totalCaseTypes: caseTypeData.length,
    };

    res.json({
      success: true,
      data: {
        byCourt: courtData,
        byCaseType: caseTypeData,
        summary,
      },
    });
  } catch (error) {
    console.error('Case summary error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve case summary',
      message: error.message,
    });
  }
});

/**
 * GET /api/analytics/case-trends
 * Get case trends data (aggregated by multiple dimensions)
 * 
 * Query Parameters:
 * - dimension: 'court' or 'casetype' (default: 'court')
 * - limit: Top N results to return (default 20, max 100)
 * 
 * Response:
 * {
 *   success: true,
 *   dimension: "court",
 *   data: [{ id, label, value }, ...],
 *   total: number
 * }
 */
router.get('/case-trends', async (req, res) => {
  try {
    const { dimension = 'court', limit = 20 } = req.query;

    // Validate dimension parameter
    if (!['court', 'casetype'].includes(dimension.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid dimension',
        message: 'Dimension must be "court" or "casetype"',
      });
    }

    const parsedLimit = Math.min(parseInt(limit) || 20, 100);

    let data;
    let label;

    if (dimension.toLowerCase() === 'court') {
      const sql = queries.getCaseAnalyticsByCourt();
      data = await db.executeQuery(sql);
      label = 'Court';

      // Transform to trends format, limit to top N
      const transformed = data
        .map((row) => ({
          id: row.courtId,
          label: row.courtName,
          value: row.caseCount,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, parsedLimit);

      return res.json({
        success: true,
        dimension: 'court',
        label,
        data: transformed,
        total: data.length,
      });
    } else {
      const sql = queries.getCaseAnalyticsByCaseType();
      data = await db.executeQuery(sql);
      label = 'Case Type';

      // Transform to trends format, limit to top N
      const transformed = data
        .map((row) => ({
          id: row.caseTypeId,
          label: row.areaOfLaw,
          value: row.caseCount,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, parsedLimit);

      return res.json({
        success: true,
        dimension: 'casetype',
        label,
        data: transformed,
        total: data.length,
      });
    }
  } catch (error) {
    console.error('Case trends error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve case trends',
      message: error.message,
    });
  }
});

export default router;
