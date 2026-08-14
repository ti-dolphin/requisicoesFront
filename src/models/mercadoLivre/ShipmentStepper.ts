import {
  MercadoLivreShipmentEvent,
  MercadoLivreTracking,
} from "./MercadoLivreOrder";

export interface ShipmentStepperProps {
  rastreio: MercadoLivreTracking | null;
  historico: MercadoLivreShipmentEvent[];
}
