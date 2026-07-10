import type { Bill } from '../db/types'
import config from '../../.env.google-sheets.json'

const SPREADSHEET_ID = config.spreadsheetId
const SHEET_NAME = config.sheetName
const DRIVE_FOLDER_ID = config.driveFolderId
const CLIENT_ID = '691167222198-9qo2f2omlgnm9j90otd8l06rql4qnk29.apps.googleusercontent.com'
const SCOPE_VERSION = '2' // Increment when scopes change to force re-auth

let accessToken: string | null = (() => {
  try {
    const storedVersion = sessionStorage.getItem('gs_scope_version')
    if (storedVersion !== SCOPE_VERSION) {
      sessionStorage.removeItem('gs_access_token')
      sessionStorage.setItem('gs_scope_version', SCOPE_VERSION)
      return null
    }
    return sessionStorage.getItem('gs_access_token')
  } catch { return null }
})()
let tokenClient: any = null
let isGISReady = false
let cachedSheetId: number | null = null

declare global {
  interface Window {
    google: any
  }
}

function setAccessToken(token: string | null) {
  accessToken = token
  try {
    if (token) {
      sessionStorage.setItem('gs_access_token', token)
    } else {
      sessionStorage.removeItem('gs_access_token')
    }
  } catch { /* ignore */ }
}

function loadGIS(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="https://accounts.google.com/gsi/client"]`)) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'))
    document.head.appendChild(script)
  })
}

async function waitForGoogle(): Promise<void> {
  const maxWait = 10000
  const start = Date.now()
  while (!window.google?.accounts && Date.now() - start < maxWait) {
    await new Promise((r) => setTimeout(r, 50))
  }
  if (!window.google?.accounts) {
    throw new Error('Google Identity Services failed to initialize')
  }
}

async function initTokenClient(): Promise<void> {
  if (isGISReady && tokenClient) return
  await loadGIS()
  await waitForGoogle()

  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file',
    callback: '',
  })
  isGISReady = true
}

export async function authenticate(): Promise<boolean> {
  try {
    await initTokenClient()

    if (accessToken) {
      return true
    }

    return new Promise((resolve) => {
      tokenClient.callback = (response: any) => {
        if (response.error) {
          console.error('OAuth error:', response.error)
          resolve(false)
          return
        }
        setAccessToken(response.access_token)
        resolve(true)
      }
      tokenClient.requestAccessToken()
    })
  } catch (error) {
    console.error('Authentication failed:', error)
    return false
  }
}

export function isAuthenticated(): boolean {
  return !!accessToken
}

export function revokeAccess(): void {
  setAccessToken(null)
  if (tokenClient) {
    try {
      window.google.accounts.oauth2.revoke('', () => {})
    } catch {
      // Ignore revoke errors
    }
  }
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = []
  let current: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const next = text[i + 1]

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"'
        i++
      } else if (char === '"') {
        inQuotes = false
      } else {
        field += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === ',') {
        current.push(field)
        field = ''
      } else if (char === '\n' || char === '\r') {
        if (char === '\r' && next === '\n') {
          i++
        }
        current.push(field)
        field = ''
        if (current.some((f) => f.trim())) {
          rows.push(current)
        }
        current = []
      } else {
        field += char
      }
    }
  }

  if (field || current.length) {
    current.push(field)
    if (current.some((f) => f.trim())) {
      rows.push(current)
    }
  }

  return rows
}

function mapRowToBill(headers: string[], row: string[], rowIndex: number): Bill | null {
  const obj: Record<string, string> = {}
  headers.forEach((header, index) => {
    const normalized = header.trim().toLowerCase().replace(/[\s-]+/g, '_')
    obj[normalized] = row[index]?.trim() || ''
  })

  const merchant = obj['merchant']
  const owner = obj['owner']

  if (!merchant || !owner) {
    return null
  }

  return {
    merchant,
    category: obj['category'] || 'Uncategorized',
    frequency: obj['frequency'] || 'Monthly',
    cycle_days: parseInt(obj['cycle_days'], 10) || 30,
    count: parseInt(obj['count'], 10) || 0,
    first_date: obj['first_date'] || '',
    last_date: obj['last_date'] || '',
    avg_amount: parseFloat(obj['avg_amount']) || 0,
    variance: parseFloat(obj['variance']) || 0,
    projected_payments: [],
    owner,
    sheetRow: rowIndex,
    exact_date: obj['exact_date'] ? parseInt(obj['exact_date'], 10) : undefined,
    iconUrl: normalizeIconUrl(obj['icon_url']),
  }
}

async function fetchDriveImageAsDataUri(driveUrl: string): Promise<string | null> {
  const fileIdMatch = driveUrl.match(/id=([^&]+)/)
  if (!fileIdMatch) return null
  const fileId = fileIdMatch[1]

  try {
    if (!accessToken) return null
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    if (!res.ok) return null
    const blob = await res.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

async function convertDriveUrlsToDataUris(bills: Bill[]): Promise<Bill[]> {
  return Promise.all(
    bills.map(async (bill) => {
      if (bill.iconUrl && bill.iconUrl.startsWith('https://drive.google.com')) {
        const dataUri = await fetchDriveImageAsDataUri(bill.iconUrl)
        if (dataUri) return { ...bill, iconDataUri: dataUri }
      }
      return bill
    })
  )
}

export async function fetchBillsFromSheets(): Promise<Bill[]> {
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${SHEET_NAME}`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Google Sheets fetch failed: ${response.status}`)
    }

    const csvText = await response.text()
    const rows = parseCSV(csvText)

    if (rows.length < 2) {
      return []
    }

    const headers = rows[0]
    const bills: Bill[] = []

    for (let i = 1; i < rows.length; i++) {
      const bill = mapRowToBill(headers, rows[i], i + 1)
      if (bill) {
        bills.push(bill)
      }
    }

    return convertDriveUrlsToDataUris(bills)
  } catch (error) {
    console.error('Failed to fetch bills from Google Sheets:', error)
    throw error
  }
}

async function sheetsRequest(path: string, method: string, body?: any): Promise<any> {
  if (!accessToken) {
    throw new Error('Not authenticated for Google Sheets write')
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}${path}`

  const response = await fetch(url, {
    method,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    if (response.status === 401) {
      setAccessToken(null)
      throw new Error('Token expired, please re-authenticate')
    }
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }))
    throw new Error(`Sheets API error: ${error.error?.message || response.statusText}`)
  }

  return response.json()
}

