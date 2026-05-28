/**
 * Search Page Component
 * Judge and Attorney search with filters, results, and pagination
 */

import React, { useState } from 'react';
import { useSearch, useDebounce } from '../hooks/api';
import api from '../services/api';
import './SearchPage.css';

function SearchPage() {
  const [activeTab, setActiveTab] = useState('judges'); // 'judges' or 'attorneys'
  const [searchInput, setSearchInput] = useState('');
  const [firmFilter, setFirmFilter] = useState('');

  // Debounce search input to avoid excessive API calls
  const debouncedSearch = useDebounce(searchInput, 300);
  const debouncedFirm = useDebounce(firmFilter, 300);

  // Judge search hook
  const judgeSearch = useSearch(api.searchJudges, 20);

  // Attorney search hook
  const attorneySearch = useSearch(
    (query, limit, offset) =>
      api.searchAttorneys(query, debouncedFirm, limit, offset),
    20
  );

  // Determine active search based on tab
  const activeSearch = activeTab === 'judges' ? judgeSearch : attorneySearch;

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    activeSearch.search(value, 0);
  };

  // Handle firm filter change (attorneys only)
  const handleFirmFilterChange = (e) => {
    const value = e.target.value;
    setFirmFilter(value);
    if (activeTab === 'attorneys') {
      attorneySearch.search(searchInput, 0);
    }
  };

  // Handle tab switch
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setSearchInput('');
    setFirmFilter('');
  };

  return (
    <div className="search-page">
      <div className="search-container">
        <h1>⚖️ Legal Search</h1>

        {/* Tab Navigation */}
        <div className="search-tabs">
          <button
            className={`tab-button ${activeTab === 'judges' ? 'active' : ''}`}
            onClick={() => handleTabSwitch('judges')}
          >
            👨‍⚖️ Judges
          </button>
          <button
            className={`tab-button ${activeTab === 'attorneys' ? 'active' : ''}`}
            onClick={() => handleTabSwitch('attorneys')}
          >
            👤 Attorneys
          </button>
        </div>

        {/* Search Filters */}
        <div className="search-filters">
          <input
            type="text"
            placeholder={
              activeTab === 'judges'
                ? 'Search judge name...'
                : 'Search attorney name...'
            }
            value={searchInput}
            onChange={handleSearchChange}
            className="search-input"
          />

          {activeTab === 'attorneys' && (
            <input
              type="text"
              placeholder="Filter by law firm (optional)"
              value={firmFilter}
              onChange={handleFirmFilterChange}
              className="search-input"
            />
          )}
        </div>

        {/* Results Info */}
        {activeSearch.totalResults > 0 && (
          <div className="results-info">
            Found <strong>{activeSearch.totalResults}</strong> result
            {activeSearch.totalResults !== 1 ? 's' : ''}
            {searchInput && ` for "${searchInput}"`}
          </div>
        )}

        {/* Loading State */}
        {activeSearch.loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Searching...</p>
          </div>
        )}

        {/* Error State */}
        {activeSearch.error && (
          <div className="error-message">
            <strong>Error:</strong> {activeSearch.error}
          </div>
        )}

        {/* Results */}
        {!activeSearch.loading && activeSearch.results.length > 0 && (
          <div className="results">
            {activeTab === 'judges' ? (
              // Judge Results
              <div className="results-list">
                {activeSearch.results.map((judge) => (
                  <div key={judge.id} className="result-card judge-card">
                    <div className="result-header">
                      <h3>{judge.name}</h3>
                      <span className="badge">{judge.judicialstatus}</span>
                    </div>
                    <div className="result-details">
                      <p>
                        <strong>Total Cases:</strong> {judge.totalcases}
                      </p>
                      <p>
                        <strong>Political Affiliation:</strong>{' '}
                        {judge.politicalaffiliation || 'Unknown'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Attorney Results
              <div className="results-list">
                {activeSearch.results.map((attorney) => (
                  <div key={attorney.id} className="result-card attorney-card">
                    <div className="result-header">
                      <h3>{attorney.name}</h3>
                      <span className="badge">{attorney.status}</span>
                    </div>
                    <div className="result-details">
                      <p>
                        <strong>Firm:</strong> {attorney.firm || 'Unknown'}
                      </p>
                      <p>
                        <strong>Total Cases:</strong> {attorney.totalcases}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* No Results */}
        {!activeSearch.loading && activeSearch.results.length === 0 && searchInput && (
          <div className="empty-state">
            <p>No results found</p>
            <p className="hint">Try a different search term</p>
          </div>
        )}

        {/* Empty State */}
        {!activeSearch.loading && activeSearch.results.length === 0 && !searchInput && (
          <div className="empty-state">
            <p>Enter a name to search</p>
            <p className="hint">
              {activeTab === 'judges'
                ? 'Search for judges by name'
                : 'Search for attorneys by name'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {activeSearch.totalResults > activeSearch.pageSize && (
          <div className="pagination">
            <button
              disabled={!activeSearch.hasPrevPage || activeSearch.loading}
              onClick={activeSearch.prevPage}
              className="pagination-button"
            >
              ← Previous
            </button>

            <span className="pagination-info">
              Page {activeSearch.currentPage + 1} of{' '}
              {Math.ceil(activeSearch.totalResults / activeSearch.pageSize)}
            </span>

            <button
              disabled={!activeSearch.hasNextPage || activeSearch.loading}
              onClick={activeSearch.nextPage}
              className="pagination-button"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
