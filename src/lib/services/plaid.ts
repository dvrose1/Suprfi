// ABOUTME: Plaid API client and service functions
// ABOUTME: Handles bank linking, income verification, and identity verification

import { 
  Configuration, 
  PlaidApi, 
  PlaidEnvironments, 
  Products, 
  CountryCode, 
  DepositoryAccountSubtype,
  AssetReportCreateRequest,
  IdentityVerificationCreateRequest,
  CreditBankIncomeGetRequest,
  ConsumerReportPermissiblePurpose,
} from 'plaid'

// Initialize Plaid client
const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments] || PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID!,
      'PLAID-SECRET': process.env.PLAID_SECRET!,
    },
  },
})

export const plaidClient = new PlaidApi(configuration)

// ============================================
// LINK TOKEN CREATION
// ============================================

/**
 * Create a link_token for Plaid Link initialization
 * Products requested:
 * - Auth: Account and routing numbers for ACH
 * - Transactions: Transaction history (required for Assets)
 */
export async function createLinkToken(userId: string, customerName: string) {
  try {
    // Request Auth + Transactions (Transactions enables Asset Reports)
    const products = [Products.Auth, Products.Transactions]
    
    console.log('Creating Plaid link token with:', {
      userId,
      customerName,
      products,
      env: process.env.PLAID_ENV,
    })

    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: userId,
      },
      client_name: 'SuprFi',
      products: products,
      country_codes: [CountryCode.Us],
      language: 'en',
      account_filters: {
        depository: {
          account_subtypes: [DepositoryAccountSubtype.Checking, DepositoryAccountSubtype.Savings],
        },
      },
    })

    console.log('Plaid link token created successfully')

    return {
      linkToken: response.data.link_token,
      expiration: response.data.expiration,
      requestId: response.data.request_id,
    }
  } catch (error: any) {
    console.error('Error creating Plaid link token:', error)
    console.error('Plaid API error:', error?.response?.data)
    throw new Error('Failed to create Plaid link token')
  }
}

/**
 * Create a link_token specifically for Identity Verification
 */
export async function createIdentityVerificationLinkToken(userId: string, templateId: string) {
  try {
    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: userId,
      },
      client_name: 'SuprFi',
      products: [Products.IdentityVerification],
      identity_verification: {
        template_id: templateId,
      },
      country_codes: [CountryCode.Us],
      language: 'en',
      webhook: `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/webhooks/plaid`,
    })

    return {
      linkToken: response.data.link_token,
      expiration: response.data.expiration,
      requestId: response.data.request_id,
    }
  } catch (error) {
    console.error('Error creating IDV link token:', error)
    throw new Error('Failed to create identity verification link token')
  }
}

/**
 * Exchange public_token for access_token
 */
export async function exchangePublicToken(publicToken: string) {
  try {
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    })

    return {
      accessToken: response.data.access_token,
      itemId: response.data.item_id,
      requestId: response.data.request_id,
    }
  } catch (error) {
    console.error('Error exchanging public token:', error)
    throw new Error('Failed to exchange public token')
  }
}

/**
 * Get account and balance information
 */
export async function getAccountInfo(accessToken: string) {
  try {
    const response = await plaidClient.accountsBalanceGet({
      access_token: accessToken,
    })

    return {
      accounts: response.data.accounts.map(account => ({
        accountId: account.account_id,
        name: account.name,
        mask: account.mask,
        type: account.type,
        subtype: account.subtype,
        balance: {
          current: account.balances.current,
          available: account.balances.available,
          limit: account.balances.limit,
          currency: account.balances.iso_currency_code,
        },
      })),
      item: response.data.item,
    }
  } catch (error) {
    console.error('Error getting account info:', error)
    throw new Error('Failed to get account information')
  }
}

/**
 * Get auth information (account and routing numbers)
 */
export async function getAuthInfo(accessToken: string) {
  try {
    const response = await plaidClient.authGet({
      access_token: accessToken,
    })

    return {
      accounts: response.data.accounts.map(account => ({
        accountId: account.account_id,
        name: account.name,
        mask: account.mask,
        type: account.type,
        subtype: account.subtype,
      })),
      numbers: response.data.numbers,
    }
  } catch (error) {
    console.error('Error getting auth info:', error)
    throw new Error('Failed to get auth information')
  }
}

