import '@testing-library/jest-dom'

// Polyfill for fetch API in Node.js
if (typeof Request === 'undefined') {
  global.Request = class Request {
    constructor(input, init = {}) {
      this.url = typeof input === 'string' ? input : input.url
      this.method = init.method || 'GET'
      this.headers = new Map(Object.entries(init.headers || {}))
      this._body = init.body
    }
    async json() {
      return JSON.parse(this._body)
    }
    get(header) {
      return this.headers.get(header)
    }
  }
}

if (typeof Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init = {}) {
      this._body = body
      this.status = init.status || 200
      this.headers = new Map(Object.entries(init.headers || {}))
    }
    async json() {
      return JSON.parse(this._body)
    }
  }
}

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock nanoid (ESM module that Jest can't transform)
jest.mock('nanoid', () => ({
  nanoid: (size = 21) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'
    let result = ''
    for (let i = 0; i < size; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  },
}))

// Mock environment variables for tests
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'

// Suppress console errors in tests (optional - comment out for debugging)
// global.console.error = jest.fn()
