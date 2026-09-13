import { useState, useEffect, useRef, useCallback } from 'react'

const STUDENTS = [
  'Akshad Rokade', 'Rahul Patil', 'Sneha Sharma', 'Tanvi Joshi',
  'Neha Joshi', 'Aditya Shinde', 'Priya Mehta', 'Rohit Kumar',
  'Ananya Singh', 'Vikram Nair', 'Kavya Reddy', 'Arjun Sharma',
  'Pooja Iyer', 'Siddharth Rao', 'Meera Patel', 'Karan Desai',
  'Sunita Gupta', 'Ravi Tiwari', 'Deepa Verma', 'Amit Joshi',
]

const TOPICS = [
  'Automated Plant Watering System', 'Smart Traffic Controller',
  'IoT Weather Station', 'Gesture-Controlled Robot', 'Solar Energy Monitor',
  'AI Attendance System', 'Bluetooth Door Lock', 'Voice Controlled Home',
  'Waste Segregation Bot', 'Smart Irrigation System', 'Fire Detection System',
  'Real-Time Chat App', 'Health Monitoring Band', 'Smart Parking System',
  'Facial Recognition Door', 'EV Charging Tracker', 'Drone Navigation AI',
  'Smart Mirror Display', 'Water Quality Monitor', 'Air Quality Index App',
  'Remote Lab Simulator',
]

type Results = { team: string[]; topic: string } | null

function mod(n: number, m: number) {
  return ((n % m) + m) % m
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function IconList() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="2" y1="4" x2="14" y2="4" />
      <line x1="2" y1="8" x2="14" y2="8" />
      <line x1="2" y1="12" x2="14" y2="12" />
    </svg>
  )
}

function IconFullscreen() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="2,6 2,2 6,2" />
      <polyline points="10,2 14,2 14,6" />
      <polyline points="14,10 14,14 10,14" />
      <polyline points="6,14 2,14 2,10" />
    </svg>
  )
}

function IconReset() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M13.5 8A5.5 5.5 0 1 1 10 3.06" />
      <polyline points="10,1 10,4 13,4" />
    </svg>
  )
}

function IconRefresh({ spinning }: { spinning?: boolean }) {
  return (
    <svg
      width="13" height="13" viewBox="0 0 16 16" fill="none"
      stroke="currentColor" strokeWidth="1.5"
      className={spinning ? 'spinning-icon' : ''}
    >
      <path d="M13.5 8A5.5 5.5 0 1 1 10 3.06" />
      <polyline points="10,1 10,4 13,4" />
    </svg>
  )
}

function IconChevronUp() {
  return (
    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="1,7 6,2 11,7" />
    </svg>
  )
}

function IconChevronDown() {
  return (
    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="1,1 6,6 11,1" />
    </svg>
  )
}

function IconChevronLeft() {
  return (
    <svg width="8" height="12" viewBox="0 0 8 12" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="7,1 2,6 7,11" />
    </svg>
  )
}

function IconChevronRight() {
  return (
    <svg width="8" height="12" viewBox="0 0 8 12" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="1,1 6,6 1,11" />
    </svg>
  )
}

function IconSpinArrow({ spinning }: { spinning: boolean }) {
  return (
    <svg
      width="15" height="15" viewBox="0 0 16 16" fill="none"
      stroke="currentColor" strokeWidth="1.8"
      className={spinning ? 'spinning-icon' : ''}
    >
      <path d="M13.5 8A5.5 5.5 0 1 1 10 3.06" />
      <polyline points="10,1 10,4 13,4" />
    </svg>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function NavIconBtn({ onClick, children, title }: { onClick?: () => void; children: React.ReactNode; title?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-8 h-8 flex items-center justify-center border border-[var(--border)] text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--border-strong)] transition-colors duration-150 cursor-pointer"
    >
      {children}
    </button>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="text-[10px] tracking-[0.18em] uppercase text-[var(--text-dim)]"
      style={{ fontFamily: 'var(--font-mono)' }}
    >
      {children}
    </span>
  )
}

