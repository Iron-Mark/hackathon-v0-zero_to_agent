'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, CheckCircle2, AlertCircle, ArrowRight, Cpu, RefreshCcw, ChevronRight, Target } from 'lucide-react'
import { showToast } from '@/components/toast'

const quizItems = [
  {
    id: 1,
    correct: 'A',
    options: {
      A: {
        text: '"Seeking a highly motivated Frontend Developer to join our dynamic team. Competitive salary and remote work options available. Apply now!"',
        explanation: '✅ Correct! This is LLM-generated.',
        points: [
          'Generic corporate buzzwords ("dynamic team").',
          'Vague compensation ("Competitive salary").',
          'Aggressive call to action ("Apply now!").'
        ]
      },
      B: {
        text: '"Small team at Vertex Labs looking for a dev who doesn\'t mind diving into legacy code. Warning: our office dog will bark at your first PR."',
        explanation: '❌ Incorrect! This is human-written.',
        points: [
          'Specific company name and scale context.',
          'Authentic vulnerability ("legacy code").',
          'Unpredictable human humor ("office dog").'
        ]
      }
    }
  },
  {
    id: 2,
    correct: 'B',
    options: {
      A: {
        text: '"Customer Support Rep for local e-commerce store. Must speak fluent Tagalog and English. Shifts include weekends. Office in Makati."',
        explanation: '❌ Incorrect! This is human-written.',
        points: [
          'Specific language requirements.',
          'Concrete location and shift details.',
          'Realistic expectations for the role.'
        ]
      },
      B: {
        text: '"Urgent hiring for Customer Support. PHP 150,000/month. Flexible hours. No experience needed. Start today! Contact manager on Telegram."',
        explanation: '✅ Correct! This is a high-risk bot template.',
        points: [
          'Unrealistic compensation for the role.',
          'High-risk contact channel (Telegram).',
          'Low barrier to entry for high pay.'
        ]
      }
    }
  },
  {
    id: 3,
    correct: 'B',
    options: {
      A: {
        text: '"Looking for a Backend Eng to help us migrate from a monolith to microservices. We use Go and Postgres. It\'s going to be messy but rewarding."',
        explanation: '❌ Incorrect! This is human-written.',
        points: [
          'Specific technical stack mentioned.',
          'Honest appraisal of the work ("messy").',
          'Casual but professional tone.'
        ]
      },
      B: {
        text: '"We are a global leader in innovation. Our mission is to synergize cross-functional paradigms for future growth. Join us in our journey of transformation."',
        explanation: '✅ Correct! This is pure AI "corporate-speak".',
        points: [
          'High density of buzzwords ("synergize", "paradigms").',
          'Zero specific information about the role.',
          'Typical "mission-driven" AI hallucination.'
        ]
      }
    }
  },
  {
    id: 4,
    correct: 'A',
    options: {
      A: {
        text: '"Recruiting for Google. Senior Product Manager. Base salary $400k. Apply at google-careers-portal.net/apply"',
        explanation: '✅ Correct! This is a phishing bot.',
        points: [
          'Suspicious domain name (google-careers-portal.net).',
          'Unusually high base salary for the role.',
          'Missing official Google job ID or link.'
        ]
      },
      B: {
        text: '"Product Manager, Growth. Help us scale our user base. Check our LinkedIn page for full details. No direct email applications."',
        explanation: '❌ Incorrect! This is a standard authentic listing.',
        points: [
          'Refers to official social channels.',
          'Specific role focus (Growth).',
          'Professional and realistic tone.'
        ]
      }
    }
  }
]

