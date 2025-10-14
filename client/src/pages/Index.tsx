import Navigation from "@/components/Navigation";
import AlertCard from "@/components/AlertCard";
import UploadSection from "@/components/UploadSection";
import SystemStatus from "@/components/SystemStatus";
import NetworkTraffic from "@/components/NetworkTraffic";
import ModelPerformance from "@/components/ModelPerformance";
import LogsViewer from "@/components/LogsViewer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            <AlertCard />
            <UploadSection />
            <SystemStatus />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <NetworkTraffic />
            <ModelPerformance />
            <LogsViewer />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
