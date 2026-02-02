import './VitalsCard.css'

interface VitalsCardProps {
  imageSrc: string
  active?: boolean
  alt?: string
  className?: string
}

export function VitalsCard({ imageSrc, active = true, alt = 'Constantes vitales', className = '' }: VitalsCardProps) {
  const displaySrc = active ? imageSrc : '/images/VitalsInactif.png'

  return (
    <div className={`vitals-card ${className}`}>
      <img src={displaySrc} alt={alt} className="vitals-card-image" />
    </div>
  )
}
