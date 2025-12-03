/**
 * Decisioning Service
 * 
 * Uses Plaid data (Balance, Assets, Income) to make lending decisions.
 * In production, this would also integrate with credit bureaus.
 */

interface PlaidData {
  accessToken?: string
  itemId?: string
  accountId?: string
  institutionName: string
  accountName?: string
  accountMask: string
  accountType: string
  balance?: {
    current: number | null
    available: number | null
    limit?: number | null
  } | null
  achNumbers?: {
    accountNumber: string
    routingNumber: string
  }
  allAccounts?: Array<{
    accountId: string
    name: string
    balance: {
      current: number | null
      available: number | null
    }
  }> | null
  assetReport?: {
    status: string
    report?: any
  } | null
  // Manual entry flag
  manualEntry?: boolean
  verificationStatus?: string
}

interface DecisionInput {
  loanAmount: number
  plaidData: PlaidData
  customerInfo: {
    firstName: string
    lastName: string
    email: string
    dateOfBirth: string
  }
}

interface DecisionResult {
  approved: boolean
  score: number
  maxLoanAmount: number
  riskFactors: string[]
  positiveFactors: string[]
  decisionReason: string
  dataUsed: {
    hasBalance: boolean
    hasAssetReport: boolean
    accountAge?: number
    avgBalance?: number
    incomeDetected?: number
  }
}

/**
 * Run decisioning based on Plaid data
 */
