/* eslint-disable no-irregular-whitespace */
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import logoUrl from "../../Requisitions/assets/logodolphin.jpg";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import { userContext } from "../../Requisitions/context/userContext";
const modules = [
  {
    image:
      "https://firebasestorage.googleapis.com/v0/b/dolphin-8f800.appspot.com/o/_69f4380e-7447-4651-93ee-1d1529dd5c78.jpeg?alt=media&token=c3f35b95-f67b-47a9-901f-f6f16fedfe04",
    name: "Requisições",
    Info: "Realize solicitações de materiais aplicados no projeto, materiais de consumo, EPI's, equipamentos do operacional ou TI, ferramentas e serviços.",
    path: "/requisitions",
  },
  {
    image:
      "https://firebasestorage.googleapis.com/v0/b/dolphin-8f800.appspot.com/o/_6d46fa5a-0284-43eb-a5fb-bdc796ada67a.jpeg?alt=media&token=e1450447-7f7f-4610-87a7-f13b674a852d",
    name: "Controle de Patrimônios  (Em desenvolvimento)",
    Info: `Gerenciar a localização;
            Responsável pela guarda;
            Registro de movimentações (Obra, sede e manutenção/calibração).
            Controle dos acessórios (Cabos, bateria reserva)`,
    path: "/patrimony",
  },
  {
    image:
      "https://firebasestorage.googleapis.com/v0/b/dolphin-8f800.appspot.com/o/_9a5059cb-cba2-4295-a84b-ef43505868e1.jpeg?alt=media&token=82691098-8e4c-4384-8a5b-569e00f00273",
    name: "Banco de Currículos (Em desenvolvimento)",
    Info: `Cadastro de currículos recebidos;
            Triagem de currículos
            Controle de possíveis contratações para o futuro;
            Controle de indicações.
            Acesso ilimitado aos gerentes/coordenadores para consultas (Exemplo prospectar currículo adequado para uma vaga específica para setor de orçamentos, projetos ou alguma vaga na obra)`,
    path: "/home",
  },
];
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { Dropdown } from "@mui/base/Dropdown";
import { Menu } from "@mui/base/Menu";
import { MenuButton as BaseMenuButton } from "@mui/base/MenuButton";

const Home = () => {
  const navigate = useNavigate();
  const { logedIn, user, toggleLogedIn } = useContext(userContext);
  useEffect(() => {
    console.log("user: ", user);
    if (!logedIn) {
      navigate("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logedIn]);
  const handleNavigateToModule = (path: string) => {
    navigate(path);
  };
  const handleLogOut = () => {
    window.localStorage.removeItem("user");
    window.localStorage.removeItem("token");
    toggleLogedIn(false);
  };
  return (
    <Box
      sx={{
        backgroundRepeat: "no-repeat",
        backgroundSize: "contain",
        backgroundPosition: "center",
        width: "100%",
        height: "95vh",
      }}
    >
      <Box
 
        sx={{
          background: `url('${logoUrl}')`,
          backgroundPosition: "left",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "10%",
        }}
      >
        <IconButton sx={{ position: "absolute", right: "4rem" }}>
          <Dropdown>
            <BaseMenuButton>
              {" "}
              <AccountCircleIcon sx={{ color: "#F7941E" }} />
            </BaseMenuButton>
            <Menu>
              <Button onClick={() => handleLogOut()}>Log out</Button>
            </Menu>
          </Dropdown>
        </IconButton>
      </Box>

      <Box
        sx={{
          height: "100%",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "start",
          gap: "2rem",
          alignItems: "center",
        }}
      >
        {" "}
        <Typography
          sx={{
            textAlign: "center",
            fontWeight: "600",
            color: "#2B3990",
            fontSize: "2rem",
          }}
        >
          Bem Vindo ao Dolphin Controle
        </Typography>
        <Stack
          width="100%"

          direction="row"
          justifyContent="center"
          alignItems="center"
          gap={6}
          flexWrap="wrap"
          className="space-y-2"
        >
          {modules.map(
            (
              module,
              index //box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;
            ) => (
              <Card
                sx={{
                  width: 300,
                  height: "500px",
                  borderRadius: "30px",
                  boxShadow: 'none'
                }}
              >
                <CardActionArea
                  onClick={() => handleNavigateToModule(module.path)}
                >
                  <CardMedia
                    sx={{
                      filter: index > 0 ? "grayscale(100%)" : "none",
                    }}
                    component="img"
                    image={module.image}
                    alt="green iguana"
                  />
                  <CardContent
                    style={{
                      backgroundColor: "white",
                      transform: "translateY(-100px)",
                    }}
                  >
                    <Typography gutterBottom variant="h5" component="div">
                      {module.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {module.Info}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            )
          )}
        </Stack>
      </Box>
    </Box>
  );
};

export default Home;
