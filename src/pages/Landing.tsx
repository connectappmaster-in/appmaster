import Hero from "@/components/Hero";
import ProductShowcase from "@/components/ProductShowcase";
import Features from "@/components/Features";
import Benefits from "@/components/Benefits";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="pt-[52px]">
        <Hero />
        <Benefits />
        <Footer />
      </div>
    </div>
  );
};

export default Landing;
