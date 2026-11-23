import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import LiveSupportWidgets from '@/components/LiveSupportWidgets';

export const metadata: Metadata = {
  title: 'Worldwide International Logistics (WWIL) | Global Freight & Multimodal Cargo',
  description: 'Worldwide International Logistics (WWIL) is a premier global logistics provider specializing in air freight, ocean liners, intermodal rail, and live satellite tracking across 180+ countries.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-white text-slate-800 antialiased selection:bg-[#2563EB] selection:text-white min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <LiveSupportWidgets />
      </body>
    </html>
  );
}
