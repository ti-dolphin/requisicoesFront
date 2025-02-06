import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import { postItemFile, postRequisitionFile } from "../../utils";
import { inputFileProps } from "../../types";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

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
  setIsLoading,
  refreshToggler,
}: inputFileProps) => {

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleChange Input File');
    if (e.target.files) {
      setIsLoading(true);
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);

      if (caller === "ItemFilesModal") {
        const response = await postItemFile(id, formData);
        setIsLoading(false);
        if (response?.status === 200) setRefreshToggler(!refreshToggler);
        return;
      }

      const response = await postRequisitionFile(id, formData);
      if (response === 200) {
        console.log('response === 200')
        setRefreshToggler(!refreshToggler);
        setIsLoading(false);
      }
      return;
    }
  };
  return (
    <Button
      component="label"
      role={undefined}
      variant="contained"
      tabIndex={-1}
      startIcon={<CloudUploadIcon />}
    >
      Anexar Arquivo
      <VisuallyHiddenInput
        accept="image/*,application/pdf"
        onChange={handleChange}
        type="file"
      />
    </Button>
  );
};

export default InputFile;
