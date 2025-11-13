import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { getGravatarUrl } from '../services/gravatarService';

interface Profile {
  id: string;
  user_type: 'mentor' | 'team';
  full_name?: string;
  email?: string;
  state?: string;
  city?: string;
  bio?: string;
  avatar_url?: string;
  gravatar_url?: string;
  linkedin_url?: string;
  is_admin?: boolean;
  is_mentor_verified?: boolean;
  last_avatar_checked?: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, profileData?: Partial<Profile>) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  toggleAdmin: (userId: string, isAdmin: boolean) => Promise<void>;
  verifyMentor: (userId: string, verified: boolean) => Promise<void>;
  deleteProfile: (userId: string) => Promise<void>;
  syncAvatar: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('fetchProfile error', error);
      setProfile(null);
      return;
    }

    setProfile(data as Profile | null);
  };

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      const sessionUser = data?.session?.user ?? null;
      if (!mounted) return;
      setUser(sessionUser);
      if (sessionUser) await fetchProfile(sessionUser.id);
      setLoading(false);
    };
    init();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      const sUser = session?.user ?? null;
      setUser(sUser);
      if (sUser) fetchProfile(sUser.id);
      else setProfile(null);
    });

    return () => {
      mounted = false;
      subscription?.subscription?.unsubscribe?.();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, profileData: Partial<Profile> = {}) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    const authUser = (data as any)?.user ?? null;
    if (!authUser) return;

    const gravatar_url = getGravatarUrl(email);
    const profileRow = {
      id: authUser.id,
      email,
      gravatar_url,
      ...profileData
    };

    const { error: insertErr } = await supabase.from('profiles').insert(profileRow);
    if (insertErr) console.error('signUp profiles insert error', insertErr);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  // admin actions - these use standard profile updates; require RLS policy that allows admins to update others
  const toggleAdmin = async (userId: string, isAdmin: boolean) => {
    const { error } = await supabase.from('profiles').update({ is_admin: isAdmin }).eq('id', userId);
    if (error) throw error;
    if (user?.id === userId) await fetchProfile(userId);
  };

  const verifyMentor = async (userId: string, verified: boolean) => {
    const { error } = await supabase.from('profiles').update({ is_mentor_verified: verified }).eq('id', userId);
    if (error) throw error;
    if (user?.id === userId) await fetchProfile(userId);
  };

  // deletes only the profiles row. Deleting auth.user requires a server-side call with service role key.
  const deleteProfile = async (userId: string) => {
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (error) throw error;
    // if current user deleted themselves, sign out locally
    if (user?.id === userId) {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    }
  };

  const syncAvatar = async (userId: string) => {
    const { data, error } = await supabase.from('profiles').select('email, avatar_url').eq('id', userId).maybeSingle();
    if (error || !data) throw error ?? new Error('profile not found');
    const gravatar_url = getGravatarUrl(data.email || '');
    const { error: updErr } = await supabase.from('profiles').update({ gravatar_url, last_avatar_checked: new Date().toISOString() }).eq('id', userId);
    if (updErr) throw updErr;
    if (user?.id === userId) await fetchProfile(userId);
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      refreshProfile,
      toggleAdmin,
      verifyMentor,
      deleteProfile,
      syncAvatar
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
