import HeroSection from '@/components/HeroSection';
import ServicesSection from '@/components/ServicesSection';
import WhyWeSection from '@/components/WhyWeSection';
import ContactSection from '@/components/ContactSection'; 

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <HeroSection />
      <ServicesSection />
      <WhyWeSection />
      <ContactSection /> {/* Added Contact Section here */}
    </div>
  );
};

export default Index;