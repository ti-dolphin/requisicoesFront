/* eslint-disable no-irregular-whitespace */
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
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
    name: "Controle de Patrimônios",
    Info: `Gerenciar a localização;
            Responsável pela guarda;
            Registro de movimentações (Obra, sede e manutenção/calibração).
            Controle dos acessórios (Cabos, bateria reserva)`,
    path: "/patrimony",
  },
 
  {
    image:
      "https://firebasestorage.googleapis.com/v0/b/dolphin-8f800.appspot.com/o/Wavy_Bus-17_Single-07.jpg?alt=media&token=0414fe18-af22-4d9b-a669-90153972fa9b",
      name: 'CRM',
      Info: 'Gerenciamneto e acompanhamento de Projetos',
      path: '/crm'
  },
];
import ProfileButton from "../../components/ProfileButton";

const Home = () => {
  const navigate = useNavigate();
  const { logedIn, user } = useContext(userContext);
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
          <ProfileButton />
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
                key={index}
                sx={{
                  width: 300,
                  height: "500px",
                  borderRadius: "30px",
                  boxShadow: "none",
                }}
              >
                <CardActionArea
                  onClick={() => handleNavigateToModule(module.path)}
                >
                  <CardMedia
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
