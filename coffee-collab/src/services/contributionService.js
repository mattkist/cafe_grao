// Service for contributions operations in Firestore
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { updateProductAveragePrice } from './productService'

/**
 * Create a new contribution
 */
export async function createContribution(contributionData) {
  const contributionsRef = collection(db, 'contributions')
  
  const newContribution = {
    userId: contributionData.userId,
    purchaseDate: Timestamp.fromDate(new Date(contributionData.purchaseDate)),
    value: contributionData.value,
    quantityKg: contributionData.quantityKg,
    productId: contributionData.productId,
    purchaseEvidence: contributionData.purchaseEvidence || null,
    arrivalEvidence: contributionData.arrivalEvidence || null,
    arrivalDate: contributionData.arrivalDate 
      ? Timestamp.fromDate(new Date(contributionData.arrivalDate))
      : null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }

  const docRef = await addDoc(contributionsRef, newContribution)
  
  // Recalculate product average price
  await updateProductAveragePrice(contributionData.productId)
  
  return docRef.id
}

/**
 * Get all contributions
 */
export async function getAllContributions() {
  const contributionsRef = collection(db, 'contributions')
  const q = query(contributionsRef, orderBy('purchaseDate', 'desc'))
  
  const querySnapshot = await getDocs(q)
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}

/**
 * Get contributions by user ID
 */
export async function getContributionsByUser(userId) {
  const contributionsRef = collection(db, 'contributions')
  // Query without orderBy to avoid requiring composite index
  const q = query(contributionsRef, where('userId', '==', userId))
  
  const querySnapshot = await getDocs(q)
  
  // Sort in memory instead
  return querySnapshot.docs
    .map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    .sort((a, b) => {
      const dateA = a.purchaseDate?.toDate?.() || new Date(a.purchaseDate)
      const dateB = b.purchaseDate?.toDate?.() || new Date(b.purchaseDate)
      return dateB - dateA // Descending order
    })
}

/**
 * Get contributions within date range (for calculation base months)
 */
export async function getContributionsInDateRange(startDate, endDate) {
  const contributionsRef = collection(db, 'contributions')
  const q = query(
    contributionsRef,
    where('purchaseDate', '>=', Timestamp.fromDate(startDate)),
    where('purchaseDate', '<=', Timestamp.fromDate(endDate)),
    orderBy('purchaseDate', 'desc')
  )
  
  const querySnapshot = await getDocs(q)
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}

/**
 * Get contribution by ID
 */
export async function getContributionById(contributionId) {
  const contributionRef = doc(db, 'contributions', contributionId)
  const contributionSnap = await getDoc(contributionRef)
  
  if (contributionSnap.exists()) {
    return { id: contributionSnap.id, ...contributionSnap.data() }
  }
  return null
}

/**
 * Update contribution
 */
export async function updateContribution(contributionId, updates) {
  const contributionRef = doc(db, 'contributions', contributionId)
  
  const updateData = {
    ...updates,
    updatedAt: serverTimestamp()
  }
  
  // Convert dates to Timestamps if present
  if (updates.purchaseDate) {
    updateData.purchaseDate = Timestamp.fromDate(new Date(updates.purchaseDate))
  }
  if (updates.arrivalDate) {
    updateData.arrivalDate = Timestamp.fromDate(new Date(updates.arrivalDate))
  }
  
  await updateDoc(contributionRef, updateData)
  
  // Recalculate product average price if value or quantity changed
  const contribution = await getContributionById(contributionId)
  if (contribution && (updates.value !== undefined || updates.quantityKg !== undefined)) {
    await updateProductAveragePrice(contribution.productId)
  }
  
  // If arrivalEvidence was added and product has no photo, use it as product photo
  if (updates.arrivalEvidence && contribution) {
    const { getProductById, updateProduct } = await import('./productService')
    const product = await getProductById(contribution.productId)
    if (product && !product.photoURL) {
      await updateProduct(contribution.productId, { photoURL: updates.arrivalEvidence })
    }
  }
}

/**
 * Delete contribution
 */
export async function deleteContribution(contributionId) {
  const contribution = await getContributionById(contributionId)
  const contributionRef = doc(db, 'contributions', contributionId)
  
  await deleteDoc(contributionRef)
  
  // Recalculate product average price
  if (contribution) {
    await updateProductAveragePrice(contribution.productId)
  }
}

/**
 * Get contributions missing arrival data for a user
 */
export async function getContributionsMissingArrival(userId) {
  const contributionsRef = collection(db, 'contributions')
  const q = query(
    contributionsRef,
    where('userId', '==', userId),
    orderBy('purchaseDate', 'desc')
  )
  
  const querySnapshot = await getDocs(q)
  
  return querySnapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(contrib => !contrib.arrivalEvidence || !contrib.arrivalDate)
}
