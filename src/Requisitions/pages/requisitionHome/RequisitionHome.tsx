import RequisitionTable from "../../components/tables/RequisitionTable";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import { IconButton, Typography } from "@mui/material";
import Stack from "@mui/material/Stack";
import logoUrl from "../../assets/logodolphin.jpg";
import { useContext, useEffect } from "react";
import { userContext } from "../../context/userContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@mui/x-date-pickers/icons";
const RequisitionHome = () => {
  const { logedIn } = useContext(userContext);
  const navigate = useNavigate();
  useEffect(() => {
    if (!logedIn) navigate("/");
  });
  const handleNavigateHome = () => {
    navigate("/home");
  };
  return (
    <>
      <Card
        variant="outlined"
        sx={{ maxWidth: "96vw", padding: "0.5rem", marginX: "auto" }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Stack spacing={2} direction="row" alignItems="center">
            <IconButton onClick={() => navigate("/home")}>
              <ArrowLeftIcon />
            </IconButton>
            <img
              style={{ cursor: "pointer" }}
              onClick={() => handleNavigateHome()}
              src={logoUrl}
              alt="logo Dolphin"
              width={"140px"}
            />
            <Typography
              variant="h6"
              sx={{
                display: {
                  xs: "none",
                  sm: "block",
                },
                color: "#2B3990",
              }}
            >
              Requisições de materiais e serviços
            </Typography>
          </Stack>
        </Box>

        <Divider />
        <RequisitionTable />
      </Card>
    </>
  );
};

export default RequisitionHome;
