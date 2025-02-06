import { Box, Typography } from "@mui/material";
import { PatrimonyInfo } from "../../types";


interface PatrimonyInfoTableFooterProps {
  filteredRows: PatrimonyInfo[];

}
const PatrimonyInfoTableFooter = ({
  filteredRows,
}: PatrimonyInfoTableFooterProps) => {
  if (!filteredRows || filteredRows.length === 0) return null;

  const totalValue = filteredRows.reduce(
    (total, row) => total + Number(row.valor_compra || 0),
    0
  );

  return (
    <Box
      display="flex"
      justifyContent="flex-end"
      paddingY={2}
      paddingX="2rem"
      gap={4}
    >
      <Typography
        variant="body2"
        color="blue"
        fontWeight="semibold"
        fontFamily="Roboto"
      >
        {`Total: ${new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(totalValue)}`}
      </Typography>
      <Typography
        variant="body2"
        color="blue"
        fontWeight="semibold"
        fontFamily="Roboto"
      >
        {`${filteredRows.length} Itens encontrados`}
      </Typography>
    </Box>
  );
};

export default PatrimonyInfoTableFooter;
