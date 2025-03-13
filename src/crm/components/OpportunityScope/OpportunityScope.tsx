import React, { Dispatch, MutableRefObject, SetStateAction, useEffect, useState } from "react";
import { Guide, OpportunityFile } from "../../types";
import { Box, Button, Stack, TextField } from "@mui/material";
import OpportunityFiles from "../OpportunityFiles/OpportunityFiles";
import style from "./OpportunityScopo.styles";
import { AnimatePresence, motion } from "framer-motion";
import { alertAnimation, BaseButtonStyles } from "../../../utilStyles";

interface props {
  guide: Guide;
  guidesReference: MutableRefObject<Guide[] | undefined>;
  formDataFilesRef: MutableRefObject<FormData | undefined>;
  setChangeWasMade: Dispatch<SetStateAction<boolean>>;
}

const OpportunityScope = ({
  guide,
  guidesReference,
  formDataFilesRef,
  setChangeWasMade
}: props) => {
  const [files, setFiles] = useState<OpportunityFile[]>([]);
  const [oppId, setOppId] = useState<number>();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [observation, setObservation] = useState<string>();

  // Função para deletar um arquivo
  const handleDeleteFile = (file: OpportunityFile) => {
    if (files && guidesReference.current) {
      const newFiles = files.filter(
        (oppFile) => oppFile.nome_arquivo !== file.nome_arquivo
      );
      setFiles(newFiles);
      guide.fields[1].data = newFiles;
      guidesReference.current[2] = guide;
      setChangeWasMade(true);

    }
  };

  const handleChangeFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      const newFile: OpportunityFile = {
        id_anexo_os: Math.random(),
        arquivo: URL.createObjectURL(file),
        nome_arquivo: file.name,
        codos: oppId || 0,
      };
      setFiles([...(files || []), newFile]);
      const newFormData = new FormData();
      formDataFilesRef.current?.forEach((value, key) => {
        newFormData.append(key, value);
      });
      newFormData.append("files", file);
      formDataFilesRef.current = newFormData;
      e.target.value = "";
      setChangeWasMade(true);
    }
  };

  const cancelObsEdition = () => {
    setObservation("");
    setIsEditing(false);
  };
  const handleChangeObservation = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const { value } = e.target;
    setObservation(value);

  };
  const concludeObservationEdition = () => {
    if (guidesReference.current) {
      guide.fields[0].data = observation;
      guidesReference.current[2] = guide;
      setChangeWasMade(true);
    }
    setIsEditing(false);
  };

  useEffect(() => {
    if (guidesReference.current) {
      const oppId = guidesReference.current[0].fields[0].data.codOs || 0;
      setOppId(oppId);
      setFiles(guide.fields[1].data);
      setObservation(guide.fields[0].data);
    }
  }, [guide]);

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        justifyContent: "center",
        gap: 2,
        padding: 1,
      }}
    >
      <TextField
        label={"Observação"}
        InputLabelProps={{ shrink: true }}
        fullWidth
        sx={style.observationField}
        multiline
        type="text"
        value={observation}
        onChange={handleChangeObservation}
        onFocus={() => setIsEditing(true)}
      />
      {
        <AnimatePresence>
          {isEditing && (
            <motion.div {...alertAnimation}>
              <Stack direction="row" gap={1}>
                <Button
                  sx={BaseButtonStyles}
                  onClick={concludeObservationEdition}
                >
                  Concluir
                </Button>
                <Button sx={BaseButtonStyles} onClick={cancelObsEdition}>
                  Cancelar
                </Button>
              </Stack>
            </motion.div>
          )}
        </AnimatePresence>
      }
      {
        <OpportunityFiles
          files={files}
          handleDeleteFile={handleDeleteFile}
          handleChangeFiles={handleChangeFiles}
        />
      }
    </Box>
  );
};

export default OpportunityScope;
