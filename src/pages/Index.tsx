import { useState } from "react";
import { AnnouncementBar } from "@/components/church/AnnouncementBar";
import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/church/HeroSection";
import { ServiceTimesCards } from "@/components/church/ServiceTimesCards";
import { AboutSection } from "@/components/church/AboutSection";
import { MinistriesSection } from "@/components/church/MinistriesSection";
import { SermonsAndEventsSection } from "@/components/church/SermonsAndEventsSection";
import { GivingSection } from "@/components/church/GivingSection";
import { VisitContactSection } from "@/components/church/VisitContactSection";
import { ChurchFooter } from "@/components/church/ChurchFooter";

import { GiveOnlineModal } from "@/components/church/GiveOnlineModal";
import { PlanVisitModal } from "@/components/church/PlanVisitModal";
import { PrayerRequestModal } from "@/components/church/PrayerRequestModal";
import { SermonPlayerModal } from "@/components/church/SermonPlayerModal";
import { AboutModal } from "@/components/church/AboutModal";
import { AllEventsModal } from "@/components/church/AllEventsModal";

const Index = () => {
  const [giveModalOpen, setGiveModalOpen] = useState(false);
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [prayerModalOpen, setPrayerModalOpen] = useState(false);
  const [sermonModalOpen, setSermonModalOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [eventsModalOpen, setEventsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-[#1B2430] flex flex-col font-sans selection:bg-[#0F3E6B] selection:text-white">
      {/* Top Announcement Bar */}
      <AnnouncementBar />

      {/* Main Church Navigation */}
      <Navigation
        variant="default"
        onGiveOnline={() => setGiveModalOpen(true)}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Section 1: Hero */}
        <HeroSection
          onPlanVisit={() => setVisitModalOpen(true)}
          onWatchOnline={() => setSermonModalOpen(true)}
        />

        {/* Section 2: Service Times Floating Cards */}
        <ServiceTimesCards
          onPlanVisit={() => setVisitModalOpen(true)}
          onPrayerRequest={() => setPrayerModalOpen(true)}
        />

        {/* Section 3: About Church & Heritage */}
        <AboutSection
          onLearnMore={() => setAboutModalOpen(true)}
        />

        {/* Section 4: Ministries for Every Season */}
        <MinistriesSection />

        {/* Section 5: Watch Latest Message & Upcoming Events */}
        <SermonsAndEventsSection
          onWatchSermon={() => setSermonModalOpen(true)}
          onViewAllEvents={() => setEventsModalOpen(true)}
        />

        {/* Section 6: Partner With Us / Giving */}
        <GivingSection
          onGiveOnline={() => setGiveModalOpen(true)}
        />

        {/* Section 7: Visit & Contact Details */}
        <VisitContactSection
          onPlanVisit={() => setVisitModalOpen(true)}
          onPrayerRequest={() => setPrayerModalOpen(true)}
        />
      </main>

      {/* Church Footer */}
      <ChurchFooter />

      {/* Interactive Modals */}
      <GiveOnlineModal
        open={giveModalOpen}
        onOpenChange={setGiveModalOpen}
      />

      <PlanVisitModal
        open={visitModalOpen}
        onOpenChange={setVisitModalOpen}
      />

      <PrayerRequestModal
        open={prayerModalOpen}
        onOpenChange={setPrayerModalOpen}
      />

      <SermonPlayerModal
        open={sermonModalOpen}
        onOpenChange={setSermonModalOpen}
      />

      <AboutModal
        open={aboutModalOpen}
        onOpenChange={setAboutModalOpen}
      />

      <AllEventsModal
        open={eventsModalOpen}
        onOpenChange={setEventsModalOpen}
      />
    </div>
  );
};

export default Index;
