import './VitalsCard.css'

interface VitalsCardProps {
  imageSrc: string
  alt?: string
  className?: string
}

export function VitalsCard({ imageSrc, alt = 'Constantes vitales', className = '' }: VitalsCardProps) {
  return (
    <div className={`vitals-card ${className}`}>
      <img src={imageSrc} alt={alt} className="vitals-card-image" />
    </div>
  )
}
