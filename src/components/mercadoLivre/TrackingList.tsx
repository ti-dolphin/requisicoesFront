import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useDispatch } from "react-redux";
import { setFeedback } from "../../redux/slices/feedBackSlice";
import MercadoLivreService from "../../services/mercadoLivre/MercadoLivreService";
import {
  MercadoLivreOrder,
  MercadoLivreShipmentDetail,
} from "../../models/mercadoLivre/MercadoLivreOrder";
import { TrackingListProps } from "../../models/mercadoLivre/TrackingList";
import { getDateStringFromISOstring, formatCurrency } from "../../utils";

export const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  handling: "Em preparação",
  ready_to_ship: "Pronto para envio",
  shipped: "Enviado",
  delivered: "Entregue",
  not_delivered: "Não entregue",
  cancelled: "Cancelado",
  to_be_agreed: "A combinar",
};

export const SUBSTATUS_LABELS: Record<string, string> = {
  out_for_delivery: "Saiu para entrega",
  receiver_absent: "Comprador ausente",
  dangerous_area: "Região de risco",
  bad_address: "Endereço incorreto",
  unauthorized_receiver: "Pessoa não autorizada",
  returning_to_sender: "Em devolução ao vendedor",
  printed: "Etiqueta impressa",
  waiting_for_label_generation: "Aguardando etiqueta",
  picked_up: "Coletado pela transportadora",
  authorized_by_carrier: "Autorizado pela transportadora",
  in_hub: "Recebido no centro de distribuição",
  waiting_for_payment: "Aguardando pagamento do frete",
  shipment_paid: "Frete pago",
  creating_route: "Rota criada",
  under_review: "Em revisão",
};

const STATUS_COLORS: Record<
  string,
  "default" | "info" | "success" | "error" | "warning"
> = {
  delivered: "success",
  shipped: "info",
  ready_to_ship: "info",
  handling: "warning",
  pending: "default",
  not_delivered: "error",
  cancelled: "error",
};

