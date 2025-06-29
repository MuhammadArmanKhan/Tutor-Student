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
      console.log('Auth state changed:', event, session?.user?.id);
      
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
      console.log('Attempting sign in for:', email);

      // First check if user exists in our custom table
      const { data: existingUser, error: userCheckError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (userCheckError) {
        console.error('Database error:', userCheckError);
        throw new Error('Database error occurred. Please try again.');
      }

      if (!existingUser) {
        throw new Error('No account found with this email. Please sign up first.');
      }

      console.log('User found in database:', existingUser.id);

      // Use Supabase authentication
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        console.error('Auth error:', authError);
        if (authError.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        }
        throw new Error(authError.message);
      }

      if (authData.user) {
        console.log('Authentication successful:', authData.user.id);
        
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
      throw new Error(error instanceof Error ? error.message : 'Failed to sign in. Please try again.');
    }
  };

  const signUp = async (userData: any) => {
    try {
      console.log('Attempting sign up for:', userData.email);

      // Check if user already exists in our custom table
      const { data: existingUser, error: userCheckError } = await supabase
        .from('users')
        .select('id')
        .eq('email', userData.email)
        .maybeSingle();

      if (userCheckError) {
        console.error('Database check error:', userCheckError);
        throw new Error('Database error occurred. Please try again.');
      }

      if (existingUser) {
        throw new Error('An account with this email already exists. Please sign in instead.');
      }

      console.log('Email is available, proceeding with signup');

      // Use Supabase authentication
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password || 'defaultpassword123',
        options: {
          emailRedirectTo: undefined,
          data: {
            name: userData.name || userData.parentName,
            role: userData.role
          }
        }
      });

      if (authError) {
        console.error('Auth signup error:', authError);
        if (authError.message.includes('already registered') || authError.message.includes('user_already_exists')) {
          throw new Error('An account with this email already exists. Please sign in instead.');
        }
        throw new Error(authError.message);
      }

      if (authData.user) {
        console.log('Auth user created:', authData.user.id);

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
        
        console.log('Creating user profile:', mockUser);

        // Save to database with proper error handling
        const { error: userError } = await supabase
          .from('users')
          .insert(mockUser);

        if (userError) {
          console.error('User profile creation error:', userError);
          // If user creation fails, clean up auth user
          await supabase.auth.signOut();
          throw new Error('Failed to create user profile. Please try again.');
        }

        console.log('User profile created successfully');

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
              console.warn('Tutor profile creation warning:', profileError);
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
              console.warn('Student profile creation warning:', profileError);
            }
          }
        } catch (profileError) {
          console.warn('Profile creation warning:', profileError);
          // Don't fail the whole signup for profile creation issues
        }

        // Send welcome email
        try {
          await emailService.sendWelcomeEmail(mockUser.email, mockUser.name, mockUser.role);
        } catch (emailError) {
          console.warn('Failed to send welcome email:', emailError);
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
        
        console.log('Signup completed successfully');
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