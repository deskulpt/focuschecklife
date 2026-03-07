import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ConsentDialogProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const ConsentDialog = ({ open, onAccept, onDecline }: ConsentDialogProps) => {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-lg" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-xl">
              {t('consent.title') || 'Terms & Privacy Consent'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-left space-y-3 pt-2">
            <p>{t('consent.intro') || 'Before we save your assessment results, please review our data handling practices:'}</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{t('consent.point1') || 'Your assessment data is stored securely and linked to your account.'}</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{t('consent.point2') || 'Data is used solely to display your results and is never shared with third parties.'}</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                <span>{t('consent.point3') || 'If you decline, your results will still be shown but will not be saved — they will be lost on refresh.'}</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                <span>{t('consent.point4') || 'Saved assessments that are not accessed for 7 days will be automatically deleted.'}</span>
              </li>
            </ul>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
          <Button variant="outline" onClick={onDecline} className="sm:flex-1">
            {t('consent.decline') || 'Decline — Don\'t Save'}
          </Button>
          <Button onClick={onAccept} className="sm:flex-1">
            {t('consent.accept') || 'Accept & Save Results'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
