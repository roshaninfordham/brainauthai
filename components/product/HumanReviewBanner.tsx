import { ShieldCheck } from "lucide-react";

export function HumanReviewBanner() {
  return (
    <div className="reviewBanner">
      <ShieldCheck size={17} aria-hidden="true" />
      <div>
        <strong>Physician review required before submission</strong>
        <span>
          BrainAuth prepares documentation drafts only. It does not diagnose,
          order treatment, approve care, or delay emergency stabilization.
        </span>
      </div>
    </div>
  );
}
