import React from "react";
import {
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
  Box,
} from "@mui/material";
import { Checklist } from "../../models/patrimonios/Checklist";
import { getDateStringFromISOstring } from "../../utils";

interface Props {
  checklist: Partial<Checklist>;
  styles?: any;
  openChecklistView: (checklist: Partial<Checklist>) => void;
}

const ChecklistCard = ({ checklist, styles, openChecklistView }: Props) => {
  return (
    <Card
      sx={{
        ...styles,
        margin: "8px auto",
        boxShadow: 2,
        borderRadius: 2,
        overflow: "hidden",
        maxHeight: 300,
        minHeight: 300,
        width: '100%',
        fontSize: "0.8rem",
      }}
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
        <Typography
          variant="subtitle1"
          component="div"
          gutterBottom
          sx={{ fontSize: "0.95rem", fontWeight: 600 }}
        >
          {checklist.patrimonio_nome || "Patrimônio não informado"}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          gutterBottom
          sx={{ fontSize: "0.8rem" }}
        >
          <strong>Responsável:</strong> {checklist.responsavel_nome || "-"}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          gutterBottom
          sx={{ fontSize: "0.8rem" }}
        >
          <strong>Realizado:</strong> {checklist.realizado ? "Sim" : "Não"}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          gutterBottom
          sx={{ fontSize: "0.8rem" }}
        >
          <strong>Aprovado:</strong> {checklist.aprovado ? "Sim" : "Não"}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          gutterBottom
          sx={{ fontSize: "0.8rem" }}
        >
          <strong>Data da Realização:</strong>{" "}
          {getDateStringFromISOstring(
            checklist.data_realizado || checklist.data_aprovado || ""
          ) || "-"}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          gutterBottom
          sx={{ fontSize: "0.8rem" }}
        >
          <strong>Data da Aprovação:</strong>{" "}
          {getDateStringFromISOstring(checklist.data_aprovado || "") || "-"}
        </Typography>
      </CardContent>
      <CardActions sx={{ padding: "8px" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            width: "100%",
          }}
        >
          <Button
            size="small"
            variant="contained"
            color="primary"
            sx={{ fontSize: "0.75rem", padding: "4px 12px" }}
            onClick={() => openChecklistView(checklist)}
          >
            Ver Detalhes
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
};

export default ChecklistCard;
