interface ClusterProps {
  charge: number;
  index: number;
  isActive: boolean;
  colorPhase: string;
  isWarning: boolean;
}

export function Cluster({
  charge,
  index,
  isActive,
}: ClusterProps) {
  const gaugeClassName = [
    "cluster-gauge",
    "charge-safe",
    isActive ? "charging phase-safe" : "",
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
