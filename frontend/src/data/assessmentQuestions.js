// Assessment question definitions (Step 8).
//
// Aligned with the finalized Google Form survey (Q1-Q11) so the two data
// sources use the same taxonomy and can be compared/merged later. Not every
// form question is reproduced here:
//   - Q1, Q2, Q3, Q4, Q5, Q6 -> reused below (same wording/options as the form)
//   - Q7 (career areas to explore) -> omitted, it duplicates the Q4 interest
//     signal for matching purposes, and asking it before showing results is
//     circular (that's the app's output, not an input)
//   - Q8, Q9, Q10, Q11 -> omitted, these are research/validation questions
//     about the project itself (career-choice difficulty, goal clarity,
//     willingness to use an AI system) and don't feed calculateMatches()
//
// A few questions have no equivalent in the form but are kept because
// PROJECT_INSTRUCTIONS.md Section 6 requires them as matching factors, or
// because they meaningfully sharpen matching without contradicting the form:
//   - skills_detail   -> optional, finer-grained skills so 10 different
//                        careers don't all collapse to the same 8 answers
//   - work_style / work_environment -> supplementary "work preferences" signal
//   - career_priorities -> the form has no "career preferences" question at
//                          all, but Section 6 lists it as a required factor
//
// Each question has:
//   id        - key used in the answers object (e.g. answers.skills)
//   type      - 'single' (one -> string), 'multi' (many -> string[]),
//               or 'scale' (1-5 rating -> string, rendered like 'single')
//   label     - the question text shown to the student
//   help      - optional hint text
//   required  - must be answered before moving on
//   maxSelect - (multi only) maximum number of choices allowed
//   minLabel/maxLabel - (scale only) captions shown under the low/high ends
//   options   - [{ value, label }]; `value` is a stable slug, `label` is display text
//
// NOTE: the skill/interest slugs here are the taxonomy the career/skill
// tables (Steps 5-7) should be built against, since they now mirror the
// Google Form categories.

