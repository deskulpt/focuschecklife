import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, BarChart3, FileText, HelpCircle, Tag, Settings, Loader2, Globe, Users } from 'lucide-react';
import { AdminAnalytics } from '@/components/admin/AdminAnalytics';
import { AdminFaqs } from '@/components/admin/AdminFaqs';
import { AdminArticles } from '@/components/admin/AdminArticles';
import { AdminCoupons } from '@/components/admin/AdminCoupons';
import { AdminSettings } from '@/components/admin/AdminSettings';
import { AdminTranslations } from '@/components/admin/AdminTranslations';
import { AdminCRM } from '@/components/admin/AdminCRM';

const Admin = () => {
  const { isAdmin, loading } = useAdmin();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
          <p className="text-muted-foreground">You do not have admin privileges.</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/50 bg-card/60 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-lg font-bold text-foreground">Admin CMS</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 max-w-3xl">
            <TabsTrigger value="analytics" className="gap-1 text-xs sm:text-sm">
              <BarChart3 className="w-3.5 h-3.5 hidden sm:inline" /> Analytics
            </TabsTrigger>
            <TabsTrigger value="faqs" className="gap-1 text-xs sm:text-sm">
              <HelpCircle className="w-3.5 h-3.5 hidden sm:inline" /> FAQs
            </TabsTrigger>
            <TabsTrigger value="articles" className="gap-1 text-xs sm:text-sm">
              <FileText className="w-3.5 h-3.5 hidden sm:inline" /> Articles
            </TabsTrigger>
            <TabsTrigger value="coupons" className="gap-1 text-xs sm:text-sm">
              <Tag className="w-3.5 h-3.5 hidden sm:inline" /> Coupons
            </TabsTrigger>
            <TabsTrigger value="translations" className="gap-1 text-xs sm:text-sm">
              <Globe className="w-3.5 h-3.5 hidden sm:inline" /> Languages
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-1 text-xs sm:text-sm">
              <Settings className="w-3.5 h-3.5 hidden sm:inline" /> Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics"><AdminAnalytics /></TabsContent>
          <TabsContent value="faqs"><AdminFaqs /></TabsContent>
          <TabsContent value="articles"><AdminArticles /></TabsContent>
          <TabsContent value="coupons"><AdminCoupons /></TabsContent>
          <TabsContent value="translations"><AdminTranslations /></TabsContent>
          <TabsContent value="settings"><AdminSettings /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
