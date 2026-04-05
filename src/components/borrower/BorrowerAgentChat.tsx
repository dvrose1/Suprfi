'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlaidLink } from 'react-plaid-link'
import type { FormData } from './ApplicationForm'
import { ChatOfferCard, ChatAgreementCard, ChatSuccessCard } from './chat'
import type { ChatOffer } from './chat'

interface Message {
  id: string
  role: 'assistant' | 'user'
  content: string
  timestamp: Date
  phase?: ChatPhase // Track which phase this message was sent in
}

interface BorrowerAgentChatProps {
  customer: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    addressLine1?: string | null
    city?: string | null
    state?: string | null
    postalCode?: string | null
  }
  job: {
    id: string
    estimateAmount: number
    serviceType?: string | null
  }
  applicationId: string
  token: string
  onSwitchToForm: () => void
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
}

type PendingAction = 'plaid_link' | 'kyc_verify' | 'submit' | null
type ChatPhase = 'collection' | 'offers' | 'agreement' | 'success'

// Helper to detect if input looks like an SSN (not a date)
const looksLikeSSN = (value: string): boolean => {
  // If it contains slashes, it's probably a date (MM/DD/YYYY)
  if (value.includes('/')) return false
  
  // If it contains letters, it's not an SSN
  if (/[a-zA-Z]/.test(value)) return false
  
  const digitsOnly = value.replace(/\D/g, '')
  
  // SSN is exactly 9 digits - only trigger masking when we have 4+ digits
  // and the pattern looks like SSN (just digits and possibly dashes)
  // Dates typically have slashes, dots, or are written with month names
  
  // Check if it's in SSN format: digits with optional dashes in SSN positions
  const ssnPattern = /^\d{3}-?\d{0,2}-?\d{0,4}$/
  
  return digitsOnly.length >= 4 && ssnPattern.test(value.trim())
}