export function runDecisioning(input: DecisionInput): DecisionResult {
  const { loanAmount, plaidData, customerInfo } = input
  
  let score = 650 // Base score
  const riskFactors: string[] = []
  const positiveFactors: string[] = []
  
  // --- Manual Entry Penalty ---
  // If bank was entered manually (no Plaid verification), apply score penalty
  // and flag for potential manual review
  const isManualEntry = plaidData.manualEntry === true
  
  if (isManualEntry) {
    score -= 50 // Significant penalty for no bank verification
    riskFactors.push('Bank account not verified through Plaid (manual entry)')
    
    // For manual entry, we have ACH details but no balance/transaction data
    // Apply stricter requirements
    if (loanAmount > 5000) {
      riskFactors.push('Loan amount exceeds $5,000 threshold for manual bank entry')
    }
    
    // Skip balance analysis since we don't have the data
    const maxLoanAmount = Math.min(loanAmount, 5000) // Cap at $5k for manual entry
    
    // Decision for manual entry is more conservative
    const approved = score >= 600 && loanAmount <= 5000
    
    let decisionReason = ''
    if (approved) {
      decisionReason = 'Approved with manual bank entry - limited verification'
    } else if (loanAmount > 5000) {
      decisionReason = 'Declined: Loan amount exceeds $5,000 limit for manual bank entry. Please connect your bank through Plaid for larger amounts.'
    } else {
      decisionReason = 'Declined: Insufficient verification data for approval'
    }
    
    return {
      approved,
      score,
      maxLoanAmount,
      riskFactors,
      positiveFactors: isManualEntry ? ['ACH details provided for disbursement'] : [],
      decisionReason,
      dataUsed: {
        hasBalance: false,
        hasAssetReport: false,
      },
    }
  }
  
  // --- Standard Plaid Verification Flow ---
  // --- Balance Analysis ---
  const currentBalance = plaidData.balance?.current || 0
  const availableBalance = plaidData.balance?.available || currentBalance
  
  // Check if balance covers loan amount
  if (availableBalance >= loanAmount * 0.5) {
    score += 30
    positiveFactors.push('Strong cash reserves (50%+ of loan amount)')
  } else if (availableBalance >= loanAmount * 0.25) {
    score += 15
    positiveFactors.push('Moderate cash reserves')
  } else if (availableBalance < loanAmount * 0.1) {
    score -= 20
    riskFactors.push('Low cash reserves relative to loan amount')
  }
  
  // Check absolute balance thresholds
  if (availableBalance >= 10000) {
    score += 20
    positiveFactors.push('Healthy account balance (>$10k)')
  } else if (availableBalance >= 5000) {
    score += 10
    positiveFactors.push('Adequate account balance (>$5k)')
  } else if (availableBalance < 1000) {
    score -= 15
    riskFactors.push('Low account balance (<$1k)')
  }
  
  // --- Multi-Account Analysis ---
  if (plaidData.allAccounts && plaidData.allAccounts.length > 1) {
    const totalBalance = plaidData.allAccounts.reduce(
      (sum, acc) => sum + (acc.balance?.available || acc.balance?.current || 0),
      0
    )
    
    if (totalBalance >= loanAmount) {
      score += 15
      positiveFactors.push('Combined account balances cover loan amount')
    }
  }
  
  // --- Asset Report Analysis (if available) ---
  let avgBalance = 0
  let incomeDetected = 0
  let accountAge = 0
  
  if (plaidData.assetReport?.status === 'ready' && plaidData.assetReport?.report) {
    const report = plaidData.assetReport.report
    
    // Analyze historical balances
    if (report.items?.[0]?.accounts?.[0]?.historicalBalances) {
      const balances = report.items[0].accounts[0].historicalBalances
      avgBalance = balances.reduce((sum: number, b: any) => sum + (b.current || 0), 0) / balances.length
      
      if (avgBalance >= loanAmount * 0.3) {
        score += 25
        positiveFactors.push('Consistent historical balance')
      }
      
      // Check for balance stability (low variance)
      const variance = calculateVariance(balances.map((b: any) => b.current || 0))
      if (variance < avgBalance * 0.3) {
        score += 10
        positiveFactors.push('Stable account balance over time')
      }
    }
    
    // Analyze transactions for income patterns
    if (report.items?.[0]?.accounts?.[0]?.transactions) {
      const transactions = report.items[0].accounts[0].transactions
      const deposits = transactions.filter((t: any) => t.amount < 0) // Plaid uses negative for deposits
      
      // Look for recurring large deposits (likely income)
      const largeDeposits = deposits.filter((t: any) => Math.abs(t.amount) >= 1000)
      if (largeDeposits.length >= 2) {
        incomeDetected = Math.abs(largeDeposits[0]?.amount || 0)
        score += 20
        positiveFactors.push('Regular income deposits detected')
        
        // Check debt-to-income ratio
        const monthlyPaymentEstimate = loanAmount / 48 // Rough 4-year estimate
        if (incomeDetected > 0 && monthlyPaymentEstimate < incomeDetected * 0.3) {
          score += 15
          positiveFactors.push('Good debt-to-income ratio')
        }
      }
    }
    
    // Account age from asset report
    if (report.items?.[0]?.accounts?.[0]?.daysAvailable) {
      accountAge = report.items[0].accounts[0].daysAvailable
      if (accountAge >= 365) {
        score += 15
        positiveFactors.push('Established account (1+ years)')
      } else if (accountAge >= 180) {
        score += 5
        positiveFactors.push('Account age 6+ months')
      } else if (accountAge < 90) {
        score -= 10
        riskFactors.push('New account (<90 days)')
      }
    }
  }
  
  // --- Institution Trust ---
  const majorBanks = ['chase', 'bank of america', 'wells fargo', 'citibank', 'us bank', 'pnc', 'capital one']
  if (majorBanks.some(bank => plaidData.institutionName.toLowerCase().includes(bank))) {
    score += 5
    positiveFactors.push('Account at major financial institution')
  }
  
  // --- ACH Verification ---
  if (plaidData.achNumbers) {
    score += 10
    positiveFactors.push('ACH account verified')
  }
  
  // --- Loan Amount vs Capacity ---
  const estimatedMonthlyCapacity = incomeDetected > 0 ? incomeDetected * 0.25 : availableBalance * 0.1
  const maxAffordablePayment = estimatedMonthlyCapacity
  const maxLoanAmount = maxAffordablePayment * 48 // 4 year term
  
  if (loanAmount > maxLoanAmount * 1.5) {
    score -= 30
    riskFactors.push('Loan amount may exceed repayment capacity')
  }
  
  // --- Final Score Adjustments ---
  // Cap score between 300-850
  score = Math.max(300, Math.min(850, score))
  
  // Decision logic
  // Note: In sandbox/testing, Plaid test accounts have low balances
  // so we're lenient on risk factors. In production, tighten this.
  const approved = score >= 580 && riskFactors.length <= 3
  
  let decisionReason = ''
  if (approved) {
    if (score >= 750) {
      decisionReason = 'Excellent financial profile with strong cash reserves and stable income'
    } else if (score >= 700) {
      decisionReason = 'Good financial profile with adequate reserves'
    } else {
      decisionReason = 'Approved with standard terms based on account analysis'
    }
  } else {
    decisionReason = `Declined: ${riskFactors.slice(0, 2).join(', ')}`
  }
  
  return {
    approved,
    score,
    maxLoanAmount: Math.min(loanAmount * 1.2, maxLoanAmount),
    riskFactors,
    positiveFactors,
    decisionReason,
    dataUsed: {
      hasBalance: !!plaidData.balance,
      hasAssetReport: plaidData.assetReport?.status === 'ready',
      accountAge,
      avgBalance,
      incomeDetected,
    },
  }
}

