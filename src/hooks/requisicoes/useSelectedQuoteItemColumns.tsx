import { Box, Typography } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import {
  calculateQuoteSubtotal,
  formatCurrency2To3,
  formatQuantidade,
  getQuoteItemObservation,
} from "../../utils";

export const useSelectedQuoteItemColumns = (): GridColDef[] => {
  const columns: GridColDef[] = [
    {
      field: "produto_codigo",
      headerName: "Código",
      flex: 0.7,
      minWidth: 100,
      editable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Typography fontSize="12px" fontWeight="bold" color="text.secondary">
            {params.value || "-"}
          </Typography>
        </Box>
      ),
    },
    {
      field: "produto_descricao",
      headerName: "Descrição do Produto",
      flex: 2.6,
      minWidth: 200,
      editable: false,
      renderCell: (params) => {
        const observacao = getQuoteItemObservation(params.row);

        return (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 0.25,
              height: "100%",
              py: 0.5,
            }}
          >
            <Typography
              fontSize="12px"
              fontWeight="bold"
              color="black"
              sx={{ whiteSpace: "normal", lineHeight: 1.3 }}
            >
              {params.value || "-"}
            </Typography>
            {observacao && (
              <Typography
                fontSize="11px"
                fontStyle="italic"
                color="text.secondary"
                sx={{ whiteSpace: "normal", lineHeight: 1.3 }}
              >
                {observacao}
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      field: "produto_unidade",
      headerName: "Unidade",
      flex: 0.45,
      minWidth: 70,
      editable: false,
    },
    {
      field: "quantidade_solicitada",
      headerName: "Qtd. Solicitada",
      flex: 0.7,
      minWidth: 100,
      editable: false,
      type: "number",
      renderCell: (params) => formatQuantidade(params.value),
    },
    {
      field: "preco_unitario",
      headerName: "Preço Unitário",
      flex: 0.8,
      minWidth: 110,
      editable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Typography fontSize="12px">{formatCurrency2To3(Number(params.value))}</Typography>
        </Box>
      ),
    },
    {
      field: "ICMS",
      headerName: "ICMS %",
      flex: 0.45,
      minWidth: 70,
      editable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Typography fontSize="12px">{params.value}%</Typography>
        </Box>
      ),
    },
    {
      field: "IPI",
      headerName: "IPI %",
      flex: 0.45,
      minWidth: 65,
      editable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Typography fontSize="12px">{params.value}%</Typography>
        </Box>
      ),
    },
    {
      field: "ST",
      headerName: "ST %",
      flex: 0.45,
      minWidth: 65,
      editable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Typography fontSize="12px">{params.value}%</Typography>
        </Box>
      ),
    },
    {
      field: "subtotal",
      headerName: "Subtotal",
      flex: 0.85,
      minWidth: 110,
      editable: false,
      valueGetter: (_value, row) =>
        Number(row.preco_unitario || 0) * Number(row.quantidade_solicitada || 0),
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Typography fontSize="12px" fontWeight="bold" color="success.main">
            {formatCurrency2To3(Number(params.value))}
          </Typography>
        </Box>
      ),
    },
    {
      field: "total",
      headerName: "Total",
      flex: 0.85,
      minWidth: 110,
      editable: false,
      valueGetter: (_value, row) =>
        calculateQuoteSubtotal(
          Number(row.preco_unitario || 0),
          Number(row.quantidade_solicitada || 0),
          Number(row.IPI || 0),
          Number(row.ST || 0)
        ),
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Typography fontSize="12px" fontWeight="bold" color="success.main">
            {formatCurrency2To3(Number(params.value))}
          </Typography>
        </Box>
      ),
    },
  ];

  return columns;
};
