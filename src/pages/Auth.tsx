import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, User, ArrowLeft, Phone, Globe, Calendar, Users } from 'lucide-react';

const countries = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'India', 'Brazil',
  'Germany', 'France', 'Spain', 'Mexico', 'Japan', 'South Korea', 'Nigeria',
  'South Africa', 'UAE', 'Saudi Arabia', 'Singapore', 'Philippines', 'Indonesia', 'Other'
];

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, phone, country, age: parseInt(age) || null, gender },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast({
          title: 'Account created!',
          description: 'Please check your email to verify your account.',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-medical-light/20 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-3 mb-3 sm:mb-4">
            <img src="/logo.png" alt="FocusCheck" className="w-10 h-10 sm:w-12 sm:h-12" />
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-medical-teal bg-clip-text text-transparent">
              FocusCheck
            </h1>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm">
            ADHD assessment platform — pending clinical trials
          </p>
        </div>

        <Card className="shadow-[var(--shadow-card)] border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-3">
            <CardTitle className="text-lg sm:text-xl">
              {isLogin ? 'Welcome Back' : 'Create Free Account'}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {isLogin ? 'Sign in to access your assessments' : 'Start your ADHD assessment journey today'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-3 sm:space-y-4">
              {!isLogin && (
                <>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="text" placeholder="Full Name *" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-10" required />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-10" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                      <Input type="number" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} className="pl-10" min="5" max="120" />
                    </div>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <SelectValue placeholder="Gender" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="non-binary">Non-binary</SelectItem>
                        <SelectItem value="prefer-not">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="Country" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input type="email" placeholder="Email *" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input type="password" placeholder="Password *" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" required minLength={6} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-4 sm:mt-6 text-center">
              <button onClick={() => setIsLogin(!isLogin)} className="text-xs sm:text-sm text-primary hover:underline">
                {isLogin ? "Don't have an account? Sign up free" : 'Already have an account? Sign in'}
              </button>
            </div>

            {!isLogin && (
              <div className="mt-3 sm:mt-4 p-3 bg-success/10 rounded-lg text-xs text-center text-muted-foreground">
                <strong className="text-foreground">Free account includes:</strong> Complete first assessment with results snapshot
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-4 text-center">
          <button onClick={() => navigate('/')} className="text-xs sm:text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mx-auto">
            <ArrowLeft className="w-3 h-3" /> Back to home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
