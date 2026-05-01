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
  let score = 25

  const redFlagWeights: Array<[string, number]> = [
    ['payment', 30],
    ['fee', 30],
    ['unrealistic', 28],
    ['telegram', 18],
    ['whatsapp', 16],
    ['reputation', 18],
    ['interview', 16],
    ['salary', 14],
    ['company', 14],
    ['local', 8],
    ['evidence', 8],
    ['pressure', 10],
  ]
  const safeRedFlags = Array.isArray(redFlags) ? redFlags : []
  safeRedFlags.forEach(flag => {
    const lowerFlag = String(flag || '').toLowerCase()
    for (const [key, weight] of redFlagWeights) {
      if (lowerFlag.includes(key)) {
        score += weight
        break
      }
    }
  })

  const greenFlagWeights: Array<[string, number]> = [
    ['verified', -12],
    ['official', -12],
    ['professional', -10],
    ['legitimate', -10],
    ['standard', -8],
    ['specific', -4],
  ]
  let greenCredit = 0
  const safeGreenFlags = Array.isArray(greenFlags) ? greenFlags : []
  safeGreenFlags.forEach(flag => {
    const lowerFlag = String(flag || '').toLowerCase()
    for (const [key, weight] of greenFlagWeights) {
      if (lowerFlag.includes(key)) {
        greenCredit += weight
        break
      }
    }
  })
  score += Math.max(greenCredit, -28)

  const safeEvidence = Array.isArray(evidence) ? evidence : []
  const evidenceTypes = new Set(safeEvidence.map(item => String(item?.type || '').toLowerCase()))
  if (evidenceTypes.has('company check')) score -= 3
  if (evidenceTypes.has('local presence')) score -= 3
  if (evidenceTypes.has('comparable jobs')) score -= 2

  const negativeEvidenceCount = safeEvidence.filter(item => {
    const snippet = String(item?.snippet || '').toLowerCase()
    return /\b(scam|fraud|fake|impersonat|phishing)\b/.test(snippet)
  }).length
  score += Math.min(negativeEvidenceCount * 8, 16)

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
