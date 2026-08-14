import { Box, Step, StepLabel, Stepper, Typography } from "@mui/material";
import { ShipmentStepperProps } from "../../models/mercadoLivre/ShipmentStepper";
import { getDateStringFromISOstring } from "../../utils";

const ETAPAS = [
  {
    id: "preparacao",
    label: "Em preparação",
    descricao: "O vendedor está preparando o seu pacote.",
    statuses: ["pending", "handling"],
  },
  {
    id: "caminho",
    label: "A caminho",
    descricao: "O vendedor despachou o seu pacote.",
    statuses: ["ready_to_ship", "shipped"],
  },
  {
    id: "entrega",
    label: "Entrega",
    descricao: "Pacote entregue ao destinatário.",
    statuses: ["delivered"],
  },
];

const SUBSTATUS_DESCRICAO: Record<string, string> = {
  out_for_delivery: "Saiu para entrega.",
  in_hub: "Recebido no centro de distribuição.",
  picked_up: "Coletado pela transportadora.",
  printed: "Etiqueta impressa.",
  waiting_for_label_generation: "Aguardando geração da etiqueta.",
  receiver_absent: "Tentativa sem sucesso: comprador ausente.",
  bad_address: "Tentativa sem sucesso: endereço incorreto.",
  dangerous_area: "Tentativa sem sucesso: região de risco.",
  unauthorized_receiver: "Tentativa sem sucesso: pessoa não autorizada.",
  returning_to_sender: "Em devolução ao vendedor.",
};

const ShipmentStepper = ({ rastreio, historico }: ShipmentStepperProps) => {
  const statusAtual = rastreio?.status || "";
  const falhou = statusAtual === "not_delivered" || statusAtual === "cancelled";

  const etapaAtual = ETAPAS.findIndex((etapa) =>
    etapa.statuses.includes(statusAtual)
  );

  const dataDaEtapa = (statuses: string[]) => {
    const evento = historico.find((item) => statuses.includes(item.status));
    return evento?.data ? getDateStringFromISOstring(evento.data) : null;
  };

  const descricaoDaEtapa = (indice: number, padrao: string) => {
    if (indice === etapaAtual && rastreio?.substatus) {
      return SUBSTATUS_DESCRICAO[rastreio.substatus] || padrao;
    }
    return padrao;
  };

  return (
    <Box sx={{ width: "100%", py: 1 }}>
      <Stepper
        activeStep={falhou ? ETAPAS.length : etapaAtual}
        alternativeLabel
      >
        {ETAPAS.map((etapa, indice) => {
          const data = dataDaEtapa(etapa.statuses);
          return (
            <Step key={etapa.id} completed={etapaAtual > indice}>
              <StepLabel error={falhou && indice === ETAPAS.length - 1}>
                <Typography fontSize="0.8rem" fontWeight={600}>
                  {etapa.label}
                </Typography>
                <Typography fontSize="0.7rem" color="text.secondary">
                  {descricaoDaEtapa(indice, etapa.descricao)}
                </Typography>
                {data && (
                  <Typography fontSize="0.7rem" color="text.secondary">
                    {data}
                  </Typography>
                )}
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>

      {falhou && (
        <Typography fontSize="0.75rem" color="error.main" sx={{ mt: 1 }}>
          {statusAtual === "cancelled"
            ? "Envio cancelado."
            : "Entrega não concluída."}
          {rastreio?.substatus
            ? ` ${SUBSTATUS_DESCRICAO[rastreio.substatus] || ""}`
            : ""}
        </Typography>
      )}
    </Box>
  );
};

export default ShipmentStepper;
