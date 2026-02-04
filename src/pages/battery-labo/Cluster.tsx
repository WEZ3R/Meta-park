import { ColorPhase } from "./useBatteryLabo";

interface ClusterProps {
  charge: number;
  index: number;
  isActive: boolean;
  colorPhase: ColorPhase;
  isWarning: boolean;
}

// Détermine la couleur en fonction du niveau de charge
function getChargeColor(charge: number): string {
  if (charge <= 25) return "charge-critical";
  if (charge <= 50) return "charge-danger";
  if (charge <= 75) return "charge-caution";
  return "charge-safe";
}

export function Cluster({
  charge,
  index,
  isActive,
  colorPhase,
  isWarning,
}: ClusterProps) {
  const chargeColorClass = getChargeColor(charge);

  const gaugeClassName = [
    "cluster-gauge",
    chargeColorClass,
    isActive ? `charging phase-${colorPhase}` : "",
    isWarning ? "warning" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="cluster-container">
      <div className="cluster-label">Batterie {index + 1}</div>
      <div className={gaugeClassName}>
        <div className="cluster-fill" style={{ height: `${charge}%` }} />
        <div className="cluster-percentage">{Math.round(charge)}%</div>
      </div>
    </div>
  );
}
