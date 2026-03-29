'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlaidLink } from 'react-plaid-link'
import type { FormData } from './ApplicationForm'

interface Message {
  id: string
  role: 'assistant' | 'user'
  content: string
  timestamp: Date
  action?: 'plaid_link' | 'kyc_verify' | 'submit'
  fieldCollected?: keyof FormData
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
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [showPlaidLink, setShowPlaidLink] = useState(false)
  const [showKYC, setShowKYC] = useState(false)
  const [plaidLinkToken, setPlaidLinkToken] = useState<string | null>(null)
  const [plaidReady, setPlaidReady] = useState(false)
  const [plaidLoading, setPlaidLoading] = useState(false)
  const [kycLoading, setKycLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch Plaid link token
  useEffect(() => {
    async function fetchPlaidToken() {
      try {
        const response = await fetch(`/api/v1/borrower/${token}/plaid/link-token`, {
          method: 'POST',
        })
        if (response.ok) {
          const data = await response.json()
          if (!data.mockMode) {
            setPlaidLinkToken(data.linkToken)
          } else {
            setPlaidLinkToken('mock')
          }
        }
      } catch (err) {
        console.error('Error fetching Plaid token:', err)
      }
    }
    fetchPlaidToken()
  }, [token])

  // Plaid Link success handler
  const onPlaidSuccess = useCallback(async (publicToken: string, metadata: Parameters<typeof usePlaidLink>[0]['onSuccess'] extends (token: string, meta: infer M) => void ? M : never) => {
    setPlaidLoading(true)
    try {
      const response = await fetch(`/api/v1/borrower/${token}/plaid/exchange`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicToken, metadata }),
      })
      
      if (response.ok) {
        const data = await response.json()
        updateFormData({
          plaidAccessToken: 'connected',
          plaidAccountId: metadata.accounts?.[0]?.id,
          bankName: data.bankName,
          accountMask: data.accountMask,
        })
        setShowPlaidLink(false)
        // Note: sendMessage will be called after state update
        setTimeout(() => {
          const input = document.querySelector('input[type="text"]') as HTMLInputElement
          if (input) {
            input.value = `I've connected my ${data.bankName} account ending in ${data.accountMask}`
            input.dispatchEvent(new Event('input', { bubbles: true }))
          }
        }, 100)
      }
    } catch (err) {
      console.error('Plaid exchange error:', err)
    } finally {
      setPlaidLoading(false)
    }
  }, [token, updateFormData])

  // Plaid Link configuration
  const { open: openPlaid, ready: plaidLinkReady } = usePlaidLink({
    token: plaidLinkToken !== 'mock' ? plaidLinkToken : null,
    onSuccess: onPlaidSuccess,
    onExit: () => setShowPlaidLink(false),
  })

  useEffect(() => {
    setPlaidReady(plaidLinkReady || plaidLinkToken === 'mock')
  }, [plaidLinkReady, plaidLinkToken])

  // Handle mock Plaid connection
  const handleMockPlaid = () => {
    setPlaidLoading(true)
    setTimeout(() => {
      updateFormData({
        plaidAccessToken: 'mock_connected',
        plaidAccountId: 'mock_account_123',
        bankName: 'Chase Bank',
        accountMask: '4567',
      })
      setShowPlaidLink(false)
      setPlaidLoading(false)
      sendMessage("I've connected my Chase Bank account ending in 4567")
    }, 1500)
  }

  // Handle KYC verification trigger
  const handleStartKYC = async () => {
    setKycLoading(true)
    try {
      const response = await fetch(`/api/v1/borrower/${token}/persona/create-inquiry`, {
        method: 'POST',
      })
      
      if (response.ok) {
        const data = await response.json()
        // Open Persona in a new window or modal
        if (data.inquiryUrl) {
          window.open(data.inquiryUrl, '_blank', 'width=500,height=700')
        }
        updateFormData({
          personaInquiryId: data.inquiryId,
          kycStatus: 'pending',
        })
        setShowKYC(false)
        sendMessage("I've started the identity verification process")
      }
    } catch (err) {
      console.error('KYC error:', err)
    } finally {
      setKycLoading(false)
    }
  }

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
      
      // Small delay for natural feel
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const greeting: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Hi ${customer.firstName}! I'm here to help you apply for financing for your ${job.serviceType || 'home service'} project. The total is $${job.estimateAmount.toLocaleString()}.

I'll guide you through a few quick questions. You can ask me anything along the way if you're unsure about something.

