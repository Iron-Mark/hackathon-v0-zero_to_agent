export const DEMO_FIXTURES = {
  highRisk: {
    verdict: 'high-risk' as const,
    riskScore: 92,
    confidence: 'Very High',
    summary: 'This opportunity has multiple red flags suggesting a potential scam. The combination of unrealistic salary, no interview process, Telegram-only contact, and inability to verify the company strongly indicate this is fraudulent.',
    extractedClaims: {
      company: 'Unknown / Not Verifiable',
      role: 'Frontend Intern',
      salary: 'PHP 80,000 per week',
      location: 'Remote',
      contactMethod: 'Telegram',
      applicationPath: 'Direct message only',
    },
    redFlags: [
      'Unrealistically high salary for an internship role (₱4.1M/year equivalent)',
      'No formal interview process mentioned',
      'Telegram-only contact method (bypasses official channels)',
      'Company name not verifiable via web search',
      'No application through standard job board',
      'Pressure to contact immediately via messaging app',
      'Generic messaging suggests mass recruitment attempt',
    ],
    greenFlags: [],
    evidence: [
      {
        source: 'Demo fixture: market signal',
        snippet: 'Sample market signal: the advertised weekly pay is intentionally unrealistic for the demo scenario.',
        type: 'Market Data',
        url: undefined,
      },
      {
        source: 'Demo fixture: company check',
        snippet: 'Sample company check: no verifiable employer identity is provided in this demo scenario.',
        type: 'Company Check',
        url: undefined,
      },
      {
        source: 'Demo fixture: scam pattern',
        snippet: 'Sample scam pattern: off-platform chat plus urgent high-pay recruiting is treated as risky.',
        type: 'Reputation',
        url: undefined,
      },
    ],
    alternatives: [],
    nextSteps: [
      'Do not respond to the Telegram message or provide any personal information',
      'Report the account to Telegram for suspected fraud',
      'Search for the company name on LinkedIn, Google, and business registries',
      'Browse legitimate job boards like LinkedIn Jobs, indeed.com, or local platforms',
      'Be cautious of offers that promise high pay with minimal qualifications',
    ],
  },
  caution: {
    verdict: 'caution' as const,
    riskScore: 55,
    confidence: 'Medium',
    summary: 'This opportunity has some positive signs but lacks clarity in key areas. The company appears legitimate, but incomplete information about the role, vague requirements, and limited company details warrant further investigation before applying.',
    extractedClaims: {
      company: 'TechStart Solutions',
      role: 'Software Engineer',
      salary: 'Competitive (not specified)',
      location: 'Remote / Hybrid',
      contactMethod: 'Email application',
      applicationPath: 'Online form',
    },
    redFlags: [
      'Salary not specified ("competitive package")',
      'Vague job responsibilities listed',
      'Company description is minimal',
      'Limited information about team structure',
      'No clear career progression mentioned',
      'Application process not transparent',
    ],
    greenFlags: [
      'Company has official website and LinkedIn presence',
      'Multiple job openings suggest stable hiring',
      'Uses standard application channels',
      'Offers benefits package',
      'Remote work option available',
    ],
    evidence: [
      {
        source: 'Demo fixture: company website',
        snippet: 'Sample company footprint: the demo employer has some public presence but not enough detail to clear all concerns.',
        type: 'Company Info',
        url: undefined,
      },
      {
        source: 'Demo fixture: social proof',
        snippet: 'Sample social proof: a public profile exists, but this fixture is not a fresh live verification.',
        type: 'Social Proof',
        url: undefined,
      },
      {
        source: 'Demo fixture: review signal',
        snippet: 'Sample review signal: mixed employer reputation is represented for the demo only.',
        type: 'Company Reviews',
        url: undefined,
      },
    ],
    alternatives: [],
    nextSteps: [
      'Research the company on Glassdoor and Indeed to read employee reviews',
      'Connect with current/former employees on LinkedIn',
      'Ask specific questions about salary range and role expectations',
      'Request a call with the hiring manager to clarify ambiguities',
      'Compare this offer with similar roles on job boards before applying',
    ],
  },
  safe: {
    verdict: 'safe' as const,
    riskScore: 18,
    confidence: 'High',
    summary: 'This opportunity appears legitimate. The company is well-established with a strong reputation, clear job requirements, transparent salary information, and professional application process. Standard due diligence recommended.',
    extractedClaims: {
      company: 'Microsoft Corporation',
      role: 'Senior Software Engineer',
      salary: '$200,000 - $250,000 + benefits',
      location: 'Seattle, WA (Hybrid)',
      contactMethod: 'LinkedIn Recruiter',
      applicationPath: 'LinkedIn Application Portal',
    },
    redFlags: [],
    greenFlags: [
      'Major established technology company (Fortune 500)',
      'Clear salary transparency',
      'Specific role requirements and responsibilities',
      'Professional recruiter outreach',
      'Uses official company channels',
      'Comprehensive benefits package listed',
      'Multiple offices and team locations',
      'Strong employer reputation',
    ],
    evidence: [
      {
        source: 'Demo fixture: company profile',
        snippet: 'Sample established-company signal for a safe demo report. This is not a fresh live lookup.',
        type: 'Company Info',
        url: undefined,
      },
      {
        source: 'Demo fixture: employer review signal',
        snippet: 'Sample positive employer-review signal for demo presentation only.',
        type: 'Company Reviews',
        url: undefined,
      },
      {
        source: 'Demo fixture: recruiter signal',
        snippet: 'Sample recruiter-channel signal. Live mode should verify the actual recruiter profile before trusting it.',
        type: 'Recruiter Verification',
        url: undefined,
      },
    ],
    alternatives: [],
    nextSteps: [
      'Review the complete job description on the official careers portal',
      'Research the specific team and manager on LinkedIn',
      'Prepare technical interview materials',
      'Connect with current Microsoft employees for insights',
      'Prepare questions about team, projects, and growth opportunities',
    ],
  },
}

export function getFixtureByVerdict(verdict: 'safe' | 'caution' | 'high-risk') {
  switch (verdict) {
    case 'safe':
      return DEMO_FIXTURES.safe
    case 'caution':
      return DEMO_FIXTURES.caution
    case 'high-risk':
      return DEMO_FIXTURES.highRisk
  }
}

export function getAllFixtures() {
  return [DEMO_FIXTURES.highRisk, DEMO_FIXTURES.caution, DEMO_FIXTURES.safe]
}
