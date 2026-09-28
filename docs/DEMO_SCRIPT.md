# Demo Script — From Degree to Career

A step-by-step script for presenting the app live at Avishkar. It covers the
full student journey (profile → assessment → ranked matches → career details →
skill gap → learning path) in about **8 minutes**. For a 5-minute slot, skip the
steps marked *(optional)*.

Every number below is what the matching model (`weighted-v1`) actually produces
for these inputs with the current seed data. If you change weights or career
data, re-check them, since the results will change.

---

## 1. Before the presentation

**The day before**

- [ ] `npm run verify` passes against the live database.
- [ ] `/api/health` on the deployed URL returns OK.
- [ ] Run the main demo (Section 3) once end to end on the **deployed URL** and
      once on a **phone**. Check the numbers match Section 3.
- [ ] Take screenshots of every screen in Section 3 (home, profile,
      each assessment step, results, career details). They're your backup if the
      Wi-Fi or database fails.
- [ ] Have a local copy ready as a second backup: `npm run dev` with a working
      `.env.local`.

**Just before you start**

- [ ] Open the app in a **private / incognito window**. The app remembers a
      student with a cookie and autosaves assessment drafts, so a normal window
      may open halfway through an old run.
- [ ] Open a second tab on `/methodology` for questions.
- [ ] Zoom the browser to about 125% so judges can read the screen.
- [ ] Keep Section 3's input card printed or on your phone.

**Between two runs** (e.g. a judge wants to try it): open a new private window,
or go to `/profile` and click **Forget me on this device**.

---

## 2. The one-sentence framing

Say this early and use the same words every time:

> "It's an **explainable, rule-based matching model**: five weighted factors,
> and every percentage point can be traced back to a rule. It isn't machine
> learning, and we chose that on purpose so a student can see *why* a career
> was recommended."

Don't call it "AI" or say the system "learns". If a judge asks about machine
learning, see Q2 in Section 5.

---

## 3. Main demo — "Riya", MA student (about 8 min)

**Why this student:** Riya gets a strong match (85%) but is still missing one
core skill, so the skill gap and learning path have something to show. A student
who scores 99% looks rigged and leaves the gap screens empty.

### Input card

| Screen | Field | Enter / click |
|---|---|---|
| Profile | Full name | Riya Sharma |
| | Current level of education | Postgraduate |
| | Degree | MA |
| | College, graduation year, email | Leave blank (optional) |
| Assessment 1 — Skills | Which skills do you currently have? | **Excel**, **Analytical Thinking** |
| | More specific skills (optional) | **Research**, **Critical Thinking**, **Presentation** |
| | How confident are you? | 3 |
| Assessment 2 — Interests | Which areas interest you? | **Research** |
| Assessment 3 — Work preferences | Type of work | **Analytical** |
| | Alone or with others | **Mostly independently** |
| | Work environment | **Structured, with clear processes and routines** |
| Assessment 4 — Career preferences | What matters most (up to 3) | **Work-life balance**, **Job stability** |

### Expected results (check these during rehearsal)

| Rank | Career | Match | Band |
|---|---|---|---|
| 1 | Research Analyst | **85%** | Strong match |
| 2 | Financial Analyst | 44% | Moderate match |
| 3 | Data Analyst | 41% | Moderate match |
| 4 | Talent Acquisition Specialist | 39% | Moderate match |

Research Analyst breakdown (points add up to the Match %):

| Factor | Weight | Points | Why |
|---|---|---|---|
| Skills | 35% | 20.4 | Has 3 of 5 required skills (7 of 12 importance points) |
| Interests | 25% | 25 | Research is the career's primary area |
| Education | 15% | 15 | MA is a preferred degree |
| Work preferences | 15% | 15 | Analytical, independent, structured: all match |
| Career preferences | 10% | 10 | Offers both of her priorities |
| **Total** | | **85.4 → 85%** | Potential match if the gaps are closed: **100%** |

Skill gap: missing **Data Analysis** (core) and **Communication** (supporting).
Learning path: **Phase 1** Data Analysis (about 105 hours), **Phase 2**
Communication (about 21 hours).

