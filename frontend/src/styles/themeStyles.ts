import { cn } from "@/lib/utils";

/**
 * Global ArogyaLink Theme & Reusable Tailwind Style Dictionary.
 * 
 * Provides unified, consistent class names for layouts, typography,
 * cards, forms, avatars, metrics, alerts, modals, and auth screens.
 * 
 * Usage:
 *   import { themeStyles, cn } from "@/styles/themeStyles";
 * 
 *   // Direct class string
 *   <div className={themeStyles.layout.pageContainer}>...</div>
 * 
 *   // Combined with custom Tailwind classes
 *   <div className={themeStyles.combine(themeStyles.card.base, "hover:border-teal-400 p-8")}>...</div>
 *   // Or using standard cn():
 *   <div className={cn(themeStyles.card.base, "p-8")}>...</div>
 */

export const layoutStyles = {
  /** Main wrapper for inner dashboard & portal views */
  pageContainer: "space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-12",
  /** Narrow container for focused form views */
  narrowContainer: "space-y-6 max-w-4xl mx-auto pb-12",
  /** Full-width container */
  fullContainer: "w-full space-y-6 pb-12",

  /** Ambient dark gradient top banner for pages (Doctor & Health Institute) */
  headerBannerDark:
    "bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-slate-800",
  /** Light clean top banner for pages */
  headerBannerLight:
    "bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden",
  /** Ambient glowing orb overlay */
  ambientGlow:
    "absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none",
  ambientGlowTeal:
    "absolute right-0 top-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none",

  /** Multi-column responsive layout grids */
  grid4: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5",
  grid3: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5",
  grid2: "grid grid-cols-1 md:grid-cols-2 gap-5",
  split12: "grid grid-cols-1 lg:grid-cols-12 gap-6",
  col5: "lg:col-span-5 space-y-6",
  col7: "lg:col-span-7 space-y-6",
  col4: "lg:col-span-4 space-y-6",
  col8: "lg:col-span-8 space-y-6",
} as const;

export const cardStyles = {
  /** Standard clean content card */
  base: "bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all",
  /** Rounded-3xl card for hero containers */
  large: "bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden",
  /** Interactive clickable card */
  interactive:
    "bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-cyan-400/80 transition-all cursor-pointer group",
  /** Metric statistic display card */
  metric: "border-slate-200 shadow-xs hover:shadow-md transition-shadow bg-white rounded-2xl",

  /** Card sub-sections */
  header: "p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-3",
  headerMuted: "p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3",
  content: "p-5 sm:p-6 space-y-4",
  footer: "px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500",
} as const;

export const formStyles = {
  /** Form text/number/date inputs */
  input: "h-10 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 rounded-xl transition-all",
  /** Form select dropdown */
  select:
    "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer transition-all",
  /** Form multi-line textarea */
  textarea:
    "w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all",
  /** Field labels */
  label: "text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5",
  /** Help / info subtext */
  helperText: "text-[11px] text-slate-400 mt-1",
  /** Form validation error */
  errorText: "text-xs text-red-600 font-medium mt-1 flex items-center gap-1",
  /** Form row / group */
  fieldGroup: "space-y-1.5",
} as const;

export const typographyStyles = {
  /** Page primary titles */
  h1: "text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900",
  h1White: "text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white",
  /** Section titles */
  h2: "text-xl sm:text-2xl font-black tracking-tight text-slate-900",
  h2White: "text-xl sm:text-2xl font-black tracking-tight text-white",
  /** Card & sub-section headers */
  h3: "text-base sm:text-lg font-extrabold text-slate-900",
  h4: "text-sm font-bold text-slate-900",
  
  /** Body and paragraphs */
  body: "text-xs sm:text-sm text-slate-600 leading-relaxed",
  bodyWhite: "text-xs sm:text-sm text-slate-300 leading-relaxed",
  subtext: "text-xs text-slate-500",
  muted: "text-[11px] text-slate-400",
  
  /** Codes & registration numbers */
  mono: "font-mono font-bold text-xs tracking-tight",
  monoCyan: "font-mono font-bold text-xs text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200",
  monoTeal: "font-mono font-bold text-xs text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200",

  /** Section category pill badge */
  pillCyan: "text-[11px] font-bold uppercase tracking-wider text-cyan-800 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200/60",
  pillTeal: "text-[11px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/60",
  pillEmerald: "text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60",
} as const;

export const avatarStyles = {
  /** Doctor avatar with cyan-to-teal gradient */
  doctor: "w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-600 to-teal-700 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs",
  /** Institute avatar with teal-to-cyan gradient */
  institute: "w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-700 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs",
  /** Hero large avatar for detail profile views */
  hero: "w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-600 to-teal-700 text-white font-black text-2xl flex items-center justify-center shadow-lg border-2 border-white/20 shrink-0",
  /** Small avatar for tables & lists */
  sm: "w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0",
} as const;

export const iconBadgeStyles = {
  cyan: "w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center border border-cyan-100 shrink-0",
  teal: "w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100 shrink-0",
  emerald: "w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 shrink-0",
  indigo: "w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100 shrink-0",
  amber: "w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100 shrink-0",
  rose: "w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-100 shrink-0",
} as const;

export const stateCardStyles = {
  /** Search and Filter bar container */
  filterBar: "bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3",
  /** Empty state placeholder */
  empty: "py-16 text-center space-y-4 bg-white rounded-3xl border border-slate-200 shadow-xs p-6 max-w-xl mx-auto",
  /** Loading state spinner container */
  loading: "py-20 text-center space-y-3 bg-white rounded-3xl border border-slate-200 shadow-xs",
} as const;

export const authStyles = {
  /** Fullscreen dark ambient background */
  container: "min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950 flex items-center justify-center p-4 sm:p-6 lg:p-8",
  /** Dual-column card */
  card: "w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-slate-800/50",
  /** Left hero branding column */
  heroCol: "lg:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden",
  /** Right form input column */
  formCol: "lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between bg-white",
} as const;

/**
 * Composite ThemeStyles Object & Helper
 */
export const themeStyles = {
  layout: layoutStyles,
  card: cardStyles,
  form: formStyles,
  typography: typographyStyles,
  avatar: avatarStyles,
  iconBadge: iconBadgeStyles,
  state: stateCardStyles,
  auth: authStyles,

  /**
   * Helper function to combine common theme classes with custom Tailwind classes.
   * Leverages clsx & twMerge under the hood for clean conflict resolution.
   * 
   * Example:
   *   themeStyles.combine(themeStyles.card.base, "p-8 hover:border-teal-500")
   */
  combine: (...classes: (string | undefined | null | false)[]) => cn(...classes),
} as const;

export default themeStyles;
