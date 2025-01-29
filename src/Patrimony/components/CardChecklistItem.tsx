import { Card, CardMedia, CardContent, Stack, Typography, Button, TextField } from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { CardChecklistItemProps } from "../../crm/types";


const CardChecklistItem = ({
  checklistItem,
  onOpenItemImage,
  onChangeProblem,
  onChangeOkay,
  onChangeObservation,
  renderItemImage,
  renderErrorColor,
  renderOkayColor,
  renderObservation,
  isMovimentationResponsable,
  handleFileChange,
  toBeDone,
  isIOS,
  shouldShowFinalizeButton,
  handleSendChecklistItems,
  key,
  isMobile
}: CardChecklistItemProps) => {
  const shouldShowUploadFileButton = () => {
    return toBeDone() && isMovimentationResponsable() && isMobile;
  };
  return (
    <Card
      key={key}
      sx={{
        width: {
          xs: "100%",
        },
        boxShadow: "none",
        margin: "auto",
        minHeight: 320,
        borderRadius: "10px",
        cursor: "pointer",
      }}
    >
      <CardMedia
        onClick={() => onOpenItemImage(checklistItem)}
        sx={{
          height: 200,
        }}
        image={renderItemImage(checklistItem)}
        title="checklist image"
      />
      <CardContent>
        <Stack gap={1}>
          <Typography fontSize="small">
            {checklistItem.nome_item_checklist}
          </Typography>
          <Button
            onClick={() => onChangeProblem(checklistItem)}
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
            onClick={() => onChangeOkay(checklistItem)}
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
          {shouldShowUploadFileButton() && (
            <label>
              <input
                type="file"
                id="fileUpload"
                accept="image/*"
                capture={isIOS ? false : "environment"}
                style={{ display: "none" }}
                onChange={(e) => handleFileChange(e, checklistItem)}
              />
              <Button
                component="span"
                variant="outlined"
                sx={{
                  height: "20px",
                  width: "fit-content",
                  padding: 2,
                  borderRadius: 5,
                }}
              >
                <Stack direction="row" alignItems="center" gap={0.5}>
                  <Typography fontSize="small">Novo Arquivo</Typography>
                  <CloudUploadIcon sx={{ fontSize: "16px" }} />
                </Stack>
              </Button>
            </label>
          )}
          <TextField
            onChange={(e) => onChangeObservation(e, checklistItem)}
            placeholder="Observação..."
            value={renderObservation(checklistItem)}
          />
          {shouldShowFinalizeButton && (
            <Button onClick={handleSendChecklistItems}>
              <Typography
                fontSize="medium"
                fontFamily="revert-layer"
                textTransform="capitalize"
              >
                Finalizar
              </Typography>
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
export default CardChecklistItem;