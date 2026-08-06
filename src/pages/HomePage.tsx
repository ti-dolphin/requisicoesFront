import { Box, Grid, IconButton, Menu, MenuItem, Typography, Stack } from '@mui/material'
import React from 'react'
import crm from '../assets/images/crm.jpg'
import patrimonios from '../assets/images/patrimonios.jpg';
import requisicoes from '../assets/images/requisicoes.jpg';
import apontamentos from '../assets/images/apontamentos.png';
import ordemCompra from '../assets/images/capa-ordem-de-compra.png';
import { useNavigate } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useSelector } from 'react-redux';

type HomeModule = {
  name: string;
  path: string;
  description: string;
  image?: string;
  icon?: React.ReactNode;
  adminOnly?: boolean;
};

const modules: HomeModule[] = [
  {
    name: "Requisições",
    image: requisicoes,
    path: "/requisicoes",
    description:
      "Realize solicitações de materiais aplicados no projeto, materiais de consumo, EPI's, equipamentos do operacional ou TI, ferramentas e serviços.",
  },
  {
    name: "Controle de Patrimônios",
    image: patrimonios,
    path: "/patrimonios",
    description:
      "Gerenciar a localização; Responsável pela guarda; Registro de movimentações (Obra, sede e manutenção/calibração). Controle dos acessórios (Cabos, bateria reserva)",
  },
  {
    name: "CRM",
    image: crm,
    path: "/oportunidades",
    description: "Gerenciamento e acompanhamento de Projetos",
  },
  {
    name: "Gestão de Pessoas",
    image: apontamentos,
    path: "/apontamentos",
    description:
      "Controle de contratos de experiência, férias, apontamentos e folgas.",
  },
  // {
  //   name: "Ordem de Compra",
  //   image: ordemCompra,
  //   path: "/ordens-compra",
  //   description:
  //     "Consulta e acompanhamento de ordens de compra com filtros e paginação.",
  // },
  {
    name: "Gestão Adm",
    path: "/gestao-adm",
    description:
      "Cadastro e gerenciamento de usuários e permissões do sistema.",
    icon: <AdminPanelSettingsIcon sx={{ fontSize: 96, color: "white" }} />,
    adminOnly: true,
  },
]

const HomePage = () => {

  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const user = useSelector((state: any) => state.user.user);
  const isAdmin = user ? user.PERM_ADMINISTRADOR === 1 : false;

  React.useEffect(() => {
    if (!user) {
      navigate('/auth', { replace: true });
    }
  }, [user, navigate]);

  const formatUserName = (name: string | undefined): string => {
    if (!name) return 'Usuário';
    return name
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 4,
        minHeight: "100vh",
        bgcolor: "#fff",
      }}
    >

      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{
          position: "absolute",
          right: 16,
          top: 16,
        }}
      >
        <Typography
          variant="body1"
          color="primary.main"
          fontWeight={500}
          sx={{
            display: { xs: 'none', sm: 'block' }
          }}
        >
          {formatUserName(user?.NOME)}
        </Typography>
        <IconButton
          aria-label="more"
          aria-controls="long-menu"
          aria-haspopup="true"
          onClick={handleClick}
          sx={{
            color: "primary.main",
          }}
        >
          <AccountCircleIcon />
        </IconButton>
      </Stack>
      <Menu
        id="long-menu"
        MenuListProps={{
          "aria-labelledby": "long-button",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: 48 * 4.5,
            width: "20ch",
          },
        }}
      >
        <MenuItem onClick={() => { handleClose(); navigate('/perfil'); }}>
          Perfil
        </MenuItem>
        <MenuItem onClick={( ) => navigate('/auth')}>
          Logout
        </MenuItem>
        {/* Ocultado temporariamente — Painel Admin
        {isAdmin && (
          <MenuItem onClick={( ) => navigate('/admin')}>
            painel admin
          </MenuItem>
        )}
        */}
      </Menu>
      <Typography
        variant="h4"
        color="primary"
        gutterBottom
        textAlign="center"
        fontWeight={600}
      >
        Bem Vindo ao Dolphin Controle
      </Typography>
      <Grid
        container
        spacing={4}
        justifyContent="center"
        alignItems="flex-start"
        sx={{
          width: {
            xs: "100%",
            sm: "100%",
            md: "90%",
          },
          mt: 2,
        }}
      >
        {modules
          .filter((module) => !module.adminOnly || isAdmin)
          .map((module) => (
          <Grid
            item
            xs={6}
            sm={6}
            md={3}
            key={module.name}
            sx={{ height: { xs: "auto", md: 600 } }}
          >
            <Box
              onClick={() => navigate(module.path)}
              sx={{
                p: 0,
                borderRadius: 4,
                textAlign: "left",
                bgcolor: "#fff",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                transition: "box-shadow 0.3s, transform 0.3s",
                cursor: "pointer",
                "&:hover": {
                  boxShadow: 8,
                  transform: "translateY(-6px) scale(1.03)",
                },
              }}
            >
              {module.image ? (
                <Box
                  component="img"
                  src={module.image}
                  alt={module.name}
                  sx={{
                    height: { xs: 120, md: 220 },
                    width: "100%",
                    objectFit: "cover",
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    mb: { xs: 1, md: 2 },
                  }}
                />
              ) : (
                <Box
                  sx={{
                    height: { xs: 120, md: 220 },
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(135deg, #2B3990, #1e285c)",
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    mb: { xs: 1, md: 2 },
                  }}
                >
                  {module.icon}
                </Box>
              )}
              <Box sx={{ px: { xs: 1.5, md: 3 }, pb: { xs: 2, md: 3 }, width: "100%" }}>
                <Typography
                  fontSize={{ xs: "1rem", md: "1.25rem" }}
                  textAlign="center"
                  color="#222831"
                  mb={{ xs: 0, md: 1 }}
                >
                  {module.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ display: { xs: "none", md: "block" } }}
                >
                  {module.description}
                </Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default HomePage