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
          tutor:tutors(*),
          student:students(*),
          recording:session_recordings(*)
        `)
        .eq('id', sessionId)
        .single();

      if (error || !sessionData) {
        throw new Error('Session not found');
      }

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
      pdf.text(`Date: ${format(new Date(sessionData.scheduled_at), 'PPP')}`, 20, 65);
      pdf.text(`Subject: ${sessionData.subject}`, 20, 75);
      pdf.text(`Duration: ${sessionData.duration_minutes} minutes`, 20, 85);
      pdf.text(`Tutor: ${sessionData.tutor.name}`, 20, 95);
      pdf.text(`Student: ${sessionData.student.name}`, 20, 105);

      // Engagement Score
      const engagementScore = sessionData.recording?.ai_insights?.engagement_score || 0;
      pdf.setFontSize(16);
      pdf.text('Engagement Analysis', 20, 130);
      
      pdf.setFontSize(14);
      pdf.setTextColor(16, 185, 129); // Green
      pdf.text(`Engagement Score: ${engagementScore}%`, 20, 145);

      // Performance Indicators
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      let yPos = 160;
      
      const performanceMetrics = [
        { label: 'Participation Level', value: engagementScore > 80 ? 'Excellent' : engagementScore > 60 ? 'Good' : 'Needs Improvement' },
        { label: 'Focus Duration', value: `${Math.round(sessionData.duration_minutes * 0.8)} minutes` },
        { label: 'Questions Asked', value: sessionData.recording?.ai_insights?.student_questions || 'N/A' },
        { label: 'Comprehension Level', value: engagementScore > 75 ? 'High' : engagementScore > 50 ? 'Medium' : 'Low' }
      ];

      performanceMetrics.forEach(metric => {
        pdf.text(`${metric.label}: ${metric.value}`, 20, yPos);
        yPos += 10;
      });

      // AI Insights
      pdf.setFontSize(16);
      pdf.text('AI-Generated Insights', 20, yPos + 20);
      yPos += 35;

      const insights = sessionData.recording?.ai_insights?.auto_highlights || [];
      if (insights.length > 0) {
        pdf.setFontSize(12);
        insights.slice(0, 3).forEach((insight: any, index: number) => {
          const text = `• ${insight.text}`;
          const lines = pdf.splitTextToSize(text, pageWidth - 40);
          pdf.text(lines, 20, yPos);
          yPos += lines.length * 5 + 5;
        });
      }

      // Recommendations
      pdf.setFontSize(16);
      pdf.text('Recommendations', 20, yPos + 15);
      yPos += 30;

      const recommendations = this.generateRecommendations(engagementScore, sessionData);
      pdf.setFontSize(12);
      recommendations.forEach(rec => {
        const lines = pdf.splitTextToSize(`• ${rec}`, pageWidth - 40);
        pdf.text(lines, 20, yPos);
        yPos += lines.length * 5 + 5;
      });

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
          ai_summary: insights.slice(0, 3).map((i: any) => i.text).join('. '),
          recommendations,
          created_at: new Date().toISOString()
        });

      return urlData.publicUrl;
    } catch (error) {
      console.error('Report generation error:', error);
      return null;
    }
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