import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
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
  demoLogin: (role: 'tutor' | 'student') => Promise<void>;
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
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          // Get user from our custom table
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (userData && !error) {
            const user: User = {
              id: userData.id,
              email: userData.email,
              name: userData.name,
              role: userData.role,
              profileComplete: userData.profile_complete,
              avatar_url: userData.avatar_url
            };
            setUser(user);
            localStorage.setItem('edusync_user', JSON.stringify(user));
          } else {
            console.error('User not found in database:', error);
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

  const demoLogin = async (role: 'tutor' | 'student') => {
    try {
      const demoCredentials = {
        tutor: { email: 'tutor@example.com', password: 'demo123' },
        student: { email: 'student@example.com', password: 'demo123' }
      };

      const { email, password } = demoCredentials[role];
      
      // First check if user exists in our database
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (userError || !existingUser) {
        throw new Error('Demo user not found. Please contact support.');
      }

      // Try to sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        // If auth user doesn't exist, create it
        if (authError.message.includes('Invalid login credentials')) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: undefined
            }
          });

          if (signUpError) throw signUpError;
          
          // Update the auth user ID in our database
          if (signUpData.user) {
            await supabase
              .from('users')
              .update({ id: signUpData.user.id })
              .eq('email', email);
          }
        } else {
          throw authError;
        }
      }

      const userData: User = {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        role: existingUser.role,
        profileComplete: existingUser.profile_complete,
        avatar_url: existingUser.avatar_url
      };

      setUser(userData);
      localStorage.setItem('edusync_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Demo login error:', error);
      throw new Error(error instanceof Error ? error.message : 'Demo login failed');
    }
  };

  const signIn = async (email: string, password: string, role: string) => {
    try {
      console.log('Attempting sign in for:', email, role);

      // First check if user exists in our database
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (userError || !existingUser) {
        throw new Error('User not found. Please check your email or sign up first.');
      }

      if (existingUser.role !== role) {
        throw new Error(`This account is registered as a ${existingUser.role}, not a ${role}.`);
      }

      // Use Supabase authentication
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        }
        throw authError;
      }

      if (authData.user) {
        // Update last login
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', existingUser.id);

        const userData: User = {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          role: existingUser.role,
          profileComplete: existingUser.profile_complete,
          avatar_url: existingUser.avatar_url
        };

        setUser(userData);
        localStorage.setItem('edusync_user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to sign in. Please try again.');
    }
  };

  const signUp = async (userData: any) => {
    try {
      console.log('Attempting sign up for:', userData.email, userData.role);

      // Check if user already exists in our database
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', userData.email)
        .single();

      if (existingUser) {
        throw new Error('An account with this email already exists. Please sign in instead.');
      }

      // Use Supabase authentication
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password || 'defaultpassword123',
        options: {
          emailRedirectTo: undefined
        }
      });

      if (authError) {
        if (authError.message.includes('already registered') || authError.message.includes('user_already_exists')) {
          throw new Error('An account with this email already exists. Please sign in instead.');
        }
        throw authError;
      }

      if (authData.user) {
        // Create user profile in our custom table
        const newUser = {
          id: authData.user.id,
          email: userData.email,
          name: userData.name || userData.parentName,
          role: userData.role,
          profile_complete: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const { error: userError } = await supabase
          .from('users')
          .insert(newUser);

        if (userError) {
          console.error('User creation error:', userError);
          throw new Error('Failed to create user profile. Please try again.');
        }

        // Create role-specific profile
        try {
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

            if (profileError) {
              console.warn('Tutor profile creation failed:', profileError);
            }
          } else if (userData.role === 'student' || userData.role === 'parent') {
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

            if (profileError) {
              console.warn('Student profile creation failed:', profileError);
            }
          }
        } catch (profileError) {
          console.warn('Profile creation warning:', profileError);
          // Don't fail the whole signup for profile creation issues
        }

        // Send welcome email
        try {
          await emailService.sendWelcomeEmail(newUser.email, newUser.name, newUser.role);
        } catch (emailError) {
          console.warn('Failed to send welcome email:', emailError);
        }
        
        const finalUser: User = {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          profileComplete: newUser.profile_complete
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
    demoLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};