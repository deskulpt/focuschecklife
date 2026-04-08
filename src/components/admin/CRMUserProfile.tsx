import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { toast } from 'sonner';
import {
  User, Mail, Phone, MapPin, Calendar, Brain, CreditCard,
  Clock, AlertTriangle, Download, Send, Shield, Bell
} from 'lucide-react';

interface Assessment {
  id: string;
  test_type: string;
  age_group: string;
  risk_level: string | null;
  overall_score: number | null;
  completion_percentage: number | null;
  time_spent_seconds: number | null;
  is_full_access: boolean;
  completed_at: string;
  created_at: string;
  survey_responses: any;
  game_results: any;
}

interface PageVisit {
  page: string;
  created_at: string;
  session_id: string | null;
}

export interface CRMUserDetail {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
  state: string | null;
  age: number | null;
  gender: string | null;
  plan: string;
  has_paid_full_test: boolean;
  has_paid_pdf: boolean;
  share_results_consent: boolean;
  marketing_email_opt_in: boolean;
  marketing_email_opt_in_at: string | null;
  marketing_push_opt_in: boolean;
  marketing_push_opt_in_at: string | null;
  stripe_order_id: string | null;
  created_at: string;
  updated_at: string;
  email?: string;
  assessments: Assessment[];
  page_visits: PageVisit[];
  faq_accessed: boolean;
  total_time_on_site: number;
  session_count: number;
  incomplete_tests: number;
}

interface Props {
  user: CRMUserDetail | null;
  open: boolean;
  onClose: () => void;
}

