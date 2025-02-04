import { Box, Stack, IconButton } from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import CircleIcon from "@mui/icons-material/Circle";
import { ChecklistItemFile } from "../types";

interface SliderPaginationProps {
  ChecklistItems: ChecklistItemFile[];
  currentSlideIndex: number;
  previous: () => void;
  next: () => Promise<void>;
}
const SliderPagination = ({
  ChecklistItems,
  currentSlideIndex,
  previous,
  next,
}: SliderPaginationProps) => {
  return (
    <Box className="space-y-8">
      <Stack direction="row" justifyContent="space-between">
        <IconButton onClick={previous}>
          <NavigateBeforeIcon sx={{ color: "blue" }} />
        </IconButton>
        <IconButton onClick={next}>
          <NavigateNextIcon sx={{ color: "blue" }} />
        </IconButton>
      </Stack>
      <Stack direction="row" justifyContent="center" flexWrap="wrap" gap={1}>
        {ChecklistItems?.map((_checklistItem, index) => (
          <CircleIcon
            key={index}
            sx={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: index === currentSlideIndex ? "#333" : "#bbb", // Cor ativa para o slide atual
              transition: "transform 0.3s ease, background-color 0.3s ease",
              cursor: "pointer",
              color: "#e3e3e3",
              transform:
                index === currentSlideIndex ? "scale(1.4)" : "scale(1)", // Aumento do ponto ativo

              "&:hover": {
                backgroundColor: "#888", // Cor ao passar o mouse
                transform:
                  index === currentSlideIndex ? "scale(1.4)" : "scale(1.2)", // Efeito de zoom ao passar o mouse
              },
            }}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default SliderPagination;
