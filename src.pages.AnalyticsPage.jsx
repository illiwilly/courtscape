/**
 * Analytics Dashboard Page
 * Display case statistics and trends with charts
 */

import React, { useState } from 'react';
import { useApi } from '../hooks/api';
import api from '../services/api';
import './AnalyticsPage.css';

// Simple chart component (no external library required)
function SimpleBarChart({ data, title, maxHeight = 300 }) {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.value || 0));
  const scale = maxHeight / maxValue;

  return (
    <div className="chart">
      <h3>{title}</h3>
      <div className="chart-bars">
        {data.map((item, index) => (
          <div key={index} className="chart-bar-container">
            <div
              className="chart-bar"
              style={{ height: `${Math.max(item.value * scale, 20)}px` }}
              title={`${item.label}: ${item.value}`}
            />
            <div className="chart-label">{item.label}</div>
            <div className="chart-value">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsPage() {
  const [courtLimit, setCourtLimit] = useState(10);
  const [typeLimit, setTypeLimit] = useState(10);

  // Fetch all analytics data
  const { data: analyticsData, loading, error } = useApi(
    () => api.getAllAnalytics(),
    []
  );

  // Get summary data
  const summary = analyticsData?.summary || {};

  // Filter court trends by limit
  const courtTrends = analyticsData?.courtTrends
    ? analyticsData.courtTrends.slice(0, courtLimit)
    : [];

  // Filter type trends by limit
  const typeTrends = analyticsData?.typeTrends
    ? analyticsData.typeTrends.slice(0, typeLimit)
    : [];

  // Calculate total cases across all trends
  const totalCases =
    summary.totalCases || 0;

  return (
    <div className="analytics-page">
      <div className="analytics-container">
        <h1>📊 Case Analytics</h1>

        {/* Loading State */}
        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading analytics...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Analytics Content */}
        {!loading && !error && analyticsData && (
          <>
            {/* Summary Stats */}
            <div className="summary-cards">
              <div className="stat-card">
                <div className="stat-value">{totalCases.toLocaleString()}</div>
                <div className="stat-label">Total Cases</div>
              </div>

              <div className="stat-card">
                <div className="stat-value">
                  {summary.totalCourts || 0}
                </div>
                <div className="stat-label">Courts</div>
              </div>

              <div className="stat-card">
                <div className="stat-value">
                  {summary.totalCaseTypes || 0}
                </div>
                <div className="stat-label">Case Types</div>
              </div>

              {courtTrends.length > 0 && (
                <div className="stat-card">
                  <div className="stat-value">
                    {courtTrends[0].value.toLocaleString()}
                  </div>
                  <div className="stat-label">Top Court Cases</div>
                </div>
              )}
            </div>

            {/* Charts */}
            <div className="charts-grid">
              {/* Court Cases Chart */}
              <div className="chart-container">
                <div className="chart-header">
                  <h2>Cases by Court (Top {courtLimit})</h2>
                  <select
                    value={courtLimit}
                    onChange={(e) => setCourtLimit(Number(e.target.value))}
                    className="limit-select"
                  >
                    <option value={5}>Top 5</option>
                    <option value={10}>Top 10</option>
                    <option value={15}>Top 15</option>
                    <option value={20}>Top 20</option>
                  </select>
                </div>
                <SimpleBarChart
                  data={courtTrends}
                  title="Cases by Court"
                  maxHeight={300}
                />
              </div>

              {/* Case Type Chart */}
              <div className="chart-container">
                <div className="chart-header">
                  <h2>Cases by Type (Top {typeLimit})</h2>
                  <select
                    value={typeLimit}
                    onChange={(e) => setTypeLimit(Number(e.target.value))}
                    className="limit-select"
                  >
                    <option value={5}>Top 5</option>
                    <option value={10}>Top 10</option>
                    <option value={15}>Top 15</option>
                    <option value={20}>Top 20</option>
                  </select>
                </div>
                <SimpleBarChart
                  data={typeTrends}
                  title="Cases by Type"
                  maxHeight={300}
                />
              </div>
            </div>

            {/* Data Tables */}
            <div className="data-tables">
              {/* Court Table */}
              <div className="table-container">
                <h2>Cases by Court (All Data)</h2>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Court Name</th>
                        <th className="numeric">Case Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.courtTrends &&
                        analyticsData.courtTrends.map((item, index) => (
                          <tr key={index}>
                            <td>{item.label}</td>
                            <td className="numeric">
                              {item.value.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Case Type Table */}
              <div className="table-container">
                <h2>Cases by Type (All Data)</h2>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Case Type</th>
                        <th className="numeric">Case Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.typeTrends &&
                        analyticsData.typeTrends.map((item, index) => (
                          <tr key={index}>
                            <td>{item.label}</td>
                            <td className="numeric">
                              {item.value.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {!loading && !error && !analyticsData && (
          <div className="empty-state">
            <p>No analytics data available</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalyticsPage;
