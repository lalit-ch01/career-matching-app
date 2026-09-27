// Matching service placeholder.
//
// The real career-matching algorithm (education, skills, interests, and
// work-preference comparison -> Match %) is built in a later phase.
// See NEXT_PHASE.md for the planned approach.
//
// This placeholder just defines the expected function shape so the rest
// of the app can be wired up against it later without changes.

/**
 * Will eventually compare a student profile against the career database
 * and return ranked matches with an explainable Match %.
 *
 * @param {object} studentProfile - education, skills, interests, work preferences
 * @param {object[]} careers - the career database
 * @returns {object[]} ranked matches (not implemented yet)
 */
export function calculateMatches(studentProfile, careers) {
  throw new Error(
    'calculateMatches() is not implemented yet — matching algorithm is a later development phase.'
  )
}
