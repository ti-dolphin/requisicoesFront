/* eslint-disable @typescript-eslint/no-unused-vars */
import { useContext, useEffect, useRef, useState } from "react";
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
  styled,
} from "@mui/material";
import { checklistContext } from "../context/checklistContext";
import CloseIcon from "@mui/icons-material/Close";
import ErrorIcon from "@mui/icons-material/Error";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import {
  getChecklistItems,
  sendChecklist,
  sendChecklistItems,
  uploadFileToChecklistItemFile,
} from "../utils";
import {
  ChecklistItemFile,
  MovementationChecklist,
} from "../types";
import CameraFileLogo from "../assets/cameraFileLogo-Chy76Qi9-Chy76Qi9.png";
import { userContext } from "../../Requisitions/context/userContext";
import { TextareaAutosize as BaseTextareaAutosize } from "@mui/base/TextareaAutosize";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { CircularProgress } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import CircleIcon from '@mui/icons-material/Circle';
const ChecklistItemsModal = () => {
  const {
    checklistOpen,
    toggleChecklistOpen,
    setChecklistOpen,
    refreshChecklist,
    toggleRefreshChecklist,
  } = useContext(checklistContext);
  const { user } = useContext(userContext);

  const [ChecklistItems, setChecklistItems] = useState<ChecklistItemFile[]>();
  const [isMobile, setIsMobile] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState(false);
  const sliderRef = useRef<Slider | null>(null);
  const [itemImageOpen, setItemImageOpen] = useState <ChecklistItemFile>();

  function verifyIsIOS() {
    if(navigator.userAgent.toLowerCase().includes('iphone')){ 
      setIsIOS(true);
      return;
    }
    setIsIOS(false);
  }
  
  const next = async () => {
      if (sliderRef.current) {
        sliderRef.current.slickNext();
      }
      return;
}

  const previous = () => {
     if (sliderRef.current) {
      sliderRef.current.slickPrev();
     }
  };

  const settings = {
    swipe: true,
    arrows: false,
    accessibility: false,
    dots: false,
    infinite: false,
    speed: 200,
    slidesToShow: 1,
    slidesToScroll: 1,
    draggable: false,
    beforeChange: (oldIndex : number) => {
      if (ChecklistItems && ChecklistItems[oldIndex]) {
        (async () => {
          await sendChecklistItems(ChecklistItems);
          console.log("saved it");
        })();
      } else {
        console.log("dont save it because there's no item");
      }
    },
    // beforeChange: async (oldIndex: number) => {
    //   if(checklistItemsMap && checklistItemsMap[oldIndex].checklistItemFile){
    //      const filledChecklistItems = checklistItemsMap.filter(
    //        (item) => item.checklistItemFile !== undefined
    //      );
    //      console.log("filledChecklistItems", filledChecklistItems);
    //      await sendChecklistItems(filledChecklistItems);
    //      console.log('saved it');
    //       return;
    //   }
    //   console.log('dont save it because theres no item')
    // },
     afterChange: (current: number) => setCurrentSlideIndex(current),
  };

  const handleClose = () => {
    toggleChecklistOpen();
  };

  const handleUploadImage = async (
    checklistItem : ChecklistItemFile,
    file: FormData
  ) => {
    if (checklistItem) {
    
        const updatedItems = updateChecklistItemToOkay(checklistItem);
        await sendChecklistItems(updatedItems);
        await uploadFileToChecklistItemFile(checklistItem.id_item_checklist_movimentacao, file);
        setIsLoading(false);
        toggleRefreshChecklist();
        return;
      
    }
  };

  const updateChecklistItemToOkay = (checklistItemReceived : ChecklistItemFile) => {
    return (
      ChecklistItems?.map((checklistItem) => {
        if (checklistItem) {
          return checklistItem.id_item_checklist_movimentacao ===
            checklistItemReceived.id_item_checklist_movimentacao
            ? {
                ...checklistItemReceived,
                problema: 0,
              }
            : checklistItem;
        }
        return checklistItem;
      }) || []
    );
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    checklistItem : ChecklistItemFile
  ) => {
    const file = e.target.files?.[0];
    if (isMovimentationResponsable() && file && toBeDone()) {
      const formData = new FormData();
      setIsLoading(true);
      formData.append("file", file);
      await handleUploadImage(checklistItem, formData); // Atualiza a imagem no estado
      return;
    }
    alert("Editar checklist não é permitido!");
  };

  const handleChangeProblem = (checklistItemReceived : ChecklistItemFile) => {
    if (checklistItemReceived) {
      const problem = checklistItemReceived.problema;
      if (!problem && isTypeResponsable()) {
        const updatedItems = ChecklistItems?.map((checklistItem) =>
          checklistItem.id_item_checklist_movimentacao ===
          checklistItemReceived.id_item_checklist_movimentacao
            ? {
                ...checklistItem,
                problema: 1,
              }
            : checklistItem
        );

        setChecklistItems(updatedItems);
      }
    }
  };

const handleChangeOkay = (checklistItemReceived: ChecklistItemFile) => {
  if (checklistItemReceived) {
    const problem = checklistItemReceived.problema;
    if (problem && isTypeResponsable()) {
      const updatedItems = ChecklistItems?.map((checklistItem) =>
        checklistItem.id_item_checklist_movimentacao ===
        checklistItemReceived.id_item_checklist_movimentacao
          ? {
              ...checklistItem,
              problema: 0,
            }
          : checklistItem
      );

      setChecklistItems(updatedItems);
    }
  }
};

  const handleAproveChecklist = async () => {
    if (checklistOpen[1]) {
      const currentChecklist = {
        ...checklistOpen[1],
      };
      //envia os itens
      const problemItem = ChecklistItems?.find(checklistItem => checklistItem.problema);
      if (problemItem) {
        alert(
          "Existem itens com problemas, todos devem estar Okay para aprovar!"
        );
        return;
      }
      const response = ChecklistItems && await sendChecklistItems(ChecklistItems);
      //muda checklist para aprovado e define data de aprovação
      if (response && response.status === 200) {
        currentChecklist.aprovado = 1;
        currentChecklist.data_aprovado = new Date().toISOString();
        const response = await sendChecklist(currentChecklist);
        if (response && response.status === 200) {
          setChecklistOpen([true, currentChecklist]);
          toggleRefreshChecklist();
          alert("Checklist Aprovado!");
        }
      }
    }
  };
const handleReproveChecklist = async () => {
  if (checklistOpen[1]) {
    const currentChecklist = {
      ...checklistOpen[1],
    };
    // Verifica se há algum item marcado como problema
    const problemItem = ChecklistItems?.find(
      (checklistItem) => checklistItem.problema === 1
    );
    if (!problemItem) {
      alert(
        "Por favor, marque o item com problema antes de reprovar o checklist"
      );
      return;
    }
    // Envia os itens de checklist com os problemas marcados
    const response =
      ChecklistItems && (await sendChecklistItems(ChecklistItems));
    // Muda o status do checklist para reprovado e reseta a data de aprovação
    if (response && response.status === 200) {
      currentChecklist.aprovado = 0;
      currentChecklist.realizado = 0; // Remove a data de aprovação, pois foi reprovado
      currentChecklist.reprovado = 1;
      const checklistResponse = await sendChecklist(currentChecklist);
      if (checklistResponse && checklistResponse.status === 200) {
        setChecklistOpen([true, currentChecklist]);
        toggleRefreshChecklist();
        alert("Checklist Reprovado!");
      }
    }
  }
};

  const handleSendChecklistItems = async () => {
    if (ChecklistItems) {
      const response = await sendChecklistItems(ChecklistItems);
      if (response && response.status === 200 && checklistOpen[1]) {
        const currentChecklist = { ...checklistOpen[1] };
        currentChecklist.realizado = 1;
        currentChecklist.data_realizado = new Date().toISOString();
        await sendCurrentChecklist(currentChecklist);
        toggleRefreshChecklist();
        toggleChecklistOpen();
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
    checklistItemReceived : ChecklistItemFile
  ) => {
    const { value } = e.target;
    const updatedChecklistItems = ChecklistItems?.map(
      (checklistItem) => {
        if (
          checklistItemReceived.id_item_checklist_movimentacao ===
          checklistItem.id_item_checklist_movimentacao
        ) {
          const updatedChecklistMap = { ...checklistItemReceived };
          updatedChecklistMap.observacao = value;
          return { ...updatedChecklistMap };
        }
        return {
          ...checklistItem,
        };
      }
    );
    setChecklistItems(updatedChecklistItems);
  };
  
  const getChecklistItemsMap = async () => {
    if (checklistOpen[1]) {
      const { id_patrimonio, id_movimentacao, id_checklist_movimentacao } =
        checklistOpen[1];
      const checklistItems = await getChecklistItems(
        id_patrimonio,
        id_movimentacao,
        id_checklist_movimentacao
      );
      if (checklistItems) {
        console.log(checklistItems);
        setChecklistItems(checklistItems);
        return;
      }
    }
  };

  const renderItemImage = (checklistItem: ChecklistItemFile) => {
    if (checklistItem.arquivo) {

      return `${checklistItem.arquivo}`;
    }
    return CameraFileLogo;
  };

  const renderErrorColor = (
    checklistItem : ChecklistItemFile) => {
    if (checklistItem) {
      return checklistItem.problema ? "red" : "gray";
    }
    return "gray";
  };

  const renderOkayColor = (checklistItem: ChecklistItemFile) => {
    if (checklistItem) {
      return !checklistItem.problema ? "green" : "gray";
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


  const lastItem = ( ) => { 
    if (ChecklistItems && currentSlideIndex === ChecklistItems.length - 1){ 
      return true;
    }
    return false;
  };

  const renderObservation = (checklistItem: ChecklistItemFile) => {
    if (checklistItem) {
      return checklistItem.observacao
        ? checklistItem.observacao
        : "";
    }
    return "";
  };
  const handleCloseImageModal =  () => { 
    setItemImageOpen(undefined);
  };
  const handleOpenItemImage = (checklistItem  : ChecklistItemFile) => {
    if(checklistItem.arquivo){ 
     setItemImageOpen(checklistItem);
     return;
    }
    alert("Não há arquivo!");
  };

  useEffect(() => {
    verifyIsIOS()
    checkIfMobile();
    getChecklistItemsMap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checklistOpen[0], refreshChecklist]);

  return (
    <Modal open={checklistOpen[0]} onClose={handleClose}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "4rem",
          justifyContent: "start",

          position: "absolute" as const,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          height: "96%",
          width: {
            xs: "90%",
            md: "60%",
            lg: "40%",
            xl: "80%",
          },
          bgcolor: "background.paper",
          boxShadow: 24,
          p: {
            xs: 0.5,
            md: 3,
            lg: 4,
            xl: 5,
          },
          overflowY: "scroll",
          borderRadius: "8px", // Bordas arredondadas para um visual mais clean
          outline: "none", // Remover as bordas do modal
        }}
      >
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

        <Stack
          direction={"column"}
          alignItems={"center"}
          spacing={1}
          padding={1}
        >
          <Typography
            variant="h6"
            component="h2"
            textAlign="center"
            marginBottom={2}
          >
            Checklist
          </Typography>
          <Typography textAlign="center" fontSize="small">
            Patrimônio {checklistOpen[1]?.id_patrimonio} (
            {checklistOpen[1]?.nome})
          </Typography>
        </Stack>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",

            alignItems: {
              md: "center",
            },
            justifyContent: "center",
            gap: "2rem",
          }}
        >
          {ChecklistItems && !isMobile ? ( //desktop
            <Stack direction="row" flexWrap="wrap" width="90%" gap={1}>
              {ChecklistItems.map((checklistItem) => (
                <Card
                  key={checklistItem.id_checklist_movimentacao}
                  sx={{
                    width: {
                      xs: 240,
                      md: 300,
                    },
                    minHeight: 320,
                    borderRadius: "10px",
                    cursor: "pointer",
                  }}
                  onClick={() => handleOpenItemImage(checklistItem)}
                >
                  <CardMedia
                    sx={{
                      height: 200,
                    }}
                    image={renderItemImage(checklistItem)}
                    title="checklist image"
                  ></CardMedia>
                  <CardContent>
                    <Stack gap={1}>
                      <Typography fontSize="small">
                        {checklistItem.nome_item_checklist}
                      </Typography>
                      <Button
                        onClick={() => handleChangeProblem(checklistItem)}
                        sx={{ width: "fit-content" }}
                      >
                        <Stack direction="row" alignItems="center" gap={1}>
                          <ErrorIcon
                            sx={{
                              color: renderErrorColor(checklistItem),
                            }}
                          />
                          <Typography
                            sx={{
                              color: renderErrorColor(checklistItem),
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
                        onClick={() => handleChangeOkay(checklistItem)}
                        sx={{ width: "fit-content" }}
                      >
                        <Stack direction="row" alignItems="center" gap={1}>
                          <CheckCircleIcon
                            sx={{
                              color: renderOkayColor(checklistItem),
                            }}
                          />
                          <Typography
                            sx={{
                              color: renderOkayColor(checklistItem),
                            }}
                            variant="body2"
                            fontSize="small"
                          >
                            Okay
                          </Typography>
                        </Stack>
                      </Button>
                      <TextareaAutosize
                        onChange={(e) =>
                          handleChangeItemObservation(e, checklistItem)
                        }
                        defaultValue={""}
                        value={renderObservation(checklistItem)}
                      />
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          ) : (
            //mobile
            ChecklistItems && (
              <Slider ref={sliderRef} {...settings}>
                {ChecklistItems.map((checklistItem) => (
                  <Card
                    key={checklistItem.id_checklist_movimentacao}
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
                      image={isLoading ? "" : renderItemImage(checklistItem)}
                      title="checklist image"
                    >
                      {isLoading && (
                        <Stack
                          direction="row"
                          justifyContent="center"
                          alignItems="center"
                          sx={{ mt: 2, height: "100%" }}
                        >
                          <CircularProgress />
                        </Stack>
                      )}
                    </CardMedia>
                    <CardContent>
                      <Stack gap={1}>
                        <Typography fontSize="small">
                          {checklistItem.nome_item_checklist}
                        </Typography>
                        <Button
                          onClick={() => handleChangeProblem(checklistItem)}
                          sx={{ width: "fit-content" }}
                        >
                          <Stack direction="row" alignItems="center" gap={1}>
                            <ErrorIcon
                              sx={{
                                color: renderErrorColor(checklistItem),
                              }}
                            />
                            <Typography
                              sx={{
                                color: renderErrorColor(checklistItem),
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
                          onClick={() => handleChangeOkay(checklistItem)}
                          sx={{ width: "fit-content" }}
                        >
                          <Stack direction="row" alignItems="center" gap={1}>
                            <CheckCircleIcon
                              sx={{
                                color: renderOkayColor(checklistItem),
                              }}
                            />
                            <Typography
                              sx={{
                                color: renderOkayColor(checklistItem),
                              }}
                              variant="body2"
                              fontSize="small"
                            >
                              Okay
                            </Typography>
                          </Stack>
                        </Button>
                        <TextareaAutosize
                          onChange={(e) =>
                            handleChangeItemObservation(e, checklistItem)
                          }
                          defaultValue={""}
                          value={renderObservation(checklistItem)}
                        />
                        {toBeDone() && isMovimentationResponsable() && (
                          <label>
                            <input
                              type="file"
                              id="fileUpload"
                              accept="image/*"
                              capture={isIOS ? false : "environment"}
                              style={{ display: "none" }}
                              onChange={(e) =>
                                handleFileChange(e, checklistItem)
                              }
                            />
                            <Button
                              component="span"
                              sx={{
                                height: "20px",
                                width: "fit-content",
                                padding: "0",
                              }}
                            >
                              <Stack
                                direction="row"
                                alignItems="center"
                                gap={0.5}
                              >
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
              </Slider>
            )
          )}
          {isMobile && (
            <Box className="space-y-8">
              <Stack direction="row" justifyContent="space-between">
                <IconButton onClick={previous}>
                  <NavigateBeforeIcon sx={{ color: "blue" }} />
                </IconButton>
                <IconButton onClick={next}>
                  <NavigateNextIcon sx={{ color: "blue" }} />
                </IconButton>
              </Stack>
              <Stack
                direction="row"
                justifyContent="center"
                flexWrap="wrap"
                gap={1}
              >
                {ChecklistItems?.map((_checklistItem, index) => (
                  <CircleIcon
                    sx={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      backgroundColor:
                        index === currentSlideIndex ? "#333" : "#bbb", // Cor ativa para o slide atual
                      transition:
                        "transform 0.3s ease, background-color 0.3s ease",
                      cursor: "pointer",
                      color: "#e3e3e3",
                      transform:
                        index === currentSlideIndex ? "scale(1.4)" : "scale(1)", // Aumento do ponto ativo

                      "&:hover": {
                        backgroundColor: "#888", // Cor ao passar o mouse
                        transform:
                          index === currentSlideIndex
                            ? "scale(1.4)"
                            : "scale(1.2)", // Efeito de zoom ao passar o mouse
                      },
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}
        </Box>

        <Box
          display="flex"
          justifyContent="center"
          gap={2}
          marginTop="1rem"
          sx={{
            transform: "translateY(-4rem)",
          }}
        >
          {toBeDone() &&
            isMovimentationResponsable() &&
            (lastItem() || !isMobile) &&
            toBeDone() && (
              <Button onClick={handleSendChecklistItems}>
                <Typography
                  fontSize="medium"
                  fontFamily="revert-layer"
                  textTransform="capitalize"
                >
                  {" "}
                  Finalizar
                </Typography>
              </Button>
            )}

          {toBeAproved() && (lastItem() || !isMobile) && (
            <Button onClick={handleAproveChecklist}>
              <Typography fontSize="medium" textTransform="capitalize">
                Aprovar
              </Typography>
            </Button>
          )}
          {toBeAproved() && (lastItem() || !isMobile) && (
            <Button onClick={handleReproveChecklist}>
              <Typography fontSize="medium" textTransform="capitalize">
                Reprovar
              </Typography>
            </Button>
          )}
        </Box>
        <Modal
          open={itemImageOpen !== undefined}
          onClose={handleCloseImageModal}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "90%",
              height: "90%",
              bgcolor: "background.paper",
              border: "1px solid #000",
              boxShadow: 24,
              p: 2,
            }}
          >
            <IconButton
              onClick={handleCloseImageModal}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
              }}
            >
              <CloseIcon sx={{ color: "red" }} />
            </IconButton>
            <Box
              sx={{
                height: "100%",
                backgroundImage: `url(${itemImageOpen?.arquivo})`,
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
              }}
            ></Box>
          </Box>
        </Modal>
      </Box>
    </Modal>
  );
};

const blue = {
  100: "#DAECFF",
  200: "#b6daff",
  400: "#3399FF",
  500: "#007FFF",
  600: "#0072E5",
  900: "#003A75",
};

const grey = {
  50: "#F3F6F9",
  100: "#E5EAF2",
  200: "#DAE2ED",
  300: "#C7D0DD",
  400: "#B0B8C4",
  500: "#9DA8B7",
  600: "#6B7A90",
  700: "#434D5B",
  800: "#303740",
  900: "#1C2025",
};

const TextareaAutosize = styled(BaseTextareaAutosize)(
  ({ theme }) => `
  box-sizing: border-box;
  width: '100%';
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.5;
  padding: 8px 12px;
  border-radius: 8px;
  color: ${theme.palette.mode === "dark" ? grey[300] : grey[900]};
  background: ${theme.palette.mode === "dark" ? grey[900] : "#fff"};
  border: 1px solid ${theme.palette.mode === "dark" ? grey[700] : grey[200]};
  box-shadow: 0px 2px 2px ${
    theme.palette.mode === "dark" ? grey[900] : grey[50]
  };

  &:hover {
    border-color: ${blue[400]};
  }

  &:focus {
    border-color: ${blue[400]};
    box-shadow: 0 0 0 3px ${
      theme.palette.mode === "dark" ? blue[600] : blue[200]
    };
  }

  // firefox
  &:focus-visible {
    outline: 0;
  }
`
);

export default ChecklistItemsModal;