### Step by step

| # | Time | On screen | Do | Say |
|---|---|---|---|---|
| 1 | 0:00 | Home page | — | "Many Indian graduates pick a career because of family or peer pressure, or because they don't know what their degree leads to. *[Add one finding from your Google Form survey here, e.g. "X% of our N respondents said…"]* Our app turns a student's degree, skills and interests into ranked careers, and shows why each one was recommended." |
| 2 | 0:45 | Home | Click **Start — it's free** | "Riya has just finished an MA. She likes research but doesn't know which jobs fit." |
| 3 | 1:00 | Profile | Fill the Profile rows of the input card, click **Continue to assessment** | "No sign-up or password. Only the name and degree are required, and she can delete her data at any time." |
| 4 | 1:30 | Assessment — Skills | Fill Skills, click **Next** | "The assessment asks the same kinds of questions as our research survey, so the survey data and the app use the same categories." |
| 5 | 2:15 | Interests, Work preferences, Career preferences | Fill the rest, click **Submit and see my matches** | "Four short sections, about five minutes. Answers are validated in the browser and again on the server." |
| 6 | 3:00 | Results — **Best match** card | Point at **Research Analyst 85%** | "All 14 careers in our database are scored and ranked. Riya's best match is Research Analyst at 85%, a strong match." |
| 7 | 3:30 | Results — **All careers, ranked** | Scroll through the list | "The rest drop off sharply. Financial Analyst is 44%. So the model separates careers; it doesn't give everyone 70%." |
| 8 | 3:50 | Results — **Your profile analysis** *(optional)* | Point at the panel | "This shows what the system understood from her answers. Skill confidence is recorded for research but deliberately not scored." |
| 9 | 4:10 | Results | Click **See why, skill gaps & learning path** | — |
| 10 | 4:20 | Career details — **Why this career matched** | Walk through the five factor rows | "This is the key screen. Five factors, each with a fixed weight. Skills 20.4, interests 25, education 15, work preferences 15, career preferences 10. They add up to exactly 85. Nothing is hidden." |
| 11 | 5:20 | **Skill gap** (sidebar) | Point at missing and matching skills | "She has Research, Analytical Thinking and Critical Thinking. She's missing Data Analysis, a core skill, and Communication, a supporting one. Core skills count 3 points, supporting skills 2." |
| 12 | 5:50 | **Your personalised learning path** | Scroll through Phase 1 and Phase 2 | "The learning path is built only from what *she* is missing: core skills first, then supporting ones, with free resources and hour estimates. About 105 hours for Data Analysis, 21 for Communication." |
| 13 | 6:40 | Career details *(optional)* | Scroll to **About this career** | "Each career has a description, day-to-day responsibilities, the degrees that lead to it, and first practical steps." |
| 14 | 7:00 | `/methodology` tab | Show the weights table and **Limitations** | "The whole method is public inside the app, including its limitations. Skills are self-reported, and the weights are expert judgement, not learned from outcome data. That's our future work." |
| 15 | 7:40 | — | — | "So in five minutes a student goes from 'I have an MA' to a ranked list, a reason for every score, and a concrete plan. Thank you. We're happy to run it for any profile you'd like." |

---

## 4. Backup students (if a judge asks "try someone else")

Use a fresh private window for each. The two below show different parts of the
model.

### "Arjun", BTech coder: a clear technical match

| Field | Answer |
|---|---|
| Level / Degree | Undergraduate / BTech / BE |
| Skills | **Programming**, **Problem Solving**; specific: **Python**, **SQL** |
| Interests | **Technology & Data** |
| Type / Style / Environment | **Technical** / **A mix of both** / **Fast-changing** |
| Priorities | **High salary**, **Fast career growth** |

Expected: **Software Developer 91%**, Data Analyst 66%, Business Analyst 36%,
Business Development Executive 32%.
Talking point: "Data Analyst is second because he shares SQL and the tech
interest. Its skill gap shows exactly what he'd need to switch: Data Analysis
and Excel."

### "Sneha", creative BA: two close careers, explained