/**
 * Get institution information
 */
export async function getInstitution(institutionId: string) {
  try {
    const response = await plaidClient.institutionsGetById({
      institution_id: institutionId,
      country_codes: [CountryCode.Us],
    })

    return {
      institutionId: response.data.institution.institution_id,
      name: response.data.institution.name,
      logo: response.data.institution.logo,
      primaryColor: response.data.institution.primary_color,
      url: response.data.institution.url,
    }
  } catch (error) {
    console.error('Error getting institution info:', error)
    return null
  }
}

// ============================================
// ASSETS - Bank Statements for Underwriting
// ============================================

/**
 * Create an Asset Report (bank statements for underwriting)
 * @param accessTokens - Array of access tokens from linked accounts
 * @param daysRequested - Number of days of history (default 90)
 */
export async function createAssetReport(accessTokens: string[], daysRequested: number = 90) {
  try {
    const response = await plaidClient.assetReportCreate({
      access_tokens: accessTokens,
      days_requested: daysRequested,
      options: {
        client_report_id: `suprfi-${Date.now()}`,
        webhook: `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/webhooks/plaid`,
        include_fast_report: true, // Get preliminary data faster
      },
    })

    return {
      assetReportToken: response.data.asset_report_token,
      assetReportId: response.data.asset_report_id,
      requestId: response.data.request_id,
    }
  } catch (error) {
    console.error('Error creating asset report:', error)
    throw new Error('Failed to create asset report')
  }
}

/**
 * Get an Asset Report (may need to poll until ready)
 */
export async function getAssetReport(assetReportToken: string) {
  try {
    const response = await plaidClient.assetReportGet({
      asset_report_token: assetReportToken,
      include_insights: true,
    })

    const report = response.data.report
    return {
      assetReportId: report.asset_report_id,
      dateGenerated: report.date_generated,
      daysRequested: report.days_requested,
      items: report.items.map(item => ({
        institutionName: item.institution_name,
        institutionId: item.institution_id,
        accounts: item.accounts.map(account => ({
          accountId: account.account_id,
          name: account.name,
          mask: account.mask,
          type: account.type,
          subtype: account.subtype,
          balances: account.balances,
          transactions: account.transactions,
          daysAvailable: account.days_available,
          historicalBalances: account.historical_balances,
        })),
      })),
      requestId: response.data.request_id,
    }
  } catch (error: any) {
    // Check if report is not ready yet
    if (error?.response?.data?.error_code === 'PRODUCT_NOT_READY') {
      return { status: 'pending', message: 'Asset report is still being generated' }
    }
    console.error('Error getting asset report:', error)
    throw new Error('Failed to get asset report')
  }
}

/**
 * Get Asset Report as PDF
 */
export async function getAssetReportPdf(assetReportToken: string) {
  try {
    const response = await plaidClient.assetReportPdfGet({
      asset_report_token: assetReportToken,
    })

    return {
      pdf: response.data, // Buffer containing PDF
      requestId: response.headers['plaid-request-id'],
    }
  } catch (error) {
    console.error('Error getting asset report PDF:', error)
    throw new Error('Failed to get asset report PDF')
  }
}

// ============================================
// INCOME - Payroll & Bank Income Verification
// ============================================

/**
 * Get bank income data (from transaction analysis)
 */
export async function getBankIncome(userToken: string) {
  try {
    const response = await plaidClient.creditBankIncomeGet({
      user_token: userToken,
    })

    return {
      bankIncome: response.data.bank_income?.map(income => ({
        bankIncomeId: income.bank_income_id,
        generatedTime: income.generated_time,
        daysRequested: income.days_requested,
        items: income.items?.map(item => ({
          institutionName: item.institution_name,
          institutionId: item.institution_id,
          bankIncomeSources: item.bank_income_sources?.map(source => ({
            accountId: source.account_id,
            incomeSourceId: source.income_source_id,
            incomeDescription: source.income_description,
            incomeCategory: source.income_category,
            totalAmount: source.total_amount,
            transactionCount: source.transaction_count,
            startDate: source.start_date,
            endDate: source.end_date,
            payFrequency: source.pay_frequency,
          })),
        })),
        bankIncomeSummary: income.bank_income_summary,
      })),
      requestId: response.data.request_id,
    }
  } catch (error) {
    console.error('Error getting bank income:', error)
    throw new Error('Failed to get bank income data')
  }
}