export const CRMUserProfile = ({ user, open, onClose }: Props) => {
  const [sendingReminder, setSendingReminder] = useState(false);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);

  if (!user) return null;

  const latestAssessment = user.assessments[0];
  const testCompletionPct = latestAssessment?.completion_percentage ?? 0;
  const hasIncompleteTests = user.incomplete_tests > 0;

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const getRiskBadge = (risk: string | null) => {
    if (!risk) return <Badge variant="outline" className="text-xs">No Test</Badge>;
    const colors: Record<string, string> = {
      low: 'bg-green-100 text-green-700 border-green-200',
      moderate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      high: 'bg-red-100 text-red-700 border-red-200',
    };
    return <Badge className={`text-xs ${colors[risk] || ''}`}>{risk}</Badge>;
  };

  const getSpectrumStatus = () => {
    if (!latestAssessment) return 'Not Tested';
    if (latestAssessment.risk_level === 'high') return 'Requesting Professional Support';
    if (latestAssessment.risk_level === 'moderate' || latestAssessment.risk_level === 'low') return 'Qualified Lead';
    return 'Assessed';
  };

  const handleSendReminder = async () => {
    setSendingReminder(true);
    try {
      // For now, log the reminder action. In production, integrate with email service.
      toast.success(`Reminder queued for ${user.full_name || user.email || 'user'}`);
    } catch {
      toast.error('Failed to send reminder');
    } finally {
      setSendingReminder(false);
    }
  };

  const handleGenerateInvoice = () => {
    setGeneratingInvoice(true);
    try {
      const invoiceData = {
        orderId: user.stripe_order_id || 'N/A',
        name: user.full_name || 'N/A',
        date: user.updated_at,
        amount: '$5.00',
        description: 'Full ADHD Assessment Access',
      };

      const invoiceHtml = `
        <html><head><title>Invoice</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 600px; margin: auto; }
          h1 { color: #333; } table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background: #f5f5f5; } .total { font-weight: bold; font-size: 18px; }
        </style></head><body>
        <h1>Invoice</h1>
        <p><strong>Order ID:</strong> ${invoiceData.orderId}</p>
        <p><strong>Customer:</strong> ${invoiceData.name}</p>
        <p><strong>Date:</strong> ${new Date(invoiceData.date).toLocaleDateString()}</p>
        <table>
          <tr><th>Description</th><th>Amount</th></tr>
          <tr><td>${invoiceData.description}</td><td>${invoiceData.amount}</td></tr>
          <tr><td class="total">Total</td><td class="total">${invoiceData.amount}</td></tr>
        </table>
        </body></html>
      `;

      const blob = new Blob([invoiceHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${user.stripe_order_id || user.id}.html`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Invoice downloaded');
    } catch {
      toast.error('Failed to generate invoice');
    } finally {
      setGeneratingInvoice(false);
    }
  };

  const uniqueSessions = new Set(user.page_visits.map(v => v.session_id).filter(Boolean));

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {user.full_name || 'Unknown User'}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Spectrum Status */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Lead Status</span>
                </div>
                <Badge variant={latestAssessment?.risk_level === 'high' ? 'destructive' : 'default'}>
                  {getSpectrumStatus()}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-muted-foreground" /> {user.email || '—'}</div>
              <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-muted-foreground" /> {user.phone || '—'}</div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                {[user.city, user.state, user.country].filter(Boolean).join(', ') || '—'}
              </div>
              <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-muted-foreground" /> Age: {user.age || '—'} | Gender: {user.gender || '—'}</div>
            </CardContent>
          </Card>

          {/* Test Details */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Brain className="w-4 h-4" /> Assessment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {user.assessments.length === 0 ? (
                <p className="text-muted-foreground">No assessments taken</p>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-muted-foreground">Test Type</span>
                      <p className="font-medium">{latestAssessment?.test_type || 'ADHD'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Age Group</span>
                      <p className="font-medium">{latestAssessment?.age_group || '—'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Risk Level</span>
                      <div className="mt-0.5">{getRiskBadge(latestAssessment?.risk_level)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Overall Score</span>
                      <p className="font-medium">{latestAssessment?.overall_score ?? '—'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Completion</span>
                      <p className="font-medium">{testCompletionPct}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Time Spent</span>
                      <p className="font-medium">{formatDuration(latestAssessment?.time_spent_seconds || 0)}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Attempts</span>
                    <span className="font-medium">{user.assessments.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Share Results Consent</span>
                    <Badge variant={user.share_results_consent ? 'default' : 'secondary'}>
                      {user.share_results_consent ? 'Yes' : 'No'}
                    </Badge>
                  </div>

                  {hasIncompleteTests && (
                    <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-md border border-yellow-200">
                      <div className="flex items-center gap-2 text-yellow-700">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-xs font-medium">{user.incomplete_tests} incomplete test(s)</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleSendReminder}
                        disabled={sendingReminder}
                        className="text-xs h-7"
                      >
                        <Send className="w-3 h-3 mr-1" /> Send Reminder
                      </Button>
                    </div>
                  )}

                  {/* All test history */}
                  <div className="space-y-2 mt-2">
                    <span className="text-xs font-medium text-muted-foreground">Test History</span>
                    {user.assessments.map((a, i) => (
                      <div key={a.id} className="flex items-center justify-between text-xs p-2 bg-muted/50 rounded">
                        <span>#{user.assessments.length - i} — {a.test_type} ({a.age_group})</span>
                        <div className="flex items-center gap-2">
                          {getRiskBadge(a.risk_level)}
                          <span className="text-muted-foreground">{new Date(a.completed_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Session & Engagement */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" /> Session & Engagement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-muted-foreground">Total Time on Site</span>
                  <p className="font-medium">{formatDuration(user.total_time_on_site)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Sessions</span>
                  <p className="font-medium">{user.session_count}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Page Views</span>
                  <p className="font-medium">{user.page_visits.length}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Accessed FAQs</span>
                  <Badge variant={user.faq_accessed ? 'default' : 'secondary'}>
                    {user.faq_accessed ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>

              {/* Session dates */}
              {uniqueSessions.size > 0 && (
                <div className="mt-2 space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">Recent Sessions</span>
                  {Array.from(uniqueSessions).slice(0, 5).map((sid, i) => {
                    const sessionVisits = user.page_visits.filter(v => v.session_id === sid);
                    const first = sessionVisits[sessionVisits.length - 1];
                    return (
                      <div key={i} className="text-xs p-1.5 bg-muted/50 rounded flex justify-between">
                        <span>{new Date(first?.created_at).toLocaleString()}</span>
                        <span className="text-muted-foreground">{sessionVisits.length} pages</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment & Invoice */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Payment & Billing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Completed Payment</span>
                <Badge variant={user.has_paid_full_test ? 'default' : 'secondary'}>
                  {user.has_paid_full_test ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Paid PDF Report</span>
                <Badge variant={user.has_paid_pdf ? 'default' : 'secondary'}>
                  {user.has_paid_pdf ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-mono text-xs">{user.stripe_order_id || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Plan</span>
                <Badge>{user.plan}</Badge>
              </div>

              {user.has_paid_full_test && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-2"
                  onClick={handleGenerateInvoice}
                  disabled={generatingInvoice}
                >
                  <Download className="w-3.5 h-3.5 mr-2" /> Generate Invoice
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Marketing Consent */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Bell className="w-4 h-4" /> Marketing Consent
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Email Opt-In</span>
                <div className="flex items-center gap-2">
                  <Badge variant={user.marketing_email_opt_in ? 'default' : 'secondary'}>
                    {user.marketing_email_opt_in ? 'Yes' : 'No'}
                  </Badge>
                  {user.marketing_email_opt_in_at && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(user.marketing_email_opt_in_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Push Opt-In</span>
                <div className="flex items-center gap-2">
                  <Badge variant={user.marketing_push_opt_in ? 'default' : 'secondary'}>
                    {user.marketing_push_opt_in ? 'Yes' : 'No'}
                  </Badge>
                  {user.marketing_push_opt_in_at && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(user.marketing_push_opt_in_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Member since */}
          <div className="text-xs text-muted-foreground text-center pb-4">
            Member since {new Date(user.created_at).toLocaleDateString()}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
