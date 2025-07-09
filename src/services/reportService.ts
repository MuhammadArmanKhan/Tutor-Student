import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

export interface SessionReportData {
  session: any;
  student: any;
  tutor: any;
  recording: any;
  engagementScore: number;
  aiInsights: any;
}

export class ReportService {
  async generateSessionReport(sessionId: string): Promise<string | null> {
    try {
      // Fetch session data with related information
      const { data: sessionData, error } = await supabase
        .from('sessions')
        .select(`
          *,
          tutor:users!sessions_tutor_id_fkey(id, name, email),
          student:users!sessions_student_id_fkey(id, name, email)
        `)
        .eq('id', sessionId)
        .single();

      if (error || !sessionData) {
        throw new Error('Session not found');
      }

      // Fetch recording data separately to ensure it's retrieved
      const { data: recordingData, error: recordingError } = await supabase
        .from('session_recordings')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      // Combine the data
      const fullSessionData = {
        ...sessionData,
        recording: recordingData
      };

      // Fetch learning milestones for the student
      let milestones = [];
      if (fullSessionData.student?.id) {
        const { data: milestonesData, error: milestonesError } = await supabase
          .from('learning_milestones')
          .select('*')
          .eq('student_id', fullSessionData.student.id);
        if (!milestonesError && milestonesData) {
          milestones = milestonesData;
        }
      }

      // Fetch progress tracking for the student
      let progress = null;
      if (fullSessionData.student?.id) {
        const { data: progressData, error: progressError } = await supabase
          .from('progress_tracking')
          .select('*')
          .eq('student_id', fullSessionData.student.id)
          .single();
        if (!progressError && progressData) {
          progress = progressData;
        }
      }

      // Update or insert progress tracking for this student
      if (fullSessionData.student?.id && fullSessionData.tutor?.id) {
        if (progress) {
          // Update
          await supabase
            .from('progress_tracking')
            .update({
              total_sessions: (progress.total_sessions || 0) + 1,
              completed_sessions: (progress.completed_sessions || 0) + 1,
              // Optionally update other fields here
              last_updated: new Date().toISOString()
            })
            .eq('id', progress.id);
        } else {
          // Insert (FIX: include subject)
          await supabase
            .from('progress_tracking')
            .insert({
              student_id: fullSessionData.student.id,
              tutor_id: fullSessionData.tutor.id,
              subject: fullSessionData.subject, // <-- Added subject
              total_sessions: 1,
              completed_sessions: 1,
              completion_rate: 100,
              average_engagement: fullSessionData.engagement_score || 0,
              last_updated: new Date().toISOString(),
              created_at: new Date().toISOString()
            });
        }
      }

      // DEMO: Insert a default milestone if none exist for this student/subject
      if (fullSessionData.student?.id && fullSessionData.tutor?.id && fullSessionData.subject) {
        if (!milestones || milestones.length === 0) {
          await supabase.from('learning_milestones').insert({
            student_id: fullSessionData.student.id,
            tutor_id: fullSessionData.tutor.id,
            subject: fullSessionData.subject,
            milestone_name: 'First Session Completed',
            description: 'Student attended their first session.',
            target_date: new Date(),
            completed_date: new Date(),
            completion_percentage: 100,
            status: 'completed',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      }

      console.log('Session data for report:', sessionData);
      console.log('Recording data:', recordingData);

      // Generate PDF
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Header
      pdf.setFontSize(24);
      pdf.setTextColor(0, 212, 255); // Primary blue
      pdf.text('EduSync Session Report', 20, 30);

      // Session Info
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Session Details', 20, 50);
      
      pdf.setFontSize(12);
      pdf.text(`Date: ${format(new Date(fullSessionData.scheduled_at), 'PPP')}`, 20, 65);
      pdf.text(`Subject: ${fullSessionData.subject}`, 20, 75);
      pdf.text(`Duration: ${fullSessionData.duration_minutes} minutes`, 20, 85);
      pdf.text(`Tutor: ${fullSessionData.tutor?.name || 'N/A'}`, 20, 95);
      pdf.text(`Student: ${fullSessionData.student?.name || 'N/A'}`, 20, 105);

      // Engagement Score - Use session engagement_score or calculate from AI insights
      const engagementScore = fullSessionData.engagement_score || this.calculateEngagementFromInsights(fullSessionData.recording?.ai_insights) || 75;
      pdf.setFontSize(16);
      pdf.text('Engagement Analysis', 20, 130);
      
      pdf.setFontSize(14);
      pdf.setTextColor(16, 185, 129); // Green
      pdf.text(`Engagement Score: ${engagementScore}%`, 20, 145);

      // Performance Indicators
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      let yPos = 160;
      
      // Calculate student questions from speaker labels
      const studentQuestions = this.countStudentQuestions(fullSessionData.recording?.speaker_labels || []);
      
      const performanceMetrics = [
        { label: 'Participation Level', value: engagementScore > 80 ? 'Excellent' : engagementScore > 60 ? 'Good' : 'Needs Improvement' },
        { label: 'Focus Duration', value: `${Math.round(fullSessionData.duration_minutes * 0.8)} minutes` },
        { label: 'Questions Asked', value: studentQuestions.toString() },
        { label: 'Comprehension Level', value: engagementScore > 75 ? 'High' : engagementScore > 50 ? 'Medium' : 'Low' }
      ];

      performanceMetrics.forEach(metric => {
        pdf.text(`${metric.label}: ${metric.value}`, 20, yPos);
        yPos += 10;
      });

      // Session Transcript
      pdf.setFontSize(16);
      pdf.text('Session Transcript', 20, yPos + 20);
      yPos += 35;

      const transcript = fullSessionData.recording?.transcript || '';
      if (transcript) {
        pdf.setFontSize(10);
        const transcriptLines = pdf.splitTextToSize(transcript, pageWidth - 40);
        transcriptLines.slice(0, 20).forEach((line: string) => { // Limit to first 20 lines
          pdf.text(line, 20, yPos);
          yPos += 4;
        });
        if (transcriptLines.length > 20) {
          pdf.text('... (transcript continues)', 20, yPos);
          yPos += 10;
        }
      } else {
        pdf.setFontSize(12);
        pdf.text('No transcript available', 20, yPos);
        yPos += 10;
      }

      // AI Insights
      pdf.setFontSize(16);
      pdf.text('AI-Generated Insights', 20, yPos + 20);
      yPos += 35;

      // Use the correct field name for auto highlights
      const insights = fullSessionData.recording?.ai_insights?.auto_highlights_result || [];
      if (insights.length > 0) {
        pdf.setFontSize(12);
        insights.slice(0, 3).forEach((insight: any, index: number) => {
          const text = `• ${insight.text}`;
          const lines = pdf.splitTextToSize(text, pageWidth - 40);
          pdf.text(lines, 20, yPos);
          yPos += lines.length * 5 + 5;
        });
      } else {
        // Show sentiment analysis if available
        const sentimentResults = fullSessionData.recording?.ai_insights?.sentiment_analysis || [];
        if (sentimentResults.length > 0) {
          const positiveCount = sentimentResults.filter((s: any) => s.sentiment === 'POSITIVE').length;
          const totalCount = sentimentResults.length;
          const sentimentText = `Overall sentiment: ${positiveCount}/${totalCount} positive segments`;
          const lines = pdf.splitTextToSize(`• ${sentimentText}`, pageWidth - 40);
          pdf.setFontSize(12);
          pdf.text(lines, 20, yPos);
          yPos += lines.length * 5 + 5;
        }
      }

      // Recommendations
      pdf.setFontSize(16);
      pdf.text('Recommendations', 20, yPos + 15);
      yPos += 30;

      const recommendations = this.generateRecommendations(engagementScore, fullSessionData);
      pdf.setFontSize(12);
      recommendations.forEach(rec => {
        const lines = pdf.splitTextToSize(`• ${rec}`, pageWidth - 40);
        pdf.text(lines, 20, yPos);
        yPos += lines.length * 5 + 5;
      });

      // Learning Milestones Section
      pdf.setFontSize(16);
      pdf.text('Learning Milestones', 20, yPos + 20);
      yPos += 35;
      if (milestones && milestones.length > 0) {
        milestones.slice(0, 3).forEach((milestone: any) => {
          const text = `• ${milestone.milestone_name}: ${milestone.status} (${milestone.completion_percentage}%)`;
          const lines = pdf.splitTextToSize(text, pageWidth - 40);
          pdf.setFontSize(12);
          pdf.text(lines, 20, yPos);
          yPos += lines.length * 5 + 5;
        });
      } else {
        pdf.setFontSize(12);
        pdf.text('No milestones found.', 20, yPos);
        yPos += 10;
      }

      // Progress Tracking Section
      pdf.setFontSize(16);
      pdf.text('Progress Tracking', 20, yPos + 20);
      yPos += 35;
      if (progress) {
        pdf.setFontSize(12);
        pdf.text(`Total Sessions: ${progress.total_sessions}`, 20, yPos); yPos += 10;
        pdf.text(`Completed Sessions: ${progress.completed_sessions}`, 20, yPos); yPos += 10;
        pdf.text(`Completion Rate: ${progress.completion_rate}%`, 20, yPos); yPos += 10;
        pdf.text(`Average Engagement: ${progress.average_engagement}%`, 20, yPos); yPos += 10;
        if (progress.strengths && progress.strengths.length > 0) {
          pdf.text(`Strengths: ${progress.strengths.join(', ')}`, 20, yPos); yPos += 10;
        }
        if (progress.areas_for_improvement && progress.areas_for_improvement.length > 0) {
          pdf.text(`Areas for Improvement: ${progress.areas_for_improvement.join(', ')}`, 20, yPos); yPos += 10;
        }
      } else {
        pdf.setFontSize(12);
        pdf.text('No progress data found.', 20, yPos);
        yPos += 10;
      }

      // Save PDF
      const pdfBlob = pdf.output('blob');
      const fileName = `session-report-${sessionId}-${Date.now()}.pdf`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('session-reports')
        .upload(fileName, pdfBlob);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('session-reports')
        .getPublicUrl(fileName);

      // Save report metadata
      await supabase
        .from('session_reports')
        .insert({
          session_id: sessionId,
          pdf_url: urlData.publicUrl,
          engagement_metrics: { engagement_score: engagementScore },
          ai_summary: insights.length > 0 ? insights.slice(0, 3).map((i: any) => i.text).join('. ') : 
                     (fullSessionData.recording?.transcript ? fullSessionData.recording.transcript.substring(0, 200) + '...' : 'No transcript available'),
          recommendations,
          created_at: new Date().toISOString()
        });

      return urlData.publicUrl;
    } catch (error) {
      console.error('Report generation error:', error);
      return null;
    }
  }

  private calculateEngagementFromInsights(aiInsights: any): number {
    if (!aiInsights) return 75;

    // Calculate engagement from sentiment analysis
    const sentimentResults = aiInsights.sentiment_analysis || [];
    if (sentimentResults.length > 0) {
      const positiveSentiments = sentimentResults.filter((s: any) => s.sentiment === 'POSITIVE').length;
      const totalSentiments = sentimentResults.length;
      const sentimentScore = totalSentiments > 0 ? (positiveSentiments / totalSentiments) * 100 : 75;
      return Math.round(sentimentScore);
    }

    return 75; // Default score
  }

  private countStudentQuestions(speakerLabels: any[]): number {
    if (!speakerLabels || speakerLabels.length === 0) return 0;

    // Count utterances from student (speaker B) that contain question marks
    return speakerLabels.filter((utterance: any) => 
      utterance.speaker === 'B' && utterance.text.includes('?')
    ).length;
  }

  private generateRecommendations(engagementScore: number, sessionData: any): string[] {
    const recommendations = [];

    if (engagementScore < 60) {
      recommendations.push('Consider incorporating more interactive elements to boost engagement');
      recommendations.push('Schedule shorter, more frequent sessions to maintain focus');
    } else if (engagementScore < 80) {
      recommendations.push('Great progress! Try adding more challenging material to maintain interest');
      recommendations.push('Encourage more questions and discussions during sessions');
    } else {
      recommendations.push('Excellent engagement! Continue with current teaching approach');
      recommendations.push('Consider advancing to more complex topics');
    }

    recommendations.push('Review session recording together to identify key learning moments');
    recommendations.push('Set specific goals for the next session based on today\'s progress');

    return recommendations;
  }

  async sendReportEmail(sessionId: string, reportUrl: string, parentEmail: string): Promise<boolean> {
    try {
      // This would integrate with your email service (SendGrid, Mailgun, etc.)
      // For now, we'll use Supabase Edge Functions
      
      const { data, error } = await supabase.functions.invoke('send-session-report', {
        body: {
          sessionId,
          reportUrl,
          parentEmail,
          subject: 'Session Report - EduSync Learning Platform'
        }
      });

      if (error) throw error;

      // Update report as sent
      await supabase
        .from('session_reports')
        .update({ email_sent: true })
        .eq('session_id', sessionId);

      return true;
    } catch (error) {
      console.error('Email sending error:', error);
      return false;
    }
  }
}