import React, { useCallback, useEffect, useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import { useSelector } from "react-redux";
import UpperNavigation from "../../components/shared/UpperNavigation";
import { useNavigate } from "react-router-dom";
import OpportunityTableComponent from "../../components/oportunidades/OpportunityTableComponent";
import OpportunityKanbanComponent from "../../components/oportunidades/OpportunityKanbanComponent";
import CrmConfigList from "../../components/oportunidades/CrmConfigList";
import { RootState } from "../../redux/store";

const OpportunityListPage = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user.user);

  const [activeTab, setActiveTab] = useState(0);

  const podeConfigurar = user?.PERM_CRM === 1 || user?.PERM_ADMINISTRADOR === 1;

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100%",
      }}
    >
      <UpperNavigation handleBack={() => navigate("/")}/>

      <Box
        sx={{
          height: "calc(100% - 50px)",
          display: "flex",
          flexDirection: "column",
        }}
      >

        <Box sx={{ borderBottom: 1, borderColor: "divider", backgroundColor: "white" }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              minHeight: 36,
              "& .MuiTab-root": {
                minHeight: 36,
                fontSize: 12,
                textTransform: "none",
                fontWeight: "bold",
              },
            }}
          >
            <Tab label="Tabela" />
            <Tab label="Kanban" />
            {podeConfigurar && <Tab label="Config" />}
          </Tabs>
        </Box>

        {activeTab === 0 && <OpportunityTableComponent />}
        {activeTab === 1 && <OpportunityKanbanComponent />}
        {activeTab === 2 && podeConfigurar && <CrmConfigList />}
      </Box>
    </Box>

  );
};

export default OpportunityListPage;
