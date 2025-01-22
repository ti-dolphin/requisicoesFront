import { Stack, Chip } from "@mui/material";
import {GuideSelectorProps } from "../types";


const GuideSelector = ({
  guides,
  currentSlideIndex,
  handleChangeGuide,
}: GuideSelectorProps) => {
  return (
    <Stack
      direction="row"
      gap={1}
      sx={{
        display: "flex",
        width: "100%",
        justifyContent: "space-around",
        alignItems: "center",
        overflowX: "scroll",
        minHeight: "4em",
        padding: 1,
        "&::-webkit-scrollbar": {
          width: "4px", // Largura da barra de rolagem
          height: "2px",
        },
        "&::-webkit-scrollbar-thumb": {
          height: "2px",
          backgroundColor: "#888", // Cor da barra de rolagem
          borderRadius: "4px", // Bordas arredondadas
        },
      }}
    >
      {guides.map((guide, index) => (
        <Chip
          key={index}
          onClick={() => handleChangeGuide(index)}
          sx={{
            cursor: "pointer",
          }}
          label={guide.name}
          variant={currentSlideIndex === index ? "filled" : "outlined"}
        />
      ))}
    </Stack>
  );
};

export default GuideSelector;
