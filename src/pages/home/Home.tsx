import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Stack,
  Typography,
} from "@mui/material";
import logoUrl from '../../assets/logodolphin.jpg';
import { useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import { userContext } from "../../context/userContext";
const modules = [
  {
    image:"https://firebasestorage.googleapis.com/v0/b/dolphin-8f800.appspot.com/o/homeBg-worker.jpeg?alt=media&token=cdbc7d30-2e57-44b7-b786-4e6685e6e83e",
    name: "Dolphin Requisições",
    Info: "Faça aqui suas Requisições de Materiais/Serviços",
    path: "/requisitions",
  },
];

const Home = () => {
    const navigate = useNavigate();
    const { logedIn, user } = useContext(userContext);
    useEffect(( ) => { 
      console.log('user: ', user);
        if(!logedIn){ 
            navigate('/');
        }
    });
    const handleNavigateToModule = (path : string ) => { 
        navigate(path);
    }
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
        className="shadow-sm"
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
      ></Box>

      <Box
        sx={{
          height: '100%',
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "start",
          gap: '2rem',
          alignItems: "center",
        }}
      >
        {" "}
        <Typography
          sx={{
            textAlign: "center",
            fontWeight: "600",
            color: "#1e549f",
            fontSize: "2rem",

          }}
        >
          Bem Vindo ao Dolphin Controle
        </Typography>
        <Stack width="100%" justifyContent="center" flexWrap="wrap"  direction="row" spacing={1}>
          {modules.map((module) => (
            <Card sx={{ maxWidth: 345,  }}>
              <CardActionArea
                onClick={() => handleNavigateToModule(module.path)}
              >
                <CardMedia
                  sx={{
                    minWidth: '315px',
                    maxHeight: "300px",
                  }}
                  component="img"
                  image={module.image}
                  alt="green iguana"
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {module.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {module.Info}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Stack>
      </Box>
    </Box>
  );
};

export default Home;