Let's start with confirming your information. Is your current address ${customer.addressLine1 ? `${customer.addressLine1}, ${customer.city}, ${customer.state} ${customer.postalCode}` : 'on file with us'}?`,
        timestamp: new Date(),
      }
      
      setIsTyping(false)
      setMessages([greeting])
    }
    
    initChat()
  }, [customer, job])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)
    setIsTyping(true)

    try {
      const response = await fetch(`/api/v1/borrower/${token}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          formData,
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
              
              if (parsed.action) {
                if (parsed.action === 'plaid_link') {
                  setShowPlaidLink(true)
                } else if (parsed.action === 'kyc_verify') {
                  setShowKYC(true)
                } else if (parsed.action === 'submit') {
                  // Handle submission
                  window.location.href = `/apply/${token}/offers`
                }
              }
              
              if (parsed.fieldUpdate) {
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
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "I'm sorry, I encountered an issue. Let me try that again, or you can switch to the form view if you prefer.",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setIsTyping(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputValue)
    }
  }

  const handleQuickReply = (reply: string) => {
    sendMessage(reply)
  }

  // Refined easing curves (from Impeccable animate skill)
  const easeOutQuart: [number, number, number, number] = [0.25, 1, 0.5, 1]
  const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1]

  return (
    <motion.div 
      className="flex flex-col h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-lg overflow-hidden border border-navy/5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easeOutExpo }}
    >
      {/* Header - refined, no gradient */}
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
          className="text-sm text-navy/60 hover:text-teal transition-colors duration-200 flex items-center gap-1.5 group"
          style={{ transitionTimingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)' }}
        >
          <svg className="w-4 h-4 group-hover:scale-105 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ transitionTimingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Switch to form
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ 
                duration: 0.25, 
                ease: easeOutQuart,
                delay: index === messages.length - 1 ? 0 : 0 
              }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-teal text-white rounded-2xl rounded-br-sm'
                    : 'bg-navy/[0.04] text-navy rounded-2xl rounded-bl-sm'
                }`}
              >
                <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator - refined pulse instead of bounce */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: easeOutQuart }}
            className="flex justify-start"
          >
            <div className="bg-navy/[0.04] rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-2 h-2 bg-navy/30 rounded-full"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.4, 0.8, 0.4]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: easeOutQuart
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Plaid Link Action Card */}
        {showPlaidLink && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: easeOutQuart }}
            className="bg-white border border-navy/10 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-11 h-11 rounded-xl bg-teal/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <p className="text-[15px] font-medium text-navy">Connect your bank</p>
                <p className="text-sm text-navy/50 mt-0.5">256-bit encryption. Credentials never stored.</p>
              </div>
            </div>
            <motion.button
              onClick={() => {
                if (plaidLinkToken === 'mock') {
                  handleMockPlaid()
                } else if (plaidReady) {
                  openPlaid()
                }
              }}
              disabled={!plaidReady || plaidLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3 bg-teal text-white rounded-xl font-medium hover:bg-teal/90 disabled:opacity-40 transition-colors duration-200"
              style={{ transitionTimingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)' }}
            >
              {plaidLoading ? 'Connecting...' : 'Connect Bank Account'}
            </motion.button>
            <button
              onClick={() => setShowPlaidLink(false)}
              className="w-full mt-2 py-2 text-sm text-navy/40 hover:text-navy/60 transition-colors duration-200"
              style={{ transitionTimingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)' }}
            >
              Do this later
            </button>
          </motion.div>
        )}

        {/* KYC Verification Action Card */}
        {showKYC && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: easeOutQuart }}
            className="bg-white border border-navy/10 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-11 h-11 rounded-xl bg-mint/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-mint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="text-[15px] font-medium text-navy">Verify your identity</p>
                <p className="text-sm text-navy/50 mt-0.5">Quick photo ID check. About 2 minutes.</p>
              </div>
            </div>
            <motion.button
              onClick={handleStartKYC}
              disabled={kycLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3 bg-mint text-white rounded-xl font-medium hover:bg-mint/90 disabled:opacity-40 transition-colors duration-200"
              style={{ transitionTimingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)' }}
            >
              {kycLoading ? 'Starting...' : 'Verify My Identity'}
            </motion.button>
            <button
              onClick={() => setShowKYC(false)}
              className="w-full mt-2 py-2 text-sm text-navy/40 hover:text-navy/60 transition-colors duration-200"
              style={{ transitionTimingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)' }}
            >
              Do this later
            </button>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick replies - staggered entrance */}
      {messages.length === 1 && (
        <motion.div 
          className="px-6 pb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3, ease: easeOutQuart }}
        >
          <div className="flex flex-wrap gap-2">
            {[
              "Yes, that's correct",
              "Update my address", 
              "I have a question"
            ].map((reply, i) => (
              <motion.button
                key={reply}
                onClick={() => handleQuickReply(reply === "Update my address" ? "No, I need to update my address" : reply === "I have a question" ? "I have a question first" : reply)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.08, duration: 0.25, ease: easeOutQuart }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 text-sm bg-navy/[0.04] text-navy rounded-full hover:bg-navy/[0.08] border border-navy/[0.06] transition-colors duration-200"
                style={{ transitionTimingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)' }}
              >
                {reply}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Input - refined */}
      <div className="px-6 py-4 border-t border-navy/5 bg-navy/[0.01]">
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-white border border-navy/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal/15 focus:border-teal/40 text-[14px] text-navy placeholder:text-navy/35 disabled:opacity-50 transition-all duration-200"
            style={{ transitionTimingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)' }}
          />
          <motion.button
            onClick={() => sendMessage(inputValue)}
            disabled={isLoading || !inputValue.trim()}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="p-3 bg-teal text-white rounded-xl hover:bg-teal/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200"
            style={{ transitionTimingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)' }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </motion.button>
        </div>
        <p className="text-xs text-navy/35 mt-2.5 text-center">
          Your data is encrypted and secure
        </p>
      </div>
    </motion.div>
  )
}
