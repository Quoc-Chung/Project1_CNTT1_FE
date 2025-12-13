import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import Hero from "./Hero";

// Lazy load non-critical components
const Categories = dynamic(() => import("./Categories"), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>,
});

const NewArrival = dynamic(() => import("./NewArrivals"), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>,
});

const PromoBanner = dynamic(() => import("./PromoBanner"), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>,
});

const BestSeller = dynamic(() => import("./BestSeller"), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>,
});

const CounDown = dynamic(() => import("./Countdown"), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>,
});

const Vouchers = dynamic(() => import("./Vouchers"), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>,
});

// Lazy load FeaturedProducts để giảm bundle size (sử dụng framer-motion)
const FeaturedProducts = dynamic(() => import("./FeaturedProducts"), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg"></div>,
});

const Home = () => {
  return (
    <main className="relative">
      {/* Critical above-the-fold content */}
      <Hero />
      
      {/* Non-critical content with lazy loading */}
      <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>}>
        <Categories />
      </Suspense>
      
      <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>}>
        <NewArrival />
      </Suspense>
      
      <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>}>
        <PromoBanner />
      </Suspense>
      
      <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>}>
        <BestSeller />
      </Suspense>
      
      <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>}>
        <Vouchers />
      </Suspense>
      
      <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>}>
        <CounDown />
      </Suspense>
    </main>
  );
};

export default Home;