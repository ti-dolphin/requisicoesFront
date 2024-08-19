import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { postItemFile, postRequisitionFile } from "../../../utils";
import { inputFileProps } from "../../../types";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const InputFile = ({
  id,
  caller,
  setRefreshToggler,
  refreshToggler,
}: inputFileProps) => {
  
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);

      if (caller === "ItemFilesModal") {
        const response = await postItemFile(id, formData);
        if (response?.status === 200) setRefreshToggler(!refreshToggler);
        return;
      }

      const response = await postRequisitionFile(id, formData);
      if (response === 200) setRefreshToggler(!refreshToggler);
      return;
    }
  };
  return (
    <Button
      component="label"
      role={undefined}
      variant="outlined"
      tabIndex={-1}
      startIcon={<AttachFileIcon />}
    >
      Anexar Arquivo
      <VisuallyHiddenInput onChange={handleChange} type="file" />
    </Button>
  );
};

export default InputFile;
