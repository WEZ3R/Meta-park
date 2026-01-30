import { VitalsCard } from '../../components/VitalsCard/VitalsCard'
import './VitalsPage.css'

export function VitalsPage() {
  return (
    <div className="vitals-page">
      <VitalsCard imageSrc="/images/cartes constantes vitales.png" alt="Constantes vitales 1" />
      <VitalsCard imageSrc="/images/cartes constantes vitales.png" alt="Constantes vitales 2" />
      <VitalsCard imageSrc="/images/cartes constantes vitales.png" alt="Constantes vitales 3" />
    </div>
  )
}
