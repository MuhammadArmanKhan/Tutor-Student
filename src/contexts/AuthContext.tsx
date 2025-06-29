import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, dbHelpers } from '../lib/supabase';
import { EmailService } from '../services/emailService';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'tutor' | 'parent';
  profileComplete?: boolean;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string, role: string) => Promise<void>;
  signUp: (userData: any) => Promise<void>;
  signOut: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const emailService = new EmailService();

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('edusync_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('edusync_user');
      }
    }
    setLoading(false);

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const userProfile = await dbHelpers.getUserWithProfile(session.user.id);
          
          if (userProfile?.user) {
            const userData: User = {
              id: userProfile.user.id,
              email: userProfile.user.email,
              name: userProfile.user.name,
              role: userProfile.user.role,
              profileComplete: userProfile.user.profile_complete,
              avatar_url: userProfile.user.avatar_url
            };
            setUser(userData);
            localStorage.setItem('edusync_user', JSON.stringify(userData));
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('edusync_user');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string, role: string) => {
    try {
      // Use Supabase authentication
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        // If user doesn't exist, create them for demo purposes
        if (authError.message.includes('Invalid login credentials')) {
          // Create user with Supabase auth first
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: undefined // Disable email confirmation for demo
            }
          });

          if (signUpError) throw signUpError;

          if (signUpData.user) {
            // Create user profile in our custom table
            const mockUser = {
              id: signUpData.user.id,
              email,
              name: email.split('@')[0],
              role: role as 'student' | 'tutor' | 'parent',
              profile_complete: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              last_login: new Date().toISOString()
            };

            const { error: insertError } = await supabase
              .from('users')
              .insert(mockUser);

            if (insertError) throw insertError;

            // Create role-specific profile
            if (role === 'tutor') {
              const { error: profileError } = await supabase
                .from('tutor_profiles')
                .insert({
                  user_id: signUpData.user.id,
                  bio: '',
                  hourly_rate: 0,
                  experience_years: 0,
                  certifications: [],
                  subjects: [],
                  rating: 0,
                  total_sessions: 0,
                  created_at: new Date().toISOString()
                });

              if (profileError) throw profileError;
            } else if (role === 'student') {
              const { error: profileError } = await supabase
                .from('student_profiles')
                .insert({
                  user_id: signUpData.user.id,
                  parent_id: null,
                  grade_level: '',
                  subjects_of_interest: [],
                  learning_goals: [],
                  created_at: new Date().toISOString()
                });

              if (profileError) throw profileError;
            }

            const userData: User = {
              id: mockUser.id,
              email: mockUser.email,
              name: mockUser.name,
              role: mockUser.role,
              profileComplete: mockUser.profile_complete
            };

            setUser(userData);
            localStorage.setItem('edusync_user', JSON.stringify(userData));
            return;
          }
        }
        throw authError;
      }

      if (authData.user) {
        // Get user profile from our custom table
        const { data: existingUser, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (error || !existingUser) {
          throw new Error('User profile not found');
        }

        const userData: User = {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          role: existingUser.role,
          profileComplete: existingUser.profile_complete,
          avatar_url: existingUser.avatar_url
        };

        // Update last login
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', existingUser.id);

        setUser(userData);
        localStorage.setItem('edusync_user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw new Error('Failed to sign in. Please check your credentials.');
    }
  };

  const signUp = async (userData: any) => {
    try {
      // Use Supabase authentication
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password || 'defaultpassword123', // Use provided password or default
        options: {
          emailRedirectTo: undefined // Disable email confirmation for demo
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          throw new Error('An account with this email already exists. Please sign in instead.');
        }
        throw authError;
      }

      if (authData.user) {
        // Create user profile in our custom table
        const mockUser = {
          id: authData.user.id,
          email: userData.email,
          name: userData.name || userData.parentName,
          role: userData.role,
          profile_complete: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Save to database
        const { error: userError } = await supabase
          .from('users')
          .insert(mockUser);

        if (userError) throw userError;

        // Create role-specific profile
        if (userData.role === 'tutor') {
          const { error: profileError } = await supabase
            .from('tutor_profiles')
            .insert({
              user_id: authData.user.id,
              bio: '',
              hourly_rate: 0,
              experience_years: 0,
              certifications: [],
              subjects: [],
              rating: 0,
              total_sessions: 0,
              created_at: new Date().toISOString()
            });

          if (profileError) throw profileError;
        } else if (userData.role === 'student') {
          const { error: profileError } = await supabase
            .from('student_profiles')
            .insert({
              user_id: authData.user.id,
              parent_id: userData.role === 'parent' ? authData.user.id : null,
              grade_level: '',
              subjects_of_interest: [],
              learning_goals: [],
              created_at: new Date().toISOString()
            });

          if (profileError) throw profileError;
        }

        // Send welcome email
        try {
          await emailService.sendWelcomeEmail(mockUser.email, mockUser.name, mockUser.role);
        } catch (emailError) {
          console.warn('Failed to send welcome email:', emailError);
          // Don't throw error for email failure
        }
        
        const finalUser: User = {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
          profileComplete: mockUser.profile_complete
        };

        setUser(finalUser);
        localStorage.setItem('edusync_user', JSON.stringify(finalUser));
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create account. Please try again.');
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({
          ...userData,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('edusync_user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Update user error:', error);
      throw new Error('Failed to update user profile.');
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
    setUser(null);
    localStorage.removeItem('edusync_user');
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};