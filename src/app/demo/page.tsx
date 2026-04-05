// ABOUTME: Investor demo page showing agentic lending flow
// ABOUTME: Three-panel layout: Technician SMS, Homeowner SMS (automated), Contractor Portal

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Mock CRM Database
const MOCK_CRM = {
  jobs: [
    {
      job_id: 'ST-48291',
      customer_name: 'Sarah Johnson',
      customer_phone: '+15618675309',
      address: '123 Palm Ave, Boynton Beach, FL 33426',
      job_type: 'HVAC Install',
      equipment: 'Carrier 3-ton 16 SEER2 AC System',
      quoted_amount: 6800,
      technician: 'Mike Rivera',
      contractor: 'Cool Air Pros',
      status: 'Quoted',
      created_date: '2026-03-25',
      dob: '10/15/1985',
      annual_income: 72000,
    },
    {
      job_id: 'ST-48295',
      customer_name: 'David Chen',
      customer_phone: '+15617891234',
      address: '456 Ocean Blvd, Delray Beach, FL 33483',
      job_type: 'Water Heater Replacement',
      equipment: 'Rheem 50-gal Hybrid Electric',
      quoted_amount: 3200,
      technician: 'Mike Rivera',
      contractor: 'Cool Air Pros',
      status: 'Financing Offered',
      created_date: '2026-03-24',
    },
    {
      job_id: 'ST-48288',
      customer_name: 'Maria Garcia',
      customer_phone: '+15614567890',
      address: '789 Cypress Dr, Lake Worth, FL 33461',
      job_type: 'Electrical Panel Upgrade',
      equipment: '200A Panel with Whole-Home Surge',
      quoted_amount: 4500,
      technician: 'Carlos Diaz',
      contractor: 'Cool Air Pros',
      status: 'Approved',
      created_date: '2026-03-22',
    },
    {
      job_id: 'ST-48280',
      customer_name: 'Tom Williams',
      customer_phone: '+15619876543',
      address: '321 Banyan Way, Wellington, FL 33414',
      job_type: 'Roof Repair',
      equipment: 'Flat roof section, 400 sq ft',
      quoted_amount: 8900,
      technician: 'Jake Thompson',
      contractor: 'Cool Air Pros',
      status: 'Funded',
      created_date: '2026-03-18',
    },
  ],
}

type JobStatus = 'Quoted' | 'Financing Offered' | 'Sent to Customer' | 'Application In Progress' | 'Under Review' | 'Approved' | 'Funded'

interface Job {
  job_id: string
  customer_name: string
  customer_phone: string
  address: string
  job_type: string
  equipment: string
  quoted_amount: number
  technician: string
  contractor: string
  status: JobStatus
  created_date: string
  updated_at?: string
  dob?: string
  annual_income?: number
}

interface Message {
  id: string
  role: 'agent' | 'user'
  content: string
  timestamp: Date
  isSSN?: boolean
  isLink?: boolean
  linkText?: string
  isCard?: boolean
  cardType?: 'offers' | 'agreement' | 'success'
  isTermsLinks?: boolean
}

// Payment calculation formula
function calculateMonthlyPayment(principal: number, annualRate: number, months: number): number {
  const monthlyRate = annualRate / 100 / 12
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
}

// Format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)
}

