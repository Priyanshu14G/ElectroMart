import { Suspense } from 'react';
import { Header } from '@/components/layouts/header';
import { Footer } from '@/components/layouts/footer';
import { HeroSection } from '@/components/sections/hero-section';
import { PopularCategories } from '@/components/sections/popular-categories';
import { TrendingComponents } from '@/components/sections/trending-components';
import { FeaturedSuppliers } from '@/components/sections/featured-suppliers';
import { VerifiedSuppliers } from '@/components/sections/verified-suppliers';
import { FeaturedCompanies } from '@/components/sections/featured-companies';
import { FAQSection } from '@/components/sections/faq-section';

export default function Home() {
  return (
    <>
      <Suspense>
        <Header />
      </Suspense>
      <main className="min-h-screen">
        <HeroSection />
        <PopularCategories />
        <FeaturedSuppliers />
        <TrendingComponents />
        <VerifiedSuppliers />
        <FeaturedCompanies />
        <FAQSection />
      </main>
      <Footer />
    </>
  );
}
