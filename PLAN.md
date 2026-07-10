# Plan: Custom Bill Icons via Google Drive Upload

## Context

Users can assign a custom image to each bill. Previously, uploaded images were stored as base64 data URIs in IndexedDB — local-only and lost on "Refresh from Sheets". This tranche adds Google Drive upload so images persist across devices and survive data refreshes.

## Architecture

```
User picks file → FileReader → blob
  → uploadImageToDrive() → Drive API multipart upload
  → set permissions (anyone with link)
  → get file ID
  → construct URL: https://drive.google.com/uc?id={fileId}
  → save URL to bill.iconUrl (IndexedDB) + icon_url column L (Sheets)
  → CategoryIcon renders <img src={url} />
```

## Folder ID Configuration

The Google Drive folder ID is stored in `.env.google-sheets.json` and bundled into the app at build time:

```json
{
  "spreadsheetId": "...",
  "sheetName": "Data",
  "credentialsPath": "./client-secret.json",
  "driveFolderId": "YOUR_FOLDER_ID_HERE"
}
```

**To get your folder ID:**
1. Open Google Drive → navigate to your folder
2. Copy the URL: `https://drive.google.com/drive/folders/1ABCxyz...`
3. Paste the full URL or just the ID part into `driveFolderId`
4. Rebuild the app (`npm run build`)

This persists across devices — no settings UI needed, it's committed to git.

## Changes

### 1. OAuth Scope (`src/utils/googleSheets.ts`)
- `https://www.googleapis.com/auth/drive.file` added to scope
- Users will see a new consent prompt on next auth (Drive file access)

### 2. Upload Function (`src/utils/googleSheets.ts`)
```typescript
export async function uploadImageToDrive(
  file: File,
  merchant: string,
  owner: string,
): Promise<string | null>
```
- Multipart upload to Drive API
- Creates `PaymentReminderIcons/` folder lazily (or uses configured folder)
- File named `{merchant}_{owner}_{timestamp}.{ext}`
- Returns `https://drive.google.com/uc?id={fileId}` on success

### 3. Permission Function (`src/utils/googleSheets.ts`)
```typescript
async function setFilePublic(fileId: string): Promise<void>
```
- Sets file to "anyone with link can view"
- Ensures images load without auth

### 4. BillEditor & NewBillModal
- Image picker: URL input + file picker
- File picker calls `uploadImageToDrive()` → URL → `iconUrl`
- Authenticated → Drive upload; Unauthenticated → base64 fallback
- Shows "Uploading..." progress

### 5. CategoryIcon (`src/components/CategoryIcon.tsx`)
- 60x60 fully circular (`rounded-full`)
- `iconUrl` prop: renders `<img>` with Phosphor duotone fallback
- 60x60 fully circular with object-cover

### 6. Google Sheets Schema
- Column K: `exact_date` (day of month, 1-28, for exact-date mode)
- Column L: `icon_url` (Drive URL or pasted URL)
- `billToRow()` / `mapRowToBill()` handle both columns

## Data Flow

| Action | IndexedDB | Google Sheets | Google Drive |
|--------|-----------|---------------|--------------|
| Paste URL | `iconUrl` = URL | `icon_url` = URL | — |
| Upload file | `iconUrl` = URL | `icon_url` = URL | Image stored |
| Refresh from Sheets | Cleared + re-fetched from L | Source of truth | Images persist |
| Delete bill | Cleared | Row deleted | Image orphaned |

## Google Cloud Console

- [x] Google Drive API enabled
- [x] `drive.file` scope added to OAuth client
- [x] `spreadsheets` scope for Sheets access

## Files Modified

| File | Change |
|------|--------|
| `.env.google-sheets.json` | Added `driveFolderId` field |
| `src/utils/googleSheets.ts` | Drive scope, upload, permissions, folder config |
| `src/components/BillEditor.tsx` | Upload progress, wire to upload |
| `src/components/NewBillModal.tsx` | Upload progress, wire to upload |
| `src/components/CategoryIcon.tsx` | Phosphor duotone, `iconUrl` prop, 60x60 circle |
| `src/components/OwnerFilter.tsx` | Modal overlay with circular accent icon |
| `src/components/PaymentCard.tsx` | Subtext: Line 1=date, Line 2="Freq | Cat | Owner" |
| `src/utils.ts` | `getValidatedPayments` handles `cycle_days=-1` (exact date) |
| `src/db/types.ts` | `exact_date?: number`, `iconUrl?: string` fields |
| `tsconfig.app.json` | `resolveJsonModule: true` |

## Verification

- [ ] Upload a file in BillEditor → preview shows → save → check Drive folder has image
- [ ] Check spreadsheet column L has the Drive URL
- [ ] Refresh from Sheets → bill still shows custom icon
- [ ] Paste a URL instead of uploading → still works
- [ ] Remove icon → icon cleared from IndexedDB and Sheets
- [ ] Build passes (`npm run build`)
