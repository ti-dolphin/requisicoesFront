/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
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
import CardChecklistItem from "../components/CardChecklistItem";
import SliderPagination from "../components/SliderPagination";
import FileViewer from "../../crm/modals/FileViewer";
import { isPDF } from "../../generalUtilities";

dayjs.extend(utc);
dayjs.extend(timezone);

const ChecklistItemsModal = () => {
  const {
    checklistOpen,
    toggleChecklistOpen,
    setChecklistOpen,
    refreshChecklist,
    toggleRefreshChecklist,
  } = useContext(checklistContext);
  const { user } = useContext(userContext);

  const [ChecklistItems, setChecklistItems] = useState<ChecklistItemFile[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isIOS, setIsIOS] = useState(false);
  const sliderRef = useRef<Slider | null>(null);
  const [itemImageOpen, setItemImageOpen] = useState <ChecklistItemFile>();
 const [isLoadingItems, setIsLoadingItems] = useState(true);



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
        currentChecklist.data_aprovado = dayjs()
          .tz("America/Sao_Paulo")
          .format("YYYY-MM-DD HH:mm:ss");
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
    const noFilteItem = ChecklistItems.find(item => !item.arquivo);
    if(noFilteItem) {
      alert("Todos os itens da checklist devem ter uma imagem.");
      return;
    }

    if (ChecklistItems) {
      const response = await sendChecklistItems(ChecklistItems);
      if (response && response.status === 200 && checklistOpen[1]) {
        const currentChecklist = { ...checklistOpen[1] };
        currentChecklist.realizado = 1;
        currentChecklist.data_realizado = dayjs()
          .tz("America/Sao_Paulo")
          .format("YYYY-MM-DD HH:mm:ss");
        await sendCurrentChecklist(currentChecklist);
        toggleRefreshChecklist();
        toggleChecklistOpen();
      }
      return;
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
  
  const getChecklistItemsMap = useCallback(async () => {
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
  }, [checklistOpen]); 

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

  const shouldShowFinalizeButton = toBeDone() && isMovimentationResponsable() && (lastItem() || !isMobile);
  const shouldShowApprovalButtons = toBeAproved() && (lastItem() || !isMobile);

  useEffect(() => {
     if (ChecklistItems?.length > 0) {
     const timer = setTimeout(() => {
       setIsLoadingItems(false) 
     },ChecklistItems?.length * 200)

     return () => clearTimeout(timer) 
   }
  });

  useEffect(() => {
    verifyIsIOS();
    checkIfMobile();
    getChecklistItemsMap();
  }, [checklistOpen, refreshChecklist, getChecklistItemsMap]);

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
          <Typography
            textAlign="center"
            fontSize="small"
            color="blue"
            sx={{ textDecoration: "underline", cursor: "pointer" }}
            onClick={() =>
              window.open(
                `/patrimony/details/${checklistOpen[1]?.id_patrimonio}`
              )
            }
          >
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
          {isLoadingItems ? (
            <CircularProgress sx={{ margin: "auto" }} />
          ) : ChecklistItems && !isMobile ? ( // Desktop
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: `repeat(${Math.min(
                  ChecklistItems.length,
                  4
                )}, 1fr)`, // Definindo o máximo de 4 colunas
                justifyContent: "center",
                gap: 2, // Espaçamento entre os itens do grid
              }}
            >
              {ChecklistItems.map((checklistItem) => (
                <CardChecklistItem
                  key={checklistItem.id_item_checklist_movimentacao}
                  checklistItem={checklistItem}
                  onOpenItemImage={handleOpenItemImage}
                  onChangeProblem={handleChangeProblem}
                  onChangeOkay={handleChangeOkay}
                  onChangeObservation={handleChangeItemObservation}
                  renderItemImage={renderItemImage}
                  renderErrorColor={renderErrorColor}
                  renderOkayColor={renderOkayColor}
                  renderObservation={renderObservation}
                  isMovimentationResponsable={isMovimentationResponsable}
                  handleFileChange={handleFileChange}
                  toBeDone={toBeDone}
                  isIOS={isIOS}
                  shouldShowFinalizeButton={shouldShowFinalizeButton}
                  handleSendChecklistItems={handleSendChecklistItems}
                />
              ))}
            </Box>
          ) : (
            // Mobile
            ChecklistItems && (
              <Stack gap={1}>
                <Slider ref={sliderRef} {...settings}>
                  {ChecklistItems.map((checklistItem) => (
                    <CardChecklistItem
                      key={checklistItem.id_item_checklist_movimentacao}
                      checklistItem={checklistItem}
                      onOpenItemImage={handleOpenItemImage}
                      onChangeProblem={handleChangeProblem}
                      onChangeOkay={handleChangeOkay}
                      onChangeObservation={handleChangeItemObservation}
                      renderItemImage={renderItemImage}
                      renderErrorColor={renderErrorColor}
                      renderOkayColor={renderOkayColor}
                      renderObservation={renderObservation}
                      toBeDone={toBeDone}
                      handleFileChange={handleFileChange}
                      isMovimentationResponsable={isMovimentationResponsable}
                      isIOS={isIOS}
                      shouldShowFinalizeButton={shouldShowFinalizeButton}
                      handleSendChecklistItems={handleSendChecklistItems}
                    />
                  ))}
                </Slider>
                <SliderPagination
                  ChecklistItems={ChecklistItems}
                  currentSlideIndex={currentSlideIndex}
                  previous={previous}
                  next={next}
                />
              </Stack>
            )
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
          {shouldShowApprovalButtons && (
            <>
              <Button onClick={handleAproveChecklist}>
                <Typography fontSize="medium" textTransform="capitalize">
                  Aprovar
                </Typography>
              </Button>
              <Button onClick={handleReproveChecklist}>
                <Typography fontSize="medium" textTransform="capitalize">
                  Reprovar
                </Typography>
              </Button>
            </>
          )}
        </Box>
        <FileViewer
          fileViewerOpen={itemImageOpen !== undefined}
          fileUrl={itemImageOpen?.arquivo || ""}
          fileName={itemImageOpen?.arquivo || ""}
          isPDF={isPDF}
          handleCloseFileViewer={handleCloseImageModal}
        />
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
