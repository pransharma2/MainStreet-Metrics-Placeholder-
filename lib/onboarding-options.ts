// Client-safe shared option arrays for the onboarding + settings forms.
// Keep this file free of "use server" and any server-only imports so it can
// be imported from client components.

export const INDUSTRY_OPTIONS = [
  "Boutique",
  "Café / bakery",
  "Etsy / handmade shop",
  "Local retail",
  "Pop-up / market seller",
  "Home business",
  "Online store",
  "Other",
] as const;

export const CURRENCY_OPTIONS = ["USD", "CAD", "GBP", "EUR", "Other"] as const;

export const SOURCE_OPTIONS = [
  "Shopify",
  "Square",
  "Etsy",
  "Excel / spreadsheet",
  "Google Sheets",
  "Other POS",
  "Not sure yet",
] as const;

export const GOAL_OPTIONS = [
  "Understand revenue trends",
  "Find top products",
  "Understand repeat customers",
  "Track sales by channel",
  "Clean messy sales files",
  "Get a simple business report",
] as const;
