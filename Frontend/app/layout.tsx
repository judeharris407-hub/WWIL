import type { Metadata } from 'next';
import { Inter, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import LiveSupportWidgets from '@/components/LiveSupportWidgets';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TransGlobe-Logistics | Global Freight & Multimodal Cargo',
  description: 'TransGlobe-Logistics is a premier global logistics provider specializing in air freight, ocean liners, intermodal rail, and live satellite tracking across 180+ countries.',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`scroll-smooth ${inter.variable} ${ibmPlexMono.variable}`}>
      <body className="font-sans bg-white text-slate-800 antialiased selection:bg-[#2563EB] selection:text-white min-h-screen flex flex-col overflow-x-hidden max-w-full">
        <Navbar />
        <main className="flex-1 overflow-x-hidden">{children}</main>
        <Footer />
        <LiveSupportWidgets />
      </body>
    </html>
  );
}
