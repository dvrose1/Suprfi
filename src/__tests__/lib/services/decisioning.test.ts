import { runDecisioning, generateOffers } from '@/lib/services/decisioning'

describe('Decisioning Service', () => {
  const baseCustomerInfo = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    dateOfBirth: '1990-01-15',
  }

  const basePlaidData = {
    institutionName: 'Chase Bank',
    accountMask: '1234',
    accountType: 'checking',
    balance: {
      current: 5000,
      available: 4500,
    },
    achNumbers: {
      accountNumber: '123456789',
      routingNumber: '021000021',
    },
  }

  describe('runDecisioning', () => {
    it('should approve loan with strong cash reserves', () => {
      const result = runDecisioning({
        loanAmount: 3000,
        plaidData: {
          ...basePlaidData,
          balance: { current: 10000, available: 9500 },
        },
        customerInfo: baseCustomerInfo,
      })

      expect(result.approved).toBe(true)
      expect(result.score).toBeGreaterThanOrEqual(650)
      expect(result.positiveFactors).toContain('Strong cash reserves (50%+ of loan amount)')
    })

    it('should approve loan with moderate reserves', () => {
      const result = runDecisioning({
        loanAmount: 5000,
        plaidData: {
          ...basePlaidData,
          balance: { current: 2000, available: 1800 },
        },
        customerInfo: baseCustomerInfo,
      })

      expect(result.approved).toBe(true)
      expect(result.positiveFactors).toContain('Moderate cash reserves')
    })

    it('should add risk factor for low balance', () => {
      const result = runDecisioning({
        loanAmount: 5000,
        plaidData: {
          ...basePlaidData,
          balance: { current: 400, available: 300 },
        },
        customerInfo: baseCustomerInfo,
      })

      expect(result.riskFactors).toContain('Low cash reserves relative to loan amount')
      expect(result.riskFactors).toContain('Low account balance (<$1k)')
    })

    it('should add positive factor for healthy balance > $10k', () => {
      const result = runDecisioning({
        loanAmount: 3000,
        plaidData: {
          ...basePlaidData,
          balance: { current: 15000, available: 14000 },
        },
        customerInfo: baseCustomerInfo,
      })

      expect(result.positiveFactors).toContain('Healthy account balance (>$10k)')
    })

    it('should add positive factor for verified ACH', () => {
      const result = runDecisioning({
        loanAmount: 3000,
        plaidData: basePlaidData,
        customerInfo: baseCustomerInfo,
      })

      expect(result.positiveFactors).toContain('ACH account verified')
    })

    it('should add positive factor for major bank', () => {
      const result = runDecisioning({
        loanAmount: 3000,
        plaidData: {
          ...basePlaidData,
          institutionName: 'Bank of America',
        },
        customerInfo: baseCustomerInfo,
      })

      expect(result.positiveFactors).toContain('Account at major financial institution')
    })

    describe('manual entry handling', () => {
      it('should apply penalty for manual bank entry', () => {
        const result = runDecisioning({
          loanAmount: 3000,
          plaidData: {
            ...basePlaidData,
            manualEntry: true,
            balance: undefined,
          },
          customerInfo: baseCustomerInfo,
        })

        expect(result.score).toBeLessThan(650) // Base is 650, penalty is -50
        expect(result.riskFactors).toContain('Bank account not verified through Plaid (manual entry)')
      })

      it('should decline manual entry loans over $5000', () => {
        const result = runDecisioning({
          loanAmount: 7000,
          plaidData: {
            ...basePlaidData,
            manualEntry: true,
            balance: undefined,
          },
          customerInfo: baseCustomerInfo,
        })

        expect(result.approved).toBe(false)
        expect(result.riskFactors).toContain('Loan amount exceeds $5,000 threshold for manual bank entry')
        expect(result.decisionReason).toContain('exceeds $5,000 limit')
      })

      it('should approve small manual entry loans', () => {
        const result = runDecisioning({
          loanAmount: 3000,
          plaidData: {
            ...basePlaidData,
            manualEntry: true,
            balance: undefined,
          },
          customerInfo: baseCustomerInfo,
        })

        expect(result.approved).toBe(true)
        expect(result.maxLoanAmount).toBeLessThanOrEqual(5000)
      })
    })

    describe('multi-account analysis', () => {
      it('should consider combined balances across accounts', () => {
        const result = runDecisioning({
          loanAmount: 8000,
          plaidData: {
            ...basePlaidData,
            balance: { current: 3000, available: 2800 },
            allAccounts: [
              { accountId: '1', name: 'Checking', balance: { current: 3000, available: 2800 } },
              { accountId: '2', name: 'Savings', balance: { current: 6000, available: 6000 } },
            ],
          },
          customerInfo: baseCustomerInfo,
        })

        expect(result.positiveFactors).toContain('Combined account balances cover loan amount')
      })
    })

    describe('score boundaries', () => {
      it('should cap score at 850', () => {
        const result = runDecisioning({
          loanAmount: 1000,
          plaidData: {
            ...basePlaidData,
            balance: { current: 100000, available: 99000 },
            achNumbers: { accountNumber: '123', routingNumber: '456' },
            allAccounts: [
              { accountId: '1', name: 'Checking', balance: { current: 100000, available: 99000 } },
            ],
          },
          customerInfo: baseCustomerInfo,
        })

        expect(result.score).toBeLessThanOrEqual(850)
      })

      it('should floor score at 300', () => {
        const result = runDecisioning({
          loanAmount: 50000,
          plaidData: {
            institutionName: 'Unknown Bank',
            accountMask: '0000',
            accountType: 'checking',
            balance: { current: 10, available: 5 },
          },
          customerInfo: baseCustomerInfo,
        })

        expect(result.score).toBeGreaterThanOrEqual(300)
      })
    })

    it('should include dataUsed in result', () => {
      const result = runDecisioning({
        loanAmount: 3000,
        plaidData: basePlaidData,
        customerInfo: baseCustomerInfo,
      })

      expect(result.dataUsed).toHaveProperty('hasBalance')
      expect(result.dataUsed).toHaveProperty('hasAssetReport')
      expect(result.dataUsed.hasBalance).toBe(true)
      expect(result.dataUsed.hasAssetReport).toBe(false)
    })
  })

  describe('generateOffers', () => {
    it('should return empty array if not approved', () => {
      const offers = generateOffers(5000, 550, false)
      expect(offers).toHaveLength(0)
    })

    it('should generate 3 offers when approved', () => {
      const offers = generateOffers(5000, 700, true)
      expect(offers).toHaveLength(3)
    })

    it('should have correct term months: 24, 48, 60', () => {
      const offers = generateOffers(5000, 700, true)
      expect(offers[0].termMonths).toBe(24)
      expect(offers[1].termMonths).toBe(48)
      expect(offers[2].termMonths).toBe(60)
    })

    it('should have lower APR for higher scores', () => {
      const highScoreOffers = generateOffers(5000, 800, true)
      const lowScoreOffers = generateOffers(5000, 650, true)

      expect(highScoreOffers[0].apr).toBeLessThan(lowScoreOffers[0].apr)
      expect(highScoreOffers[1].apr).toBeLessThan(lowScoreOffers[1].apr)
    })

    it('should require down payment for lower scores on 60-month term', () => {
      const lowScoreOffers = generateOffers(5000, 650, true)
      const highScoreOffers = generateOffers(5000, 750, true)

      expect(lowScoreOffers[2].downPayment).toBeGreaterThan(0)
      expect(highScoreOffers[2].downPayment).toBe(0)
    })

    it('should calculate monthly payment correctly', () => {
      const offers = generateOffers(5000, 700, true)
      
      // Each offer should have positive monthly payment
      offers.forEach(offer => {
        expect(offer.monthlyPayment).toBeGreaterThan(0)
      })

      // Shorter term should have higher monthly payment
      expect(offers[0].monthlyPayment).toBeGreaterThan(offers[1].monthlyPayment)
      expect(offers[1].monthlyPayment).toBeGreaterThan(offers[2].monthlyPayment)
    })

    it('should calculate total amount correctly', () => {
      const offers = generateOffers(5000, 700, true)
      
      offers.forEach(offer => {
        const expectedTotal = offer.monthlyPayment * offer.termMonths + offer.downPayment
        expect(offer.totalAmount).toBeCloseTo(expectedTotal, 0)
      })
    })

    it('should have origination fees', () => {
      const offers = generateOffers(5000, 700, true)
      
      // 24-month has 1% fee
      expect(offers[0].originationFee).toBe(50)
      // 48-month has 0.5% fee
      expect(offers[1].originationFee).toBe(25)
      // 60-month has no fee
      expect(offers[2].originationFee).toBe(0)
    })
  })
})