function MetaRow({ count, label, onRefresh }: { count: number; label: string; onRefresh: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="text-[10px] tracking-[0.14em] uppercase text-[var(--text-dim)]"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {count} {label}
      </span>
      <button
        onClick={onRefresh}
        className="text-[var(--text-muted)] hover:text-[var(--text-dim)] transition-colors duration-150 cursor-pointer"
      >
        <IconRefresh />
      </button>
    </div>
  )
}

// Student Picker — vertical drum-roll
function StudentPicker({
  students,
  activeIndex,
  onPrev,
  onNext,
  isSpinning,
}: {
  students: string[]
  activeIndex: number
  onPrev: () => void
  onNext: () => void
  isSpinning: boolean
}) {
  const offsets = [-2, -1, 0, 1, 2]

  return (
    <div className="flex flex-col items-center w-full">
      {/* Up arrow */}
      <button
        onClick={onPrev}
        disabled={isSpinning}
        className="mb-3 text-[var(--text-muted)] hover:text-[var(--text-dim)] disabled:opacity-30 transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed"
      >
        <IconChevronUp />
      </button>

      {/* Names */}
      <div className="flex flex-col items-center w-full gap-0">
        {offsets.map((offset) => {
          const idx = mod(activeIndex + offset, students.length)
          const name = students[idx]
          const isActive = offset === 0

          if (isActive) {
            return (
              <div
                key="active"
                className="w-full flex items-center justify-center py-2 px-4 border border-[var(--border-strong)] pick-row-0"
                style={{ height: '44px' }}
              >
                <span
                  className="text-sm font-bold tracking-wide text-[var(--text)]"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {name}
                </span>
              </div>
            )
          }

          const cls = Math.abs(offset) === 2 ? 'pick-row-2' : 'pick-row-1'

          return (
            <div
              key={offset}
              className={`w-full flex items-center justify-center py-2 px-4 ${cls}`}
              style={{ height: '40px' }}
            >
              <span
                className="text-sm tracking-wide text-[var(--text)]"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {name}
              </span>
            </div>
          )
        })}
      </div>

      {/* Down arrow */}
      <button
        onClick={onNext}
        disabled={isSpinning}
        className="mt-3 text-[var(--text-muted)] hover:text-[var(--text-dim)] disabled:opacity-30 transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed"
      >
        <IconChevronDown />
      </button>
    </div>
  )
}

