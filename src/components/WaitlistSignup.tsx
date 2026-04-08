import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface WaitlistSignupProps {
  source?: string;
  variant?: 'card' | 'inline' | 'compact';
  className?: string;
}

export const WaitlistSignup = ({ source = 'landing', variant = 'card', className = '' }: WaitlistSignupProps) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();

  const isEn = language === 'en';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast({
        title: isEn ? 'Invalid email' : 'Email inválido',
        description: isEn ? 'Please enter a valid email address.' : 'Por favor, insira um endereço de email válido.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('waitlist' as any).insert({ email: email.trim().toLowerCase(), source } as any);
    setLoading(false);

    if (error) {
      if (error.code === '23505') {
        toast({
          title: isEn ? "You're already on the list!" : 'Você já está na lista!',
          description: isEn ? "We'll notify you when the app launches." : 'Nós avisaremos quando o app for lançado.',
        });
        setJoined(true);
      } else {
        toast({
          title: isEn ? 'Something went wrong' : 'Algo deu errado',
          description: isEn ? 'Please try again later.' : 'Por favor, tente novamente mais tarde.',
          variant: 'destructive',
        });
      }
      return;
    }

    setJoined(true);
    toast({
      title: isEn ? "You're on the waitlist!" : 'Você está na lista de espera!',
      description: isEn ? "We'll email you when the self-monitoring app launches." : 'Enviaremos um email quando o app de automonitoramento for lançado.',
    });
  };

  if (joined) {
    return (
      <div className={`flex items-center gap-2 justify-center p-4 rounded-xl bg-[hsl(var(--success)/0.1)] border border-[hsl(var(--success)/0.2)] ${className}`}>
        <CheckCircle className="w-5 h-5 text-[hsl(var(--success))]" />
        <span className="text-sm font-medium text-[hsl(var(--success))]">
          {isEn ? "You're on the waitlist! We'll be in touch." : 'Você está na lista! Entraremos em contato.'}
        </span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <Input
          type="email"
          placeholder={isEn ? 'Enter your email' : 'Seu email'}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 text-sm"
          required
        />
        <Button type="submit" size="sm" disabled={loading} className="gap-1.5 shrink-0">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bell className="w-3.5 h-3.5" />}
          {isEn ? 'Join' : 'Entrar'}
        </Button>
      </form>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Bell className="w-4 h-4 text-[hsl(var(--primary))]" />
          <span>{isEn ? 'Get notified when this launches' : 'Seja notificado quando lançar'}</span>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="email"
            placeholder={isEn ? 'your@email.com' : 'seu@email.com'}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
            required
          />
          <Button type="submit" disabled={loading} className="gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
            {isEn ? 'Join Waitlist' : 'Entrar na lista'}
          </Button>
        </form>
      </div>
    );
  }

  // card variant
  return (
    <div className={`glass-card p-6 sm:p-8 text-center space-y-4 ${className}`}>
      <div className="w-12 h-12 mx-auto rounded-xl bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
        <Bell className="w-6 h-6 text-[hsl(var(--primary))]" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          {isEn ? 'Self-Monitoring App Coming Soon' : 'App de Automonitoramento em Breve'}
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {isEn
            ? 'Track your ADHD symptoms daily, build habits, and visualize your progress over time. Join the waitlist to be first to know.'
            : 'Acompanhe seus sintomas de TDAH diariamente, crie hábitos e visualize seu progresso. Entre na lista de espera para ser o primeiro a saber.'}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
        <Input
          type="email"
          placeholder={isEn ? 'your@email.com' : 'seu@email.com'}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
          required
        />
        <Button type="submit" disabled={loading} className="gap-2 shrink-0">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
          {isEn ? 'Join Waitlist' : 'Entrar na lista'}
        </Button>
      </form>
      <p className="text-xs text-muted-foreground">
        {isEn ? 'No spam. Unsubscribe anytime.' : 'Sem spam. Cancele quando quiser.'}
      </p>
    </div>
  );
};