/**
 * Generate loan offers based on decision
 */
export function generateOffers(
  loanAmount: number,
  score: number,
  approved: boolean
): Array<{
  termMonths: number
  apr: number
  monthlyPayment: number
  downPayment: number
  originationFee: number
  totalAmount: number
}> {
  if (!approved) {
    return []
  }
  
  // APR tiers based on score
  const getApr = (baseApr: number): number => {
    if (score >= 800) return baseApr - 2
    if (score >= 750) return baseApr - 1
    if (score >= 700) return baseApr
    if (score >= 650) return baseApr + 2
    return baseApr + 4
  }
  
  const offers = []
  
  // Offer 1: 24 months
  const apr24 = getApr(8.9)
  offers.push({
    termMonths: 24,
    apr: apr24,
    monthlyPayment: calculateMonthlyPayment(loanAmount, 24, apr24),
    downPayment: 0,
    originationFee: Math.round(loanAmount * 0.01),
    totalAmount: calculateMonthlyPayment(loanAmount, 24, apr24) * 24,
  })
  
  // Offer 2: 48 months
  const apr48 = getApr(11.9)
  offers.push({
    termMonths: 48,
    apr: apr48,
    monthlyPayment: calculateMonthlyPayment(loanAmount, 48, apr48),
    downPayment: 0,
    originationFee: Math.round(loanAmount * 0.005),
    totalAmount: calculateMonthlyPayment(loanAmount, 48, apr48) * 48,
  })
  
  // Offer 3: 60 months
  const apr60 = getApr(13.9)
  const downPayment = score < 700 ? Math.round(loanAmount * 0.1) : 0
  const financedAmount = loanAmount - downPayment
  offers.push({
    termMonths: 60,
    apr: apr60,
    monthlyPayment: calculateMonthlyPayment(financedAmount, 60, apr60),
    downPayment,
    originationFee: 0,
    totalAmount: calculateMonthlyPayment(financedAmount, 60, apr60) * 60 + downPayment,
  })
  
  return offers
}

// Helper functions
function calculateMonthlyPayment(principal: number, months: number, apr: number): number {
  const monthlyRate = apr / 100 / 12
  if (monthlyRate === 0) return principal / months
  const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
  return Math.round(payment * 100) / 100
}

function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2))
  return squaredDiffs.reduce((a, b) => a + b, 0) / values.length
}