export function SpotTheBot() {
  const [currentStep, setCurrentStep] = useState(0)
  const [selection, setSelection] = useState<'A' | 'B' | null>(null)
  const [score, setScore] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)

  const currentItem = quizItems[currentStep]

  const handleSelection = (choice: 'A' | 'B') => {
    if (selection) return
    setSelection(choice)
    if (choice === currentItem.correct) {
      setScore(s => s + 1)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 2000)
    }
  }

  const nextStep = () => {
    if (currentStep < quizItems.length - 1) {
      setCurrentStep(s => s + 1)
      setSelection(null)
    }
  }

  const reset = () => {
    setCurrentStep(0)
    setSelection(null)
    setScore(0)
  }

  const progress = ((currentStep + (selection ? 1 : 0)) / quizItems.length) * 100

  return (
    <section className="bg-surface border-b border-border-soft py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#10b98108,transparent_70%)]" />
      
      {/* Visual Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-border-soft overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-safe shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-500 ease-out"
        />
      </div>

      <div className="mx-auto max-w-5xl px-6 lg:px-12 xl:px-16 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-evidence/20 bg-evidence/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-evidence shadow-sm"
          >
            <Target className="h-3 w-3" />
            Recruitment Forensic Training
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-black md:text-5xl lg:text-6xl tracking-tight"
          >
            Can you spot the bot?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg text-muted font-medium max-w-2xl mx-auto"
          >
            Choose the job listing you think is <span className="text-risk-text font-black underline decoration-risk-text/30 underline-offset-4">AI-generated</span> or <span className="text-risk-text font-black underline decoration-risk-text/30 underline-offset-4">malicious</span>.
          </motion.p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 relative">
          <AnimatePresence mode="wait">
            {['A', 'B'].map((optionId) => {
              const id = optionId as 'A' | 'B'
              const isCorrect = currentItem.correct === id
              const isSelected = selection === id
              const isAnswered = selection !== null
              const isCorrectSelection = isSelected && isCorrect
              const isWrongSelection = isSelected && !isCorrect

              return (
                <motion.div
                  key={`item-${id}-${currentStep}`}
                  initial={{ opacity: 0, x: id === 'A' ? -30 : 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                >
                  <button
                    onClick={() => handleSelection(id)}
                    disabled={isAnswered}
                    className={`group relative w-full h-full flex flex-col text-left rounded-[2rem] border p-10 transition-all duration-500 overflow-hidden ${
                      isSelected 
                        ? isCorrect
                          ? 'border-safe bg-safe/5 ring-4 ring-safe/10 shadow-[0_20px_50px_-12px_rgba(16,185,129,0.3)]' 
                          : 'border-risk-text bg-risk-bg/10 ring-4 ring-risk-text/10 shadow-[0_20px_50px_-12px_rgba(239,68,68,0.2)]'
                        : isAnswered 
                          ? 'border-border-soft bg-background/50 opacity-50 scale-[0.97]' 
                          : 'border-border bg-background hover:border-safe/40 hover:bg-surface hover:shadow-2xl hover:-translate-y-2'
                    }`}
                  >
                    {!isAnswered && <div className="bot-scan-line opacity-0 group-hover:opacity-30" />}
                    {/* Shake/Bounce Animation on Select */}
                    <motion.div
                      animate={isSelected ? (isCorrect ? { scale: [1, 1.05, 1] } : { x: [-10, 10, -10, 10, 0] }) : {}}
                      transition={{ duration: 0.4 }}
                      className="w-full h-full flex flex-col"
                    >
                      <div className="mb-8 flex items-center justify-between">
                        <div className={`flex items-center gap-3 rounded-2xl px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                          isSelected ? 'bg-foreground text-background shadow-lg scale-110' : 'bg-surface text-muted border border-border-soft group-hover:border-evidence/30'
                        }`}>
                          Example {id}
                        </div>
                        <AnimatePresence>
                          {isSelected && (
                            <motion.div 
                              initial={{ scale: 0, rotate: -45 }} 
                              animate={{ scale: 1, rotate: 0 }} 
                              className={`flex h-10 w-10 items-center justify-center rounded-2xl shadow-xl ${isCorrect ? 'bg-safe text-background' : 'bg-risk-text text-background'}`}
                            >
                              {isCorrect ? <CheckCircle2 className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      <div className="relative flex-grow">
                        <p className={`text-lg font-semibold leading-relaxed transition-colors duration-300 ${isSelected ? 'text-foreground' : 'text-foreground/90'}`}>
                          {currentItem.options[id].text}
                        </p>
                        
                        <AnimatePresence>
                          {isAnswered && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              transition={{ duration: 0.5, ease: 'circOut' }}
                              className="overflow-hidden"
                            >
                              <div className={`mt-8 rounded-2xl border p-6 backdrop-blur-sm ${isSelected && isCorrect ? 'border-safe/20 bg-safe/10 text-safe shadow-inner' : 'border-border-soft bg-surface/50 text-muted'}`}>
                                <div className="flex items-center gap-3 mb-4">
                                  <div className={`h-1.5 w-1.5 rounded-full ${isSelected && isCorrect ? 'bg-safe' : 'bg-muted'}`} />
                                  <p className="text-sm font-black uppercase tracking-wider">{currentItem.options[id].explanation}</p>
                                </div>
                                <ul className="space-y-3">
                                  {currentItem.options[id].points.map((p, i) => (
                                    <li key={i} className="flex items-start gap-3 text-xs font-semibold leading-relaxed opacity-90">
                                      <ArrowRight className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${isSelected && isCorrect ? 'text-safe' : 'text-muted'}`} /> 
                                      {p}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>

                    {/* Celebratory Particles (Simulated) */}
                    {isCorrectSelection && showConfetti && (
                      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2rem]">
                        {[...Array(12)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ x: '50%', y: '50%', scale: 0 }}
                            animate={{ 
                              x: `${Math.random() * 100}%`, 
                              y: `${Math.random() * 100}%`, 
                              scale: [0, 1, 0],
                              rotate: [0, 180] 
                            }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="absolute h-2 w-2 rounded-full bg-safe/40"
                          />
                        ))}
                      </div>
                    )}
                  </button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
        
        <div className="mt-16 flex flex-col items-center gap-8">
          <AnimatePresence mode="wait">
            {selection && currentStep < quizItems.length - 1 ? (
              <motion.button 
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={nextStep}
                className="group inline-flex items-center gap-3 rounded-2xl bg-foreground px-10 py-5 text-base font-black text-background hover:bg-safe transition-all shadow-2xl hover:shadow-safe/20"
              >
                Continue Training 
                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </motion.button>
            ) : selection && currentStep === quizItems.length - 1 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="mb-6 inline-flex flex-col items-center">
                  <div className="text-sm font-black uppercase tracking-[0.3em] text-muted mb-2">Training Performance</div>
                  <div className="text-6xl font-black text-foreground tabular-nums">{score} <span className="text-2xl text-muted">/ {quizItems.length}</span></div>
                  <div className={`mt-2 rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${
                    score === quizItems.length ? 'bg-safe/20 text-safe border border-safe/30' : 
                    score >= 2 ? 'bg-evidence/20 text-evidence border border-evidence/30' : 
                    'bg-muted/20 text-muted border border-border-soft'
                  }`}>
                    {score === quizItems.length ? 'MASTER FORENSIC ANALYST' : score >= 2 ? 'SENIOR INVESTIGATOR' : 'RECRUIT'}
                  </div>
                </div>
                <div className="mb-4 text-2xl font-black">Training Complete!</div>
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                  <button
                    onClick={reset}
                    className="inline-flex items-center gap-2 rounded-full border border-border-soft bg-background px-6 py-2 text-sm font-bold text-muted hover:text-foreground transition-all"
                  >
                    <RefreshCcw className="h-4 w-4" /> Start Over
                  </button>
                  <button
                    onClick={() => {
                      const rank = score === quizItems.length ? 'Master Forensic Analyst' : score >= 2 ? 'Senior Investigator' : 'Recruit'
                      const text = `I just reached the rank of "${rank}" in the HireProof "Spot the Bot" challenge (${score}/${quizItems.length})! 🕵️‍♂️✨\n\nCan you beat my forensic score? #HireProof #DeadInternet #StopScams`
                      if (navigator.share) {
                        navigator.share({ title: 'HireProof Training', text })
                      } else {
                        navigator.clipboard.writeText(text)
                        showToast('Score copied to clipboard! Share it on social media.', 'success')
                      }
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-safe/10 px-6 py-2 text-sm font-black text-safe hover:bg-safe/20 transition-all"
                  >
                    Share My Score
                  </button>
                </div>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="inline-flex items-center gap-2 rounded-2xl bg-safe px-8 py-4 text-sm font-black text-background hover:shadow-xl transition-all"
                >
                  Start Real Audit
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="overflow-hidden rounded-[2.5rem] border border-evidence/10 bg-surface/30 backdrop-blur-md p-10 text-center shadow-sm relative max-w-3xl border-dashed"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-evidence/5 text-evidence mb-6">
              <Cpu className="h-7 w-7" />
            </div>
            <p className="text-base font-semibold leading-relaxed text-muted/80 italic">
              "Linguistic analysis reveals that automated agents often struggle with <span className="text-foreground font-black underline decoration-evidence/20 underline-offset-4">authentically messy human communication</span>. HireProof identifies these optimized patterns with 99.4% precision."
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
