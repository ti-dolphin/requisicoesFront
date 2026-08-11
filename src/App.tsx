import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import SnackBar from "./components/shared/SnackBar";
import MercadoLivreCallback from "./components/mercadoLivre/MercadoLivreCallback";
import { ptBR } from "@mui/material/locale";
import { green } from "@mui/material/colors";

const theme = createTheme(
  {
    palette: {
      primary: {
        main: "#2B3990",
        light: "#e4f1fe",
      },
      secondary: {
        main: "#F7941E",
        light: "#e4f1fe",
      },
      text: {
        primary: "#222831",
        secondary: "#606470",
      },
      background: {
        default: "#e7eaf6"
      },
      error: {
        main: "#d32f2f",
        dark: "#b71c1c",
      },
      success: {
        main: "#4caf50",
      },
    },
    typography: {
      fontFamily: "Roboto, sans-serif",
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            backgroundColor: "#2B3990", // ou theme.palette.primary.main
            color: "white",
            textTransform: "capitalize",
            borderRadius: 8,
            maxWidth: 200,
            display: "flex",
            alignItems: "center",
            gap: 8,
            // Para manter o background no hover:
            "&:hover": {
              backgroundColor: "#1e285c", // ajuste para um tom mais escuro do primary
            },
            "&.MuiButton-containedError": {
              backgroundColor: "#d32f2f",
              color: "white",
              textTransform: "capitalize",
              maxWidth: 200,
              display: "flex",
              alignItems: "center",
              gap: 1,
              "&:hover": {
                backgroundColor: "#b71c1c",
              },
            },
            "&.MuiButton-containedSuccess": {
              backgroundColor: green[500],
              color: "white",
              textTransform: "capitalize",
              maxWidth: 200,
              display: "flex",
              alignItems: "center",
              gap: 1,
              "&:hover": {
                backgroundColor: green[700],
              },
            },
          },
        },
      },
    },
  },
  ptBR
);

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Provider store={store}>
        <BrowserRouter>

          <SnackBar />
          <MercadoLivreCallback />
          <AppRoutes />
        </BrowserRouter>
      </Provider>
    </ThemeProvider>
  );
};

export default App;
