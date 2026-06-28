import { createSelector } from '@reduxjs/toolkit'

export const selectSkills            = (state) => state.skills.list
export const selectSkillsLoading     = (state) => state.skills.loading
export const selectSkillsError       = (state) => state.skills.error
export const selectSkillsSubmitting  = (state) => state.skills.submitting
export const selectSkillsSubmitError = (state) => state.skills.submitError

export const selectSkillsByCategory = createSelector(
  [selectSkills],
  (skills) =>
    skills.reduce((acc, skill) => {
      const category = skill.category || 'Uncategorized'
      if (!acc[category]) acc[category] = []
      acc[category].push(skill)
      return acc
    }, {})
)
