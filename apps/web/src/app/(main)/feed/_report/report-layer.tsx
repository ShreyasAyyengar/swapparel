"use client";

import { useQueryState } from "nuqs";
import ReportForm from "./report-form";

export default function ReportLayer() {
  const [reportedPostId, setReportedPostId] = useQueryState("report");

  if (reportedPostId === null) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto backdrop-blur-md">
      <ReportForm reportedPostId={reportedPostId} closeAction={() => setReportedPostId(null)} />
    </div>
  );
}
