// Service for file upload operations
// NOTE: This service now uses Google Drive instead of Firebase Storage
// to avoid Firebase Storage costs. Images are stored in a shared Google Drive folder.
import { convertDriveLinkToImageUrl, isGoogleDriveUrl } from './googleDriveService'

/**
 * Upload file to Google Drive (via manual URL input for now)
 * 
 * Since Google Drive API requires OAuth2 setup, users can:
 * 1. Manually upload images to their Google Drive folder
 * 2. Share the image with "Anyone with the link"
 * 3. Paste the share link here, which will be converted to a direct image URL
 * 
 * @param {string} driveShareLink - Google Drive share link from user
 * @returns {Promise<string>} - Direct image URL
 */
export async function uploadFileFromDriveLink(driveShareLink) {
  if (!driveShareLink) {
    throw new Error('Google Drive link é obrigatório')
  }
  
  if (!isGoogleDriveUrl(driveShareLink)) {
    throw new Error('URL inválida. Forneça um link do Google Drive.')
  }
  
  try {
    return convertDriveLinkToImageUrl(driveShareLink)
  } catch (error) {
    console.error('Error converting Drive link:', error)
    throw new Error('Erro ao processar link do Google Drive. Certifique-se de que o arquivo está compartilhado como "Qualquer pessoa com o link"')
  }
}

/**
 * Upload file - Now supports automatic Google Drive upload
 * 
 * @param {File|string} fileOrLink - File to upload OR Google Drive share link
 * @param {string} path - Not used anymore (kept for compatibility)
 * @returns {Promise<string>} - Public URL of the uploaded file
 */
export async function uploadFile(fileOrLink, path) {
  // If it's a File, try automatic upload to Google Drive
  if (fileOrLink instanceof File) {
    try {
      const { uploadFileToDrive } = await import('./googleDriveService')
      const { getDriveFolderId } = await import('../lib/googleDrive')
      const folderId = getDriveFolderId()
      return await uploadFileToDrive(fileOrLink, folderId)
    } catch (error) {
      // If automatic upload fails, fall back to manual link input
      throw new Error(`
        Upload automático falhou: ${error.message}
        
        Alternativa: Faça upload manual:
        1. Faça upload da imagem para sua pasta do Google Drive
        2. Clique com botão direito > Compartilhar > "Qualquer pessoa com o link"
        3. Cole o link no campo de texto
      `)
    }
  }
  
  // If it's a string (URL), treat it as a Google Drive link
  if (typeof fileOrLink === 'string') {
    return await uploadFileFromDriveLink(fileOrLink)
  }
  
  throw new Error('Tipo de arquivo não suportado. Use um arquivo ou link do Google Drive.')
}

/**
 * Upload contribution evidence
 * 
 * @param {File|string} fileOrLink - File to upload OR Google Drive share link
 * @param {string} contributionId - The contribution ID
 * @param {string} type - Type of evidence ('purchase' or 'arrival')
 * @returns {Promise<string>} - Public URL of the uploaded file
 * 
 * Usage:
 * - If you have a Google Drive link: pass the link string (manual upload)
 * - If you have a file: automatic upload to Google Drive (requires OAuth2 setup)
 */
export async function uploadContributionEvidence(fileOrLink, contributionId, type = 'purchase') {
  // If it's a string (Google Drive link), convert it
  if (typeof fileOrLink === 'string') {
    return await uploadFileFromDriveLink(fileOrLink)
  }
  
  // If it's a File, try automatic upload
  if (fileOrLink instanceof File) {
    try {
      const { uploadContributionEvidenceToDrive } = await import('./googleDriveService')
      return await uploadContributionEvidenceToDrive(fileOrLink, contributionId, type)
    } catch (error) {
      // If automatic upload fails, provide fallback instructions
      throw new Error(`
        Upload automático falhou: ${error.message}
        
        Alternativa: Faça upload manual:
        1. Faça upload da imagem para sua pasta compartilhada do Google Drive
        2. Clique com botão direito na imagem > Compartilhar
        3. Selecione "Qualquer pessoa com o link"
        4. Copie o link e cole no campo de texto
      `)
    }
  }
  
  throw new Error('Forneça um arquivo ou link do Google Drive')
}

/**
 * Upload product photo
 * 
 * @param {File|string} fileOrLink - File to upload OR Google Drive share link
 * @param {string} productId - The product ID
 * @returns {Promise<string>} - Public URL of the uploaded file
 */
export async function uploadProductPhoto(fileOrLink, productId) {
  // If it's a string (Google Drive link), convert it
  if (typeof fileOrLink === 'string') {
    return await uploadFileFromDriveLink(fileOrLink)
  }
  
  // If it's a File, try automatic upload
  if (fileOrLink instanceof File) {
    try {
      const { uploadProductPhotoToDrive } = await import('./googleDriveService')
      return await uploadProductPhotoToDrive(fileOrLink, productId)
    } catch (error) {
      throw new Error(`
        Upload automático falhou: ${error.message}
        
        Alternativa: Faça upload manual e cole o link do Google Drive.
      `)
    }
  }
  
  throw new Error('Forneça um arquivo ou link do Google Drive')
}

/**
 * Upload user photo
 * 
 * @param {File|string} fileOrLink - File to upload OR Google Drive share link
 * @param {string} userId - The user ID
 * @returns {Promise<string>} - Public URL of the uploaded file
 */
export async function uploadUserPhoto(fileOrLink, userId) {
  // If it's a string (Google Drive link), convert it
  if (typeof fileOrLink === 'string') {
    return await uploadFileFromDriveLink(fileOrLink)
  }
  
  // If it's a File, try automatic upload
  if (fileOrLink instanceof File) {
    try {
      const { uploadUserPhotoToDrive } = await import('./googleDriveService')
      return await uploadUserPhotoToDrive(fileOrLink, userId)
    } catch (error) {
      throw new Error(`
        Upload automático falhou: ${error.message}
        
        Alternativa: Faça upload manual e cole o link do Google Drive.
      `)
    }
  }
  
  throw new Error('Forneça um arquivo ou link do Google Drive')
}

/**
 * Delete file - Not applicable for Google Drive links
 * Files need to be deleted manually from Google Drive
 */
export async function deleteFile(path) {
  console.warn('Delete file not implemented for Google Drive. Delete files manually from your Drive folder.')
}