// Technician Agent System Prompt
function getTechnicianSystemPrompt(jobs: Job[]): string {
  return `You are the SuprFi Technician Assistant Agent. You help home services technicians offer financing to their customers via SMS.

You have access to a CRM (ServiceTitan) with these jobs:
${JSON.stringify(jobs, null, 2)}

When a technician mentions a job (by customer name, address, job ID, or description), look it up in the CRM and respond with:
1. Confirm the job details: customer name, address, job type, equipment, and quoted amount
2. Show ESTIMATED payment ranges (not exact rates - we don't know their credit yet). Use "as low as" language since actual rates depend on the customer's credit after they apply.
3. Ask if they want you to send financing options to the customer

IMPORTANT: Do NOT quote specific APR rates to the technician. The customer's actual rate depends on their credit score after underwriting. Just show estimated monthly payment ranges.

Example payment estimates for a $6,800 job:
- "Payments as low as $113/mo" (best case, 84 months)
- "Typical range: $115-220/mo depending on term and credit"

Keep responses conversational and concise. This is SMS, so no long paragraphs. Use line breaks between sections.

If the message is unclear or you can't find the job, ask a clarifying question.

If the technician confirms (says "yes", "send it", "go ahead", "yeah", "yep", "sure", etc.), respond exactly with this format:
"Sending financing options to [customer name] now. I'll text her at [phone number]. She'll get a quick application and her personalized rates based on her credit. I'll update you when she responds."

IMPORTANT: Include the exact phrase "Sending financing options to" when confirming you will send to customer - this triggers the automation.

If the technician asks how SuprFi works: "SuprFi originates unsecured consumer loans for home services jobs under $25K. You text me the job, I handle the rest: texting the homeowner, walking them through a quick application, underwriting them instantly, and syncing everything back to your CRM."`
}

