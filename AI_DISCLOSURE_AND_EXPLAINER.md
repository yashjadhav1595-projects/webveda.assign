# AI Disclosure & Complete Code Explainer

This document fulfills the AI disclosure requirement and provides an exhaustive line-by-line breakdown of the codebase to prepare for the 20-minute live interview.

---

## 1. AI Usage Disclosure

> **Statement**:  
> *"I used an AI coding assistant to scaffold the boilerplate for the React/TypeScript structure and draft the initial fetch calls. I took active ownership of architecting the decoupled error-handling strategy (preventing country endpoint failures from blocking course rendering), calculating exact currency conversions (`pricePaise / 100` and `priceUsdCents / 100`), configuring the Framer `addPropertyControls` schema, implementing CSS two-line truncation, and writing the interactive API test sandbox."*

---

## 2. Deep Dive: Line-by-Line Code Explanation

### A. Currency Conversion & Formatting Math
```typescript
// IN: 100 paise = ₹1. 199900 paise -> ₹1,999
const rupees = Math.round(course.pricePaise) / 100;
return new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(rupees);

// US: 100 cents = $1. 3999 cents -> $39.99
const dollars = course.priceUsdCents / 100;
return new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
}).format(dollars);
```
- **Why this math?** The API returns paise (hundredths of a rupee) and cents (hundredths of a dollar). Displaying `199900` directly as `₹1,99,900` is a 100x calculation error. Dividing by 100 gives `₹1,999` and `$39.99`.
- **`Intl.NumberFormat`**: Uses standard browser localization with proper grouping (`en-IN` uses Indian numbering comma system `₹1,999`, while `en-US` uses standard US currency formatting `$39.99`).

---

### B. Flaky API Resilience & The 4-State Lifecycle
The API intentionally returns `404` or `500` roughly 1 in 3 requests on both endpoints:
```typescript
const [status, setStatus] = useState<'loading' | 'error' | 'empty' | 'success'>('loading');
```
1. **Loading State (`status === 'loading'`)**: Displays 6 animated skeleton cards with gradient shimmer animation (`skeleton-shimmer`). This provides visual continuity rather than a generic spinner.
2. **Error State (`status === 'error'`)**: If `/assignment/course-data` returns 404 or 500, a clean, user-friendly error container is shown with diagnostic HTTP information and an interactive **"Retry Connection"** button.
3. **Empty State (`status === 'empty'`)**: If the API returns `[]` (0 courses), a dedicated empty-state placeholder renders with a reload button.
4. **Working State (`status === 'success'`)**: Renders the complete, responsive course grid.

---

### C. Decoupled Country Code Resolution (Graceful Fallback)
```typescript
const activeCountryCode: CountryCode = useMemo(() => {
  if (manualCurrency !== "auto") return manualCurrency;
  if (defaultCurrency !== "auto") return defaultCurrency;
  if (countryFetchFailed) return "IN"; // Safe default
  return detectedCountry;
}, [manualCurrency, defaultCurrency, countryFetchFailed, detectedCountry]);
```
- **The Problem**: If you use `Promise.all([fetchCourses, fetchCountry])`, a 500 error on `/assignment/country-code` causes the entire page to fail, even though courses were fetched successfully.
- **The Solution**: We fire `fetchCountryCode()` independently. If it fails, `countryFetchFailed` is set to `true`, and the component silently falls back to the configured default currency (e.g. `INR` or `USD`) without degrading the user experience.

---

### D. Clean Two-Line Text Clamping
```css
display: -webkit-box;
-webkit-line-clamp: 2;
-webkit-box-orient: vertical;
overflow: hidden;
text-overflow: ellipsis;
min-height: 42px; /* Uniform height across varying description lengths */
```
- Ensures that long course descriptions are truncated cleanly with an ellipsis (`...`) after exactly 2 lines across all modern browsers.

---

### E. Framer Property Controls (`addPropertyControls`)
```typescript
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
});
```
- Allows non-technical designers in Framer to customize the section title, subtitle, fallback currency override, brand accent color, and search bar visibility directly from the Framer sidebar.

---

### F. Responsive 3 / 2 / 1 Column Layout
- **Desktop (>= 1024px)**: 3 columns (`grid-template-columns: repeat(3, 1fr)`)
- **Tablet (640px - 1023px)**: 2 columns (`grid-template-columns: repeat(2, 1fr)`)
- **Mobile (< 640px)**: 1 column (`grid-template-columns: 1fr`)
- Responsive inline Framer fallback: `gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))"`.

---

## 3. Preparation for the 20-Minute Live Coding Call

During the live call, the interviewer will ask you to make a small change. Here is how to handle common requests:

### Challenge 1: *"Add another field to the card (e.g. Mango ID or Short Course)"*
**Answer / Action**:
Locate the card JSX in `SkillpathCourses.tsx` and insert the new field:
```tsx
{/* Example: Displaying courseCode or shortCourse badge */}
<span style={{ fontSize: 11, color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 4 }}>
  ID: {course.shortCourse}
</span>
```

### Challenge 2: *"Add a new Property Control (e.g. Max Cards to Display)"*
**Answer / Action**:
1. Add `maxCards?: number` to `Props` interface.
2. Destructure `maxCards = 10` in component function.
3. Slice `filteredCourses.slice(0, maxCards)`.
4. In `addPropertyControls`, append:
```typescript
maxCards: {
  type: ControlType.Number,
  title: "Max Cards",
  min: 1,
  max: 20,
  defaultValue: 10,
  displayStepper: true,
}
```

### Challenge 3: *"Why did you choose `mainCategory` and `refundable` as extra fields?"*
**Answer**:
A real learner evaluating courses needs to know:
1. **Topic Domain** (`mainCategory`): Helps them quickly identify if the course matches their career focus (e.g., Content Creation, Social Media, Productivity).
2. **Delivery Format** (`courseType`): Distinguishes comprehensive full-length "Originals" from fast "Workshops".
3. **Risk Reversal** (`refundable`): A 100% money-back guarantee badge gives immediate purchase confidence.
