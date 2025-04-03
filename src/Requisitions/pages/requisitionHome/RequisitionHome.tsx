import RequisitionTable from "../../components/tables/RequisitionTable";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import { useContext, useEffect } from "react";
import { userContext } from "../../context/userContext";
import { useNavigate } from "react-router-dom";
const RequisitionHome = () => {
  const { logedIn } = useContext(userContext);
  const navigate = useNavigate();
  useEffect(() => {
    if (!logedIn) navigate("/");
  });

  return (
      <Box
        sx={{ width: "100%", height: '99vh'}}
      >
        <Divider />
        <RequisitionTable />
      </Box>
  
  );
};

export default RequisitionHome;