// Topic Picker — horizontal prev/next
function TopicPicker({
  topics,
  activeIndex,
  onPrev,
  onNext,
  isSpinning,
}: {
  topics: string[]
  activeIndex: number
  onPrev: () => void
  onNext: () => void
  isSpinning: boolean
}) {
  return (
    <div className="flex items-center gap-3 w-full">
      <button
        onClick={onPrev}
        disabled={isSpinning}
        className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-dim)] disabled:opacity-30 transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed"
      >
        <IconChevronLeft />
      </button>

      <div className="flex-1 border border-[var(--border-strong)] flex items-center justify-center px-4 py-3">
        <span
          className="text-sm font-bold tracking-wide text-[var(--text)] text-center leading-snug"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {topics[activeIndex]}
        </span>
      </div>

      <button
        onClick={onNext}
        disabled={isSpinning}
        className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-dim)] disabled:opacity-30 transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed"
      >
        <IconChevronRight />
      </button>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [activeStudentIdx, setActiveStudentIdx] = useState(2)
  const [activeTopicIdx, setActiveTopicIdx] = useState(0)
  const [teamSize, setTeamSize] = useState(3)
  const [isSpinning, setIsSpinning] = useState(false)
  const [results, setResults] = useState<Results>(null)
  const [students] = useState(STUDENTS)
  const [topics] = useState(TOPICS)
  const spinRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const handleSpin = useCallback(() => {
    if (isSpinning) return
    setIsSpinning(true)
    setResults(null)

    let tick = 0
    const totalTicks = 28
    let delay = 40

    const cycle = () => {
      setActiveStudentIdx((i) => mod(i + 1, students.length))
      setActiveTopicIdx((i) => mod(i + 1, topics.length))
      tick++

      if (tick >= totalTicks) {
        setIsSpinning(false)
        setActiveStudentIdx((finalIdx) => {
          setActiveTopicIdx((finalTopicIdx) => {
            const team: string[] = []
            for (let k = 0; k < teamSize; k++) {
              team.push(students[mod(finalIdx + k, students.length)])
            }
            setResults({ team, topic: topics[finalTopicIdx] })
            return finalTopicIdx
          })
          return finalIdx
        })
        return
      }

      if (tick > 18) delay = 40 + (tick - 18) * 22
      spinRef.current = setTimeout(cycle, delay)
    }

    spinRef.current = setTimeout(cycle, delay)
  }, [isSpinning, students, topics, teamSize])

  useEffect(() => {
    return () => {
      if (spinRef.current) clearTimeout(spinRef.current)
    }
  }, [])

  const handleReset = () => {
    if (spinRef.current) clearTimeout(spinRef.current)
    setIsSpinning(false)
    setResults(null)
    setActiveStudentIdx(2)
    setActiveTopicIdx(0)
    setTeamSize(3)
  }

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >
      {/* ── Header ── */}
      <header
        className="flex-shrink-0 flex items-center justify-between px-8 border-b border-[var(--border)]"
        style={{ height: '48px' }}
      >
        {/* Left: brand + nav */}
        <div className="flex items-center gap-6">
          <span
            className="text-sm font-bold tracking-[0.2em] uppercase text-[var(--text)]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            SPINCLASS
          </span>
          <nav className="flex items-center gap-4">
            <button className="text-[10px] tracking-[0.18em] uppercase text-[var(--text-dim)] hover:text-[var(--text)] transition-colors duration-150 cursor-pointer">
              SPINCLASS
            </button>
            <button className="text-[10px] tracking-[0.18em] uppercase text-[var(--text)] border border-[var(--border-strong)] px-3 py-1 cursor-pointer">
              TEAM &amp; TOPIC
            </button>
          </nav>
        </div>

        {/* Right: icon buttons */}
        <div className="flex items-center gap-1.5">
          <NavIconBtn title="Manage students"><IconList /></NavIconBtn>
          <NavIconBtn title="Fullscreen"><IconFullscreen /></NavIconBtn>
          <NavIconBtn title="Reset" onClick={handleReset}><IconReset /></NavIconBtn>
        </div>
      </header>

      {/* ── Body ── */}
      <main className="flex-1 flex flex-col items-center justify-start overflow-hidden px-8 pt-8 pb-6">
        <div className="w-full" style={{ maxWidth: '900px' }}>

          {/* ── Two-column pickers ── */}
          <div className="grid gap-8" style={{ gridTemplateColumns: '1fr 1fr' }}>

            {/* ── Left: Team Members ── */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <SectionLabel>Team Members</SectionLabel>
                <MetaRow count={students.length} label="students loaded" onRefresh={() => {}} />
              </div>

              {/* Picker container */}
              <div
                className="border border-[var(--border)] flex flex-col items-center justify-center py-4 px-6"
                style={{ background: 'var(--bg-surface)' }}
              >
                <StudentPicker
                  students={students}
                  activeIndex={activeStudentIdx}
                  onPrev={() => setActiveStudentIdx((i) => mod(i - 1, students.length))}
                  onNext={() => setActiveStudentIdx((i) => mod(i + 1, students.length))}
                  isSpinning={isSpinning}
                />
              </div>
            </div>

            {/* ── Right: Topic ── */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <SectionLabel>Topic</SectionLabel>
                <MetaRow count={topics.length} label="topics loaded" onRefresh={() => {}} />
              </div>

              {/* Picker container — same border/bg treatment */}
              <div
                className="border border-[var(--border)] flex flex-col justify-center py-4 px-6"
                style={{ background: 'var(--bg-surface)', minHeight: '220px' }}
              >
                <TopicPicker
                  topics={topics}
                  activeIndex={activeTopicIdx}
                  onPrev={() => setActiveTopicIdx((i) => mod(i - 1, topics.length))}
                  onNext={() => setActiveTopicIdx((i) => mod(i + 1, topics.length))}
                  isSpinning={isSpinning}
                />

                {/* Topic counter indicator */}
                <div className="mt-4 flex justify-center">
                  <span
                    className="text-[10px] tracking-[0.14em] text-[var(--text-muted)]"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {String(activeTopicIdx + 1).padStart(2, '0')} / {String(topics.length).padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Controls: Team Size + Spin ── */}
          <div className="mt-6 flex flex-col items-center gap-3">
            {/* Team size */}
            <div className="flex items-center gap-4">
              <SectionLabel>Team Size</SectionLabel>
              <div className="flex items-center gap-0">
                <button
                  onClick={() => setTeamSize((s) => Math.max(1, s - 1))}
                  disabled={isSpinning || teamSize <= 1}
                  className="w-8 h-8 flex items-center justify-center border border-[var(--border-strong)] text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--text-dim)] disabled:opacity-30 transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed text-sm"
                >
                  −
                </button>
                <div
                  className="w-10 h-8 flex items-center justify-center border-t border-b border-[var(--border-strong)] text-sm font-bold text-[var(--text)]"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {teamSize}
                </div>
                <button
                  onClick={() => setTeamSize((s) => Math.min(students.length, s + 1))}
                  disabled={isSpinning || teamSize >= students.length}
                  className="w-8 h-8 flex items-center justify-center border border-[var(--border-strong)] text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--text-dim)] disabled:opacity-30 transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed text-sm"
                >
                  +
                </button>
              </div>
            </div>

            {/* Spin button */}
            <button
              onClick={handleSpin}
              disabled={isSpinning}
              className="flex items-center justify-center gap-3 border border-[var(--border-strong)] px-12 py-3 text-sm font-bold tracking-[0.2em] uppercase text-[var(--text)] hover:bg-[var(--bg-surface)] disabled:opacity-50 transition-all duration-150 cursor-pointer disabled:cursor-not-allowed"
              style={{ minWidth: '200px', fontFamily: 'var(--font-mono)' }}
            >
              <IconSpinArrow spinning={isSpinning} />
              {isSpinning ? 'SPINNING...' : results ? 'SPIN AGAIN' : 'SPIN'}
            </button>
          </div>

          {/* ── Results ── */}
          {results && (
            <div className="mt-6">
              {/* Divider */}
              <div className="border-t border-[var(--border)] mb-5" />

              <div className="grid gap-8" style={{ gridTemplateColumns: '1fr 1fr' }}>
                {/* Team column */}
                <div>
                  <SectionLabel>Team</SectionLabel>
                  <div className="mt-3 flex flex-col gap-1.5">
                    {results.team.map((name, i) => (
                      <div key={i} className="flex items-baseline gap-3">
                        <span
                          className="text-[10px] tracking-[0.1em] text-[var(--text-muted)] w-5 text-right flex-shrink-0"
                          style={{ fontFamily: 'var(--font-mono)' }}
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span
                          className="text-sm text-[var(--text)] tracking-wide"
                          style={{ fontFamily: 'var(--font-mono)' }}
                        >
                          {name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Topic column */}
                <div>
                  <SectionLabel>Topic</SectionLabel>
                  <div className="mt-3">
                    <span
                      className="text-sm font-bold text-[var(--text)] tracking-wide leading-snug"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {results.topic}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
