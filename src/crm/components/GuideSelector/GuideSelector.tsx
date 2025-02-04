import { Stack, Chip } from "@mui/material";
import { GuideSelectorProps } from "../../types";


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
        height: 300,
        justifyContent: "space-around",
        alignItems: "center",
        overflowX: "scroll",
        minHeight: "4rem",
        position: 'sticky',
        top: 0,
        padding: 1,
        backgroundColor: "white", // Cor de fundo
        zIndex: 20,
        "&::-webkit-scrollbar": {
          width: "4px", // Largura da barra de rolagem
          height: "2px",
        },
        "&::-webkit-scrollbar-thumb": {
          display: 'none',
          height: "2px",
          backgroundColor: "#888", // Cor da barra de rolagem
          borderRadius: "4px", // Bordas arredondadas
        },
        transform: `translateY(-1rem)`
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
GuideSelector.displayName = "GuideSelector";
export default GuideSelector;
