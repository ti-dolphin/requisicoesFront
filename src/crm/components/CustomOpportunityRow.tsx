import React from "react";
import { DataGrid, GridRowProps } from "@mui/x-data-grid";
import { Box } from "@mui/material";

const CustomOpportunityRow = (props: GridRowProps) => {
    return (
        <Box {...props}>
            {props.children}
        </Box>
    );
};