| Field | Answer |
|---|---|
| Level / Degree | Undergraduate / BA |
| Skills | **Creativity**, **Communication**; specific: **Digital Marketing**, **Presentation** |
| Interests | **Marketing** |
| Type / Style / Environment | **Creative** / **A mix of both** / **Fast-changing** |
| Priorities | **Creative freedom**, **Fast career growth** |

Expected: **Marketing Executive 92%**, **Digital Marketing Executive 87%**,
HR Recruiter 37%, Business Development Executive 34%.
Talking point: "Two marketing roles are close, and the breakdown shows why they
differ: Digital Marketing needs Adaptability and Analytical Thinking, which she
hasn't picked."

### A judge's own answers

Hand over the phone or laptop and let them fill it in. This is the strongest
proof that nothing is scripted. Afterwards, open their top career and walk
through the "why" screen as in Step 10.

---

## 5. Likely judge questions

**Q1. Why is skills weighted 35%, interests 25%, and so on?**
They're our expert judgement: skills decide whether you can do the job today,
interests decide whether you'll stay in it, and education is a smaller factor
because Indian graduates switch fields often. All weights are in one file
(`src/lib/matching/config.ts`), shown on `/methodology`, and versioned. Tuning
them against survey and outcome data is our first item of future work.
*[If you've run a sensitivity check or asked respondents to rank factors, give
that result here.]*

**Q2. Is this AI? Why didn't you use machine learning?**
Machine learning needs outcome data, meaning which students went into which
careers and succeeded. That dataset doesn't exist for our target group yet, and
a model trained on too little data would be a black box we couldn't defend. A
transparent rule-based model can be checked line by line. The results we store
(profile, answers, match, model version) are exactly the data a future learned
model would need.

**Q3. How do you know the matches are correct?**
Be honest: they haven't been compared with real outcomes yet. What we have:
88 automated tests, including sample students with an obvious best career (a
BTech coder gets Software Developer; an MA researcher gets Research Analyst), and
rules such as "points always add up to the Match %" and "the same inputs always
give the same result". *[If you've compared the app's top 3 with career
counsellors' picks for sample profiles, give that agreement rate here.]*

**Q4. Some careers score very close together (e.g. the three HR roles).**
Correct, because they genuinely share most of their skills. Interests, work
style and priorities are what separate them, and the breakdown shows the
difference. We see it as honest: the model doesn't invent differences that
aren't in the data.

**Q5. Students can just claim skills they don't have.**
Yes, skills are self-reported, and the methodology page says so. We record a 1–5
skill-confidence answer for research but don't score it yet. A future version
could add short skill quizzes.

**Q6. How is this different from Mindler, iDreamCareer or the National Career
Service portal?**
(1) Every score is explained factor by factor, and most commercial tools are a
black box. (2) Each match comes with a skill gap and a learning path of free
resources. (3) It's built around typical Indian degrees (BCom, BBA, BA, BSc) and
real entry-level job descriptions.

**Q7. Why only 14 careers?**
They're the entry-level roles our team agreed on for this scope. Careers,
skills and learning steps are data, not code, so adding a career means adding
database rows. No changes to the matching engine are needed.

**Q8. What about student data and privacy?**
There are no passwords. Only a name and degree are required, and email is
optional. A signed cookie links the browser to the profile, and students can
**Delete my data** at any time. The database isn't reachable from the browser:
all access goes through our server, and Supabase's public API is locked down.

**Q9. What's the Google Form for, if the app has its own assessment?**
The form is our research instrument, used to understand the problem. The app is
the product. They use the same categories for skills, interests and work type,
so survey findings map directly onto the model.

---

## 6. If something goes wrong

| Problem | What to do |
|---|---|
| Page shows an error or `/api/health` fails | Switch to the local copy (`npm run dev`). If that fails too, present with the screenshots and say "this is the same flow from our rehearsal." |
| The app opens halfway through an old run | Open a new private window, or use **Forget me on this device** on `/profile`. |
| Numbers differ from this script | Career data or weights have changed since this script was written. Present the numbers on screen; they are still explained factor by factor. Update this file afterwards. |
| Slow network | Pre-load the home page and `/methodology` in tabs before you start. |
