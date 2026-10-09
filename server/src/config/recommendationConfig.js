// Tunable defaults pending a team decision; risk-score values follow the current 0-100 Human Risk Score.
module.exports = {
  QUIZ_DUE_SOON_DAYS: 3, // Give employees a short, actionable warning before quiz deadlines.
  HIGH_RISK_SCORE: 60, // Current risk service classifies scores above 60 as High.
  LOW_QUIZ_SCORE: 70, // Reuses the existing recommendation service's below-70 cutoff.
  TRAINING_INACTIVITY_DAYS: 14, // Allow two weeks after assignment or activity before a reminder.
  DEPARTMENT_RISK_MARGIN: 10, // Require a material 10-point increase over the organization average.
  DEPARTMENT_MIN_ASSESSED_EMPLOYEES: 3, // Avoid department-level conclusions from very small samples.
  RECOMMENDATION_ESCALATION_DAYS: 14, // Escalate unresolved admin recommendations after two weeks; keep them active until cleared or dismissed.
  QUIZ_BACKFILL_DAYS: 14, // Give legacy quizzes a two-week window from creation, or from migration if already past.
};