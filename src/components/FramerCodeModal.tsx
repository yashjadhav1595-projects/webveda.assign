import React, { useState } from 'react';
import { X, Copy, Check, Code2 } from 'lucide-react';
import './Modals.css';

interface FramerCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FRAMER_COMPONENT_RAW_CODE = `import React, { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { addPropertyControls, ControlType } from "framer"

interface Course {
  courseName: string
  courseCode: string
  description: string
  mainCategory: string
  shortCourse: string
  courseType: "Original" | "Workshop" | string
  pricePaise: number      // e.g. 199900 paise = ₹1,999 (100 paise = 1 INR)
  priceUsdCents: number   // e.g. 3999 cents = $39.99 (100 cents = 1 USD)
  mangoId: string
  refundable: boolean
}

type CountryCode = "IN" | "US"
type ApiStatus = "loading" | "success" | "error" | "empty"

interface Props {
  sectionTitle?: string
  sectionSubtitle?: string
  defaultCurrency?: "auto" | "IN" | "US"
  accentColor?: string
  showSearch?: boolean
  style?: React.CSSProperties
}

const DEFAULT_API_BASE = "https://syncsphere-hiv6.onrender.com"
const MAX_AUTO_RETRIES = 2

let cachedCourses: Course[] | null = null
let cachedCountry: CountryCode | null = null

export default function SkillpathCourses(props: Props) {
  const {
    sectionTitle = "Featured Courses",
    sectionSubtitle = "Level up your skillset with practical, outcome-driven curriculums.",
    defaultCurrency = "auto",
    accentColor = "#6366f1",
    showSearch = true,
    style,
  } = props

  const [courses, setCourses] = useState<Course[]>(() => cachedCourses || [])
  const [status, setStatus] = useState<ApiStatus>(() => (cachedCourses ? "success" : "loading"))
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [detectedCountry, setDetectedCountry] = useState<CountryCode>(() => cachedCountry || "IN")
  const [countryFetchFailed, setCountryFetchFailed] = useState<boolean>(false)
  const [manualCurrency, setManualCurrency] = useState<"auto" | "IN" | "US">("auto")

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"recommended" | "price-asc" | "price-desc" | "name-asc">("recommended")
  const [showRefundableOnly, setShowRefundableOnly] = useState<boolean>(false)

  // In-flight guards
  const isFetchingCountry = useRef<boolean>(false)
  const isFetchingCourses = useRef<boolean>(false)

  // Resolve active currency
  const activeCountryCode: CountryCode = useMemo(() => {
    if (manualCurrency !== "auto") return manualCurrency
    if (defaultCurrency !== "auto") return defaultCurrency
    if (countryFetchFailed) return "IN"
    return detectedCountry
  }, [manualCurrency, defaultCurrency, countryFetchFailed, detectedCountry])

  // Fetch Country Code with auto-retry & graceful fallback
  const fetchCountryCode = useCallback(async () => {
    if (isFetchingCountry.current) return
    isFetchingCountry.current = true

    for (let attempt = 0; attempt <= MAX_AUTO_RETRIES; attempt++) {
      try {
        const response = await fetch(\`\${DEFAULT_API_BASE}/assignment/country-code\`, {
          method: "GET",
          headers: { Accept: "application/json" },
        })
        if (response.ok) {
          const data = await response.json()
          if (data && (data.country_code === "IN" || data.country_code === "US")) {
            cachedCountry = data.country_code
            setDetectedCountry(data.country_code)
            setCountryFetchFailed(false)
            isFetchingCountry.current = false
            return
          }
        }
      } catch {}
      if (attempt < MAX_AUTO_RETRIES) {
        await new Promise((r) => setTimeout(r, 200 * (attempt + 1)))
      }
    }
    setCountryFetchFailed(true)
    isFetchingCountry.current = false
  }, [])

  // Fetch Courses with auto-retry and 4-State handling
  const fetchCourses = useCallback(async (isManual = false) => {
    if (isFetchingCourses.current && !isManual) return
    isFetchingCourses.current = true

    if (!cachedCourses || isManual) {
      setStatus("loading")
    }
    setErrorMessage(null)
    fetchCountryCode()

    const maxAttempts = isManual ? 2 : MAX_AUTO_RETRIES + 1

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await fetch(\`\${DEFAULT_API_BASE}/assignment/course-data\`, {
          method: "GET",
          headers: { Accept: "application/json" },
        })
        if (response.ok) {
          const data = await response.json()
          if (Array.isArray(data)) {
            cachedCourses = data
            if (data.length === 0) {
              setCourses([])
              setStatus("empty")
            } else {
              setCourses(data)
              setStatus("success")
            }
            isFetchingCourses.current = false
            return
          }
        }
        if (attempt < maxAttempts) {
          await new Promise((r) => setTimeout(r, 300 * attempt))
          continue
        }
        throw new Error(\`Server returned HTTP \${response.status}\`)
      } catch (err: unknown) {
        if (attempt >= maxAttempts) {
          if (cachedCourses && cachedCourses.length > 0) {
            setCourses(cachedCourses)
            setStatus("success")
          } else {
            setErrorMessage(err instanceof Error ? err.message : "API Connection Failed")
            setStatus("error")
          }
        } else {
          await new Promise((r) => setTimeout(r, 300 * attempt))
        }
      }
    }
    isFetchingCourses.current = false
  }, [fetchCountryCode])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  // Format Price helper
  const formatPrice = (course: Course) => {
    if (activeCountryCode === "IN") {
      const rupees = Math.round(course.pricePaise) / 100
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(rupees)
    }
    const dollars = course.priceUsdCents / 100
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(dollars)
  }

  // Categories
  const categories = useMemo(() => {
    const set = new Set<string>()
    courses.forEach((c) => { if (c.mainCategory) set.add(c.mainCategory) })
    return ["all", ...Array.from(set)]
  }, [courses])

  // Filtered & Sorted Courses
  const filteredCourses = useMemo(() => {
    let result = [...courses]
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(c => 
        c.courseName.toLowerCase().includes(q) || 
        c.description.toLowerCase().includes(q) ||
        c.mainCategory.toLowerCase().includes(q)
      )
    }
    if (selectedCategory !== "all") {
      result = result.filter(c => c.mainCategory === selectedCategory)
    }
    if (showRefundableOnly) {
      result = result.filter(c => c.refundable)
    }
    if (sortBy === "price-asc") {
      result.sort((a, b) => (activeCountryCode === "IN" ? a.pricePaise - b.pricePaise : a.priceUsdCents - b.priceUsdCents))
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => (activeCountryCode === "IN" ? b.pricePaise - a.pricePaise : b.priceUsdCents - a.priceUsdCents))
    } else if (sortBy === "name-asc") {
      result.sort((a, b) => a.courseName.localeCompare(b.courseName))
    }
    return result
  }, [courses, searchQuery, selectedCategory, showRefundableOnly, sortBy, activeCountryCode])

  return (
    <div style={{ width: "100%", padding: "40px 20px", color: "#f9fafb", fontFamily: "sans-serif", boxSizing: "border-box", ...style }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, margin: "0 0 8px", color: "#f9fafb" }}>{sectionTitle}</h2>
          {sectionSubtitle && <p style={{ color: "#94a3b8", fontSize: 16, margin: 0 }}>{sectionSubtitle}</p>}
          
          {/* Currency Toggle */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.06)", padding: "4px 8px", borderRadius: 9999, marginTop: 14 }}>
            <span style={{ fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center", marginRight: 4 }}>
              Region: {activeCountryCode === "IN" ? "🇮🇳 INR" : "🇺🇸 USD"}
            </span>
            {(["auto", "IN", "US"] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setManualCurrency(mode)}
                style={{
                  padding: "3px 10px",
                  borderRadius: 9999,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: 600,
                  background: manualCurrency === mode ? accentColor : "transparent",
                  color: manualCurrency === mode ? "#fff" : "#94a3b8"
                }}
              >
                {mode === "auto" ? "Auto" : mode === "IN" ? "₹ INR" : "$ USD"}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Filter Bar */}
        {showSearch && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20, justifyContent: "space-between" }}>
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                flex: "1 1 240px",
                maxWidth: 400,
                padding: "10px 16px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(17,24,39,0.7)",
                color: "#fff",
                fontSize: 14
              }}
            />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(17,24,39,0.7)",
                  color: "#fff",
                  fontSize: 13,
                  cursor: "pointer"
                }}
              >
                <option value="recommended">Recommended</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A-Z</option>
              </select>
              <button
                onClick={() => setShowRefundableOnly(!showRefundableOnly)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "1px solid",
                  borderColor: showRefundableOnly ? "#10b981" : "rgba(255,255,255,0.15)",
                  background: showRefundableOnly ? "rgba(16,185,129,0.15)" : "rgba(17,24,39,0.7)",
                  color: showRefundableOnly ? "#34d399" : "#94a3b8",
                  cursor: "pointer",
                  fontSize: 13
                }}
              >
                Refundable Only
              </button>
              <button
                onClick={() => fetchCourses(true)}
                style={{
                  padding: "10px 16px",
                  borderRadius: 8,
                  border: "none",
                  background: accentColor,
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600
                }}
              >
                Reload
              </button>
            </div>
          </div>
        )}

        {/* Category Pills */}
        {categories.length > 2 && (
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, marginBottom: 20 }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 9999,
                  border: "1px solid",
                  borderColor: selectedCategory === cat ? accentColor : "rgba(255,255,255,0.1)",
                  background: selectedCategory === cat ? accentColor : "rgba(17,24,39,0.6)",
                  color: selectedCategory === cat ? "#fff" : "#94a3b8",
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  whiteSpace: "nowrap"
                }}
              >
                {cat === "all" ? "All Categories" : cat}
              </button>
            ))}
          </div>
        )}

        {/* 1. LOADING: Skeleton Loaders */}
        {status === "loading" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 20 }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} style={{ background: "rgba(17,24,39,0.7)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.1)", padding: 24, minHeight: 220, opacity: 0.6 }}>
                <div style={{ width: 80, height: 20, background: "rgba(255,255,255,0.1)", borderRadius: 4, marginBottom: 16 }} />
                <div style={{ width: "80%", height: 24, background: "rgba(255,255,255,0.1)", borderRadius: 4, marginBottom: 12 }} />
                <div style={{ width: "100%", height: 16, background: "rgba(255,255,255,0.06)", borderRadius: 4, marginBottom: 8 }} />
                <div style={{ width: "60%", height: 16, background: "rgba(255,255,255,0.06)", borderRadius: 4 }} />
              </div>
            ))}
          </div>
        )}

        {/* 2. ERROR: Friendly Error with Retry */}
        {status === "error" && (
          <div style={{ textAlign: "center", background: "rgba(17,24,39,0.8)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 16, padding: 48, maxWidth: 500, margin: "20px auto" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px", color: "#f9fafb" }}>Connection Interrupted</h3>
            <p style={{ color: "#94a3b8", fontSize: 14, margin: "0 0 16px" }}>The test server returned an expected error: {errorMessage}</p>
            <button onClick={() => fetchCourses(true)} style={{ padding: "10px 24px", borderRadius: 8, background: accentColor, color: "#fff", border: "none", cursor: "pointer", fontWeight: 600 }}>
              Retry Connection
            </button>
          </div>
        )}

        {/* 3. ZERO RESULTS */}
        {status === "empty" && (
          <div style={{ textAlign: "center", background: "rgba(17,24,39,0.8)", borderRadius: 16, padding: 48 }}>
            <p style={{ color: "#94a3b8" }}>No courses available at this time.</p>
            <button onClick={() => fetchCourses(true)} style={{ marginTop: 12, padding: "8px 16px", borderRadius: 8, background: accentColor, color: "#fff", border: "none", cursor: "pointer" }}>Reload</button>
          </div>
        )}

        {/* 4. WORKING: Responsive Card Grid */}
        {status === "success" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 24 }}>
            {filteredCourses.map(course => (
              <div
                key={course.mangoId || course.courseCode}
                style={{
                  background: "rgba(17,24,39,0.75)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 16,
                  padding: 24,
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)"
                }}
              >
                {/* Badges */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 8px", background: "rgba(99,102,241,0.15)", color: "#818cf8", borderRadius: 6 }}>
                    {course.mainCategory}
                  </span>
                  <div style={{ display: "flex", gap: 6 }}>
                    {course.courseType && (
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 6px", background: "rgba(255,255,255,0.06)", color: "#cbd5e1", borderRadius: 4 }}>
                        {course.courseType}
                      </span>
                    )}
                    {course.refundable && (
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 6px", background: "rgba(16,185,129,0.15)", color: "#34d399", borderRadius: 4 }}>
                        ✓ Refundable
                      </span>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h3 style={{ fontSize: 19, fontWeight: 700, margin: "0 0 10px", lineHeight: 1.3, color: "#f9fafb" }}>{course.courseName}</h3>

                {/* 2-line Clamped Description */}
                <p style={{
                  fontSize: 14,
                  color: "#94a3b8",
                  lineHeight: 1.5,
                  margin: "0 0 20px",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  minHeight: 42
                }}>
                  {course.description}
                </p>

                {/* Footer */}
                <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>Tuition</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#f9fafb" }}>{formatPrice(course)}</div>
                  </div>
                  <button
                    onClick={() => alert(\`Enrolled in \${course.courseName}\`)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 8,
                      background: accentColor,
                      color: "#fff",
                      border: "none",
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: "pointer"
                    }}
                  >
                    Enroll →
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

// Framer Property Controls
addPropertyControls(SkillpathCourses, {
  sectionTitle: {
    type: ControlType.String,
    title: "Title",
    defaultValue: "Featured Courses",
  },
  sectionSubtitle: {
    type: ControlType.String,
    title: "Subtitle",
    defaultValue: "Level up your skillset with practical, outcome-driven curriculums.",
  },
  defaultCurrency: {
    type: ControlType.Enum,
    title: "Currency",
    options: ["auto", "IN", "US"],
    optionTitles: ["Auto (API / Fallback)", "India (INR ₹)", "United States (USD $)"],
    defaultValue: "auto",
  },
  accentColor: {
    type: ControlType.Color,
    title: "Accent Color",
    defaultValue: "#6366f1",
  },
  showSearch: {
    type: ControlType.Boolean,
    title: "Show Search",
    defaultValue: true,
  },
})
`

export const FramerCodeModal: React.FC<FramerCodeModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(FRAMER_COMPONENT_RAW_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <Code2 size={20} className="modal-icon" />
            <h3>Framer Code Component (`SkillpathCourses.tsx`)</h3>
          </div>
          <div className="modal-actions-header">
            <button className="copy-btn" onClick={handleCopy}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Code'}</span>
            </button>
            <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="modal-body">
          <div className="framer-instructions-box">
            <h4>How to use this component in Framer:</h4>
            <ol>
              <li>In your Framer project, navigate to the <strong>Assets</strong> panel on the left sidebar.</li>
              <li>Click <strong>Code</strong> → <strong>Create Code Component</strong> (name it <code>SkillpathCourses</code>).</li>
              <li>Replace the default code with the snippet below and hit <strong>Save (Cmd/Ctrl + S)</strong>.</li>
              <li>Drag the component from Assets onto your Framer canvas. Customize titles, currency, and colors from the right property panel!</li>
            </ol>
          </div>

          <div className="code-snippet-wrapper">
            <pre className="code-snippet">
              <code>{FRAMER_COMPONENT_RAW_CODE}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
