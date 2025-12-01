import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode, DepositoryAccountSubtype } from 'plaid'

// Initialize Plaid client
const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments] || PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
})

export const plaidClient = new PlaidApi(configuration)

/**
 * Create a link_token for Plaid Link initialization
 */
export async function createLinkToken(userId: string, customerName: string) {
  try {
    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: userId,
      },
      client_name: 'SuprFi',
      products: [Products.Auth, Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
      webhook: `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/webhooks/plaid`,
      account_filters: {
        depository: {
          account_subtypes: [DepositoryAccountSubtype.Checking, DepositoryAccountSubtype.Savings],
        },
      },
    })

    return {
      linkToken: response.data.link_token,
      expiration: response.data.expiration,
      requestId: response.data.request_id,
    }
  } catch (error) {
    console.error('Error creating Plaid link token:', error)
    throw new Error('Failed to create Plaid link token')
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
