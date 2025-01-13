import { ptBR } from "@mui/x-date-pickers/locales";
import { ptBR as pickersPtBr } from "@mui/x-date-pickers/locales";
import { ptBR as corePtBr } from "@mui/material/locale";
import { createTheme } from "@mui/material";

export const theme = createTheme(
  {
    palette: {
      primary: { main: "#1976d2" },
    },
  },
  ptBR,
  pickersPtBr,
  corePtBr
);
