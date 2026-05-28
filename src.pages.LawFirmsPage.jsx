/**
 * Law Firms Directory Page
 * Browse law firms and view associated attorneys
 */

import React, { useState } from 'react';
import { useApi } from '../hooks/api';
import api from '../services/api';
import './LawFirmsPage.css';

function LawFirmsPage() {
  const [selectedFirm, setSelectedFirm] = useState(null);
  const [page, setPage] = useState(0);
  const pageSize = 20;

  // Fetch law firms list
  const { data: firmsData, loading: firmsLoading, error: firmsError } = useApi(
    () => api.getLawFirms(pageSize, page * pageSize),
    [page]
  );

  // Fetch selected firm detail
  const {
    data: firmDetail,
    loading: firmDetailLoading,
    error: firmDetailError,
  } = useApi(
    () => (selectedFirm ? api.getLawFirmDetail(selectedFirm) : null),
    [selectedFirm]
  );

  const handleFirmSelect = (firmName) => {
    setSelectedFirm(firmName);
  };

  const handleClearSelection = () => {
    setSelectedFirm(null);
  };

  const totalFirms = firmsData?.pagination?.total || 0;
  const totalPages = Math.ceil(totalFirms / pageSize);
  const hasNextPage = page < totalPages - 1;
  const hasPrevPage = page > 0;

  return (
    <div className="lawfirms-page">
      <div className="lawfirms-container">
        <h1>🏢 Law Firms Directory</h1>

        <div className="lawfirms-content">
          {/* Firms List Panel */}
          <div className="firms-panel">
            <h2>Firms</h2>

            {/* Loading State */}
            {firmsLoading && (
              <div className="loading">
                <div className="spinner"></div>
                <p>Loading firms...</p>
              </div>
            )}

            {/* Error State */}
            {firmsError && (
              <div className="error-message">
                <strong>Error:</strong> {firmsError}
              </div>
            )}

            {/* Firms List */}
            {!firmsLoading && firmsData?.data && (
              <>
                <div className="firms-list">
                  {firmsData.data.map((firm, index) => (
                    <button
                      key={index}
                      className={`firm-item ${
                        selectedFirm === firm.firm ? 'active' : ''
                      }`}
                      onClick={() => handleFirmSelect(firm.firm)}
                    >
                      <div className="firm-name">{firm.firm}</div>
                      <div className="firm-meta">
                        <span className="attorney-count">
                          {firm.attorneyCount} attorneys
                        </span>
                        <span className="case-count">
                          {firm.totalCases} cases
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      disabled={!hasPrevPage}
                      onClick={() => setPage(page - 1)}
                      className="pagination-button"
                    >
                      ← Previous
                    </button>

                    <span className="pagination-info">
                      Page {page + 1} of {totalPages}
                    </span>

                    <button
                      disabled={!hasNextPage}
                      onClick={() => setPage(page + 1)}
                      className="pagination-button"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Empty State */}
            {!firmsLoading && !firmsError && (!firmsData?.data || firmsData.data.length === 0) && (
              <div className="empty-state">
                <p>No firms found</p>
              </div>
            )}
          </div>

          {/* Firm Detail Panel */}
          <div className="detail-panel">
            {!selectedFirm ? (
              <div className="empty-state">
                <p>Select a law firm to view details</p>
              </div>
            ) : (
              <>
                <button
                  className="close-button"
                  onClick={handleClearSelection}
                  title="Close detail panel"
                >
                  ✕
                </button>

                {/* Loading State */}
                {firmDetailLoading && (
                  <div className="loading">
                    <div className="spinner"></div>
                    <p>Loading firm details...</p>
                  </div>
                )}

                {/* Error State */}
                {firmDetailError && (
                  <div className="error-message">
                    <strong>Error:</strong> {firmDetailError}
                  </div>
                )}

                {/* Firm Detail */}
                {!firmDetailLoading && firmDetail && (
                  <>
                    <div className="firm-detail-header">
                      <h2>{firmDetail.firm}</h2>
                      <div className="firm-summary">
                        <span className="stat">
                          <strong>{firmDetail.count}</strong> Attorneys
                        </span>
                        {firmDetail.data && firmDetail.data.length > 0 && (
                          <span className="stat">
                            <strong>
                              {firmDetail.data.reduce(
                                (sum, att) => sum + att.totalcases,
                                0
                              )}
                            </strong>{' '}
                            Total Cases
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Attorneys List */}
                    {firmDetail.data && firmDetail.data.length > 0 ? (
                      <div className="attorneys-list">
                        {firmDetail.data.map((attorney) => (
                          <div
                            key={attorney.id}
                            className="attorney-card"
                          >
                            <div className="attorney-header">
                              <h4>{attorney.name}</h4>
                              <span className="badge">{attorney.status}</span>
                            </div>
                            <div className="attorney-details">
                              <p>
                                <strong>Cases:</strong> {attorney.totalcases}
                              </p>
                              <p>
                                <strong>ID:</strong> {attorney.id}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state">
                        <p>No attorneys found in this firm</p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LawFirmsPage;
