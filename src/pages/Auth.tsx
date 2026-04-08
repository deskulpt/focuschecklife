import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Mail, Lock, User, ArrowLeft, Phone, Globe, Calendar, Users, MapPin, Building } from 'lucide-react';

const countries = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'India', 'Brazil',
  'Germany', 'France', 'Spain', 'Mexico', 'Japan', 'South Korea', 'Nigeria',
  'South Africa', 'UAE', 'Saudi Arabia', 'Singapore', 'Philippines', 'Indonesia', 'Other'
];

const Auth = () => {
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [marketingEmailConsent, setMarketingEmailConsent] = useState(false);
  const [marketingPushConsent, setMarketingPushConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && !acceptTerms) {
      toast({ title: t('auth.error'), description: t('auth.mustAcceptTerms'), variant: 'destructive' });
      return;
    }
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
            data: {
              full_name: fullName, phone, country, city, state,
              age: parseInt(age) || null, gender,
              marketing_email_opt_in: marketingEmailConsent,
              marketing_push_opt_in: marketingPushConsent,
            },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast({ title: t('auth.accountCreated'), description: t('auth.checkEmail') });
      }
    } catch (error: any) {
      toast({ title: t('auth.error'), description: error.message, variant: 'destructive' });
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
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">FocusCheck</h1>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm">{t('auth.subtitle')}</p>
        </div>

        <Card className="shadow-[var(--shadow-card)] border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-3">
            <CardTitle className="text-lg sm:text-xl">
              {isLogin ? t('auth.welcomeBack') : t('auth.createAccount')}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {isLogin ? t('auth.signInSubtitle') : t('auth.signUpSubtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-3 sm:space-y-4">
              {!isLogin && (
                <>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="text" placeholder={t('auth.fullName')} value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-10" required />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="tel" placeholder={t('auth.phone')} value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-10" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                      <Input type="number" placeholder={t('auth.age')} value={age} onChange={(e) => setAge(e.target.value)} className="pl-10" min="5" max="120" />
                    </div>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <SelectValue placeholder={t('auth.gender')} />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">{t('auth.gender.male')}</SelectItem>
                        <SelectItem value="female">{t('auth.gender.female')}</SelectItem>
                        <SelectItem value="non-binary">{t('auth.gender.nonBinary')}</SelectItem>
                        <SelectItem value="prefer-not">{t('auth.gender.preferNot')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder={t('auth.country')} />
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
                <Input type="email" placeholder={t('auth.email')} value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input type="password" placeholder={t('auth.password')} value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" required minLength={6} />
              </div>

              {!isLogin && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="terms"
                      checked={acceptTerms}
                      onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                      className="mt-0.5"
                    />
                    <label htmlFor="terms" className="text-xs text-muted-foreground leading-tight cursor-pointer">
                      {t('auth.agreeTerms')}{' '}
                      <Link to="/terms" className="text-primary hover:underline" target="_blank">{t('auth.termsLink')}</Link>
                      {' '}{t('auth.and')}{' '}
                      <Link to="/privacy" className="text-primary hover:underline" target="_blank">{t('auth.privacyLink')}</Link>
                    </label>
                  </div>
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="marketing"
                      checked={marketingConsent}
                      onCheckedChange={(checked) => setMarketingConsent(checked === true)}
                      className="mt-0.5"
                    />
                    <label htmlFor="marketing" className="text-xs text-muted-foreground leading-tight cursor-pointer">
                      {t('auth.marketingConsent')}
                    </label>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading || (!isLogin && !acceptTerms)}>
                {loading ? t('auth.loading') : isLogin ? t('auth.submit.signIn') : t('auth.submit.signUp')}
              </Button>
            </form>

            <div className="mt-4 sm:mt-6 text-center">
              <button onClick={() => setIsLogin(!isLogin)} className="text-xs sm:text-sm text-primary hover:underline">
                {isLogin ? t('auth.switchToSignUp') : t('auth.switchToSignIn')}
              </button>
            </div>

            {!isLogin && (
              <div className="mt-3 sm:mt-4 p-3 bg-success/10 rounded-lg text-xs text-center text-muted-foreground">
                <strong className="text-foreground">{t('auth.freeIncludes')}</strong> {t('auth.freeIncludesDesc')}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-4 text-center">
          <button onClick={() => navigate('/')} className="text-xs sm:text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mx-auto">
            <ArrowLeft className="w-3 h-3" /> {t('auth.backHome')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