// Status badge component
function StatusBadge({ status }: { status: JobStatus }) {
  const statusStyles: Record<JobStatus, string> = {
    'Quoted': 'bg-gray-100 text-gray-600',
    'Financing Offered': 'bg-teal/10 text-teal',
    'Sent to Customer': 'bg-cyan/10 text-cyan',
    'Application In Progress': 'bg-warning/10 text-warning',
    'Under Review': 'bg-gold-400/10 text-gold-600',
    'Approved': 'bg-mint/10 text-mint',
    'Funded': 'bg-purple-100 text-purple-600',
  }
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusStyles[status]}`}>
      {status}
    </span>
  )
}

// Typing indicator component
function TypingIndicator() {
  return (
    <div className="flex gap-1 px-3 py-2">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 bg-gray-400 rounded-full"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  )
}

// iPhone Frame component
function IPhoneFrame({ 
  title, 
  children, 
  isAutomated = false 
}: { 
  title: string
  children: React.ReactNode
  isAutomated?: boolean
}) {
  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-120px)]">
      <div className="text-center mb-3 flex-shrink-0">
        <h2 className="text-sm font-semibold text-navy uppercase tracking-wide">{title}</h2>
        {isAutomated && (
          <span className="text-xs text-navy/40">(Automated)</span>
        )}
      </div>
      <div className="flex-1 bg-black rounded-[40px] p-2 shadow-2xl min-h-0">
        <div className="h-full bg-white rounded-[32px] overflow-hidden flex flex-col">
          {/* Status bar */}
          <div className="flex items-center justify-between px-6 py-2 bg-gray-50">
            <span className="text-xs font-medium">9:41</span>
            <div className="w-20 h-6 bg-black rounded-full" />
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v18M3 12h18" stroke="currentColor" strokeWidth="2" />
              </svg>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <rect x="2" y="7" width="20" height="10" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
                <rect x="22" y="10" width="2" height="4" rx="0.5" fill="currentColor" />
                <rect x="4" y="9" width="14" height="6" rx="1" fill="currentColor" />
              </svg>
            </div>
          </div>
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div className="w-10 h-10 rounded-full bg-teal flex items-center justify-center">
              <span className="text-white font-bold text-sm">SF</span>
            </div>
            <div>
              <p className="font-semibold text-navy text-sm">SuprFi</p>
              <p className="text-xs text-gray-400">Message</p>
            </div>
          </div>
          {/* Content */}
          {children}
        </div>
      </div>
    </div>
  )
}

// Main Demo Component
export default function InvestorDemoPage() {
  // State
  const [jobs, setJobs] = useState<Job[]>(MOCK_CRM.jobs.map(j => ({ ...j, status: j.status as JobStatus, updated_at: new Date().toISOString() })))
  const [techMessages, setTechMessages] = useState<Message[]>([])
  const [homeownerMessages, setHomeownerMessages] = useState<Message[]>([])
  const [techInput, setTechInput] = useState('')
  const [isTechTyping, setIsTechTyping] = useState(false)
  const [isHomeownerTyping, setIsHomeownerTyping] = useState(false)
  const [homeownerWaiting, setHomeownerWaiting] = useState(true)
  const [demoStarted, setDemoStarted] = useState(false)
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [showApiKeyModal, setShowApiKeyModal] = useState(true)
  
  const techMessagesEndRef = useRef<HTMLDivElement>(null)
  const homeownerMessagesEndRef = useRef<HTMLDivElement>(null)
  const homeownerScriptRunning = useRef(false)
  
  // Scroll to bottom helpers
  useEffect(() => {
    techMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [techMessages])
  
  useEffect(() => {
    homeownerMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [homeownerMessages])
  
  // Update job status helper
  const updateJobStatus = useCallback((jobId: string, newStatus: JobStatus) => {
    setJobs(prev => prev.map(job => 
      job.job_id === jobId 
        ? { ...job, status: newStatus, updated_at: new Date().toISOString() }
        : job
    ))
  }, [])
  
  // Add message helpers with delays
  const addAgentMessage = useCallback((
    setter: React.Dispatch<React.SetStateAction<Message[]>>,
    content: string,
    options?: Partial<Message>
  ) => {
    const message: Message = {
      id: crypto.randomUUID(),
      role: 'agent',
      content,
      timestamp: new Date(),
      ...options,
    }
    setter(prev => [...prev, message])
    return message
  }, [])
  
  const addUserMessage = useCallback((
    setter: React.Dispatch<React.SetStateAction<Message[]>>,
    content: string,
    options?: Partial<Message>
  ) => {
    const message: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
      ...options,
    }
    setter(prev => [...prev, message])
    return message
  }, [])
  
  // Delay helper
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
  
  // Homeowner scripted conversation
  const runHomeownerScript = useCallback(async () => {
    if (homeownerScriptRunning.current) return
    homeownerScriptRunning.current = true
    setHomeownerWaiting(false)
    
    const job = jobs.find(j => j.job_id === 'ST-48291')
    if (!job) return
    
    // Agent: Initial offer
    setIsHomeownerTyping(true)
    await delay(1800)
    setIsHomeownerTyping(false)
    addAgentMessage(setHomeownerMessages, `Hi Sarah! Cool Air Pros quoted a Carrier 3-ton AC install at $6,800 for your home at 123 Palm Ave. Monthly payment options start at $113/mo. Would you like to explore your financing options?`)
    
    // Sarah: Yes
    await delay(3000)
    addUserMessage(setHomeownerMessages, "Yes, what do I need to do?")
    
    // Agent: Explain process
    setIsHomeownerTyping(true)
    await delay(1800)
    setIsHomeownerTyping(false)
    addAgentMessage(setHomeownerMessages, "I can walk you through a quick application right here via text. It takes about 5 minutes. Or I can send you a link to apply on our website. Which works better for you?")
    
    // Sarah: Here
    await delay(2500)
    addUserMessage(setHomeownerMessages, "Let's do it here")
    
    // Notify technician that Sarah started
    addAgentMessage(setTechMessages, "Heads up: Sarah Johnson just started her application.")
    
    // Agent: Address confirmation
    setIsHomeownerTyping(true)
    await delay(1800)
    setIsHomeownerTyping(false)
    addAgentMessage(setHomeownerMessages, "Great! Let's get started. First, is your current address 123 Palm Ave, Boynton Beach, FL 33426?")
    
    // Sarah: Yes
    await delay(2000)
    addUserMessage(setHomeownerMessages, "Yes that's correct")
    
    // Agent: DOB
    setIsHomeownerTyping(true)
    await delay(1500)
    setIsHomeownerTyping(false)
    addAgentMessage(setHomeownerMessages, "Perfect. What's your date of birth?")
    
    // Sarah: Asks why
    await delay(2500)
    addUserMessage(setHomeownerMessages, "Why do you need my date of birth?")
    
    // Agent: Explains DOB
    setIsHomeownerTyping(true)
    await delay(1500)
    setIsHomeownerTyping(false)
    addAgentMessage(setHomeownerMessages, "Good question! We use your date of birth to verify your identity and ensure you meet the minimum age requirement of 18 for financing. It's also required for the credit check.")
    
    // Sarah: DOB
    await delay(2000)
    addUserMessage(setHomeownerMessages, "Got it. 10/15/1985")
    
    // Agent: SSN request
    setIsHomeownerTyping(true)
    await delay(1800)
    setIsHomeownerTyping(false)
    addAgentMessage(setHomeownerMessages, "Thanks! To check your financing options, I'll need your Social Security Number. This is required by federal law for credit checks. What's your SSN?")
    
    // Sarah: Asks about security
    await delay(3000)
    addUserMessage(setHomeownerMessages, "How is my social security number stored? Is it safe?")
    
    // Agent: Explains security
    setIsHomeownerTyping(true)
    await delay(1800)
    setIsHomeownerTyping(false)
    addAgentMessage(setHomeownerMessages, "Great question. Your SSN is protected with bank-level 256-bit AES encryption. We never store it in plain text, and it's only used for the credit check. After that, we only keep the last 4 digits on file for verification purposes.")
    
    // Sarah: SSN (masked)
    await delay(2500)
    addUserMessage(setHomeownerMessages, "•••-••-••••", { isSSN: true })
    
    // Update portal
    updateJobStatus('ST-48291', 'Application In Progress')
    
    // Agent: Bank link
    setIsHomeownerTyping(true)
    await delay(1800)
    setIsHomeownerTyping(false)
    addAgentMessage(setHomeownerMessages, "Thanks, that's safely recorded. Next, I need to verify your income. Tap this link to securely connect your bank account through Plaid. It only takes about a minute.", { isLink: true, linkText: "Connect your bank securely via Plaid" })
    
    // Sarah: Bank connected
    await delay(5000)
    addUserMessage(setHomeownerMessages, "Done, I've connected my Chase account")
    
    // Agent: Identity verification
    setIsHomeownerTyping(true)
    await delay(1500)
    setIsHomeownerTyping(false)
    addAgentMessage(setHomeownerMessages, "Great, your bank is linked. One more step: I need to verify your identity. This is a quick process to confirm you are who you say you are.", { isLink: true, linkText: "Start identity verification" })
    
    // Sarah: Identity verified
    await delay(4000)
    addUserMessage(setHomeownerMessages, "I've completed the identity verification")
    
    // Agent: Terms
    setIsHomeownerTyping(true)
    await delay(1500)
    setIsHomeownerTyping(false)
    addAgentMessage(setHomeownerMessages, "Identity verified. Almost finished! Please review and tap each link below, then confirm you agree:", { isTermsLinks: true })
    
    // Sarah: Agree
    await delay(3500)
    addUserMessage(setHomeownerMessages, "I've reviewed them all. I agree")
    
    // Update portal
    updateJobStatus('ST-48291', 'Under Review')
    
    // Agent: Processing and approval
    setIsHomeownerTyping(true)
    await delay(4000)
    setIsHomeownerTyping(false)
    addAgentMessage(setHomeownerMessages, "You're approved, Sarah! Here are your financing options for the $6,800 HVAC install:", { isCard: true, cardType: 'offers' })
    
    // Sarah: Select plan
    await delay(3000)
    addUserMessage(setHomeownerMessages, "The 60 month plan please")
    
    // Agent: Confirm selection
    setIsHomeownerTyping(true)
    await delay(1800)
    setIsHomeownerTyping(false)
    addAgentMessage(setHomeownerMessages, "Great choice! That's $144/mo for 60 months at 9.99% APR. Your first payment will be due on 5/4/2026. I'm sending your loan agreement now for your electronic signature.", { isCard: true, cardType: 'agreement' })
    
    // Sarah: Sign
    await delay(3000)
    addUserMessage(setHomeownerMessages, "Sarah Johnson")
    
    // Agent: Success
    setIsHomeownerTyping(true)
    await delay(2000)
    setIsHomeownerTyping(false)
    addAgentMessage(setHomeownerMessages, "Agreement signed! Your financing is confirmed.", { isCard: true, cardType: 'success' })
    
    // Sarah: Asks if anything else needed
    await delay(2500)
    addUserMessage(setHomeownerMessages, "Is there anything else I need to do?")
    
    // Agent: Final response
    setIsHomeownerTyping(true)
    await delay(1500)
    setIsHomeownerTyping(false)
    addAgentMessage(setHomeownerMessages, "Nope, you're all set! Cool Air Pros has been notified and will reach out to schedule your installation. You'll receive a confirmation email shortly with all the details. If you have any questions, just text me here anytime.")
    
    // Update portal to approved
    updateJobStatus('ST-48291', 'Approved')
    
    // Send notification to technician
    await delay(1500)
    addAgentMessage(setTechMessages, "Great news! Sarah Johnson has been approved for $6,800 financing on job ST-48291. 60-month plan at $144/mo. You're cleared to schedule the install.")
    
  }, [jobs, addAgentMessage, addUserMessage, updateJobStatus])
  
  // Send message to Claude API (technician panel)
  const sendTechMessage = useCallback(async () => {
    if (!techInput.trim() || !apiKey) return
    
    const userMessage = techInput.trim()
    setTechInput('')
    addUserMessage(setTechMessages, userMessage)
    
    setIsTechTyping(true)
    
    try {
      const response = await fetch('/api/demo/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...techMessages, { role: 'user', content: userMessage }].map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content,
          })),
          systemPrompt: getTechnicianSystemPrompt(jobs),
          apiKey,
        }),
      })
      
      if (!response.ok) {
        throw new Error('API request failed')
      }
      
      const data = await response.json()
      setIsTechTyping(false)
      
      const agentResponse = data.content || "I apologize, I couldn't process that request."
      addAgentMessage(setTechMessages, agentResponse)
      
      // Check if agent confirmed sending to customer
      if (agentResponse.toLowerCase().includes('sending financing options to')) {
        // Update job status
        updateJobStatus('ST-48291', 'Sent to Customer')
        setDemoStarted(true)
        
        // Start homeowner script after a short delay
        setTimeout(() => {
          runHomeownerScript()
        }, 2000)
      }
      
    } catch (error) {
      console.error('Chat error:', error)
      setIsTechTyping(false)
      addAgentMessage(setTechMessages, "I apologize, there was an error processing your request. Please check your API key and try again.")
    }
  }, [techInput, techMessages, jobs, apiKey, addUserMessage, addAgentMessage, updateJobStatus, runHomeownerScript])
  
  // Reset demo
  const resetDemo = useCallback(() => {
    setJobs(MOCK_CRM.jobs.map(j => ({ ...j, status: j.status as JobStatus, updated_at: new Date().toISOString() })))
    setTechMessages([])
    setHomeownerMessages([])
    setTechInput('')
    setHomeownerWaiting(true)
    setDemoStarted(false)
    homeownerScriptRunning.current = false
  }, [])
  
  // Handle API key submit
  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (apiKeyInput.trim()) {
      setApiKey(apiKeyInput.trim())
      setShowApiKeyModal(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* API Key Modal */}
      <AnimatePresence>
        {showApiKeyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="/logos/wordmark navy and mint.svg"
                  alt="SuprFi"
                  className="h-6 w-auto"
                />
                <span className="text-sm text-navy/40">Investor Demo</span>
              </div>
              
              <h2 className="text-xl font-display font-bold text-navy mb-2">Agentic Lending Flow Demo</h2>
              <p className="text-sm text-navy/60 mb-4">
                This demo shows how SuprFi agents handle the entire financing workflow.
              </p>
              
              {/* How it works */}
              <div className="bg-light-gray rounded-xl p-4 mb-6">
                <h3 className="text-sm font-semibold text-navy mb-3">How to run the demo:</h3>
                <ol className="space-y-2 text-sm text-navy/70">
                  <li className="flex gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-teal text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    <span>In the <strong>Technician</strong> panel (left), type something like: <em>"I'm with Sarah Johnson"</em> or <em>"HVAC job on Palm Ave"</em></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-teal text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    <span>The agent will show job details and payment options. Say <em>"Yes, send it to her"</em> to trigger financing</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-teal text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    <span>Watch the <strong>Homeowner</strong> panel (center) auto-play the full application flow</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-teal text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                    <span>The <strong>SuprOps</strong> dashboard (right) updates in real-time as status changes</span>
                  </li>
                </ol>
              </div>
              
              <form onSubmit={handleApiKeySubmit}>
                <label className="block text-sm font-medium text-navy mb-2">Anthropic API Key</label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="sk-ant-..."
                  className="w-full px-4 py-3 border border-navy/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal mb-4 font-mono text-sm"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!apiKeyInput.trim()}
                  className="w-full py-3 bg-teal text-white rounded-xl font-semibold hover:bg-teal/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Start Demo
                </button>
              </form>
              <p className="text-xs text-navy/40 mt-4 text-center">
                Your API key is only used in the browser and never stored. Get one at console.anthropic.com
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Header */}
      <header className="bg-navy text-white py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src="/logos/wordmark white and mint.svg"
            alt="SuprFi"
            className="h-7 w-auto"
          />
          <span className="text-sm text-white/60 border-l border-white/20 pl-4">Investor Demo</span>
        </div>
        <button
          onClick={resetDemo}
          className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        >
          Reset Demo
        </button>
      </header>
      
      {/* Main content - three panels */}
      <main className="p-6 h-[calc(100vh-72px)] flex gap-6">
        {/* Left Panel: Technician */}
        <div className="flex-1 max-w-md">
          <IPhoneFrame title="Technician">
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {techMessages.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400">Start by mentioning a job...</p>
                  <p className="text-xs text-gray-300 mt-2">Try: "I'm with Sarah Johnson" or "HVAC job on Palm Ave"</p>
                </div>
              )}
              <AnimatePresence>
                {techMessages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] px-4 py-2.5 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-teal text-white rounded-br-md'
                          : 'bg-white text-navy rounded-bl-md shadow-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isTechTyping && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl rounded-bl-md shadow-sm">
                    <TypingIndicator />
                  </div>
                </div>
              )}
              <div ref={techMessagesEndRef} />
            </div>
            {/* Input */}
            <div className="p-3 border-t border-gray-100 bg-white">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendTechMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal/20"
                  disabled={!apiKey}
                />
                <button
                  onClick={sendTechMessage}
                  disabled={!techInput.trim() || !apiKey}
                  className="w-10 h-10 bg-teal text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-teal/90 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </IPhoneFrame>
        </div>
        
        {/* Center Panel: Homeowner */}
        <div className="flex-1 max-w-md">
          <IPhoneFrame title="Homeowner" isAutomated>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {homeownerWaiting ? (
                <div className="text-center py-16">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-400">Waiting for technician to initiate financing...</p>
                </div>
              ) : (
                <>
                  <AnimatePresence>
                    {homeownerMessages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] ${
                            message.role === 'user'
                              ? 'bg-teal text-white rounded-2xl rounded-br-md px-4 py-2.5'
                              : message.isCard
                                ? 'w-full'
                                : 'bg-white text-navy rounded-2xl rounded-bl-md shadow-sm px-4 py-2.5'
                          }`}
                        >
                          {message.isSSN ? (
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                              <span className="text-sm font-mono">{message.content}</span>
                            </div>
                          ) : message.isTermsLinks ? (
                            <div>
                              <p className="text-sm mb-3">{message.content}</p>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <svg className="w-4 h-4 text-teal flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="underline text-teal font-medium cursor-pointer">Terms of Service</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <svg className="w-4 h-4 text-teal flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="underline text-teal font-medium cursor-pointer">Privacy Policy</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <svg className="w-4 h-4 text-teal flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="underline text-teal font-medium cursor-pointer">E-Sign Agreement</span>
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 mt-3">Please review each document above, then reply "I agree" to continue.</p>
                            </div>
                          ) : message.isLink ? (
                            <div>
                              <p className="text-sm mb-2">{message.content}</p>
                              <div className="flex items-center gap-2 text-teal text-sm font-medium">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                {message.linkText}
                              </div>
                            </div>
                          ) : message.isCard && message.cardType === 'offers' ? (
                            <div className="space-y-2">
                              <div className="bg-white rounded-2xl rounded-bl-md shadow-sm px-4 py-2.5">
                                <p className="text-sm text-navy">{message.content}</p>
                              </div>
                              <OffersCard amount={6800} />
                            </div>
                          ) : message.isCard && message.cardType === 'agreement' ? (
                            <div className="space-y-2">
                              <div className="bg-white rounded-2xl rounded-bl-md shadow-sm px-4 py-2.5">
                                <p className="text-sm text-navy">{message.content}</p>
                              </div>
                              <AgreementCard />
                            </div>
                          ) : message.isCard && message.cardType === 'success' ? (
                            <div className="space-y-2">
                              <div className="bg-white rounded-2xl rounded-bl-md shadow-sm px-4 py-2.5">
                                <p className="text-sm text-navy flex items-center gap-2">
                                  <span className="text-mint">✓</span> {message.content}
                                </p>
                              </div>
                              <SuccessCard />
                            </div>
                          ) : (
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {isHomeownerTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white rounded-2xl rounded-bl-md shadow-sm">
                        <TypingIndicator />
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={homeownerMessagesEndRef} />
            </div>
            {/* Disabled input for homeowner */}
            <div className="p-3 border-t border-gray-100 bg-white">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Automated conversation..."
                  disabled
                  className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>
          </IPhoneFrame>
        </div>
        
        {/* Right Panel: SuprOps Dashboard */}
        <div className="flex-1 min-w-[480px]">
          <div className="flex flex-col h-full">
            <div className="text-center mb-3">
              <h2 className="text-sm font-semibold text-navy uppercase tracking-wide">SuprOps Dashboard</h2>
              <span className="text-xs text-navy/40">(Back Office)</span>
            </div>
            <div className="flex-1 bg-light-gray rounded-2xl shadow-lg overflow-hidden border border-navy/5 flex flex-col">
              {/* SuprOps Header */}
              <div className="bg-navy px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src="/logos/wordmark white and mint.svg"
                    alt="SuprFi"
                    className="h-5 w-auto"
                  />
                  <span className="text-white/40 text-xs font-medium">SuprOps</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <span className="w-1.5 h-1.5 bg-mint rounded-full animate-pulse" />
                  Live
                </div>
              </div>
              
              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-3 p-4 bg-white border-b border-gray-100">
                <div className="bg-light-gray rounded-xl p-3">
                  <div className="text-xs text-medium-gray mb-1">Total Jobs</div>
                  <div className="text-xl font-bold font-display text-navy">{jobs.length}</div>
                </div>
                <div className="bg-light-gray rounded-xl p-3">
                  <div className="text-xs text-medium-gray mb-1">Pending</div>
                  <div className="text-xl font-bold font-display text-cyan">
                    {jobs.filter(j => ['Quoted', 'Financing Offered', 'Sent to Customer'].includes(j.status)).length}
                  </div>
                </div>
                <div className="bg-light-gray rounded-xl p-3">
                  <div className="text-xs text-medium-gray mb-1">In Progress</div>
                  <div className="text-xl font-bold font-display text-warning">
                    {jobs.filter(j => ['Application In Progress', 'Under Review'].includes(j.status)).length}
                  </div>
                </div>
                <div className="bg-light-gray rounded-xl p-3">
                  <div className="text-xs text-mint mb-1">Approved</div>
                  <div className="text-xl font-bold font-display text-navy">
                    {jobs.filter(j => j.status === 'Approved').length}
                  </div>
                </div>
              </div>
              
              {/* Applications Table */}
              <div className="flex-1 overflow-auto bg-white">
                <table className="w-full">
                  <thead className="bg-light-gray sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">Service</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {jobs.map((job) => (
                      <motion.tr
                        key={job.job_id}
                        layout
                        className={`${
                          job.job_id === 'ST-48291' && job.status === 'Approved' 
                            ? 'bg-mint/5' 
                            : 'hover:bg-light-gray/50'
                        } transition-colors`}
                      >
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-navy">{job.customer_name}</div>
                          <div className="text-xs text-medium-gray">{job.job_id}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-semibold text-navy">{formatCurrency(job.quoted_amount)}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-navy">{job.job_type}</div>
                        </td>
                        <td className="px-4 py-3">
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={job.status}
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.8, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <StatusBadge status={job.status} />
                            </motion.div>
                          </AnimatePresence>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-medium-gray">
                            {job.updated_at ? new Date(job.updated_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '-'}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Quick Actions Footer */}
              <div className="px-4 py-3 bg-white border-t border-gray-100 flex items-center justify-between">
                <div className="flex gap-2">
                  <span className="px-3 py-1.5 text-xs font-medium text-navy bg-light-gray rounded-lg">Applications</span>
                  <span className="px-3 py-1.5 text-xs text-medium-gray hover:bg-light-gray rounded-lg cursor-pointer transition-colors">Manual Reviews</span>
                  <span className="px-3 py-1.5 text-xs text-medium-gray hover:bg-light-gray rounded-lg cursor-pointer transition-colors">Contractors</span>
                </div>
                <button className="px-3 py-1.5 text-xs text-teal hover:bg-teal/10 rounded-lg transition-colors">
                  View All →
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// Offers Card Component
function OffersCard({ amount }: { amount: number }) {
  const apr = 9.99
  
  const offers = [
    { type: 'Pay in 4', apr: 0, payment: amount / 4, total: amount, term: '6 weeks' },
    { type: '36 Month Plan', apr: 9.99, payment: calculateMonthlyPayment(amount, apr, 36), total: calculateMonthlyPayment(amount, apr, 36) * 36, term: '36 mo' },
    { type: '60 Month Plan', apr: 9.99, payment: calculateMonthlyPayment(amount, apr, 60), total: calculateMonthlyPayment(amount, apr, 60) * 60, term: '60 mo', recommended: true },
    { type: '84 Month Plan', apr: 9.99, payment: calculateMonthlyPayment(amount, apr, 84), total: calculateMonthlyPayment(amount, apr, 84) * 84, term: '84 mo' },
  ]
  
  return (
    <div className="bg-white rounded-xl border border-navy/10 overflow-hidden shadow-sm">
      <div className="bg-gradient-to-r from-teal to-mint p-3 text-white">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-semibold">You're approved!</span>
        </div>
      </div>
      <div className="p-3 space-y-2">
        {offers.map((offer, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg border ${offer.recommended ? 'border-teal bg-teal/5' : 'border-gray-100'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-navy">{offer.type}</span>
                  {offer.recommended && (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-teal text-white rounded">RECOMMENDED</span>
                  )}
                </div>
                <span className="text-xs text-gray-500">{offer.apr}% APR</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-navy">{formatCurrency(offer.payment)}/mo</div>
                <div className="text-xs text-gray-500">Total: {formatCurrency(offer.total)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Agreement Card Component
function AgreementCard() {
  return (
    <div className="bg-white rounded-xl border border-navy/10 overflow-hidden shadow-sm">
      <div className="p-4 border-b border-gray-100">
        <h4 className="font-semibold text-navy text-sm">Payment Agreement</h4>
      </div>
      <div className="p-4 space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Plan</span>
          <span className="font-medium text-navy">60 Month Plan</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Service Amount</span>
          <span className="font-medium text-navy">$6,800</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Monthly Payment</span>
          <span className="font-medium text-navy">$144.43</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Total Cost</span>
          <span className="font-medium text-navy">$8,665.80</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">First Payment</span>
          <span className="font-medium text-navy">5/4/2026</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">APR</span>
          <span className="font-medium text-navy">9.99%</span>
        </div>
        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            By typing your name below, you agree to the payment terms.
          </p>
        </div>
      </div>
    </div>
  )
}

// Success Card Component
function SuccessCard() {
  const confNum = `SUP-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  
  return (
    <div className="bg-white rounded-xl border border-mint/30 overflow-hidden shadow-sm">
      <div className="bg-mint/10 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-mint rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-navy text-sm">Agreement Signed!</h4>
            <p className="text-xs text-gray-500">Your financing is confirmed</p>
          </div>
        </div>
      </div>
      <div className="p-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Confirmation #</span>
          <span className="font-mono text-xs text-navy">{confNum}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Plan</span>
          <span className="font-medium text-navy">60 Month Plan</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Monthly Payment</span>
          <span className="font-medium text-navy">$144.43</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">First Payment</span>
          <span className="font-medium text-navy">5/4/2026</span>
        </div>
        <div className="pt-3 border-t border-gray-100 text-xs text-gray-500">
          Your contractor Cool Air Pros has been notified and will schedule your installation.
        </div>
      </div>
    </div>
  )
}
