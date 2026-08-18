import React from "react";
import { Box, Typography, Stack, Avatar, Tooltip, Chip, Card, CardContent, CardActions } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { getDateFromISOstring } from "../../utils";

interface OpportunityCardProps {
  row: any;
  styles?: React.CSSProperties;
  onClick?: () => void;
  actions?: React.ReactNode;
}

const AVATAR_COLORS = ["#e57373", "#f06292", "#ba68c8", "#9575cd", "#7986cb", "#64b5f6", "#4db6ac", "#81c784", "#ffb74d"];

const getInitials = (nome: string) => {
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
};

const getAvatarColor = (nome: string) => {
  let hash = 0;
  for (let i = 0; i < nome.length; i++) hash = nome.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const formatDataPlanejada = (data: string) => {
  const date = getDateFromISOstring(data);
  return date ? date.toLocaleDateString("pt-BR", { day: "numeric", month: "short" }) : "";
};

const DSE_CODE_PATTERN = /-?\s*DSE\s*(\d+)\s*$/i;

const formatCardTitle = (row: any) => {
  const projetoId = row?.projeto?.ID ?? "-";
  const numero = row?.adicional?.NUMERO ?? "-";
  const nomeFantasia: string = row?.cliente?.NOMEFANTASIA ?? "-";

  const dseMatch = nomeFantasia.match(DSE_CODE_PATTERN);
  if (dseMatch) {
    const dseCode = dseMatch[1];
    const restName = nomeFantasia.slice(0, dseMatch.index).replace(/[\s-]+$/, "");
    return `DSE${dseCode}-${projetoId} ${restName}`;
  }

  return `${projetoId}.${numero} - ${nomeFantasia}`;
};

const OpportunityCard: React.FC<OpportunityCardProps> = ({
  row,
  styles,
  onClick,
  actions,
}) => {
  const seguidores: { NOME: string }[] = row?.seguidores ?? [];

  return (
    <Card
      elevation={3}
      sx={{
        ...styles,
        margin: "8px auto",
        boxShadow: 2,
        borderRadius: 2,
        overflow: "hidden",
        maxHeight: 300,
        minHeight: 300,
        fontSize: "0.8rem",
      }}
      style={styles}
      onClick={onClick}
    >
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          padding: "12px",
          fontSize: "0.8rem",
        }}
      >
        <Typography color="primary">
          {formatCardTitle(row)}
        </Typography>

        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: "100%", mt: 1.5 }}>
          {row?.data_planejada ? (
            <Chip
              size="small"
              icon={<AccessTimeIcon sx={{ fontSize: 14 }} />}
              label={formatDataPlanejada(row.data_planejada)}
              sx={{ height: 22, fontSize: 11 }}
            />
          ) : (
            <Box />
          )}

          {seguidores.length > 0 && (
            <Stack direction="row" sx={{ ml: "auto" }}>
              {seguidores.map((seguidor, index) => (
                <Tooltip key={seguidor.NOME + index} title={seguidor.NOME}>
                  <Avatar
                    sx={{
                      width: 24,
                      height: 24,
                      fontSize: 11,
                      bgcolor: getAvatarColor(seguidor.NOME),
                      border: "2px solid white",
                      marginLeft: index === 0 ? 0 : "-8px",
                    }}
                  >
                    {getInitials(seguidor.NOME)}
                  </Avatar>
                </Tooltip>
              ))}
            </Stack>
          )}
        </Stack>
      </CardContent>
      {actions && <CardActions>{actions}</CardActions>}
    </Card>
  );
};

export default OpportunityCard;