/**
 * Get payroll income data (direct from payroll provider)
 */
export async function getPayrollIncome(userToken: string) {
  try {
    const response = await plaidClient.creditPayrollIncomeGet({
      user_token: userToken,
    })

    return {
      items: response.data.items?.map(item => ({
        itemId: item.item_id,
        institutionName: item.institution_name,
        payrollIncome: item.payroll_income?.map(income => ({
          accountId: income.account_id,
          payStubs: income.pay_stubs?.map(stub => ({
            payPeriodStart: stub.pay_period_details?.start_date,
            payPeriodEnd: stub.pay_period_details?.end_date,
            payDate: stub.pay_period_details?.pay_date,
            grossEarnings: stub.pay_period_details?.gross_earnings,
            netPay: stub.net_pay?.current_amount,
            employer: stub.employer?.name,
            employee: stub.employee?.name,
          })),
          w2s: income.w2s?.map(w2 => ({
            employer: w2.employer?.name,
            taxYear: w2.tax_year,
            wagesTipsOtherComp: w2.wages_tips_other_comp,
            federalIncomeTaxWithheld: w2.federal_income_tax_withheld,
          })),
        })),
      })),
      requestId: response.data.request_id,
    }
  } catch (error) {
    console.error('Error getting payroll income:', error)
    throw new Error('Failed to get payroll income data')
  }
}

// ============================================
// CONSUMER REPORT - Credit Check (replaces Experian)
// ============================================

/**
 * Create a Consumer Report (CRA Check Report - credit check with cash flow data)
 * This is a soft pull and FCRA compliant
 * @param userToken - Plaid user token from link session
 * @param daysRequested - Number of days of history (default 365)
 */
export async function createConsumerReport(userToken: string, daysRequested: number = 365) {
  try {
    const response = await plaidClient.craCheckReportCreate({
      user_token: userToken,
      webhook: `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/webhooks/plaid`,
      days_requested: daysRequested,
      consumer_report_permissible_purpose: ConsumerReportPermissiblePurpose.AccountReviewCredit,
    })

    return {
      checkReportId: response.data.request_id,
      requestId: response.data.request_id,
    }
  } catch (error) {
    console.error('Error creating consumer report:', error)
    throw new Error('Failed to create consumer report')
  }
}

/**
 * Get Consumer Report Base Report (credit + cash flow analysis)
 */
export async function getConsumerReport(userToken: string) {
  try {
    const response = await plaidClient.craCheckReportBaseReportGet({
      user_token: userToken,
    })

    return {
      report: response.data.report,
      requestId: response.data.request_id,
    }
  } catch (error: any) {
    if (error?.response?.data?.error_code === 'PRODUCT_NOT_READY') {
      return { status: 'pending', message: 'Consumer report is still being generated' }
    }
    console.error('Error getting consumer report:', error)
    throw new Error('Failed to get consumer report')
  }
}

// ============================================
// IDENTITY VERIFICATION - KYC (replaces Persona)
// ============================================

/**
 * Create Identity Verification session
 */
