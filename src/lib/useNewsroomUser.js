import { useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, signOut as fbSignOut } from "firebase/auth";
import { auth } from "./firebase";

/**
 * Client hook: tracks the Firebase Auth session and resolves the caller's
 * newsroom profile (role) via /api/newsroom/session. `user` is null while
 * loading or when signed out / not an active newsroom account.
 */
export function useNewsroomUser() {
  const [firebaseUser, setFirebaseUser] = useState(undefined); // undefined = not yet resolved
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser || null);
      if (!fbUser) {
        setProfile(null);
        setLoading(false);
        return;
      }
      try {
        const token = await fbUser.getIdToken();
        const res = await fetch("/api/newsroom/session", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const { user } = await res.json();
          setProfile(user);
        } else {
          setProfile(null);
        }
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const signOut = useCallback(() => fbSignOut(auth), []);

  return { user: profile, firebaseUser, loading, signOut };
}

/** Fetch helper that attaches the current user's Firebase ID token. */
export async function authedFetch(path, options = {}) {
  const current = auth.currentUser;
  if (!current) throw new Error("Not signed in");
  const token = await current.getIdToken();
  const res = await fetch(path, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  return res;
}
