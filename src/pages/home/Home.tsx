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
    image: 'https://firebasestorage.googleapis.com/v0/b/dolphin-8f800.appspot.com/o/homeBg-worker.jpeg?alt=media&token=d94f7107-0108-40c7-98e7-7076f017f96b',
    name: "Dolphin Requisições",
    Info: "Faça aqui suas Requisições de Materiais/Serviços",
    path: '/requisitions'
  },

];
const Home = () => {
    const navigate = useNavigate();
    const { logedIn } = useContext(userContext);
    useEffect(( ) => { 
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
        border: "1px solid #e3e3e3",
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
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: "100%",
          height: "10%",
        }}
      >
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
      </Box>

      <Box
        sx={{
          height: "60%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Stack direction="row" spacing={4}>
          {modules.map((module) => (
            <Card sx={{ maxWidth: 345 }}>
              <CardActionArea onClick={() => handleNavigateToModule(module.path)}>
                <CardMedia
                  component="img"
                  height="140"
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
