import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Search, 
  RotateCw, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2, 
  SlidersHorizontal, 
  Globe, 
  ArrowUpDown, 
  Shield, 
  X 
} from 'lucide-react';
import type { Course, CountryCode, ApiStatus, SkillpathCoursesProps, SortOption } from '../types/course';
import { formatCoursePrice, getComparablePrice } from '../utils/formatters';
import './SkillpathCourses.css';

const DEFAULT_API_BASE = 'https://syncsphere-hiv6.onrender.com';
const MAX_AUTO_RETRIES = 2;

// In-memory cache for SWR resilience
let cachedCourses: Course[] | null = null;
let cachedCountry: CountryCode | null = null;

export const SkillpathCourses: React.FC<SkillpathCoursesProps> = ({
  sectionTitle = 'Featured Courses',
  sectionSubtitle = 'Level up your skillset with practical, outcome-driven curriculums.',
  defaultCurrency = 'auto',
  accentColor = '#6366f1',
  showSearch = true,
  apiUrl = DEFAULT_API_BASE,
}) => {
  // Course data and status
  const [courses, setCourses] = useState<Course[]>(() => cachedCourses || []);
  const [status, setStatus] = useState<ApiStatus>(() => (cachedCourses ? 'success' : 'loading'));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Resolved country code from API or manual toggle
  const [detectedCountry, setDetectedCountry] = useState<CountryCode>(() => cachedCountry || 'IN');
  const [countryFetchFailed, setCountryFetchFailed] = useState<boolean>(false);
  const [manualCurrency, setManualCurrency] = useState<'auto' | 'IN' | 'US'>('auto');

  // Filter & Search states (Bonus features)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [showRefundableOnly, setShowRefundableOnly] = useState<boolean>(false);

  // In-flight request guards
  const isFetchingCountry = useRef<boolean>(false);
  const isFetchingCourses = useRef<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Active currency resolution
  const activeCountryCode: CountryCode = useMemo(() => {
    // 1. If manual currency is forced by user in UI
    if (manualCurrency !== 'auto') {
      return manualCurrency;
    }
    // 2. If defaultCurrency prop from Framer property control is explicitly set to 'IN' or 'US'
    if (defaultCurrency !== 'auto') {
      return defaultCurrency;
    }
    // 3. If country API failed, use default fallback ('IN' or 'US')
    if (countryFetchFailed) {
      return 'IN'; // Safe default
    }
    // 4. Otherwise use detected country from /assignment/country-code
    return detectedCountry;
  }, [manualCurrency, defaultCurrency, countryFetchFailed, detectedCountry]);

  /**
   * Fetches country code independently.
   * If it fails (404/500), we gracefully fall back without failing course data!
   */
  const fetchCountryCode = useCallback(async (signal?: AbortSignal) => {
    if (isFetchingCountry.current) return;
    isFetchingCountry.current = true;

    for (let attempt = 0; attempt <= MAX_AUTO_RETRIES; attempt++) {
      if (signal?.aborted) break;

      try {
        const response = await fetch(`${apiUrl}/assignment/country-code`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal,
        });

        if (response.ok) {
          const data = await response.json();
          if (data && (data.country_code === 'IN' || data.country_code === 'US')) {
            cachedCountry = data.country_code;
            setDetectedCountry(data.country_code);
            setCountryFetchFailed(false);
            isFetchingCountry.current = false;
            return;
          }
        }
      } catch (e: any) {
        if (e.name === 'AbortError') {
          isFetchingCountry.current = false;
          return;
        }
      }

      // Small pause before retry
      if (attempt < MAX_AUTO_RETRIES && !signal?.aborted) {
        await new Promise((r) => setTimeout(r, 200 * (attempt + 1)));
      }
    }

    // If all attempts fail, activate safe currency fallback
    setCountryFetchFailed(true);
    isFetchingCountry.current = false;
  }, [apiUrl]);

  /**
   * Fetches courses from /assignment/course-data with resilient auto-retry
   */
  const fetchCourses = useCallback(async (isManualRetry = false) => {
    if (isFetchingCourses.current && !isManualRetry) return;
    isFetchingCourses.current = true;

    // Reset abort controller
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // If no cache, show loading
    if (!cachedCourses || isManualRetry) {
      setStatus('loading');
    }
    setErrorMessage(null);

    // Concurrently trigger country fetch
    fetchCountryCode(controller.signal);

    const maxAttempts = isManualRetry ? 2 : MAX_AUTO_RETRIES + 1;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (controller.signal.aborted) break;

      try {
        const response = await fetch(`${apiUrl}/assignment/course-data`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: controller.signal,
        });

        if (response.ok) {
          const data = await response.json();

          if (Array.isArray(data)) {
            cachedCourses = data;
            if (data.length === 0) {
              setCourses([]);
              setStatus('empty');
            } else {
              setCourses(data);
              setStatus('success');
            }
            isFetchingCourses.current = false;
            return;
          }
        }

        // If not ok (e.g. 404 or 500), wait briefly and retry if attempts remain
        if (attempt < maxAttempts && !controller.signal.aborted) {
          await new Promise((r) => setTimeout(r, 300 * attempt));
          continue;
        }

        throw new Error(`Server returned HTTP ${response.status} (Flaky API Simulation)`);
      } catch (err: any) {
        if (err.name === 'AbortError') {
          isFetchingCourses.current = false;
          return;
        }

        if (attempt >= maxAttempts) {
          // If we have cached courses from previous success, keep displaying them
          if (cachedCourses && cachedCourses.length > 0) {
            setCourses(cachedCourses);
            setStatus('success');
          } else {
            const message = err instanceof Error ? err.message : 'Unable to connect to the course server';
            setErrorMessage(message);
            setStatus('error');
          }
        } else if (!controller.signal.aborted) {
          await new Promise((r) => setTimeout(r, 300 * attempt));
        }
      }
    }

    isFetchingCourses.current = false;
  }, [apiUrl, fetchCountryCode]);

  // Initial load with cleanup
  useEffect(() => {
    fetchCourses();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchCourses]);

  // Unique categories for filter pills
  const categories = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => {
      if (c.mainCategory) set.add(c.mainCategory);
    });
    return ['all', ...Array.from(set)];
  }, [courses]);

  // Filtered and sorted courses
  const filteredCourses = useMemo(() => {
    let result = [...courses];

    // Filter by search query (name, category, description)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.courseName.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.mainCategory.toLowerCase().includes(q) ||
          c.shortCourse.toLowerCase().includes(q)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter((c) => c.mainCategory === selectedCategory);
    }

    // Filter by refundable
    if (showRefundableOnly) {
      result = result.filter((c) => c.refundable);
    }

    // Sort
    if (sortBy === 'price-asc') {
      result.sort((a, b) => getComparablePrice(a, activeCountryCode) - getComparablePrice(b, activeCountryCode));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => getComparablePrice(b, activeCountryCode) - getComparablePrice(a, activeCountryCode));
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => a.courseName.localeCompare(b.courseName));
    }

    return result;
  }, [courses, searchQuery, selectedCategory, showRefundableOnly, sortBy, activeCountryCode]);

  return (
    <section id="courses" className="courses-section" style={{ '--accent-color': accentColor } as React.CSSProperties}>
      <div className="container">
        
        {/* Section Header */}
        <div className="courses-header">
          <div className="header-badge">
            <Sparkles size={14} className="header-badge-icon" />
            <span>Interactive Catalog</span>
          </div>
          <h2 className="section-title">{sectionTitle}</h2>
          {sectionSubtitle && <p className="section-subtitle">{sectionSubtitle}</p>}

          {/* Currency Status Indicator & Tester Switcher */}
          <div className="currency-banner">
            <div className="currency-info">
              <Globe size={15} className="currency-globe-icon" />
              <span>
                Region Pricing: <strong>{activeCountryCode === 'IN' ? '🇮🇳 India (INR ₹)' : '🇺🇸 United States (USD $)'}</strong>
                {countryFetchFailed && manualCurrency === 'auto' && (
                  <span className="currency-fallback-tag"> (Fallback Active)</span>
                )}
              </span>
            </div>
            <div className="currency-toggles">
              <button 
                className={`currency-pill ${manualCurrency === 'auto' ? 'active' : ''}`}
                onClick={() => setManualCurrency('auto')}
                title="Use API detection (flips between IN and US)"
              >
                Auto {manualCurrency === 'auto' ? `(${detectedCountry})` : ''}
              </button>
              <button 
                className={`currency-pill ${manualCurrency === 'IN' ? 'active' : ''}`}
                onClick={() => setManualCurrency('IN')}
                title="Force Indian Rupees (pricePaise)"
              >
                ₹ INR
              </button>
              <button 
                className={`currency-pill ${manualCurrency === 'US' ? 'active' : ''}`}
                onClick={() => setManualCurrency('US')}
                title="Force US Dollars (priceUsdCents)"
              >
                $ USD
              </button>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        {showSearch && (
          <div className="courses-toolbar">
            <div className="search-box-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search courses, skills, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search courses"
              />
              {searchQuery && (
                <button className="clear-search-btn" onClick={() => setSearchQuery('')} aria-label="Clear search">
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="toolbar-controls">
              {/* Sort Dropdown */}
              <div className="sort-wrapper">
                <ArrowUpDown size={15} className="sort-icon" />
                <select 
                  className="sort-select" 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  aria-label="Sort courses"
                >
                  <option value="recommended">Sort: Recommended</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                </select>
              </div>

              {/* Refundable Filter Toggle */}
              <button
                className={`filter-badge-btn ${showRefundableOnly ? 'active' : ''}`}
                onClick={() => setShowRefundableOnly(!showRefundableOnly)}
                title="Filter refundable courses only"
              >
                <Shield size={14} />
                <span>100% Refundable</span>
              </button>

              {/* Refresh / Retry Button */}
              <button 
                className="refresh-btn" 
                onClick={() => fetchCourses(true)} 
                title="Refresh course data from API"
                disabled={status === 'loading'}
              >
                <RotateCw size={15} className={status === 'loading' ? 'animate-spin' : ''} />
                <span>Reload</span>
              </button>
            </div>
          </div>
        )}

        {/* Category Filter Pills */}
        {categories.length > 2 && (
          <div className="category-pills-container">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === 'all' ? 'All Categories' : cat}
              </button>
            ))}
          </div>
        )}

        {/* --- SITUATION 1: LOADING (Skeleton Loaders) --- */}
        {status === 'loading' && (
          <div className="courses-grid" aria-busy="true" aria-label="Loading courses">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="course-card skeleton-card">
                <div className="card-top-row">
                  <div className="skeleton-pill skeleton-shimmer" style={{ width: '90px', height: '24px' }} />
                  <div className="skeleton-pill skeleton-shimmer" style={{ width: '60px', height: '24px' }} />
                </div>
                <div className="skeleton-title skeleton-shimmer" style={{ width: '85%', height: '26px', margin: '14px 0 10px' }} />
                <div className="skeleton-line skeleton-shimmer" style={{ width: '100%', height: '16px', marginBottom: '8px' }} />
                <div className="skeleton-line skeleton-shimmer" style={{ width: '70%', height: '16px', marginBottom: '24px' }} />
                
                <div className="card-footer-row skeleton-footer">
                  <div className="skeleton-price skeleton-shimmer" style={{ width: '80px', height: '28px' }} />
                  <div className="skeleton-btn skeleton-shimmer" style={{ width: '100px', height: '36px' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- SITUATION 2: ERROR (Flaky API 404/500 Handled with Retry) --- */}
        {status === 'error' && (
          <div className="status-container error-state">
            <div className="status-icon-wrapper error-icon-bg">
              <AlertCircle size={32} className="error-icon" />
            </div>
            <h3 className="status-title">Connection Interrupted</h3>
            <p className="status-description">
              The live course API simulation returned a flaky response.
            </p>
            <div className="error-badge-detail">
              <code>{errorMessage || 'HTTP 500 / 404 Network Flakiness'}</code>
            </div>
            <div className="status-actions">
              <button className="primary-btn retry-btn" onClick={() => fetchCourses(true)}>
                <RotateCw size={16} />
                <span>Retry Connection</span>
              </button>
            </div>
          </div>
        )}

        {/* --- SITUATION 3: ZERO RESULTS / EMPTY STATE --- */}
        {status === 'empty' && (
          <div className="status-container empty-state">
            <div className="status-icon-wrapper empty-icon-bg">
              <SlidersHorizontal size={32} className="empty-icon" />
            </div>
            <h3 className="status-title">No Courses Available</h3>
            <p className="status-description">
              The server currently returned 0 courses. Try refreshing or check back in a moment.
            </p>
            <div className="status-actions">
              <button className="primary-btn" onClick={() => fetchCourses(true)}>
                <RotateCw size={16} />
                <span>Reload Courses</span>
              </button>
            </div>
          </div>
        )}

        {/* Filter Zero Match State */}
        {status === 'success' && filteredCourses.length === 0 && (
          <div className="status-container empty-state">
            <div className="status-icon-wrapper empty-icon-bg">
              <Search size={32} className="empty-icon" />
            </div>
            <h3 className="status-title">No matching courses found</h3>
            <p className="status-description">
              We couldn't find anything matching "{searchQuery}". Try adjusting your search query or filters.
            </p>
            <div className="status-actions">
              <button 
                className="secondary-btn" 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setShowRefundableOnly(false);
                }}
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}

        {/* --- SITUATION 4: WORKING (Responsive 3/2/1 Column Grid) --- */}
        {status === 'success' && filteredCourses.length > 0 && (
          <div className="courses-grid">
            {filteredCourses.map((course) => {
              const formattedPrice = formatCoursePrice(course, activeCountryCode);

              return (
                <article key={course.mangoId || course.courseCode} className="course-card">
                  
                  {/* Top Badges Row: Category + CourseType + Refundable */}
                  <div className="card-top-row">
                    <span className="category-badge">
                      {course.mainCategory}
                    </span>

                    <div className="card-meta-badges">
                      {course.courseType && (
                        <span className={`type-badge type-${course.courseType.toLowerCase()}`}>
                          {course.courseType}
                        </span>
                      )}
                      
                      {/* Bonus: Refundable Badge */}
                      {course.refundable && (
                        <span className="refundable-badge" title="100% money back guarantee">
                          <CheckCircle2 size={12} />
                          <span>Refundable</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Course Name */}
                  <h3 className="course-title" title={course.courseName}>
                    {course.courseName}
                  </h3>

                  {/* Clean 2-line clamped description */}
                  <p className="course-description" title={course.description}>
                    {course.description}
                  </p>

                  {/* Card Footer: Live Formatted Price & CTA */}
                  <div className="card-footer-row">
                    <div className="price-container">
                      <span className="price-label">Tuition</span>
                      <span className="price-value">{formattedPrice}</span>
                    </div>

                    <button 
                      className="enroll-btn"
                      onClick={() => alert(`Enrolling in "${course.courseName}" for ${formattedPrice}`)}
                      aria-label={`Enroll in ${course.courseName} for ${formattedPrice}`}
                    >
                      <span>Enroll</span>
                      <span className="enroll-arrow">→</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Live Course Count Footer */}
        {status === 'success' && filteredCourses.length > 0 && (
          <div className="courses-count-bar">
            <span>Showing {filteredCourses.length} of {courses.length} courses live</span>
          </div>
        )}

      </div>
    </section>
  );
};
