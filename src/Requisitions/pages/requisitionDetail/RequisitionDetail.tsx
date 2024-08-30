import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import HorizontalLinearStepper from "./components/Stepper";
import {
  Alert,
  Autocomplete,
  AutocompleteChangeDetails,
  AutocompleteChangeReason,
  Badge,
  BadgeProps,
  IconButton,
  Stack,
  styled,
  TextField,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import SaveIcon from "@mui/icons-material/Save";
import {
  Item,
  Requisition,
  fetchAllProjects,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fetchItems,
  fetchPersonById,
  fetchRequsitionById,
  updateRequisition,
} from "../../utils";
// import { useLocation } from "react-router-dom";
import { useNavigate, useParams } from "react-router-dom";
import RequisitionItemsTable from "../../components/tables/RequisitionItemsTable";
import Loader from "../../components/Loader";
import { ProductsTableModal } from "../../components/modals/ProductsTableModal";
import OpenFileModal from "../../components/modals/OpenFileModal";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { RequisitionContext } from "../../context/RequisitionContext";
import { ItemsContext } from "../../context/ItemsContext";
import { useContext } from "react";
import { userContext } from "../../context/userContext";

const RequisitionDetail: React.FC = () => {
  const { id } = useParams();
  const [requisitionData, setRequisitionData] = useState<Requisition>();
  const [requisitionItems, setRequisitionItems] = useState<Item[]>([]);
  const [editionNotAllowedAlert, setEditionNotAllowedAlert] =
    useState<boolean>(false);
  const [projectAlteredSuccessAlert, setProjectAlteredSuccessAlert] =
    useState<boolean>(false);
  const [projectOptions, setProjectOptions] = useState<ProjectOption[]>([]);
  const {
    editingField,
    handleChangeEditingField,
    seteditingField,
    refreshRequisition,
    toggleRefreshRequisition,
  } = useContext(RequisitionContext);
  const { refreshItems, adding, toggleAdding } = useContext(ItemsContext);

  const { activeStep } = useContext(RequisitionContext);
  const { logedIn, user } = useContext(userContext);

  const navigate = useNavigate();

  const fetchRequisitionData = async () => {
    const data = await fetchRequsitionById(Number(id));
    if (data) {
      const personData = await fetchPersonById(data.ID_RESPONSAVEL);
      if (personData) {
        setRequisitionData({ ...data, ["RESPONSAVEL"]: personData?.NOME });
      }
    }
  };

  const fetchItemsData = async () => {
    const itemsData = await fetchItems(Number(id));
    if (itemsData) {
      setRequisitionItems(itemsData);
      return;
    }
    setRequisitionItems([]);
  };

  const renderProjectOptions = async () => {
    console.log("projectOptions");
    const projects = await fetchAllProjects();
    console.log("projects: ", projects);
    if (projects) {
      const projectsArray: { label: string; id: number }[] = [];
      projects.forEach((project) => {
        projectsArray.push({
          label: String(project.DESCRICAO),
          id: project.ID,
        });
      });
      console.log("projectOptions: ", projectsArray);
      setProjectOptions([...projectsArray]);
    }
  };
  const renderProjectDescription = () => {
    if (requisitionData && projectOptions) {
      return {
        label: requisitionData.DESCRICAO,
        id: requisitionData.ID_PROJETO,
      };
    }
  };

  useEffect(() => {
    if (!logedIn) navigate("/");
  });

  useEffect(() => {

    fetchRequisitionData();
    renderProjectOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshRequisition]);

  useEffect(() => {

    fetchItemsData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshItems, adding]);

  const handleOpen = (e: React.MouseEvent) => {

    if (activeStep && activeStep > 0 && !user?.PERM_COMPRADOR) {
      displayAlert();
      return;
    }
    
    e.preventDefault();
    toggleAdding();
  };

  const displayAlert = (content?: string) => {
    if (content === "Projeto Alterado!") {
      setTimeout(() => {
        setProjectAlteredSuccessAlert(false);
      }, 3 * 1000);
      setProjectAlteredSuccessAlert(true);
    } else {
      setTimeout(() => {
        setEditionNotAllowedAlert(false);
      }, 3 * 1000);
      setEditionNotAllowedAlert(true);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { value, id } = e.target;
    console.log({
      ...requisitionData,
      [id]: value,
    });
      if(requisitionData){ 
          setRequisitionData({
            ...requisitionData,
            [id]: value,
    });
  }
     
  };

  const handleSave = async () => {
    if (user) {
      seteditingField({ ...editingField, isEditing: false });
      requisitionData &&
        (await updateRequisition(user.CODPESSOA, requisitionData));
      toggleRefreshRequisition();
    }
  };

  const fields = [
    { label: "Descrição", key: "DESCRIPTION" },
    { label: "Responsável", key: "RESPONSAVEL" },
    { label: "Projeto", key: "DESCRICAO" },
    { label: "Observação", key: "OBSERVACAO" },
    { label: "Ultima atualização", key: "LAST_UPDATE_ON" },
    { label: "Data de Criação", key: "CREATED_ON" },
  ];

  const StyledBadge = styled(Badge)<BadgeProps>(({ theme }) => ({
    "& .MuiBadge-badge": {
      ...theme,
    },
  }));

  const dateRenderer = (value?: string | number) => {
    if (typeof value === "string") {
      const date = value.substring(0, 10).replace(/-/g, "/");
      const time = value.substring(11, 19);
      let formatted = `${date}, ${time}`;
      const localeDate = new Date(formatted).toLocaleDateString();
      formatted = `${localeDate}, ${time}`;
      return formatted;
    }
  };

  const valueRenderer = (item: { label: string; key: string }) => {
    if (requisitionData) {
      const currentFieldValue = requisitionData[item.key as keyof Requisition];
      if (item.key === "LAST_UPDATE_ON" || item.key === "CREATED_ON") {
        return dateRenderer(currentFieldValue);
      } else {
        return currentFieldValue !== "null" ? currentFieldValue : "";
      }
    }
  };

  const handleNavigateHome = () => {
    navigate("/requisitions");
  };
  interface ProjectOption {
    label: string;
    id: number;
  }

  const handleSelectProject = async (
    event: React.SyntheticEvent<Element, Event>,
    value: ProjectOption | null,
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails<ProjectOption> | undefined
  ) => {
    console.log("Selecionado:", value, reason, details, event);
    if (activeStep === 0) {
      if (value && requisitionData && user) {
        console.log("updated: ", {
          ...requisitionData,
          ID_PROJETO: Number(value.id),
        });
        await updateRequisition(user.CODPESSOA, {
          ...requisitionData,
          ID_PROJETO: Number(value.id),
        });
        toggleRefreshRequisition();
        displayAlert("Projeto Alterado!");
      }
    } else {
      displayAlert();
      toggleRefreshRequisition();
    }
  };
  const isFieldEnabled =(item : {label : string, key : string}) =>{ 
    return !editingField.isEditing || item.key === "RESPONSAVEL";
  };
  return (
    <Box
      sx={{
        width: "100%",
        border: "1px solid #d3d6db",
        height: "100%",
        backgroundColor: "white",
        margin: "auto",
      }}
    >
      {editionNotAllowedAlert && (
        <Alert
          variant="filled"
          className="drop-shadow-lg"
          severity="warning"
          sx={{
            top: "10%",
            width: "400px",
            position: "absolute",
            left: "50%",
            marginLeft: "-200px",
          }}
        >
          Edição só é poossível quando Status é "Em edição"
        </Alert>
      )}
      {projectAlteredSuccessAlert && (
        <Alert
          variant="filled"
          className="drop-shadow-lg"
          severity="success"
          sx={{
            top: "10%",
            width: "400px",
            position: "absolute",
            left: "50%",
            marginLeft: "-200px",
          }}
        >
          Projeto Alterado!
        </Alert>
      )}
      <Box sx={{ padding: "1rem", display: "flex", alignItems: "center" }}>
        <IconButton onClick={() => handleNavigateHome()}>
          <ArrowCircleLeftIcon />
        </IconButton>
        <Typography
          sx={{
            fontSize: {
              xs: "12px",
              md: "16px",
            },
          }}
        >
          Nº {requisitionData?.ID_REQUISICAO} | {requisitionData?.DESCRIPTION} |
          Projeto {requisitionData?.DESCRICAO}
        </Typography>
      </Box>

      <Box sx={{ padding: "0.5rem" }}>
        {requisitionData && (
          <HorizontalLinearStepper
            requisitionData={requisitionData}
            setRequisitionData={setRequisitionData}
          />
        )}
      </Box>

      <Box sx={{ border: "1px solid #e3e3e3" }}>
        <Stack
          sx={{ paddingX: "2rem", flexWrap: "wrap" }}
          direction="row"
          justifyContent="end"
        >
          <IconButton
            sx={{
              border: "none",
              height: "30px",
              borderRadius: "0px",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
            onClick={handleOpen}
          >
            <Typography sx={{ textDecoration: "underline", color: "#2B3990" }}>
              Materiais/ Serviços
            </Typography>

            <StyledBadge
              badgeContent={requisitionItems.length}
              color="secondary"
            >
              <AssignmentIcon />
            </StyledBadge>
          </IconButton>
          <OpenFileModal
            currentStatus={requisitionData?.STATUS}
            ID_REQUISICAO={Number(id)}
          />
        </Stack>
      </Box>

      <Stack
        direction="row"
        sx={{
          flexWrap: "wrap",
          height: {
            xs: "1080px",
            sm: "800px",
            lg: "600px",
          },
        }}
      >
        <Box
          sx={{
            padding: "0.5rem",
            maxHeight: "60vh",
            overflowY: "auto",
            width: {
              xs: "100%",
              md: "50%",
              lg: "25%",
            },
            display: "flex",
            justifyContent: "space-around",
            alignItems: "flex-start",
          }}
        >
          <Stack
            direction="column"
            alignItems="center"
            spacing={2}
            sx={{ width: "100%", padding: "1rem" }}
          >
            <Typography>Detalhes</Typography>
            {requisitionData ? (
              fields.map((item) => (
                <Stack sx={{ width: "100%" }} direction="column" spacing={0.5}>
                  {item.key !== "DESCRICAO" && <label>{item.label}</label>}
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    key={item.key}
                    sx={
                      editingField.isEditing &&
                      editingField.field.key === item.key
                        ? {
                            padding: "4px",
                            borderRadius: "4px",
                          }
                        : {
                            padding: "4px",
                            borderRadius: "4px",
                          }
                    }
                  >
                    {item.key === "DESCRICAO" ? (
                      <>
                        <Autocomplete
                          disablePortal
                          id="selectProject"
                          options={projectOptions}
                          getOptionLabel={(option) => option.label}
                          onChange={handleSelectProject}
                          value={renderProjectDescription()}
                          sx={{ width: "100%", outline: "none" }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              sx={{ fontSize: "12px" }}
                              label="Projeto"
                            />
                          )}
                        />
                        {editingField.isEditing &&
                          editingField.field.key === item.key && (
                            <button onClick={handleSave}>
                              <SaveIcon
                                sx={{ color: "#2B3990" }}
                                className="hover:text-blue-400"
                                color="primary"
                              />
                            </button>
                          )}
                      </>
                    ) : (
                      <>
                        <TextField
                          id={item.key}
                          multiline
                          style={{
                            minHeight:
                              item.key === "OBSERVACAO" ? "6rem" : "2rem",
                          }}
                          className="w-full bg-white text-sm lowercase  focus:outline-none"
                          disabled={isFieldEnabled(item)}
                          value={valueRenderer(item)}
                          onChange={handleChange}
                          autoFocus={editingField.isEditing}
                        />
                        {(item.key === "DESCRIPTION" ||
                          item.key === "OBSERVACAO") && (
                          <button
                            onClick={() => {
                              activeStep
                                ? displayAlert()
                                : handleChangeEditingField(item);
                            }}
                          >
                            <EditIcon
                              sx={{ color: "#2B3990" }}
                              className="cursor-pointer hover:text-blue-400"
                            />
                          </button>
                        )}
                        {editingField.isEditing &&
                          editingField.field.key === item.key && (
                            <button onClick={handleSave}>
                              <SaveIcon
                                sx={{ color: "#2B3990" }}
                                className="hover:text-blue-400"
                                color="primary"
                              />
                            </button>
                          )}
                      </>
                    )}
                  </Stack>
                </Stack>
              ))
            ) : (
              <Loader />
            )}
          </Stack>
          {requisitionData && (
            <ProductsTableModal
              info={`Nº ${requisitionData?.ID_REQUISICAO} | ${requisitionData?.DESCRIPTION} | Projeto ${requisitionData?.DESCRICAO}`}
              requisitionID={requisitionData.ID_REQUISICAO}
            />
          )}
        </Box>{" "}
        <Box
          sx={{
            width: {
              xs: "100%",
              md: "50%",
              lg: "75%",
            },
            height: {
              lg: "100%",
            },
            border: "0.5px solid #e3e3e3 ",
            overflowY: "auto",
            display: "flex",
            justifyContent: "center",
          }}
        >
          {
            <RequisitionItemsTable
              items={requisitionItems}
              currentStatus={requisitionData?.STATUS}
            />
          }
        </Box>
      </Stack>
    </Box>
  );
};

export default RequisitionDetail;
