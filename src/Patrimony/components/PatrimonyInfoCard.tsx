import { Card, CardContent, Typography, Stack, Button, Box } from "@mui/material";
import { ListChildComponentProps } from "react-window";
import { PatrimonyInfo } from "../types";
import { BaseButtonStyles, buttonStylesMobile } from "../../utilStyles";

interface PatrimonyInfoCardProps {
  props: ListChildComponentProps;
  filteredRows: PatrimonyInfo[];
}

const cardColumns = [
  { label: "Valor de Compra", dataKey: "valor_compra" },
  { label: "Responsável", dataKey: "responsavel" },
  { label: "Gerente", dataKey: "gerente" },
  { label: "Projeto", dataKey: "projeto" },
];
const PatrimonyInfoCard = ({ props, filteredRows }: PatrimonyInfoCardProps) => {
  console.log('renderizou card');
  const { index, style } = props;
  if (!filteredRows) return null;
  const row = filteredRows[index];
  return (
    <Card
      style={{ ...style, boxShadow: 'none', display: 'flex', flexShrink: 1,  paddingBottom: '5px', paddingLeft: '5px', paddingRight: '5px', paddingTop: '5px'}}
      key={index}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "start",
          gap: 1,
          padding: 1,
          justifyContent: "center",
     
          borderRadius: '16px',
        }}
        className=" shadow-sm shadow-gray-600"
      >
        <Typography variant="h6" color="textPrimary" gutterBottom>
          {row.id_patrimonio} - {row.nome}
        </Typography>

        <Typography variant="body2" color="textSecondary">
          <strong>Valor de Compra:</strong> R$ {row.valor_compra}
        </Typography>

        {
           cardColumns.map((column) => (
            <Typography variant="body2" color="textSecondary">
              <strong>{column.label}:</strong>{" "}
              {row[column.dataKey as keyof PatrimonyInfo] || "N/A"}
            </Typography>
          ))}

        <Stack
          direction="row"
          spacing={1}
          justifyContent="flex-end"
          marginTop={2}
        >
          <Button sx={{ ...BaseButtonStyles }}>Detalhes</Button>
        </Stack>
      </Box>
    </Card>
  );
};
export default PatrimonyInfoCard;
