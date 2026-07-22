import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db, isFirebaseConfigured } from '../services/firebase'

const AuthContext = createContext(null)

function mapFirebaseUser(firebaseUser, token = null) {
  if (!firebaseUser) return { user: null, token: null }

  return {
    user: {
      uid: firebaseUser.uid,
      name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Team User',
      email: firebaseUser.email || '',
      photoURL: firebaseUser.photoURL || null,
    },
    token,
  }
}

async function syncUserProfile(firebaseUser, extraData = {}) {
  if (!db) return

  await setDoc(
    doc(db, 'users', firebaseUser.uid),
    {
      uid: firebaseUser.uid,
      name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Team User',
      email: firebaseUser.email || '',
      photoURL: firebaseUser.photoURL || null,
      provider: firebaseUser.providerData?.[0]?.providerId || 'password',
      ...extraData,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({ user: null, token: null })
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setIsReady(true)
      return undefined
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setAuthState({ user: null, token: null })
        setIsReady(true)
        return
      }

      const token = await firebaseUser.getIdToken()
      setAuthState(mapFirebaseUser(firebaseUser, token))
      setIsReady(true)
    })

    return unsubscribe
  }, [])

  const value = useMemo(() => {
    const login = async ({ email, password }) => {
      if (!isFirebaseConfigured || !auth) {
        throw new Error('Firebase is not configured. Set the VITE_FIREBASE_* variables first.')
      }

      const credential = await signInWithEmailAndPassword(auth, email, password)
      const token = await credential.user.getIdToken()
      setAuthState(mapFirebaseUser(credential.user, token))
      return credential.user
    }

    const register = async ({ name, email, password }) => {
      if (!isFirebaseConfigured || !auth || !db) {
        throw new Error('Firebase is not configured. Set the VITE_FIREBASE_* variables first.')
      }

      const credential = await createUserWithEmailAndPassword(auth, email, password)

      if (name) {
        await updateProfile(credential.user, { displayName: name })
      }

      await syncUserProfile(credential.user, {
        createdAt: serverTimestamp(),
      })

      const token = await credential.user.getIdToken()
      const refreshedUser = await credential.user.reload().then(() => auth.currentUser || credential.user)
      setAuthState(mapFirebaseUser(refreshedUser, token))
      return refreshedUser
    }

    const signInWithGoogle = async () => {
      if (!isFirebaseConfigured || !auth || !db) {
        throw new Error('Firebase is not configured. Set the VITE_FIREBASE_* variables first.')
      }

      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: 'select_account' })

      const credential = await signInWithPopup(auth, provider)
      await syncUserProfile(credential.user, {
        lastLoginAt: serverTimestamp(),
      })

      const token = await credential.user.getIdToken()
      setAuthState(mapFirebaseUser(credential.user, token))
      return credential.user
    }

    const logout = async () => {
      if (auth) {
        await signOut(auth)
      }
      setAuthState({ user: null, token: null })
    }

    const updateUser = (nextUser) => {
      setAuthState((current) => ({
        ...current,
        user: { ...current.user, ...nextUser },
      }))
    }

    return {
      user: authState.user,
      token: authState.token,
      isAuthenticated: Boolean(authState.token),
      isReady,
      login,
      register,
      signInWithGoogle,
      logout,
      updateUser,
    }
  }, [authState, isReady])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}