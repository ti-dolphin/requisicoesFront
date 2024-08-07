import RequisitionTable from "../../components/tables/RequisitionTable";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import { Typography } from "@mui/material";
import Stack from "@mui/material/Stack";
import AddRequisitionModal from "../../components/modals/AddRequisitionModal";
import logoUrl from "../../assets/logodolphin.jpg";
import { useContext, useEffect } from "react";
import { userContext } from "../../context/userContext";
import { useNavigate } from "react-router-dom";
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
                color: "#34495e",
              }}
            >
              Requisições de materiais e serviços
            </Typography>
          </Stack>
          <AddRequisitionModal />
        </Box>

        <Divider />
        <RequisitionTable />
      </Card>
    </>
  );
};

export default RequisitionHome;
