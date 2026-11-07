/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';

interface AuthButtonProps {
  onAuthChange?: (user: User | null, token: string | null) => void;
  onOpenJournal?: () => void;
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  onAuthChange,
  onOpenJournal,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setIsLoading(false);

      if (user) {
        try {
          const token = await user.getIdToken();
          if (onAuthChange) onAuthChange(user, token);

          // Sync user profile with Cloud SQL backend
          await fetch('/api/user/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ displayName: user.displayName || user.email }),
          });
        } catch (err) {
          console.warn('Failed to sync user with database:', err);
        }
      } else {
        if (onAuthChange) onAuthChange(null, null);
      }
    });

    return () => unsubscribe();
  }, [onAuthChange]);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithPopup(auth, googleAuthProvider);
    } catch (err) {
      console.error('Sign-in failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut(auth);
    } catch (err) {
      console.error('Sign-out failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-[11px] font-mono text-[#8ea4c7] px-2 py-1 bg-[#0d172b] border border-[#22345a] rounded-lg">
        Verifying...
      </div>
    );
  }

  if (currentUser) {
    return (
      <div className="flex items-center gap-2">
        {onOpenJournal && (
          <button
            onClick={onOpenJournal}
            className="px-2.5 py-1 text-xs font-medium text-[#c0d0ee] bg-[#142038] hover:bg-[#1b2c4e] border border-[#23355b] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            title="Open PostgreSQL Trade Journal"
          >
            📋 Trade Journal
          </button>
        )}

        <div className="flex items-center gap-2 bg-[#0d172b] border border-[#22345a] rounded-lg px-2.5 py-1 text-xs">
          <span className="w-2 h-2 rounded-full bg-[#2dd4a7]" />
          <span className="text-[#f0f4fc] font-medium max-w-[100px] truncate">
            {currentUser.displayName || currentUser.email?.split('@')[0]}
          </span>
          <button
            onClick={handleSignOut}
            className="text-[10px] text-[#7a8fae] hover:text-[#ff6b6b] ml-1 cursor-pointer"
            title="Sign Out"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      className="px-3 py-1.5 text-xs font-semibold text-[#f0f4fc] bg-[#1b2d52] hover:bg-[#253d6e] border border-[#2d4982] rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5"
    >
      <span>Sign In</span>
    </button>
  );
};
