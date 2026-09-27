import { useState } from 'react'
import Home from './pages/Home.jsx'
import Assessment from './pages/Assessment.jsx'

// Simple view switching between Home and Assessment using component state.
// A proper router (and the Profile -> Results pages) is added in a later
// phase — see NEXT_PHASE.md.
function App() {
  const [view, setView] = useState('home')

  if (view === 'assessment') {
    return <Assessment onExit={() => setView('home')} />
  }
  return <Home onStartAssessment={() => setView('assessment')} />
}

export default App
