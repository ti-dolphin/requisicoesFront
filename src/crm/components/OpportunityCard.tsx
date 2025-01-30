import { Card, Box, Typography, Stack, Button } from "@mui/material";
import { OpportunityInfo } from "../types";
import { BaseButtonStyles, basicCardContentStyles, basicCardStyles } from "../../utilStyles";
import { useContext } from "react";
import { OpportunityInfoContext } from "../context/OpportunityInfoContext";

interface OpportunityCardProps {
  row: OpportunityInfo;
  gridCardColumns: { headerName: string; field: keyof OpportunityInfo }[];
  style?: React.CSSProperties;
}


const OpportunityCard: React.FC<OpportunityCardProps> = ({
  row,
  gridCardColumns,
  style,
}) => {
  // console.log("OpportunityCard()");
  const { setCurrentOppIdSelected } = useContext(OpportunityInfoContext);

  const handleSelectOpportunty = (row: OpportunityInfo) => {
    console.log("handleSelectOpportunty");
    setCurrentOppIdSelected(row.numeroOs);
  };

  return (
    <Card sx={{ ...style, ...basicCardStyles }}>
      <Box
        sx={{
          ...basicCardContentStyles,
          width: "100%",
          height: "90%",
        }}
        className="border border-slate-200"
      >
        <Typography
          textAlign="center"
          sx={{ fontWeight: "bold", marginBottom: 1 }}
        >
          {row.nomeDescricaoProposta}
        </Typography>

        {gridCardColumns.map((column, index) => (
          <Stack key={index} gap={1} direction="row" alignItems="start">
            <Typography
              color="textPrimary"
              sx={{ fontSize: "small", fontWeight: "bold" }}
            >
              {column.headerName}:
            </Typography>
            <Typography
              color={column.field === "valorTotal" ? "green" : "textPrimary"}
              sx={{ fontSize: "small" }}
            >
              {row[column.field] as string}
            </Typography>
          </Stack>
        ))}
        <Button onClick={() => handleSelectOpportunty(row)} sx={BaseButtonStyles}>
          Detalhes
        </Button>
      </Box>
    </Card>
  );
};

OpportunityCard.displayName = "OpportunityCard";

export default OpportunityCard;
