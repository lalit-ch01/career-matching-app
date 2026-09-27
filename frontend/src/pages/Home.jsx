// Home page placeholder.
// Real content (full intro, etc.) is added in a later phase.
// For now it only has a button to open the assessment (Step 8).
function Home({ onStartAssessment }) {
  return (
    <main className="page">
      <h1>From Degree to Career</h1>
      <p>
        AI-based skill &amp; interest matching for Indian Gen Z students.
        This is the project foundation — pages, components, and services
        will be built out phase by phase. See NEXT_PHASE.md for the plan.
      </p>
      <button type="button" className="button" onClick={onStartAssessment}>
        Start Assessment
      </button>
    </main>
  )
}

export default Home
