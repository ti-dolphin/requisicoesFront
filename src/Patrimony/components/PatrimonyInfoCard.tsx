import { Card, Typography, Stack, Button, Box } from "@mui/material";
import { ListChildComponentProps } from "react-window";
import { PatrimonyInfo } from "../types";
import { BaseButtonStyles } from "../../utilStyles";
import { useNavigate } from "react-router-dom";

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

  console.log("renderizou card");
  const { index, style } = props;
  const navigate = useNavigate();
  const row = filteredRows[index];
  const handleOpenPatrimonyDetails = (patrimonyId : number) =>  {
    navigate(`/patrimony/details/${patrimonyId}`);
  };  
  return (
    <>
      {filteredRows && (
        <Card
          style={{
            ...style,
            boxShadow: "none",
            display: "flex",
            flexShrink: 1,
            paddingBottom: "5px",
            paddingLeft: "5px",
            paddingRight: "5px",
            paddingTop: "5px",
          }}
          key={index}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "start",
              gap: 0.8,
              padding: 1,
              justifyContent: "center",
              borderRadius: "16px",
            }}
            className=" shadow-sm shadow-gray-600"
          >
            <Typography color="textPrimary" fontWeight="bold" gutterBottom>
              {row.id_patrimonio} - {row.nome}
            </Typography>

            {cardColumns.map((column) => (
              <Typography
                key={column.dataKey}
                variant="body2"
                fontSize="small"
                color="textSecondary"
              >
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
              <Button
                onClick={() => handleOpenPatrimonyDetails(row.id_patrimonio)}
                sx={{ ...BaseButtonStyles }}
              >
                Detalhes
              </Button>
            </Stack>
          </Box>
        </Card>
      )}
    </>
  );
};
export default PatrimonyInfoCard;