export const assessmentSections = [
  {
    id: 'education',
    title: 'Education',
    description: 'Tell us about your academic background.',
    questions: [
      {
        // Google Form Q1
        id: 'education_level',
        type: 'single',
        label: 'What is your current level of education?',
        required: true,
        options: [
          { value: 'undergraduate', label: 'Undergraduate' },
          { value: 'postgraduate', label: 'Postgraduate' },
          { value: 'other', label: 'Other' },
        ],
      },
      {
        // Google Form Q2
        id: 'degree',
        type: 'single',
        label: 'What is your degree / specialization?',
        required: true,
        options: [
          { value: 'bsc', label: 'BSc' },
          { value: 'bcom', label: 'BCom' },
          { value: 'bba', label: 'BBA' },
          { value: 'ba', label: 'BA' },
          { value: 'btech', label: 'BTech' },
          { value: 'mba', label: 'MBA' },
          { value: 'other', label: 'Other' },
        ],
      },
    ],
  },
  {
    id: 'skills',
    title: 'Skills',
    description: 'Tell us about the skills you currently have.',
    questions: [
      {
        // Google Form Q3
        id: 'skills',
        type: 'multi',
        label: 'Which skills do you currently have?',
        help: 'Choose at least one.',
        required: true,
        options: [
          { value: 'excel', label: 'Excel' },
          { value: 'communication', label: 'Communication' },
          { value: 'analytical-thinking', label: 'Analytical Thinking' },
          { value: 'leadership', label: 'Leadership' },
          { value: 'creativity', label: 'Creativity' },
          { value: 'programming', label: 'Programming' },
          { value: 'problem-solving', label: 'Problem Solving' },
          { value: 'other', label: 'Other' },
        ],
      },
      {
        // App-only addition, not in the Google Form. Optional: it only adds
        // detail on top of the Q3 answer so career matches (e.g. Data
        // Analyst vs. HR Analyst) don't all look identical.
        id: 'skills_detail',
        type: 'multi',
        label: 'Do you have any of these more specific skills?',
        help: 'Optional — pick any that apply, or skip this question.',
        required: false,
        options: [
          { value: 'sql', label: 'SQL / databases' },
          { value: 'data-analysis', label: 'Data analysis' },
          { value: 'data-visualization', label: 'Data visualization' },
          { value: 'statistics', label: 'Statistics' },
          { value: 'financial-modeling', label: 'Financial modeling' },
          { value: 'accounting', label: 'Accounting' },
          { value: 'market-research', label: 'Market research' },
          { value: 'content-creation', label: 'Content creation / writing' },
          { value: 'seo', label: 'SEO' },
          { value: 'social-media', label: 'Social media marketing' },
          { value: 'digital-advertising', label: 'Digital advertising (Google/Meta Ads)' },
          { value: 'presentation', label: 'Presentation' },
          { value: 'teamwork', label: 'Teamwork' },
          { value: 'negotiation', label: 'Negotiation' },
          { value: 'recruitment', label: 'Recruitment / interviewing' },
          { value: 'project-planning', label: 'Project planning' },
          { value: 'process-management', label: 'Process management' },
          { value: 'requirements-gathering', label: 'Requirements gathering' },
        ],
      },
      {
        // Google Form Q5
        id: 'skill_confidence',
        type: 'scale',
        label: 'How confident are you about your current skills?',
        required: true,
        minLabel: 'Not confident',
        maxLabel: 'Very confident',
        options: [
          { value: '1', label: '1' },
          { value: '2', label: '2' },
          { value: '3', label: '3' },
          { value: '4', label: '4' },
          { value: '5', label: '5' },
        ],
      },
    ],
  },
  {
    id: 'interests',
    title: 'Interests',
    description: 'What kinds of work or topics do you enjoy?',
    questions: [
      {
        // Google Form Q4
        id: 'interests',
        type: 'multi',
        label: 'Which areas are you most interested in?',
        help: 'Choose at least one.',
        required: true,
        options: [
          { value: 'technology-data', label: 'Technology & Data' },
          { value: 'finance', label: 'Finance' },
          { value: 'hr-people', label: 'HR & People' },
          { value: 'marketing', label: 'Marketing' },
          { value: 'operations', label: 'Operations' },
          { value: 'research', label: 'Research' },
          { value: 'other', label: 'Other' },
        ],
      },
    ],
  },
  {
    id: 'work_preferences',
    title: 'Work preferences',
    description: 'How do you like to work?',
    questions: [
      {
        // Google Form Q6
        id: 'work_type',
        type: 'single',
        label: 'What type of work do you prefer?',
        required: true,
        options: [
          { value: 'analytical', label: 'Analytical' },
          { value: 'creative', label: 'Creative' },
          { value: 'people-oriented', label: 'People-oriented' },
          { value: 'technical', label: 'Technical' },
          { value: 'management-oriented', label: 'Management-oriented' },
        ],
      },
      {
        // App-only addition, not in the Google Form.
        id: 'work_style',
        type: 'single',
        label: 'Do you prefer working alone or with others?',
        required: true,
        options: [
          { value: 'independent', label: 'Mostly independently' },
          { value: 'mixed', label: 'A mix of both' },
          { value: 'team', label: 'Mostly in a team' },
        ],
      },
      {
        // App-only addition, not in the Google Form.
        id: 'work_environment',
        type: 'single',
        label: 'What kind of work environment suits you?',
        required: true,
        options: [
          { value: 'structured', label: 'Structured, with clear processes and routines' },
          { value: 'dynamic', label: 'Fast-changing, with new challenges often' },
        ],
      },
    ],
  },
  {
    id: 'career_preferences',
    title: 'Career preferences',
    description: 'What matters most to you in a career?',
    questions: [
      {
        // App-only addition, not in the Google Form. PROJECT_INSTRUCTIONS.md
        // Section 6 lists "career preferences" as a required matching
        // factor, and nothing else in the form covers it.
        id: 'career_priorities',
        type: 'multi',
        label: 'Pick the things that matter most to you in a career.',
        help: 'Choose up to 3.',
        required: true,
        maxSelect: 3,
        options: [
          { value: 'high-salary', label: 'High salary' },
          { value: 'job-stability', label: 'Job stability' },
          { value: 'fast-growth', label: 'Fast career growth' },
          { value: 'work-life-balance', label: 'Work-life balance' },
          { value: 'creativity', label: 'Creative freedom' },
          { value: 'social-impact', label: 'Making an impact on people' },
          { value: 'leadership-role', label: 'Leading a team' },
        ],
      },
    ],
  },
]
