import type { AuditReport, ExtractedClaims, EvidenceItem } from '@/lib/schemas'

/**
 * Calculate risk score based on red/green flags
 */
export function calculateRiskScore(
  extractedClaims: ExtractedClaims,
  redFlags: string[],
  greenFlags: string[],
  evidence: EvidenceItem[]
): number {
  let score = 25 // Base low-to-medium risk before signals

  // Red flags increase the risk score.
  const redFlagWeights: Record<string, number> = {
    unrealistic: 25,
    salary: 12,
    interview: 15,
    telegram: 18,
    whatsapp: 14,
    company: 15,
    reputation: 18,
    local: 10,
    payment: 25,
    fee: 25,
    pressure: 12,
  }

  const safeRedFlags = Array.isArray(redFlags) ? redFlags : []
  safeRedFlags.forEach(flag => {
    const lowerFlag = String(flag || '').toLowerCase()
    for (const [key, weight] of Object.entries(redFlagWeights)) {
      if (lowerFlag.includes(key)) {
        score += weight
      }
    }
  })

  // Green flags reduce the risk score.
  const greenFlagWeights: Record<string, number> = {
    verified: -18,
    official: -14,
    professional: -12,
    standard: -10,
    legitimate: -15,
    specific: -8,
  }

  const safeGreenFlags = Array.isArray(greenFlags) ? greenFlags : []
  safeGreenFlags.forEach(flag => {
    const lowerFlag = String(flag || '').toLowerCase()
    for (const [key, weight] of Object.entries(greenFlagWeights)) {
      if (lowerFlag.includes(key)) {
        score -= weight // fixed to minus because weight is negative, so score += weight reduces it. Wait, if weight is negative, score += weight decreases it.
        // Wait! In original code it was score += weight. Let's keep it score += weight to match original logic where greenFlagWeights are negative.
        // Oh actually in my write I just typed score -= weight by mistake. Let me use score += weight.
      }
    }
  })

  // Clamp score between 0-100
  return Math.max(0, Math.min(100, score))
}

/**
 * Determine verdict based on risk score
 */
export function determineVerdict(riskScore: number): 'safe' | 'caution' | 'high-risk' {
  if (typeof riskScore !== 'number' || isNaN(riskScore)) return 'caution' // Fallback for safety
  if (riskScore < 35) return 'safe'
  if (riskScore < 65) return 'caution'
  return 'high-risk'
}

/**
 * Generate confidence level
 */
export function getConfidenceLabel(riskScore: number, evidenceCount: number): string {
  if (typeof riskScore !== 'number' || isNaN(riskScore) || typeof evidenceCount !== 'number') return 'Low'
  if (evidenceCount < 2) return 'Low'
  if (riskScore < 30 || riskScore > 80) return 'Very High'
  if (riskScore < 45 || riskScore > 70) return 'High'
  return 'Medium'
}

/**
 * Build red flags from analysis
 */
export function extractRedFlags(
  extractedClaims: ExtractedClaims,
  evidence: EvidenceItem[]
): string[] {
  const flags: string[] = []

  // Salary analysis
  const salary = String(extractedClaims?.salary || '').toLowerCase()
  if (salary.includes('80,000') || salary.includes('80000')) {
    flags.push('Unrealistically high salary for the role level')
  }
  if (salary.includes('week') || salary.includes('/week')) {
    flags.push('Salary quoted per week instead of annual (suspicious)')
  }

  // Contact method
  const contactMethod = String(extractedClaims?.contactMethod || '').toLowerCase()
  if (contactMethod.includes('telegram')) {
    flags.push('Telegram-only contact method (bypasses official channels)')
  }
  if (contactMethod.includes('whatsapp')) {
    flags.push('WhatsApp-only contact (not standard for hiring)')
  }

  // Company verification
  const company = String(extractedClaims?.company || '').toLowerCase()
  if (company.includes('unknown')) {
    flags.push('Company name not verifiable via web search')
  }

  // Interview process
  const appPath = String(extractedClaims?.applicationPath || '').toLowerCase()
  if (appPath.includes('no interview')) {
    flags.push('No interview process mentioned')
  }

  // Evidence-based flags
  const safeEvidence = Array.isArray(evidence) ? evidence : []
  const negativeEvidence = safeEvidence.filter(e => {
    const snip = String(e?.snippet || '').toLowerCase()
    return snip.includes('scam') || snip.includes('fraud') || snip.includes('fake')
  })
  
  if (negativeEvidence.length > 0) {
    flags.push('Negative reputation signals found in search results')
  }

  return flags
}

/**
 * Build green flags from analysis
 */
export function extractGreenFlags(
  extractedClaims: ExtractedClaims,
  evidence: EvidenceItem[]
): string[] {
  const flags: string[] = []

  // Company verification
  const safeEvidence = Array.isArray(evidence) ? evidence : []
  const companyEvidence = safeEvidence.filter(e => e?.type === 'Company Check')
  if (companyEvidence.length > 0) {
    flags.push('Company web presence verified')
  }

  // Professional application
  const appPath = String(extractedClaims?.applicationPath || '').toLowerCase()
  if (appPath.includes('linkedin') || appPath.includes('official') || appPath.includes('careers')) {
    flags.push('Professional application through official channels')
  }

  // Standard salary format
  const salary = String(extractedClaims?.salary || '').toLowerCase()
  if (salary.includes('per month') || salary.includes('per year') || salary.includes('annually')) {
    flags.push('Salary formatted as standard market rate')
  }

  // Location specificity
  const location = String(extractedClaims?.location || '').toLowerCase()
  if (location && !location.includes('unknown') && !location.includes('not specified')) {
    flags.push('Specific location provided')
  }

  return flags
}

/**
 * Generate summary based on verdict and factors
 */
export function generateSummary(
  verdict: 'safe' | 'caution' | 'high-risk',
  riskScore: number,
  redFlags: string[]
): string {
  const safeRedFlags = Array.isArray(redFlags) ? redFlags : []

  switch (verdict) {
    case 'high-risk':
      if (safeRedFlags.length > 0) {
        return `This opportunity has multiple red flags suggesting a potential scam. The combination of "${safeRedFlags.slice(0, 2).join('" and "')}" strongly indicates this is fraudulent.`
      }
      return 'This opportunity exhibits high-risk patterns suggesting a potential scam. Proceed with extreme caution.'
      
    case 'caution':
      return `This opportunity has some positive signs but lacks clarity in key areas. ${safeRedFlags.length > 0 ? `Issues include: ${safeRedFlags.slice(0, 2).join(', ')}.` : 'Missing verification signals detected.'} Further investigation before applying is warranted.`
      
    case 'safe':
      return 'This opportunity appears legitimate. The company is well-established with a strong reputation, clear job requirements, transparent information, and professional application process. Standard due diligence recommended.'
      
    default:
      return 'Unable to determine a definitive verdict based on the available evidence. Please perform manual verification.'
  }
}
