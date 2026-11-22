import { useState } from "react";
import { AnnouncementBar } from "@/components/church/AnnouncementBar";
import { Navigation } from "@/components/Navigation";
import { VisitConnectSection } from "@/components/church/VisitConnectSection";
import { ChurchFooter } from "@/components/church/ChurchFooter";
import { GiveOnlineModal } from "@/components/church/GiveOnlineModal";

const Visit = () => {
  const [giveModalOpen, setGiveModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans text-[#1B2430] selection:bg-[#0F3E6B] selection:text-white">
      <AnnouncementBar />

      <Navigation
        variant="default"
        onGiveOnline={() => setGiveModalOpen(true)}
      />

      <main className="flex-1">
        <VisitConnectSection />
      </main>

      <ChurchFooter />

      <GiveOnlineModal
        open={giveModalOpen}
        onOpenChange={setGiveModalOpen}
      />
    </div>
  );
};

export default Visit;