// Format SSN with dashes: 123-45-6789
const formatSSN = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 9)
  if (digits.length <= 3) return digits
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`
}

// Mask SSN for display: show dots with same format as real SSN
const maskSSNDisplay = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 9)
  const dot = '\u2022'
  if (digits.length <= 3) return dot.repeat(digits.length)
  if (digits.length <= 5) return `${dot.repeat(3)}-${dot.repeat(digits.length - 3)}`
  return `${dot.repeat(3)}-${dot.repeat(2)}-${dot.repeat(digits.length - 5)}`
}

// Mask SSN in any text (for displaying in chat messages)
const maskSSNInText = (text: string): string => {
  // Match SSN patterns: 123-45-6789 or 123456789
  return text.replace(/\b(\d{3})-?(\d{2})-?(\d{4})\b/g, '\u2022\u2022\u2022-\u2022\u2022-\u2022\u2022\u2022\u2022')
}



export function BorrowerAgentChat({
  customer,
  job,
  applicationId,
  token,
  onSwitchToForm,
  formData,
  updateFormData,
}: BorrowerAgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [actualInputValue, setActualInputValue] = useState('') // Store actual value for SSN
  const [isSSNInput, setIsSSNInput] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)
  const [plaidLinkToken, setPlaidLinkToken] = useState<string | null>(null)
  const [plaidLoading, setPlaidLoading] = useState(false)
  const [kycLoading, setKycLoading] = useState(false)
  const [actionInProgress, setActionInProgress] = useState(false)
  const [showPlaidInline, setShowPlaidInline] = useState(false)
  const [showPersonaInline, setShowPersonaInline] = useState(false)
  const [personaInquiryUrl, setPersonaInquiryUrl] = useState<string | null>(null)
  const [isMockMode, setIsMockMode] = useState(false)
  
  // Phase management for full in-chat flow
  const [chatPhase, setChatPhase] = useState<ChatPhase>('collection')
  const [offers, setOffers] = useState<ChatOffer[]>([])
  const [selectedOffer, setSelectedOffer] = useState<ChatOffer | null>(null)
  const [isSelectingOffer, setIsSelectingOffer] = useState(false)
  const [isSigning, setIsSigning] = useState(false)
  const [confirmationNumber, setConfirmationNumber] = useState<string>('')
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const plaidContainerRef = useRef<HTMLDivElement>(null)
  const formDataRef = useRef(formData)
  const messagesRef = useRef(messages)



  // Keep refs in sync
  useEffect(() => {
    formDataRef.current = formData
  }, [formData])

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  // Refined easing curves
  const easeOutQuart: [number, number, number, number] = [0.25, 1, 0.5, 1]
  const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1]

  // Fetch Plaid link token on mount and detect mock mode
  useEffect(() => {
    async function fetchPlaidToken() {
      try {
        const response = await fetch(`/api/v1/borrower/${token}/plaid/link-token`, {
          method: 'POST',
        })
        if (response.ok) {
          const data = await response.json()
          if (data.mockMode) {
            setPlaidLinkToken('mock')
            setIsMockMode(true)
          } else {
            setPlaidLinkToken(data.linkToken)
          }
        } else {
          // API failed, use mock mode
          setPlaidLinkToken('mock')
          setIsMockMode(true)
        }
      } catch (err) {
        console.error('Error fetching Plaid token, using mock mode:', err)
        setPlaidLinkToken('mock')
        setIsMockMode(true)
      }
    }
    fetchPlaidToken()
  }, [token])

  // Plaid Link success handler
  const onPlaidSuccess = useCallback(async (publicToken: string, metadata: Parameters<typeof usePlaidLink>[0]['onSuccess'] extends (token: string, meta: infer M) => void ? M : never) => {
    setPlaidLoading(true)
    setActionInProgress(true)
    try {
      const response = await fetch(`/api/v1/borrower/${token}/plaid/exchange`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicToken, metadata }),
      })
      
      if (response.ok) {
        const data = await response.json()
        const bankInfo = {
          plaidAccessToken: 'connected',
          plaidAccountId: metadata.accounts?.[0]?.id,
          bankName: data.bankName || 'Bank',
          accountMask: data.accountMask || '****',
        }
        updateFormData(bankInfo)
        setPendingAction(null)
        setPlaidLoading(false)
        
        // Send confirmation with updated formData
        await sendMessageInternal(`I've connected my ${bankInfo.bankName} account ending in ${bankInfo.accountMask}`, bankInfo)
      }
    } catch (err) {
      console.error('Plaid exchange error:', err)
      await sendMessageInternal("I had trouble connecting my bank. Can we try again?")
      setPlaidLoading(false)
    } finally {
      setActionInProgress(false)
    }
  }, [token, updateFormData])

  // Plaid Link hook
  const { open: openPlaid, ready: plaidReady } = usePlaidLink({
    token: plaidLinkToken !== 'mock' ? plaidLinkToken : null,
    onSuccess: onPlaidSuccess,
    onExit: () => {
      setPendingAction(null)
      setActionInProgress(false)
    },
  })

  // Handle mock Plaid connection
  const handleMockPlaid = useCallback(async () => {
    setPlaidLoading(true)
    setActionInProgress(true)
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const bankInfo = {
      plaidAccessToken: 'mock_connected',
      plaidAccountId: 'mock_account_123',
      bankName: 'Chase Bank',
      accountMask: '4567',
    }
    updateFormData(bankInfo)
    setPendingAction(null)
    setPlaidLoading(false)
    
    // Send confirmation with updated formData
    await sendMessageInternal(`I've connected my ${bankInfo.bankName} account ending in ${bankInfo.accountMask}`, bankInfo)
    setActionInProgress(false)
  }, [updateFormData])

  // Handle KYC start
  const handleStartKYC = useCallback(async () => {
    setKycLoading(true)
    setActionInProgress(true)
    
    const kycInfo = {
      personaInquiryId: 'mock_inquiry_' + Date.now(),
      kycStatus: 'completed',
    }
    
    try {
      const response = await fetch(`/api/v1/borrower/${token}/persona/create-inquiry`, {
        method: 'POST',
      })
      
      if (response.ok) {
        const data = await response.json()
        kycInfo.personaInquiryId = data.inquiryId || kycInfo.personaInquiryId
      }
    } catch (err) {
      console.error('KYC error:', err)
    }
    
    // Always update and continue (mock for demo)
    updateFormData(kycInfo)
    setPendingAction(null)
    setKycLoading(false)
    
    // Send confirmation with updated formData
    await sendMessageInternal("I've completed the identity verification", kycInfo)
    setActionInProgress(false)
  }, [token, updateFormData])

  // Generate offers based on loan amount
  const generateOffers = useCallback((loanAmount: number): ChatOffer[] => {
    // Option 1: BNPL - 6 weeks, biweekly payments
    const bnpl6Week: ChatOffer = {
      id: 'bnpl-6-week',
      type: 'bnpl',
      name: 'Pay in 4',
      termWeeks: 6,
      paymentFrequency: 'biweekly',
      apr: 0,
      originationFee: 0,
      downPaymentPercent: 25,
      downPaymentAmount: loanAmount * 0.25,
      installmentAmount: loanAmount * 0.25,
      numberOfPayments: 3,
      totalAmount: loanAmount,
      loanAmount: loanAmount,
    }

    // Option 2: BNPL - 3 months, monthly
    const bnpl3Month: ChatOffer = {
      id: 'bnpl-3-month',
      type: 'bnpl',
      name: 'Pay in 4 Monthly',
      termMonths: 3,
      paymentFrequency: 'monthly',
      apr: 0,
      originationFee: 0,
      downPaymentPercent: 25,
      downPaymentAmount: loanAmount * 0.25,
      installmentAmount: loanAmount * 0.25,
      numberOfPayments: 3,
      totalAmount: loanAmount,
      loanAmount: loanAmount,
    }

    // Option 3: Installment - 6 months, 14.99% APR
    const monthlyRate = 0.1499 / 12
    const numPayments = 6
    const monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                           (Math.pow(1 + monthlyRate, numPayments) - 1)
    const totalWithInterest = monthlyPayment * numPayments

    const installment6Month: ChatOffer = {
      id: 'installment-6-month',
      type: 'installment',
      name: '6 Month Plan',
      termMonths: 6,
      paymentFrequency: 'monthly',
      apr: 14.99,
      originationFee: 0,
      downPaymentPercent: 0,
      downPaymentAmount: 0,
      installmentAmount: monthlyPayment,
      numberOfPayments: 6,
      totalAmount: totalWithInterest,
      loanAmount: loanAmount,
    }

    return [bnpl6Week, bnpl3Month, installment6Month]
  }, [])

  // Handle application submission - now shows offers in chat
  const handleSubmitApplication = useCallback(async () => {
    setActionInProgress(true)
    try {
      // When submit is triggered, user has already confirmed consent in chat
      // So we ensure consents are set (agent should have set these but may not always)
      const currentFormData = {
        ...formDataRef.current,
        creditCheckConsent: true,
        termsAccepted: true,
        eSignConsent: true,
      }
      
      // Update the ref with consents for consistency
      formDataRef.current = currentFormData
      
      // Log full form data for debugging
      console.log('Submitting application with full data:', JSON.stringify(currentFormData, null, 2))
      
      // Check for all required fields before submitting
      const missingFields: string[] = []
      if (!currentFormData.firstName) missingFields.push('firstName')
      if (!currentFormData.lastName) missingFields.push('lastName')
      if (!currentFormData.email) missingFields.push('email')
      if (!currentFormData.phone) missingFields.push('phone')
      if (!currentFormData.addressLine1) missingFields.push('address')
      if (!currentFormData.city) missingFields.push('city')
      if (!currentFormData.state) missingFields.push('state')
      if (!currentFormData.postalCode) missingFields.push('postalCode')
      if (!currentFormData.dateOfBirth) missingFields.push('dateOfBirth')
      if (!currentFormData.ssn) missingFields.push('ssn')
      if (!currentFormData.creditCheckConsent) missingFields.push('creditCheckConsent')
      if (!currentFormData.termsAccepted) missingFields.push('termsAccepted')
      if (!currentFormData.eSignConsent) missingFields.push('eSignConsent')
      
      if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields)
        setMessages(prev => [...prev, {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `I'm missing some information: ${missingFields.join(', ')}. Let me collect that first.`,
          timestamp: new Date(),
          phase: chatPhase,
        }])
        setPendingAction(null)
        setActionInProgress(false)
        return
      }
      
      const response = await fetch(`/api/v1/borrower/${token}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentFormData),
      })
      
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        console.error('Submit failed:', result)
        throw new Error(result.error || 'Submission failed')
      }
      
      // Generate offers and show in chat
      const generatedOffers = generateOffers(job.estimateAmount)
      setOffers(generatedOffers)
      setChatPhase('offers')
      setPendingAction(null)
      setActionInProgress(false)
      
    } catch (err) {
      console.error('Submit error:', err)
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "I encountered an issue submitting your application. Please try again or switch to the form view.",
        timestamp: new Date(),
      }])
      setPendingAction(null)
      setActionInProgress(false)
    }
  }, [token, job.estimateAmount, generateOffers])

  // Handle offer selection
  const handleSelectOffer = useCallback(async (offer: ChatOffer) => {
    setIsSelectingOffer(true)
    setSelectedOffer(offer)
    
    try {
      const response = await fetch(`/api/v1/borrower/${token}/offers/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          offerId: offer.id,
          offerDetails: offer
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to select offer')
      }
      
      // Move to agreement phase
      setChatPhase('agreement')
    } catch (err) {
      console.error('Offer selection error:', err)
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "I had trouble selecting that plan. Please try again.",
        timestamp: new Date(),
      }])
    } finally {
      setIsSelectingOffer(false)
    }
  }, [token])

  // Handle agreement signing
  const handleSignAgreement = useCallback(async (signature: string, consents: { reviewedTerms: boolean; agreeToPayments: boolean; electronicSignature: boolean; signedAt?: string }) => {
    if (!selectedOffer) return
    
    setIsSigning(true)
    
    try {
      const response = await fetch(`/api/v1/borrower/${token}/agreement/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerId: selectedOffer.id,
          signature,
          consents,
        }),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to sign agreement')
      }
      
      // Generate confirmation number and show success
      const confNum = `SUP-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      setConfirmationNumber(confNum)
      setChatPhase('success')
      
    } catch (err) {
      console.error('Signing error:', err)
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "I had trouble processing your signature. Please try again.",
        timestamp: new Date(),
      }])
    } finally {
      setIsSigning(false)
    }
  }, [token, selectedOffer])

  // Execute pending action
  useEffect(() => {
    if (pendingAction && !actionInProgress) {
      if (pendingAction === 'plaid_link') {
        setActionInProgress(true)
        if (plaidLinkToken === 'mock') {
          handleMockPlaid()
        } else if (plaidReady) {
          openPlaid()
        }
      } else if (pendingAction === 'kyc_verify') {
        handleStartKYC()
      } else if (pendingAction === 'submit') {
        handleSubmitApplication()
      }
    }
  }, [pendingAction, actionInProgress, plaidLinkToken, plaidReady, openPlaid, handleMockPlaid, handleStartKYC, handleSubmitApplication])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Initialize conversation
  useEffect(() => {
    const initChat = async () => {
      setIsTyping(true)
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const hasAddress = customer.addressLine1 && customer.city && customer.state && customer.postalCode
      
      const addressQuestion = hasAddress
        ? `Is your current address ${customer.addressLine1}, ${customer.city}, ${customer.state} ${customer.postalCode}?`
        : `To get started, what's your current home address?`
      
      const greeting: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Hi ${customer.firstName}! I'm here to help you apply for financing for your ${job.serviceType || 'home service'} project. The total is $${job.estimateAmount.toLocaleString()}.

I'll guide you through a few quick questions. You can ask me anything along the way.

${addressQuestion}`,
        timestamp: new Date(),
      }
      
      setIsTyping(false)
      setMessages([greeting])
    }
    
    initChat()
  }, [customer, job])

  // Internal send message (doesn't check actionInProgress)
  // Pass updatedFormData when calling after a state update to ensure latest data is sent
  const sendMessageInternal = async (content: string, updatedFormData?: Partial<FormData>) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
      phase: chatPhase,
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)
    setIsTyping(true)

    try {
      // Use refs for latest state, merge with any updates passed in
      const currentMessages = [...messagesRef.current, userMessage]
      const currentFormData = { ...formDataRef.current, ...updatedFormData }
      
      const response = await fetch(`/api/v1/borrower/${token}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: currentMessages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          formData: currentFormData,
          applicationId,
        }),
      })

      if (!response.ok) throw new Error('Chat request failed')

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response stream')

      let assistantContent = ''
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        phase: chatPhase,
      }

      setMessages(prev => [...prev, assistantMessage])
      setIsTyping(false)

      const decoder = new TextDecoder()
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            
            try {
              const parsed = JSON.parse(data)
              
              if (parsed.text) {
                assistantContent += parsed.text
                setMessages(prev => 
                  prev.map(m => 
                    m.id === assistantMessage.id 
                      ? { ...m, content: assistantContent }
                      : m
                  )
                )
              }
              
              if (parsed.action && !actionInProgress) {
                setPendingAction(parsed.action)
              }
              
              if (parsed.fieldUpdate) {
                console.log('Field update received:', parsed.fieldUpdate)
                updateFormData(parsed.fieldUpdate)
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "I encountered an issue. You can try again or switch to the form view.",
        timestamp: new Date(),
      }])
    } finally {
      setIsLoading(false)
      setIsTyping(false)
      inputRef.current?.focus()
    }
  }

  // Public send message
  const sendMessage = async (content: string) => {
    if (actionInProgress || isLoading) return
    await sendMessageInternal(content)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      // Use actual value if we're in SSN mode
      const valueToSend = isSSNInput ? actualInputValue : inputValue
      sendMessage(valueToSend)
      setIsSSNInput(false)
      setActualInputValue('')
    }
  }

  // Handle input changes with SSN detection
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    
    // If already in SSN mode, continue masking
    if (isSSNInput) {
      // User is continuing to type SSN - extract digits from what they're adding
      // Since display is masked, we need to track actual value separately
      const newChar = newValue.slice(-1)
      
      // If backspace (new value shorter than masked display)
      if (newValue.length < inputValue.length) {
        const newActual = actualInputValue.slice(0, -1)
        if (newActual.length < 4) {
          // Exit SSN mode if less than 4 digits
          setIsSSNInput(false)
          setActualInputValue('')
          setInputValue(newActual)
        } else {
          setActualInputValue(newActual)
          setInputValue(maskSSNDisplay(newActual))
        }
        return
      }
      
      // Only accept digits
      if (/\d/.test(newChar)) {
        const newActual = actualInputValue + newChar
        if (newActual.replace(/\D/g, '').length <= 9) {
          setActualInputValue(formatSSN(newActual))
          setInputValue(maskSSNDisplay(newActual))
        }
      }
      return
    }
    
    // Check if this looks like SSN input (user typing digits that could be SSN)
    if (looksLikeSSN(newValue) && newValue.length <= 11) {
      setIsSSNInput(true)
      const formatted = formatSSN(newValue)
      setActualInputValue(formatted)
      setInputValue(maskSSNDisplay(newValue))
    } else {
      setIsSSNInput(false)
      setActualInputValue('')
      setInputValue(newValue)
    }
  }

  // Show action cards only when there's a pending action and not in progress
  const showPlaidCard = pendingAction === 'plaid_link' && !actionInProgress && !plaidLoading
  const showKYCCard = pendingAction === 'kyc_verify' && !actionInProgress && !kycLoading

  return (
    <motion.div 
      className="flex flex-col h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-lg overflow-hidden border border-navy/5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easeOutExpo }}
    >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy/5 bg-navy/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-navy text-[15px]">SuprFi Assistant</h3>
              <p className="text-xs text-navy/50">Here to help with your application</p>
            </div>
          </div>
          <button
            onClick={onSwitchToForm}
            className="text-sm text-navy/60 hover:text-teal transition-colors duration-200 flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Switch to form
          </button>
        </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
        {/* Collection phase messages */}
        <AnimatePresence initial={false}>
          {messages.filter(m => !m.phase || m.phase === 'collection').map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: easeOutQuart }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-teal text-white rounded-2xl rounded-br-sm'
                    : 'bg-navy/[0.04] text-navy rounded-2xl rounded-bl-sm'
                }`}
              >
                <p className="text-[14px] leading-relaxed whitespace-pre-wrap">
                  {message.role === 'user' ? maskSSNInText(message.content) : message.content}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-navy/[0.04] rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-2 h-2 bg-navy/30 rounded-full"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading indicator for actions */}
        {(plaidLoading || kycLoading) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center py-4"
          >
            <div className="flex items-center gap-2 text-navy/60 text-sm">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {plaidLoading ? 'Connecting bank...' : 'Verifying identity...'}
            </div>
          </motion.div>
        )}

        {/* Plaid Card - only show if action is pending and not in progress */}
        {showPlaidCard && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-navy/10 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-11 h-11 rounded-xl bg-teal/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <p className="text-[15px] font-medium text-navy">Connect your bank</p>
                <p className="text-sm text-navy/50">256-bit encryption. Credentials never stored.</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (plaidLinkToken === 'mock') {
                  handleMockPlaid()
                } else if (plaidReady) {
                  setActionInProgress(true)
                  openPlaid()
                }
              }}
              disabled={!plaidReady && plaidLinkToken !== 'mock'}
              className="w-full py-3 bg-teal text-white rounded-xl font-medium hover:bg-teal/90 disabled:opacity-40 transition-colors"
            >
              Connect Bank Account
            </button>
            <button
              onClick={() => {
                setPendingAction(null)
                sendMessageInternal("I'd prefer to enter my bank details manually")
              }}
              className="w-full mt-2 py-2 text-sm text-navy/40 hover:text-navy/60 transition-colors"
            >
              Enter manually instead
            </button>
          </motion.div>
        )}

        {/* KYC Card */}
        {showKYCCard && chatPhase === 'collection' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-navy/10 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-11 h-11 rounded-xl bg-mint/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-mint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="text-[15px] font-medium text-navy">Verify your identity</p>
                <p className="text-sm text-navy/50">Quick photo ID check. About 2 minutes.</p>
              </div>
            </div>
            <button
              onClick={handleStartKYC}
              className="w-full py-3 bg-mint text-white rounded-xl font-medium hover:bg-mint/90 transition-colors"
            >
              Verify My Identity
            </button>
            <button
              onClick={() => {
                setPendingAction(null)
                sendMessageInternal("I'll do the identity verification later")
              }}
              className="w-full mt-2 py-2 text-sm text-navy/40 hover:text-navy/60 transition-colors"
            >
              Do this later
            </button>
          </motion.div>
        )}

        {/* Offers Phase - Show offer cards */}
        {(chatPhase === 'offers' || chatPhase === 'agreement' || chatPhase === 'success') && offers.length > 0 && (
          <ChatOfferCard
            offers={offers}
            onSelectOffer={handleSelectOffer}
            selectedOfferId={selectedOffer?.id}
            isSelecting={isSelectingOffer}
            customerName={customer.firstName}
          />
        )}

        {/* Messages sent during offers phase - shown after offer card */}
        <AnimatePresence initial={false}>
          {messages.filter(m => m.phase === 'offers').map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: easeOutQuart }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-teal text-white rounded-2xl rounded-br-sm'
                    : 'bg-navy/[0.04] text-navy rounded-2xl rounded-bl-sm'
                }`}
              >
                <p className="text-[14px] leading-relaxed whitespace-pre-wrap">
                  {message.role === 'user' ? maskSSNInText(message.content) : message.content}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Agreement Phase - Show agreement card */}
        {(chatPhase === 'agreement' || chatPhase === 'success') && selectedOffer && (
          <ChatAgreementCard
            offer={selectedOffer}
            customer={{
              firstName: customer.firstName,
              lastName: customer.lastName,
              email: customer.email,
              addressLine1: formData.addressLine1,
              city: formData.city,
              state: formData.state,
              postalCode: formData.postalCode,
            }}
            onSign={handleSignAgreement}
            isSigning={isSigning}
          />
        )}

        {/* Messages sent during agreement phase - shown after agreement card */}
        <AnimatePresence initial={false}>
          {messages.filter(m => m.phase === 'agreement').map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: easeOutQuart }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-teal text-white rounded-2xl rounded-br-sm'
                    : 'bg-navy/[0.04] text-navy rounded-2xl rounded-bl-sm'
                }`}
              >
                <p className="text-[14px] leading-relaxed whitespace-pre-wrap">
                  {message.role === 'user' ? maskSSNInText(message.content) : message.content}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Success Phase - Show success card */}
        {chatPhase === 'success' && selectedOffer && (
          <ChatSuccessCard
            offer={selectedOffer}
            customerEmail={customer.email}
            confirmationNumber={confirmationNumber}
          />
        )}

        {/* Messages sent during success phase - shown after success card */}
        <AnimatePresence initial={false}>
          {messages.filter(m => m.phase === 'success').map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: easeOutQuart }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-teal text-white rounded-2xl rounded-br-sm'
                    : 'bg-navy/[0.04] text-navy rounded-2xl rounded-bl-sm'
                }`}
              >
                <p className="text-[14px] leading-relaxed whitespace-pre-wrap">
                  {message.role === 'user' ? maskSSNInText(message.content) : message.content}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Quick replies for first message */}
      {chatPhase === 'collection' && messages.length === 1 && !isLoading && (
        <div className="px-6 pb-3">
          <div className="flex flex-wrap gap-2">
            {(customer.addressLine1 
              ? ["Yes, that's correct", "Update my address", "I have a question"]
              : ["I have a question"]
            ).map((reply) => (
              <button
                key={reply}
                onClick={() => sendMessage(reply === "Update my address" ? "No, I need to update my address" : reply === "I have a question" ? "I have a question first" : reply)}
                className="px-4 py-2 text-sm bg-navy/[0.04] text-navy rounded-full hover:bg-navy/[0.08] border border-navy/[0.06] transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

        {/* Input - always available so users can ask questions */}
        <div className="px-6 py-4 border-t border-navy/5 bg-navy/[0.01]">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={chatPhase === 'collection' ? "Type your message..." : "Ask a question..."}
                disabled={isLoading || actionInProgress}
                className={`w-full px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal/15 focus:border-teal/40 text-[14px] text-navy placeholder:text-navy/35 disabled:opacity-50 transition-all ${
                  isSSNInput ? 'border-teal/40 pr-10' : 'border-navy/10'
                }`}
              />
              {isSSNInput && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="w-4 h-4 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              )}
            </div>
            <button
              onClick={() => {
                const valueToSend = isSSNInput ? actualInputValue : inputValue
                sendMessage(valueToSend)
                setIsSSNInput(false)
                setActualInputValue('')
              }}
              disabled={isLoading || actionInProgress || !inputValue.trim()}
              className="p-3 bg-teal text-white rounded-xl hover:bg-teal/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-navy/35 mt-2.5 text-center">
            {isSSNInput ? (
              <span className="text-teal">SSN is hidden for your security</span>
            ) : chatPhase === 'success' ? (
              'Application complete. Questions? Just ask!'
            ) : (
              'Your data is encrypted and secure'
            )}
          </p>
        </div>
    </motion.div>
  )
}