async function getSheetId(): Promise<number> {
  if (cachedSheetId !== null) {
    return cachedSheetId
  }

  const spreadsheet = await sheetsRequest('', 'GET')
  const sheet = spreadsheet?.sheets?.find((s: any) => s.properties?.title === SHEET_NAME)
  cachedSheetId = sheet?.properties?.sheetId ?? 0
  return cachedSheetId as number
}

function normalizeIconUrl(url: string | undefined): string | undefined {
  if (!url) return undefined
  if (url.startsWith('data:')) return url
  if (url.includes('drive.google.com/uc?') && !url.includes('export=view')) {
    return url.replace('uc?', 'uc?export=view&')
  }
  return url
}

function billToRow(bill: Bill): string[] {
  return [
    bill.merchant,
    bill.category,
    bill.frequency,
    String(bill.cycle_days),
    bill.exact_date != null ? String(bill.exact_date) : '',
    String(bill.count),
    bill.first_date,
    bill.last_date,
    String(bill.avg_amount),
    String(bill.variance),
    bill.owner,
    bill.iconUrl || '',
  ]
}

export async function addBillToSheets(bill: Bill): Promise<number | null> {
  try {
    const data = await sheetsRequest(
      `/values/${SHEET_NAME}!A:L:append?valueInputOption=USER_ENTERED`,
      'POST',
      {
        values: [billToRow(bill)],
      }
    )

    const updates = data?.updates
    if (updates?.updatedRange) {
      const match = updates.updatedRange.match(/!(\d+):/)
      if (match) {
        return parseInt(match[1], 10)
      }
    }

    return null
  } catch (error) {
    console.error('Failed to add bill to Google Sheets:', error)
    throw error
  }
}

