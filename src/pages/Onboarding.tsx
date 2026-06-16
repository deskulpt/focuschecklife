import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, HeartPulse, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { SeoHead } from '@/components/SeoHead';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const testingForOptions = [
  { value: 'self', label: 'Myself' },
  { value: 'child', label: 'My child' },
  { value: 'teen', label: 'A teenager' },
  { value: 'other', label: 'Someone I support' },
];

const ageRangeOptions = ['6–12', '13–17', '18–24', '25–34', '35–44', '45–54', '55+'];

const familiarityOptions = [
  { value: 'new', label: 'I am new to ADHD' },
  { value: 'some', label: 'I know a little' },
  { value: 'familiar', label: 'I am already familiar' },
  { value: 'diagnosed', label: 'Already diagnosed or assessed before' },
];

const Onboarding = () => {
  const { user, profile, loading, refetchProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [testingFor, setTestingFor] = useState('self');
  const [guardianRelationship, setGuardianRelationship] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [adhdFamiliarity, setAdhdFamiliarity] = useState('');
  const [assessmentReason, setAssessmentReason] = useState('');
  const [currentExperiences, setCurrentExperiences] = useState('');
  const [physicalInterests, setPhysicalInterests] = useState('');
  const [mentalInterests, setMentalInterests] = useState('');
  const [supportGoals, setSupportGoals] = useState('');

  useEffect(() => {
    if (!loading && !user) navigate('/auth');
  }, [loading, navigate, user]);

  useEffect(() => {
    if (profile?.onboarding_completed) navigate('/assessment');
  }, [navigate, profile?.onboarding_completed]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !ageRange || !adhdFamiliarity || !assessmentReason.trim() || !currentExperiences.trim()) return;

    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        testing_for: testingFor,
        guardian_relationship: guardianRelationship.trim() || null,
        age_range: ageRange,
        adhd_familiarity: adhdFamiliarity,
        assessment_reason: assessmentReason.trim(),
        current_experiences: currentExperiences.trim(),
        physical_interests: physicalInterests.trim() || null,
        mental_interests: mentalInterests.trim() || null,
        support_goals: supportGoals.trim() || null,
        onboarding_completed: true,
      })
      .eq('user_id', user.id);

    setSaving(false);
    if (error) {
      toast({ title: 'Could not save onboarding', description: error.message, variant: 'destructive' });
      return;
    }
    await refetchProfile();
    navigate('/assessment');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-medical-light/20 to-background px-4 py-6 sm:py-10">
      <SeoHead title="FocusCheck onboarding" description="Tell FocusCheck what brought you here before starting your ADHD screening journey." path="/onboarding" />
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6 text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Personalize your FocusCheck journey</h1>
          <p className="mt-2 text-sm text-muted-foreground">ADHD means attention-deficit/hyperactivity disorder. Your answers help shape a better screening profile.</p>
        </div>

        <Card className="border-border/60 bg-card/90 shadow-[var(--shadow-card)] backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl"><Sparkles className="h-5 w-5 text-primary" /> Tell us what matters</CardTitle>
            <CardDescription>Share only what feels useful. This is educational screening context, not a diagnosis.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Who is this test for?</Label>
                  <Select value={testingFor} onValueChange={setTestingFor}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{testingForOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Age range</Label>
                  <Select value={ageRange} onValueChange={setAgeRange} required>
                    <SelectTrigger><SelectValue placeholder="Select age range" /></SelectTrigger>
                    <SelectContent>{ageRangeOptions.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              {testingFor !== 'self' && (
                <div className="space-y-2">
                  <Label htmlFor="guardianRelationship">Your relationship</Label>
                  <Input id="guardianRelationship" value={guardianRelationship} onChange={event => setGuardianRelationship(event.target.value)} placeholder="Parent, guardian, partner, teacher, caregiver" />
                </div>
              )}

              <div className="space-y-2">
                <Label>How familiar are you with ADHD?</Label>
                <Select value={adhdFamiliarity} onValueChange={setAdhdFamiliarity} required>
                  <SelectTrigger><SelectValue placeholder="Choose one" /></SelectTrigger>
                  <SelectContent>{familiarityOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assessmentReason">Why are you taking this test?</Label>
                <Textarea id="assessmentReason" value={assessmentReason} onChange={event => setAssessmentReason(event.target.value)} placeholder="School, work, focus, routines, relationships, emotional regulation, or curiosity" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentExperiences">What experiences made you think about ADHD?</Label>
                <Textarea id="currentExperiences" value={currentExperiences} onChange={event => setCurrentExperiences(event.target.value)} placeholder="Attention, organization, forgetfulness, restlessness, time management, impulsivity, overwhelm" required />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="physicalInterests">Physical interests and routines</Label>
                  <Textarea id="physicalInterests" value={physicalInterests} onChange={event => setPhysicalInterests(event.target.value)} placeholder="Sports, movement, sleep, exercise, outdoor activity" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mentalInterests">Mental interests and strengths</Label>
                  <Textarea id="mentalInterests" value={mentalInterests} onChange={event => setMentalInterests(event.target.value)} placeholder="Hobbies, learning style, creativity, problem solving, hyperfocus areas" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supportGoals">What support would help next?</Label>
                <Textarea id="supportGoals" value={supportGoals} onChange={event => setSupportGoals(event.target.value)} placeholder="Resources, school/work discussion, family learning, professional conversation, tracking progress" />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={saving || !ageRange || !adhdFamiliarity || !assessmentReason.trim() || !currentExperiences.trim()}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <HeartPulse className="h-4 w-4" />} Start assessment
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;