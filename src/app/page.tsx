import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { GlassNav } from "@/components/navigation/GlassNav";
import { AboutSection } from "@/components/sections/AboutSection";
import { AwardsSection } from "@/components/sections/AwardsSection";
import { CinematicIntro } from "@/components/sections/CinematicIntro";
import { ContactSection } from "@/components/sections/ContactSection";
import { DegreeSection } from "@/components/sections/DegreeSection";
import { DevelopmentSection } from "@/components/sections/DevelopmentSection";
import { EducationSection } from "@/components/sections/EducationSection";
import { ExpertiseSection } from "@/components/sections/ExpertiseSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { CanvasStage } from "@/components/three/CanvasStage";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { SvgFilters } from "@/components/ui/SvgFilters";

export default function HomePage() {
  return (
    <SmoothScroll>
      <SvgFilters />
      <CustomCursor />
      <CinematicIntro />
      <GlassNav />
      <CanvasStage />

      <main id="main-content" className="pointer-events-none relative z-10">
        <HeroSection />
        <AboutSection />
        <EducationSection />
        <DevelopmentSection />
        <ExpertiseSection />
        <AwardsSection />
        <DegreeSection />
        <ContactSection />
      </main>
    </SmoothScroll>
  );
}
