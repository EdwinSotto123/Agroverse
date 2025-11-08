import { HeroCarousel } from "@/components/HeroCarousel"
import { FeaturesCarousel } from "@/components/FeaturesCarousel"
import { StatsSection } from "@/components/StatsSection"
import Header from "@/components/Header"
import AboutSection from "@/components/AboutSection"
import TutorialSection from "@/components/TutorialSection"
import TechnologySection from "@/components/TechnologySection"
import TestimonialsSection from "@/components/TestimonialsSection"
import ContactSection from "@/components/ContactSection"
import Footer from "@/components/Footer"

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Header />
      <section id="hero">
        <HeroCarousel />
      </section>
      <section id="about">
        <AboutSection />
      </section>
      <section id="tutorial">
        <TutorialSection />
      </section>
      <section id="features">
        <FeaturesCarousel />
      </section>
      <section id="technology">
        <TechnologySection />
      </section>
      <section id="stats">
        <StatsSection />
      </section>
      <section id="testimonials">
        <TestimonialsSection />
      </section>
      <section id="contact">
        <ContactSection />
      </section>
      <Footer />
    </div>
  );
};

export default Index;