export async function updateBillInSheets(bill: Bill): Promise<boolean> {
  if (!bill.sheetRow) {
    return false
  }

  try {
    await sheetsRequest(
      `/values/${SHEET_NAME}!A${bill.sheetRow}:L${bill.sheetRow}?valueInputOption=USER_ENTERED`,
      'PUT',
      {
        values: [billToRow(bill)],
      }
    )
    return true
  } catch (error) {
    console.error('Failed to update bill in Google Sheets:', error)
    throw error
  }
}

export function getIconFolderId(): string {
  return localStorage.getItem('driveFolderId') || ''
}

export function setIconFolderId(id: string): void {
  if (id.trim()) {
    localStorage.setItem('driveFolderId', id.trim())
  } else {
    localStorage.removeItem('driveFolderId')
  }
  cachedFolderId = null
}

export async function deleteBillFromSheets(sheetRow: number): Promise<boolean> {
  try {
    const sheetId = await getSheetId()

    await sheetsRequest(
      ':batchUpdate',
      'POST',
      {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId,
                dimension: 'ROWS',
                startIndex: sheetRow - 1,
                endIndex: sheetRow,
              },
            },
          },
        ],
      }
    )
    return true
  } catch (error) {
    console.error('Failed to delete bill from Google Sheets:', error)
    throw error
  }
}

const ICON_FOLDER_NAME = 'PaymentReminderIcons'
let cachedFolderId: string | null = null

function getDriveFolderId(): string {
  try {
    const override = localStorage.getItem('driveFolderId')
    if (override) return override
  } catch { /* ignore */ }
  return DRIVE_FOLDER_ID
}

function extractFolderId(input: string): string {
  const match = input.match(/\/folders\/([a-zA-Z0-9_-]+)/)
  if (match) return match[1]
  if (/^[a-zA-Z0-9_-]{20,}$/.test(input.trim())) return input.trim()
  return input.trim()
}

async function getOrCreateIconFolder(): Promise<string> {
  const configured = getDriveFolderId()
  if (configured) return extractFolderId(configured)

  if (cachedFolderId) return cachedFolderId

  if (!accessToken) throw new Error('Not authenticated')

  // Search for existing folder
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=name='${ICON_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false&fields=files(id)`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  const searchData = await searchRes.json()
  if (searchData.files?.length > 0) {
    cachedFolderId = searchData.files[0].id as string
    return cachedFolderId
  }

  // Create folder
  const createRes = await fetch(
    'https://www.googleapis.com/drive/v3/files',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: ICON_FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
      }),
    }
  )
  const folder = await createRes.json()
  cachedFolderId = folder.id as string
  return cachedFolderId
}

async function setFilePublic(fileId: string): Promise<void> {
  if (!accessToken) return
  await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role: 'reader', type: 'anyone' }),
    }
  )
}

export async function uploadImageToDrive(
  file: File,
  merchant: string,
  owner: string,
): Promise<string | null> {
  if (!accessToken) throw new Error('Not authenticated for Google Drive')

  try {
    const folderId = await getOrCreateIconFolder()

    const safeName = merchant.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40)
    const ext = file.name.split('.').pop() || 'png'
    const fileName = `${safeName}_${owner}_${Date.now()}.${ext}`

    const metadata = {
      name: fileName,
      parents: [folderId],
    }

    const form = new FormData()
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
    form.append('file', file)

    const res = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: form,
      }
    )

    if (!res.ok) {
      console.error('Drive upload failed:', res.status, await res.text())
      return null
    }

    const data = await res.json()
    const fileId = data.id as string

    await setFilePublic(fileId)

    return `https://drive.google.com/uc?export=view&id=${fileId}`
  } catch (error) {
    console.error('Failed to upload image to Drive:', error)
    return null
  }
}