const TrackingList = ({ orders }: TrackingListProps) => {
  const dispatch = useDispatch();
  const [expanded, setExpanded] = useState<number | string | null>(null);
  const [details, setDetails] = useState<
    Record<string, MercadoLivreShipmentDetail | "loading">
  >({});

  const toggleDetail = async (order: MercadoLivreOrder) => {
    const key = String(order.id_pedido);

    if (!order.id_envio) return;

    if (expanded === key) {
      setExpanded(null);
      return;
    }

    setExpanded(key);
    if (details[key]) return;

    setDetails((prev) => ({ ...prev, [key]: "loading" }));
    try {
      const detail = await MercadoLivreService.getShipmentDetail(order.id_envio);
      setDetails((prev) => ({ ...prev, [key]: detail }));
    } catch (err: any) {
      setDetails((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      dispatch(
        setFeedback({
          message:
            err?.response?.data?.error || "Erro ao buscar as etapas do envio",
          type: "error",
        })
      );
    }
  };

  const renderTracking = (order: MercadoLivreOrder) => {
    if (order.rastreio) {
      const { status, substatus, codigo_rastreio, transportadora, data_estimada } =
        order.rastreio;
      return (
        <Stack spacing={0.5}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Chip
              size="small"
              label={STATUS_LABELS[status] || status}
              color={STATUS_COLORS[status] || "default"}
            />
            {substatus && (
              <Typography fontSize="0.75rem" color="text.secondary">
                {SUBSTATUS_LABELS[substatus] || substatus}
              </Typography>
            )}
          </Stack>
          {codigo_rastreio && (
            <Typography fontSize="0.75rem">
              Código: <strong>{codigo_rastreio}</strong>
              {transportadora ? ` — ${transportadora}` : ""}
            </Typography>
          )}
          {data_estimada && (
            <Typography fontSize="0.75rem" color="text.secondary">
              Previsão: {getDateStringFromISOstring(data_estimada)}
            </Typography>
          )}
        </Stack>
      );
    }

    if (order.erro_rastreio) {
      return (
        <Typography fontSize="0.75rem" color="error.main">
          Rastreio indisponível: {order.erro_rastreio}
        </Typography>
      );
    }

    return (
      <Typography fontSize="0.75rem" color="text.secondary">
        Sem envio associado
      </Typography>
    );
  };

  const renderDetail = (order: MercadoLivreOrder) => {
    const detail = details[String(order.id_pedido)];

    if (detail === "loading") {
      return (
        <Stack alignItems="center" sx={{ py: 2 }}>
          <CircularProgress size={20} />
        </Stack>
      );
    }

    if (!detail) return null;

    return (
      <Box sx={{ mt: 1, pl: 2, borderLeft: "2px solid", borderColor: "divider" }}>
        {detail.transportadora?.nome && (
          <Typography fontSize="0.75rem" sx={{ mb: 1 }}>
            Transportadora: <strong>{detail.transportadora.nome}</strong>
            {detail.transportadora.url && (
              <>
                {" — "}
                <Link
                  href={detail.transportadora.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  rastrear no site da transportadora
                </Link>
              </>
            )}
          </Typography>
        )}

        {detail.historico.length === 0 ? (
          <Typography fontSize="0.75rem" color="text.secondary">
            Sem etapas registradas.
          </Typography>
        ) : (
          <Stack spacing={0.5}>
            {detail.historico.map((event, index) => (
              <Stack
                key={`${event.status}-${event.data}-${index}`}
                direction="row"
                spacing={1}
                alignItems="baseline"
              >
                <Typography
                  fontSize="0.7rem"
                  color="text.secondary"
                  sx={{ minWidth: 130 }}
                >
                  {event.data ? getDateStringFromISOstring(event.data) : "—"}
                </Typography>
                <Typography fontSize="0.75rem">
                  {STATUS_LABELS[event.status] || event.status}
                  {event.substatus
                    ? ` — ${SUBSTATUS_LABELS[event.substatus] || event.substatus}`
                    : ""}
                </Typography>
              </Stack>
            ))}
          </Stack>
        )}
      </Box>
    );
  };

  return (
    <Stack spacing={1} divider={<Divider />}>
      {orders.map((order) => (
        <Box key={order.id_pedido} sx={{ py: 1 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            spacing={1}
          >
            <Box sx={{ flex: 1 }}>
              <Typography fontSize="0.85rem" fontWeight={600}>
                {order.itens.length
                  ? order.itens.map((item) => item.titulo).join(", ")
                  : `Compra ${order.id_pedido}`}
              </Typography>
              <Typography fontSize="0.75rem" color="text.secondary">
                {order.data_criacao
                  ? getDateStringFromISOstring(order.data_criacao)
                  : ""}
                {order.vendedor ? ` — ${order.vendedor}` : ""}
                {order.total ? ` — ${formatCurrency(Number(order.total))}` : ""}
              </Typography>
              <Link
                href={`https://www.mercadolivre.com.br/vendas/${order.id_pedido}/detalhe`}
                target="_blank"
                rel="noopener noreferrer"
                fontSize="0.7rem"
              >
                Pedido {order.id_pedido}
              </Link>
            </Box>
            <Box sx={{ minWidth: 220 }}>
              {renderTracking(order)}
              {order.id_envio && (
                <Button
                  size="small"
                  variant="text"
                  endIcon={
                    <ExpandMoreIcon
                      sx={{
                        transform:
                          expanded === String(order.id_pedido)
                            ? "rotate(180deg)"
                            : "none",
                      }}
                    />
                  }
                  sx={{
                    backgroundColor: "transparent",
                    color: "primary.main",
                    p: 0,
                    mt: 0.5,
                    "&:hover": { backgroundColor: "transparent" },
                  }}
                  onClick={() => toggleDetail(order)}
                >
                  Etapas
                </Button>
              )}
            </Box>
          </Stack>

          <Collapse in={expanded === String(order.id_pedido)} unmountOnExit>
            {renderDetail(order)}
          </Collapse>
        </Box>
      ))}
    </Stack>
  );
};

export default TrackingList;
