/* eslint-disable @typescript-eslint/no-unused-vars */
import { useContext, useEffect, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Card,
  CardContent,
  CardMedia,
  Stack,
  Button,
  TextField,
} from "@mui/material";
import { checklistContext } from "../context/checklistContext";
import CloseIcon from "@mui/icons-material/Close";
import ErrorIcon from "@mui/icons-material/Error";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import {
  createChecklistItem,
  getChecklistItemsMapByPatrimonyID,
  sendChecklist,
  sendChecklistItems,
  uploadFileToChecklistItemFile,
} from "../utils";
import {
  ChecklistItem,
  ChecklistItemFile,
  MovementationChecklist,
} from "../types";
import CameraFileLogo from "../../../dist/assets/cameraFileLogo-Chy76Qi9.png";
import { userContext } from "../../Requisitions/context/userContext";

const style = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  height: "90%",
  width: {
    xs: "94%",
    md: "60%",
    lg: "40%",
    xl: "80%",
  },
  bgcolor: "background.paper",
  boxShadow: 24,
  p: {
    xs: 0,
    md: 3,
    lg: 4,
    xl: 5,
  },
  borderRadius: "8px", // Bordas arredondadas para um visual mais clean
  outline: "none", // Remover as bordas do modal
};

const ChecklistItemsModal = () => {
  const {
    checklistOpen,
    toggleChecklistOpen,
    setChecklistOpen,
    refreshChecklist,
    toggleRefreshChecklist,
  } = useContext(checklistContext);
  const { user } = useContext(userContext);
  // Estado do checklist
  const [checklistItemsMap, setChecklistItemsMap] = useState<
    {
      checklistItem: ChecklistItem;
      checklistItemFile: ChecklistItemFile;
    }[]
  >();
    const [isMobile, setIsMobile] = useState(false);


  const handleClose = () => {
    toggleChecklistOpen();
  };

  // Função para atualizar a imagem de um item específico
  const handleUploadImage = async (
    checkListMap: {
      checklistItem: ChecklistItem;
      checklistItemFile: ChecklistItemFile;
    },
    file: FormData
  ) => {
    if (checklistItemsMap) {
      if (checkListMap.checklistItemFile) {
        const updatedItems = updateChecklistItemToOkay(checkListMap);
          await sendChecklistItems(updatedItems);
          await uploadFileToChecklistItemFile(
          checkListMap.checklistItemFile.id_item_checklist_movimentacao,
          file
        );
        toggleRefreshChecklist();
        return;
      }
      //create checkListItemFile
      const newItemFile: ChecklistItemFile = {
        id_item_checklist_movimentacao: 0,
        arquivo: "",
        problema: 0,
        id_checklist_movimentacao:
          checklistOpen[1]?.id_checklist_movimentacao || 0,
        nome_item_checklist: checkListMap.checklistItem.nome_item_checklist,
      };
      const response = await createChecklistItem(newItemFile, file);
      if (response && response.status === 200) {
        toggleRefreshChecklist();
      }
      return;
    }
  };
  const updateChecklistItemToOkay = (checkListMap: {
    checklistItem: ChecklistItem;
    checklistItemFile: ChecklistItemFile;
  }) => {
    return checklistItemsMap?.map((itemMap) => {
      if (itemMap.checklistItemFile) {
        return itemMap.checklistItemFile.id_item_checklist_movimentacao ===
          checkListMap.checklistItemFile.id_item_checklist_movimentacao
          ? {
              ...itemMap,
              checklistItemFile: {
                ...itemMap.checklistItemFile,
                problema: 0,
              },
            }
          : itemMap;
      }
      return itemMap;
    }) || [];
  };

  // Função para lidar com a seleção de um novo arquivo de imagem
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    checklistMap: {
      checklistItem: ChecklistItem;
      checklistItemFile: ChecklistItemFile;
    }
  ) => {
    const file = e.target.files?.[0];
    if (isMovimentationResponsable() && file && toBeDone()) {
      const formData = new FormData();
      formData.append("file", file);

      handleUploadImage(checklistMap, formData); // Atualiza a imagem no estado
      return;
    }
    alert("Editar checklist não é permitido!");
  };

  const handleChangeProblem = (checklistMap: {
    checklistItem: ChecklistItem;
    checklistItemFile: ChecklistItemFile;
  }) => {
    if (checklistMap.checklistItemFile && checklistItemsMap) {
      const problem = checklistMap.checklistItemFile.problema;
      if (!problem && isTypeResponsable()) {
        const updatedItems = checklistItemsMap.map((itemMap) => {
          if (itemMap.checklistItemFile) {
            return itemMap.checklistItemFile.id_item_checklist_movimentacao ===
              checklistMap.checklistItemFile.id_item_checklist_movimentacao
              ? {
                  ...itemMap,
                  checklistItemFile: {
                    ...itemMap.checklistItemFile,
                    problema: 1,
                  },
                }
              : itemMap;
          }
          return itemMap;
        });
        setChecklistItemsMap(updatedItems);
      }
    }
  };

  const handleChangeOkay = (checklistMap: {
    checklistItem: ChecklistItem;
    checklistItemFile: ChecklistItemFile;
  }) => {
    if (checklistMap.checklistItemFile && checklistItemsMap) {
      console.log("handleChangeOkay");
      const problem = checklistMap.checklistItemFile.problema;
      console.log("problem: ", problem);
      if (problem) {
        const updatedItems = checklistItemsMap.map((itemMap) => {
          if (itemMap.checklistItemFile) {
            return itemMap.checklistItemFile.id_item_checklist_movimentacao ===
              checklistMap.checklistItemFile.id_item_checklist_movimentacao
              ? {
                  ...itemMap,
                  checklistItemFile: {
                    ...itemMap.checklistItemFile,
                    problema: 0,
                  },
                }
              : itemMap;
          }
          return itemMap;
        });
        console.log("updatedItems: ", updatedItems);
        setChecklistItemsMap(updatedItems);
      }
    }
  };

  const handleAproveChecklist = async () => {
    if (checklistOpen[1] && checklistItemsMap) {
      const currentChecklist = {
        ...checklistOpen[1],
      };
      const problemItem =
        checklistItemsMap &&
        checklistItemsMap.find(
          (checklistItemMap) =>
            checklistItemMap.checklistItemFile.problema === 1
        );
      if (problemItem) {
        alert(
          "Existem itens com problemas, todos devem estar Okay para aprovar!"
        );
        return;
      }
      const response = await sendChecklistItems(checklistItemsMap);
      if (response && response.status === 200) {
        currentChecklist.aprovado = 1;
        currentChecklist.data_aprovado = new Date().toISOString();
        const response = await sendChecklist(currentChecklist);
        if (response && response.status === 200) {
          toggleRefreshChecklist();
          alert("Checklist Aprovado!");
        }
      }
    }
  };

  const handleReproveChecklist = async () => {
    if (checklistOpen[1] && checklistItemsMap) {
      const response = await sendChecklistItems(checklistItemsMap);
      if (response && response.status === 200) {
        const currentChecklist = {
          ...checklistOpen[1],
        };
        currentChecklist.aprovado = 0;
        currentChecklist.realizado = 0;
        const response = await sendChecklist(currentChecklist);
        if (response && response.status === 200) {
          setChecklistOpen([true, currentChecklist]);
        }
        toggleRefreshChecklist();
        alert("Checklist Reprovado!");
      }
    }
  };

  const handleSendChecklistItems = async () => {
    if (checklistItemsMap) {
      const noFileItem = checklistItemsMap.find(
        (item) => item.checklistItemFile === undefined
      );
      if (noFileItem) {
        alert(
          "Você deve preencher todos os itens antes de enviar o checklist!"
        );
        return;
      }
      const response = await sendChecklistItems(checklistItemsMap);
      if (response && response.status === 200 && checklistOpen[1]) {
        const currentChecklist = { ...checklistOpen[1] };
        currentChecklist.realizado = 1;
        currentChecklist.data_realizado = new Date().toISOString();
        await sendCurrentChecklist(currentChecklist);
        toggleRefreshChecklist();
        alert("Checklist Enviado com sucesso!");
      }
    }
  };

  const sendCurrentChecklist = async (checklist: MovementationChecklist) => {
    const response = await sendChecklist(checklist);
    if (response && response.status === 200) {
      setChecklistOpen([
        true,
        {
          ...checklist,
        },
      ]);
    }
  };
  const handleChangeItemObservation = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    checklistMap: {
      checklistItem: ChecklistItem;
      checklistItemFile: ChecklistItemFile;
    }
  ) => {
    const { value } = e.target;
    const updatedChecklistMap = { ...checklistMap };
    updatedChecklistMap.checklistItemFile.observacao = value;
    const updatedChecklistItemsMap = checklistItemsMap?.filter(
      (checklistMap) => {
        if (
          checklistMap.checklistItemFile.id_item_checklist_movimentacao ===
          updatedChecklistMap.checklistItemFile.id_item_checklist_movimentacao
        ) {
          return { ...updatedChecklistMap };
        }
        return {
          ...checklistMap,
        };
      }
    );
    setChecklistItemsMap(updatedChecklistItemsMap);
  };

  const getChecklistItemsMap = async () => {
    console.log("getChecklistItemsMap");
    if (checklistOpen[1]) {
      const { id_patrimonio, id_movimentacao, id_checklist_movimentacao } =
        checklistOpen[1];
      const checklistItemsMap = await getChecklistItemsMapByPatrimonyID(
        id_patrimonio,
        id_movimentacao,
        id_checklist_movimentacao
      );
      if (checklistItemsMap) {
        console.log(checklistItemsMap);
        setChecklistItemsMap(checklistItemsMap);
        return;
      }
    }
  };

  const renderItemImage = (checklistMap: {
    checklistItem: ChecklistItem;
    checklistItemFile: ChecklistItemFile;
  }) => {
    if (checklistMap.checklistItemFile) {
      return `${checklistMap.checklistItemFile.arquivo}`;
    }
    return CameraFileLogo;
  };

  const renderErrorColor = (checklistMap: {
    checklistItem: ChecklistItem;
    checklistItemFile: ChecklistItemFile;
  }) => {
    if (checklistMap.checklistItemFile) {
      return checklistMap.checklistItemFile.problema ? "red" : "gray";
    }
    return "gray";
  };

  const renderOkayColor = (checklistMap: {
    checklistItem: ChecklistItem;
    checklistItemFile: ChecklistItemFile;
  }) => {
    if (checklistMap.checklistItemFile) {
      return !checklistMap.checklistItemFile.problema ? "green" : "gray";
    }
    return "gray";
  };

  const toBeAproved = () => {
    if (isTypeResponsable()) {
      return (
        checklistOpen[1]?.aprovado === 0 && checklistOpen[1]?.realizado === 1
      );
    }
    return false;
  };

  const isTypeResponsable = () => {
    return checklistOpen[1]?.responsavel_tipo === user?.responsavel_tipo;
  };

  const isMovimentationResponsable = () => {
    console.log(
      "isMoveRespnsable: ",
      checklistOpen[1]?.responsavel_movimentacao === user?.CODPESSOA
    );
    console.log("user.CODPESSOA", user?.CODPESSOA);
    console.log("responsable: ", checklistOpen[1]?.responsavel_movimentacao);

    return checklistOpen[1]?.responsavel_movimentacao === user?.CODPESSOA;
  };

  const toBeDone = () => {
    console.log(
      "tobeDone: ",
      checklistOpen[1]?.realizado === 0 && checklistOpen[1]?.aprovado === 0
    );
    return (
      checklistOpen[1]?.realizado === 0 && checklistOpen[1]?.aprovado === 0
    );
  };

  const checkIfMobile = () => {
    // Definindo o breakpoint de 768px como exemplo (tamanho padrão para mobile)
    const mobileBreakpoint = 768;
    if (window.innerWidth <= mobileBreakpoint) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  };
  useEffect(() => {
    checkIfMobile();
    getChecklistItemsMap();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checklistOpen[0], refreshChecklist]);

  return (
    <Modal open={checklistOpen[0]} onClose={handleClose}>
      <Box sx={style}>
        <IconButton
          onClick={handleClose}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
          }}
        >
          <CloseIcon sx={{ color: "red" }} />
        </IconButton>

        <Stack direction={"row"} alignItems={"center"} spacing={1} padding={1}>
          <Typography
            variant="h6"
            component="h2"
            textAlign="center"
            marginBottom={2}
          >
            Checklist
          </Typography>
          <Typography textAlign="center">
            Patrimônio {checklistOpen[1]?.id_patrimonio} (
            {checklistOpen[1]?.nome})
          </Typography>
        </Stack>

        <Stack
          direction="row"
          flexWrap="wrap"
          alignItems="center"
          justifyContent="center"
          border="1px solid #eeeeee"
          sx={{
            height: "80%",
            paddingY: "1rem",
            overflowY: "scroll",
            width: {
              xs: "100%",
            },
            gap: 2,
          }}
        >
          {checklistItemsMap &&
            checklistItemsMap.map((checklistMap) => (
              <Card
                key={checklistMap.checklistItem.id_items_checklist_tipo}
                sx={{
                  width: {
                    xs: 240,
                    md: 300,
                  },
                  minHeight: 320,
                  borderRadius: "10px",
                }}
              >
                <CardMedia
                  sx={{
                    height: 200,
                  }}
                  image={renderItemImage(checklistMap)}
                  title="checklist image"
                />
                <CardContent>
                  <Stack gap={1}>
                    <Typography fontSize="small">
                      {checklistMap.checklistItem.nome_item_checklist}
                    </Typography>
                    <Button
                      onClick={() => handleChangeProblem(checklistMap)}
                      sx={{ width: "fit-content" }}
                    >
                      <Stack direction="row" alignItems="center" gap={1}>
                        <ErrorIcon
                          sx={{
                            color: renderErrorColor(checklistMap),
                          }}
                        />
                        <Typography
                          sx={{
                            color: renderErrorColor(checklistMap),
                          }}
                          variant="body2"
                          fontSize="small"
                        >
                          Problema
                        </Typography>
                      </Stack>
                    </Button>

                    <Button
                      id="notProblem"
                      onClick={() => handleChangeOkay(checklistMap)}
                      sx={{ width: "fit-content" }}
                    >
                      <Stack direction="row" alignItems="center" gap={1}>
                        <CheckCircleIcon
                          sx={{
                            color: renderOkayColor(checklistMap),
                          }}
                        />
                        <Typography
                          sx={{
                            color: renderOkayColor(checklistMap),
                          }}
                          variant="body2"
                          fontSize="small"
                        >
                          Okay
                        </Typography>
                      </Stack>
                    </Button>
                    <TextField
                      multiline
                      id="outlined-basic"
                      onChange={(e) =>
                        handleChangeItemObservation(e, checklistMap)
                      }
                      variant="outlined"
                      value={checklistMap.checklistItemFile.observacao}
                    />
                    {isMobile && (
                      <label>
                        <input
                          type="file"
                          id="fileUpload"
                          accept="image/*"
                          capture="environment"
                          style={{ display: "none" }}
                          onChange={(e) => handleFileChange(e, checklistMap)}
                        />
                        <Button
                          component="span"
                          sx={{
                            height: "20px",
                            width: "fit-content",
                            padding: "0",
                          }}
                        >
                          <Stack direction="row" alignItems="center" gap={0.5}>
                            <Typography fontSize="small">
                              Carregar nova foto
                            </Typography>
                            <CloudUploadIcon sx={{ fontSize: "16px" }} />
                          </Stack>
                        </Button>
                      </label>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            ))}
        </Stack>
        <Box display="flex" justifyContent="center" gap={2} marginTop="1rem">
          {toBeDone() && isMovimentationResponsable() && (
            <Button onClick={handleSendChecklistItems}>Enviar</Button>
          )}

          {toBeAproved() && isTypeResponsable() && (
            <Button onClick={handleAproveChecklist}>Aprovar</Button>
          )}
          {toBeAproved() && isTypeResponsable() && (
            <Button onClick={handleReproveChecklist}>Reprovar</Button>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default ChecklistItemsModal;
