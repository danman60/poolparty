import PoolsTable from "@/components/PoolsTable";
import dynamic from "next/dynamic";
import FreshnessIndicator from "@/components/FreshnessIndicator";
import IngestBadge from "@/components/IngestBadge";
import ManualIngestButton from "@/components/ManualIngestButton";

const DashboardHealthOverview = dynamic(() => import("@/components/DashboardHealthOverview"));

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex items-center gap-3">
          <DashboardHealthOverview />
          <div className="flex items-center gap-2"><FreshnessIndicator /><IngestBadge /><ManualIngestButton /></div>
        </div>
      </div>
      <p className="text-sm opacity-80">Browse top pools and filter by fee tier.</p>
      <div>
        <PoolsTable />
      </div>
    </div>
  );
}






