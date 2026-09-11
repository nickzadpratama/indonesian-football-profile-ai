import { createSlice } from '@reduxjs/toolkit'
import { onVotesChange, toggleVote, getVotes } from '../data/votes.js'

const loadVotes = () =>
  typeof window !== 'undefined' ? getVotes() : []

const initialState = {
  votedIds: loadVotes(),
}

const votesSlice = createSlice({
  name: 'votes',
  initialState,
  reducers: {
    initVotes(state, action) {
      state.votedIds = action.payload
    },
    toggleVoteAction(state, action) {
      // payload: teamId. Redux tracks voted set; the raw store still persists + notifies.
      const teamId = String(action.payload)
      const nowVoted = !state.votedIds.includes(teamId)
      if (nowVoted) {
        state.votedIds = [...state.votedIds, teamId]
      } else {
        state.votedIds = state.votedIds.filter((id) => id !== teamId)
      }
    },
  },
})

export const { initVotes, toggleVoteAction } = votesSlice.actions

export const votesSelectors = {
  selectVotedIds: (state) => state.votes.votedIds,
  selectHasVoted: (state, teamId) => state.votes.votedIds.includes(String(teamId)),
}

export default votesSlice.reducer