export async function createIdentityVerification(
  userId: string,
  templateId: string,
  userData?: {
    email?: string
    phone?: string
    dateOfBirth?: string
    name?: { firstName?: string; lastName?: string }
    address?: {
      street?: string
      city?: string
      region?: string
      postalCode?: string
      country?: string
    }
  }
) {
  try {
    // Build user object only if we have complete name data
    let userObj = undefined
    if (userData?.name?.firstName && userData?.name?.lastName) {
      userObj = {
        name: {
          given_name: userData.name.firstName,
          family_name: userData.name.lastName,
        },
        ...(userData.address?.street && userData.address?.city && {
          address: {
            street: userData.address.street,
            city: userData.address.city,
            region: userData.address.region || '',
            postal_code: userData.address.postalCode || '',
            country: userData.address.country || 'US',
          },
        }),
      }
    }

    const response = await plaidClient.identityVerificationCreate({
      client_user_id: userId,
      template_id: templateId,
      is_shareable: true,
      gave_consent: true,
      ...(userData?.email && { email: userData.email }),
      ...(userData?.phone && { phone_number: userData.phone }),
      ...(userData?.dateOfBirth && { date_of_birth: userData.dateOfBirth }),
      ...(userObj && { user: userObj }),
    })

    return {
      id: response.data.id,
      status: response.data.status,
      shareableUrl: response.data.shareable_url,
      requestId: response.data.request_id,
    }
  } catch (error) {
    console.error('Error creating identity verification:', error)
    throw new Error('Failed to create identity verification')
  }
}

/**
 * Get Identity Verification status and results
 */
export async function getIdentityVerification(identityVerificationId: string) {
  try {
    const response = await plaidClient.identityVerificationGet({
      identity_verification_id: identityVerificationId,
    })

    const data = response.data
    return {
      id: data.id,
      status: data.status, // 'success', 'failed', 'pending_review', 'canceled', 'expired'
      createdAt: data.created_at,
      completedAt: data.completed_at,
      user: data.user ? {
        name: data.user.name,
        dateOfBirth: data.user.date_of_birth,
        address: data.user.address,
        email: data.user.email_address,
        phone: data.user.phone_number,
        idNumber: data.user.id_number,
      } : null,
      documentaryVerification: data.documentary_verification ? {
        status: data.documentary_verification.status,
        documents: data.documentary_verification.documents,
      } : null,
      selfieCheck: data.selfie_check ? {
        status: data.selfie_check.status,
        selfies: data.selfie_check.selfies,
      } : null,
      kycCheck: data.kyc_check ? {
        status: data.kyc_check.status,
        address: data.kyc_check.address,
        name: data.kyc_check.name,
        dateOfBirth: data.kyc_check.date_of_birth,
        idNumber: data.kyc_check.id_number,
        phoneNumber: data.kyc_check.phone_number,
      } : null,
      riskCheck: data.risk_check,
      watchlistScreeningId: data.watchlist_screening_id,
      requestId: response.data.request_id,
    }
  } catch (error) {
    console.error('Error getting identity verification:', error)
    throw new Error('Failed to get identity verification')
  }
}

/**
 * Retry a failed Identity Verification
 */
export async function retryIdentityVerification(
  userId: string,
  templateId: string,
  previousVerificationId: string
) {
  try {
    const response = await plaidClient.identityVerificationRetry({
      client_user_id: userId,
      template_id: templateId,
      strategy: 'reset' as any, // Start fresh - cast to any for type compatibility
    })

    return {
      id: response.data.id,
      status: response.data.status,
      shareableUrl: response.data.shareable_url,
      requestId: response.data.request_id,
    }
  } catch (error) {
    console.error('Error retrying identity verification:', error)
    throw new Error('Failed to retry identity verification')
  }
}

// ============================================
// BALANCE - Real-time Balance Checks
// ============================================

/**
 * Get real-time balance (for pre-ACH checks)
 */
export async function getRealTimeBalance(accessToken: string, accountIds?: string[]) {
  try {
    const response = await plaidClient.accountsBalanceGet({
      access_token: accessToken,
      options: {
        ...(accountIds && { account_ids: accountIds }),
      },
    })

    return {
      accounts: response.data.accounts.map(account => ({
        accountId: account.account_id,
        name: account.name,
        mask: account.mask,
        type: account.type,
        subtype: account.subtype,
        balances: {
          available: account.balances.available,
          current: account.balances.current,
          limit: account.balances.limit,
          currency: account.balances.iso_currency_code,
          lastUpdated: account.balances.last_updated_datetime,
        },
      })),
      item: response.data.item,
      requestId: response.data.request_id,
    }
  } catch (error) {
    console.error('Error getting real-time balance:', error)
    throw new Error('Failed to get real-time balance')
  }
}
