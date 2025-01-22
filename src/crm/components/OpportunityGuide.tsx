import React from "react";
import { Box } from "@mui/material";
import RenderOpportunityFields from "./RenderOpportunityFields";
import FollowersTable from "./FollowersTable";
import OpportunityFiles from "./OpportunityFiles";
import { OpportunityGuideProps } from "../types";

const OpportunityGuide = ({
  guide,
  renderAutoCompleteValue,
  handleChangeAutoComplete,
  renderOptions,
  adicional,
  currentOppIdSelected,
  opportunity,
  handleChangeTextField,
  isDateField,
  currentCommentValue,
  handleChangeComentarios,
  editingComment,
  setEditingComment,
  setCurrentOpportunity,
  handleSaveOpportunity,
  handleChangeFiles,
  handleDeleteFile,
}: OpportunityGuideProps) => {
    console.log("OpportunityGuide")
  return (
    <Box
      key={guide.name}
      sx={{
        width: "100%",
        display: "flex !important",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 0.5,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 2,
          width: "100%",
          minWidth: 0,
        }}
      >
        {guide.fields?.map((field) => (
          <RenderOpportunityFields
            key={field.dataKey}
            field={field}
            renderAutoCompleteValue={renderAutoCompleteValue}
            handleChangeAutoComplete={handleChangeAutoComplete}
            renderOptions={renderOptions}
            adicional={adicional}
            currentOppIdSelected={currentOppIdSelected}
            opportunity={opportunity}
            handleChangeTextField={handleChangeTextField}
            isDateField={isDateField}
            currentCommentValue={currentCommentValue}
            handleChangeComentarios={handleChangeComentarios}
            editingComment={editingComment}
            setEditingComment={setEditingComment}
          />
        ))}
      </Box>
      {guide.name === "Seguidores" && (
        <FollowersTable
          setCurrentOpportunity={setCurrentOpportunity}
          opportunity={opportunity}
          handleSaveOpportunity={handleSaveOpportunity}
        />
      )}
      {guide.name === "Escopo" && (
        <OpportunityFiles
          handleChangeFiles={handleChangeFiles}
          handleDeleteFile={handleDeleteFile}
          opportunity={opportunity}
        />
      )}
    </Box>
  );
};

export default OpportunityGuide;
