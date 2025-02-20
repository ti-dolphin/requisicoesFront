import { Stack, Chip } from "@mui/material";
import { GuideSelectorProps } from "../../types";
import { styles } from "./GuideSelector.styles";


const GuideSelector = ({
  guides,
  currentSlideIndex,
  handleChangeGuide,
}: GuideSelectorProps) => {
  return (
    <Stack
      direction="row"
     
      sx={styles.guideSelectorContainer}
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
