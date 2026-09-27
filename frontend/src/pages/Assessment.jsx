import { useState } from 'react'
import QuestionField from '../components/QuestionField.jsx'
import { assessmentSections } from '../data/assessmentQuestions.js'

// Build the starting answers object: '' for single-choice, [] for multi-choice.
function createEmptyAnswers() {
  const answers = {}
  assessmentSections.forEach((section) => {
    section.questions.forEach((q) => {
      answers[q.id] = q.type === 'multi' ? [] : ''
    })
  })
  return answers
}

// Returns { [questionId]: 'error message' } for the unanswered required
// questions in one section. An empty object means the section is valid.
function validateSection(section, answers) {
  const errors = {}
  section.questions.forEach((q) => {
    const answer = answers[q.id]
    const isEmpty = q.type === 'multi' ? answer.length === 0 : answer === ''
    if (q.required && isEmpty) {
      errors[q.id] = 'Please answer this question to continue.'
    }
  })
  return errors
}

// Look up the display label for an option value (used in the summary).
function labelFor(question, value) {
  return question.options.find((o) => o.value === value)?.label ?? value
}

// Career Assessment page (Step 8).
// Shows one section at a time, validates it, and keeps all answers in
// component state. Nothing is saved anywhere yet — saving to Supabase is a
// later step. On submit, the captured answers are shown so they can be checked.
function Assessment({ onExit }) {
  const [answers, setAnswers] = useState(createEmptyAnswers)
  const [stepIndex, setStepIndex] = useState(0)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const section = assessmentSections[stepIndex]
  const isLastStep = stepIndex === assessmentSections.length - 1

  function handleAnswerChange(questionId, value) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
    // Clear that question's error as soon as the student answers it.
    setErrors((prev) => ({ ...prev, [questionId]: undefined }))
  }

  function handleNext() {
    const sectionErrors = validateSection(section, answers)
    if (Object.keys(sectionErrors).length > 0) {
      setErrors(sectionErrors)
      return
    }
    setErrors({})
    if (isLastStep) {
      setSubmitted(true)
    } else {
      setStepIndex(stepIndex + 1)
    }
  }

  function handleBack() {
    setErrors({})
    setStepIndex(stepIndex - 1)
  }

  function handleRestart() {
    setAnswers(createEmptyAnswers())
    setErrors({})
    setStepIndex(0)
    setSubmitted(false)
  }

  if (submitted) {
    return (
      <main className="page">
        <h1>Assessment complete</h1>
        <p>
          Your answers were captured in the app. Nothing is saved yet — storing them and
          matching them to careers comes in later steps.
        </p>

        {assessmentSections.map((s) => (
          <section key={s.id} className="summary-section">
            <h2>{s.title}</h2>
            <dl>
              {s.questions.map((q) => {
                const answer = answers[q.id]
                const values = q.type === 'multi' ? answer : [answer]
                return (
                  <div key={q.id}>
                    <dt>{q.label}</dt>
                    <dd>{values.map((v) => labelFor(q, v)).join(', ')}</dd>
                  </div>
                )
              })}
            </dl>
          </section>
        ))}

        <h2>Raw answers (for testing)</h2>
        <pre className="answers-json">{JSON.stringify(answers, null, 2)}</pre>

        <div className="button-row">
          <button type="button" className="button button-secondary" onClick={handleRestart}>
            Retake assessment
          </button>
          <button type="button" className="button button-secondary" onClick={onExit}>
            Back to home
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="page">
      <p className="step-indicator">
        Step {stepIndex + 1} of {assessmentSections.length}
      </p>
      <progress
        className="progress"
        value={stepIndex + 1}
        max={assessmentSections.length}
        aria-label="Assessment progress"
      />

      <h1>{section.title}</h1>
      <p>{section.description}</p>

      {section.questions.map((q) => (
        <QuestionField
          key={q.id}
          question={q}
          value={answers[q.id]}
          error={errors[q.id]}
          onChange={handleAnswerChange}
        />
      ))}

      <div className="button-row">
        {stepIndex === 0 ? (
          <button type="button" className="button button-secondary" onClick={onExit}>
            Cancel
          </button>
        ) : (
          <button type="button" className="button button-secondary" onClick={handleBack}>
            Back
          </button>
        )}
        <button type="button" className="button" onClick={handleNext}>
          {isLastStep ? 'Submit' : 'Next'}
        </button>
      </div>
    </main>
  )
}

export default Assessment
