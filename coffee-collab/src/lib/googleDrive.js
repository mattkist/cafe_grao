// Google Drive API initialization and authentication
// This module uses Google Identity Services (GIS) instead of deprecated gapi.auth2

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
const GOOGLE_DRIVE_FOLDER_ID = import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID || ''

// Store token globally
let currentAccessToken = null

// Check if Google Identity Services is loaded
function checkGoogleAccountsLoaded() {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.accounts) {
      resolve()
      return
    }
    
    // Wait for Google Identity Services to load
    const checkInterval = setInterval(() => {
      if (window.google && window.google.accounts) {
        clearInterval(checkInterval)
        clearTimeout(timeoutId)
        resolve()
      }
    }, 100)
    
    // Timeout after 10 seconds
    const timeoutId = setTimeout(() => {
      clearInterval(checkInterval)
      if (!window.google || !window.google.accounts) {
        reject(new Error('Google Identity Services failed to load. Check your internet connection.'))
      }
    }, 10000)
  })
}

// Check if gapi is loaded for Drive API
function checkGapiLoaded() {
  return new Promise((resolve, reject) => {
    if (window.gapi && window.gapi.load) {
      resolve()
      return
    }
    
    const checkInterval = setInterval(() => {
      if (window.gapi && window.gapi.load) {
        clearInterval(checkInterval)
        clearTimeout(timeoutId)
        resolve()
      }
    }, 100)
    
    const timeoutId = setTimeout(() => {
      clearInterval(checkInterval)
      if (!window.gapi) {
        reject(new Error('Google API (gapi) failed to load.'))
      }
    }, 10000)
  })
}

/**
 * Initialize Google API Client (Drive API only, no auth2)
 */
export async function initGoogleDrive() {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error('Google Client ID não configurado. Por favor, configure VITE_GOOGLE_CLIENT_ID no arquivo .env')
  }
  
  await checkGapiLoaded()
  
  // Load client library (without auth2)
  await new Promise((resolve, reject) => {
    try {
      window.gapi.load('client', {
        callback: () => {
          setTimeout(() => resolve(), 500)
        },
        onerror: (error) => {
          reject(new Error(`Erro ao carregar Google API: ${error || 'Erro desconhecido'}`))
        }
      })
    } catch (error) {
      reject(new Error(`Erro ao carregar biblioteca Google: ${error.message || 'Erro desconhecido'}`))
    }
  })
  
  // Initialize client (without auth2)
  try {
    // Check if already initialized
    if (window.gapi.client && window.gapi.client.drive) {
      return window.gapi.client
    }
    
    await window.gapi.client.init({
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
    })
    
    // Wait for Drive API to be ready
    await new Promise((resolve) => {
      if (window.gapi.client.drive) {
        resolve()
      } else {
        const checkInterval = setInterval(() => {
          if (window.gapi.client && window.gapi.client.drive) {
            clearInterval(checkInterval)
            resolve()
          }
        }, 100)
        
        setTimeout(() => {
          clearInterval(checkInterval)
          resolve()
        }, 3000)
      }
    })
  } catch (error) {
    if (!error.message?.includes('already initialized') && !error.message?.includes('init')) {
      throw error
    }
  }
  
  return window.gapi.client
}

/**
 * Authenticate user with Google Drive using Google Identity Services (GIS)
 * @returns {Promise<string>} - Access token
 */
export async function authenticateGoogleDrive() {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error('Google Client ID não configurado. Por favor, configure VITE_GOOGLE_CLIENT_ID no arquivo .env')
  }
  
  // If we already have a valid token, return it
  if (currentAccessToken) {
    return currentAccessToken
  }
  
  await checkGoogleAccountsLoaded()
  await initGoogleDrive()
  
  // Use Google Identity Services (new API) to get token
  return new Promise((resolve, reject) => {
    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/drive.file',
        callback: (tokenResponse) => {
          if (tokenResponse && tokenResponse.access_token) {
            currentAccessToken = tokenResponse.access_token
            resolve(tokenResponse.access_token)
          } else {
            reject(new Error('Token de acesso não recebido'))
          }
        },
        error_callback: (error) => {
          console.error('Error getting token:', error)
          reject(new Error(`Erro ao obter token: ${error.type || error.message || 'Erro desconhecido'}`))
        }
      })
      
      // Request access token (first time will show consent screen)
      tokenClient.requestAccessToken()
    } catch (error) {
      reject(new Error(`Erro ao inicializar cliente OAuth: ${error.message || 'Erro desconhecido'}`))
    }
  })
}

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>}
 */
export async function isAuthenticated() {
  return currentAccessToken !== null
}

/**
 * Sign out from Google Drive
 */
export async function signOutGoogleDrive() {
  try {
    await checkGoogleAccountsLoaded()
    
    if (window.google && window.google.accounts && window.google.accounts.oauth2) {
      window.google.accounts.oauth2.revoke(currentAccessToken, () => {
        currentAccessToken = null
      })
    } else {
      currentAccessToken = null
    }
  } catch (error) {
    console.error('Error signing out from Google Drive:', error)
    currentAccessToken = null
  }
}

/**
 * Get current access token
 */
export function getAccessToken() {
  return currentAccessToken
}

/**
 * Get Google Drive folder ID from environment
 */
export function getDriveFolderId() {
  if (!GOOGLE_DRIVE_FOLDER_ID) {
    throw new Error('Google Drive folder ID not configured. Please set VITE_GOOGLE_DRIVE_FOLDER_ID in your .env file')
  }
  return GOOGLE_DRIVE_FOLDER_ID
}

export { GOOGLE_CLIENT_ID, GOOGLE_DRIVE_FOLDER_ID }

