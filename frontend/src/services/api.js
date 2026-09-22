const API_BASE = import.meta.env.VITE_API_URL || '';

/**
 * Upload and analyze an image file
 * @param {File} file 
 * @returns {Promise<Object>} ScanResponse
 */
export async function analyzeImage(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    let errorDetail = 'Failed to analyze image';
    try {
      const err = await res.json();
      errorDetail = err.detail || errorDetail;
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }

  return await res.json();
}

/**
 * Retrieve a specific scan by ID
 * @param {string} scanId 
 * @returns {Promise<Object>} ScanResponse
 */
export async function getScan(scanId) {
  const res = await fetch(`${API_BASE}/api/scans/${scanId}`);
  if (!res.ok) {
    throw new Error('Failed to load scan');
  }
  return await res.json();
}

/**
 * Get recent scan history
 * @param {number} limit 
 * @returns {Promise<Array>} List of scans
 */
export async function getHistory(limit = 12) {
  try {
    const res = await fetch(`${API_BASE}/api/history?limit=${limit}`);
    if (!res.ok) return { items: [], total: 0 };
    return await res.json();
  } catch (err) {
    console.warn('Failed to load history:', err);
    return { items: [], total: 0 };
  }
}

/**
 * Delete a scan from history
 * @param {string} scanId 
 */
export async function deleteScan(scanId) {
  const res = await fetch(`${API_BASE}/api/history/${scanId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error('Failed to delete scan');
  }
  return await res.json();
}

/**
 * Check backend status and Groq API readiness
 */
export async function getStatus() {
  try {
    const res = await fetch(`${API_BASE}/api/status`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Ask a follow-up question regarding a scan record
 * @param {string} scanId
 * @param {string} question
 * @returns {Promise<Object>}
 */
export async function askScanQuestion(scanId, question) {
  const res = await fetch(`${API_BASE}/api/scans/${scanId}/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question }),
  });

  if (!res.ok) {
    let errorDetail = 'Failed to get answer';
    try {
      const err = await res.json();
      errorDetail = err.detail || errorDetail;
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }

  return await res.json();
}

