
import { Box } from "@mui/material";
import { OpportunityGuideProps } from "../../types";
import OpportunityFiles from "../OpportunityFiles/OpportunityFiles";
import RenderOpportunityFields from "../OpportunityFields/OpportunityFields";
import FollowersTable from "../tables/FollowersTable";
import { styles } from "./OpportunityGuide.styles";

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

  const justifyStartGuide = (guideName: string) => {
    return guideName === "Escopo" || guideName === "Interação";
  }

  return (
    <Box
      key={guide.name}
      sx={styles.guideContainer}
    >
      <Box
        sx={{
           ...styles.contentContainer,
            justifyContent: justifyStartGuide(guide.name) ? `start` : `center`, }}
      >
        {guide.name === "Escopo" && (
          <OpportunityFiles
            handleChangeFiles={handleChangeFiles}
            handleDeleteFile={handleDeleteFile}
            opportunity={opportunity}
          />
        )}
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
    </Box>
  );
};
OpportunityGuide.displayName = "OpportunityGuide";
export default OpportunityGuide;
