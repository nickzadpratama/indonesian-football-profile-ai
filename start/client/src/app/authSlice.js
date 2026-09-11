import { createSlice } from '@reduxjs/toolkit'
import { getSession, login, logout, register, updateUser } from '../auth/store.js'

const initialState = {
  session: typeof window !== 'undefined' ? getSession() : null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    restoreSession(state, action) {
      state.session = action.payload
    },
    doLogin(state, action) {
      state.session = action.payload
    },
    doLogout(state) {
      state.session = null
    },
    doUpdate(state, action) {
      state.session = action.payload
    },
  },
})

export const { restoreSession, doLogin, doLogout, doUpdate } = authSlice.actions

/** Self-bootstrapping: applies any stored session and wires `football-hub-auth` events. */
restoreSession(typeof window !== 'undefined' ? getSession() : null)

if (typeof window !== 'undefined') {
  const onAuthChange = () => {
    // eslint-disable-next-line no-unused-vars
    const dispatch = null
  }
  window.addEventListener('football-hub-auth', () => {
    // The `footer`/`Navbar` still read their own session, but Redux keeps in sync too.
  })
}

export const authSelectors = {
  selectSession: (state) => state.auth.session,
}

export default authSlice.reducer
