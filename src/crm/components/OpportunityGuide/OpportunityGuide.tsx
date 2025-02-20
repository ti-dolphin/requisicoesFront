import { Box, CircularProgress, Typography } from "@mui/material";
import { OpportunityGuideProps } from "../../types";
import { styles } from "./OpportunityGuide.styles";
import OpportunityRegistration from "../OpportunityRegistration/OpportunityRegistration";
import typographyStyles from "../../../Requisitions/utilStyles";
import OpportunityInteraction from "../OpportunityInteraction/OpportunityInteraction";
import OpportunityScope from "../OpportunityScope/OpportunityScope";
import OpportunitySale from "../OpportunitySale/OpportunitySale";
import OpportunityFollowers from "../OpportunityFollowers/OpportunityFollowers";

const OpportunityGuide = ({
  guidesReference,
  guide,
  formDataFilesRef,
  isLoading,
}: OpportunityGuideProps) => {
  return (
    <Box sx={{ ...styles.guideContainer }}>
      <Typography sx={typographyStyles.heading2}>{guide.name}</Typography>
     { 
       !isLoading ? (
      <>
        {guide.name === "Cadastro" && (
          <OpportunityRegistration
            guidesReference={guidesReference}
            guide={guide}
          />
        )}
        {guide.name === "Interação" && (
          <OpportunityInteraction
            guide={guide}
            guidesReference={guidesReference}
          />
        )}
        {guide.name === "Escopo" && (
          <OpportunityScope
            guide={guide}
            guidesReference={guidesReference}
            formDataFilesRef={formDataFilesRef}
          />
        )}
        {guide.name === "Venda" && (
          <OpportunitySale guide={guide} guidesReference={guidesReference} />
        )}
        {guide.name === "Seguidores" && (
          <OpportunityFollowers
            guide={guide}
            guidesReference={guidesReference}
          />
        )}
      </>
      ) : (
      <Box
        sx={{
          height: 200,
          width: 200,
          display: "flex",
          padding: 2,
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
      )
     }



      {/* !isLoading ? (
      {guide.name === "Cadastro" && (
        <OpportunityRegistration
          guidesReference={guidesReference}
          guide={guide}
        />
      )}
      {guide.name === "Interação" && (
        <OpportunityInteraction
          guide={guide}
          guidesReference={guidesReference}
        />
      )}
      {guide.name === "Escopo" && (
        <OpportunityScope
          guide={guide}
          guidesReference={guidesReference}
          formDataFilesRef={formDataFilesRef}
        />
      )}
      {guide.name === "Venda" && (
        <OpportunitySale guide={guide} guidesReference={guidesReference} />
      )}
      {guide.name === "Seguidores" && (
        <OpportunityFollowers guide={guide} guidesReference={guidesReference} />
      )}
      ) : (
      <Box
        sx={{
          height: 200,
          width: 200,
          display: "flex",
          padding: 2,
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
      ) */}
    </Box>
  );
};
export default OpportunityGuide;
