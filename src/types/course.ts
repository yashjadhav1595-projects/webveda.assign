export interface Course {
  courseName: string;
  courseCode: string;
  description: string;
  mainCategory: string;
  shortCourse: string;
  courseType: 'Original' | 'Workshop' | string;
  pricePaise: number;      // e.g. 199900 paise = ₹1,999
  priceUsdCents: number;   // e.g. 3999 cents = $39.99
  mangoId: string;
  refundable: boolean;
}

export type CountryCode = 'IN' | 'US';

export interface CountryResponse {
  country_code: CountryCode;
  detail?: string;
}

export type ApiStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

export type CurrencyMode = 'auto' | 'IN' | 'US';

export type SortOption = 'recommended' | 'price-asc' | 'price-desc' | 'name-asc';

export interface SkillpathCoursesProps {
  /** Section headline displayed above the grid */
  sectionTitle?: string;
  /** Section subtitle/description */
  sectionSubtitle?: string;
  /** Fallback or manual currency preference: 'auto' uses API / fallback, 'IN' forces Rupees, 'US' forces Dollars */
  defaultCurrency?: CurrencyMode;
  /** Primary accent color for buttons, badges, and focus rings */
  accentColor?: string;
  /** Toggle visibility of search & filter toolbar */
  showSearch?: boolean;
  /** Custom base API URL (useful for testing or proxying) */
  apiUrl?: string;
}
