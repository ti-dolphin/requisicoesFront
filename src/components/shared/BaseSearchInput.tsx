import SearchIcon from "@mui/icons-material/Search";
import { Box } from "@mui/material";
import { DebouncedFunc } from "lodash";
import React from 'react'

interface BaseSearchInput {
  onChange: DebouncedFunc<(event: React.ChangeEvent<HTMLInputElement>) => void>;
  value?: string;
  label? : string;
  placeholder? : string;
  showIcon? : boolean;
  type? : string;
  styles? : any;
}

const BaseSearchInput = ({ onChange, value, showIcon, label, placeholder, styles} : BaseSearchInput) => {
  return (
    <Box
      component="form"
      className={`px-3 py-1 rounded-md border text-xs outline-none transition 
          focus:ring-1 border-gray-400 focus:ring-blue-800
          bg-gray-50`}
      // sx={{
      //   display: "flex",
      //   alignItems: "center",
      //   border: "2px solid",
      //   borderColor: "lightgray",
      //   borderRadius: 0,
      //   paddingX: 2,
      //   backgroundColor: "white",
      //   ...styles
      // }}
    >
      {showIcon && <SearchIcon sx={{ height: 24, width: 24 }} />}
      <input
        type="text"
        placeholder={placeholder || "Pesquisar..."}
        aria-label={label && label}
        onChange={onChange}
        value={value}
        onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
        className="bg-gray-50"
        style={{
          padding: "8px 12px",
          borderRadius: "4px",
          border: "none",
          fontSize: "1rem",
          outline: "none",
          width: "200px",
          height: 26,
          ...styles,
        }}
      />
    </Box>
  );
}

export default BaseSearchInput