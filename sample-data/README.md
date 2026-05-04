# Sample test data

Three messy but realistic CSV exports for testing the Phase 3 upload →
mapping → processing → dashboard flow.

| File | Industry | Notes |
|---|---|---|
| `boutique_sales_messy.csv` | Apparel / accessories | Shopify + Square + Etsy channels, refunds, missing emails, mixed date formats, parenthesized negatives |
| `cafe_sales_messy.csv` | Coffee shop / bakery | High-volume walk-in tickets without emails, quantity, tax, tip, one refund row |
| `etsy_shop_sales_messy.csv` | Handmade home goods | Single-channel Etsy export, currency symbols, discounts, one refund |

## How to use them

1. Sign in to the app.
2. Go to **Upload** in the sidebar.
3. Upload one of these files.
4. Review the detected column mapping.
5. Click **Build my dashboard**.
6. You should land on `/dashboard` with real numbers.

You can upload multiple files — the dashboard is rebuilt from every
processed upload in your workspace.
