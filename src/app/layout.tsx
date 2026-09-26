import type { Metadata, Viewport } from 'next';
import { Poppins, Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OnboardingModal from '@/components/OnboardingModal';
import QueryProvider from '@/components/providers/QueryProvider';
import CustomCursor from '@/components/CustomCursor';
import SmoothScrollProvider from '@/components/providers/SmoothScrollProvider';
import ScrollProgress from '@/components/ScrollProgress';
import BackgroundGlow from '@/components/background/BackgroundGlow';
import AssistantRoot from '@/components/assistant/AssistantRoot';
import AppSidebar from '@/components/sidebar/AppSidebar';
import AppLayoutContainer from '@/components/layout/AppLayoutContainer';
import PwaInstallPrompt from '@/components/pwa/PwaInstallPrompt';

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600'],
});

export const viewport: Viewport = {
  themeColor: '#1C1B22',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'Prepr — Technical Interview Simulator',
  description:
    'Calibrated technical interview simulation. 5 multi-stage questions, trade-off evaluation, and structured performance tracking.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Prepr',
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/icons/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-[#1C1B22] text-[#EDEBE6] font-[family-name:var(--font-inter)] flex flex-col selection:bg-[#C97B4A]/30 selection:text-[#EDEBE6] relative">
        <QueryProvider>
          <SmoothScrollProvider>
            <BackgroundGlow />
            <ScrollProgress />
            <CustomCursor />
            <AppSidebar />
            <AppLayoutContainer>
              <Navbar />
              <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-14 flex flex-col relative z-10 scroll-velocity-skew">
                {children}
              </main>
              <Footer />
            </AppLayoutContainer>
            <OnboardingModal />
            <AssistantRoot />
            <PwaInstallPrompt />
          </SmoothScrollProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
