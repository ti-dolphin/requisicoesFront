import { SxProps, Theme } from "@mui/material";

export const quoteDetailPageStyles ={ 
    height: '100vh',
    width: '100%',
    padding: 1,
    backgroundColor: 'lightgray',
    display: 'flex',
    flexDirection: 'column',
    gap: 1
}
export const boxDefaultStyles = { 
    backgroundColor: 'white',
    padding: 0.5
}
const typographyStyles: { [key: string]: SxProps<Theme> } = {
  heading1: {
    fontSize: "1.4rem",
    fontWeight: 700,
    color: "text.primary",
    lineHeight: 1.5,
  },
  heading2: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "text.secondary",
    lineHeight: 1.4,
  },
  bodyText: {
    fontSize: '0.9rem',
    fontWeight: 400,
    color: "text.primary",
    lineHeight: 1.6,
  },
  smallText: {
    fontSize: "0.875rem",
    fontWeight: 400,
    color: "text.secondary",
    lineHeight: 1.4,
  },
  caption: {
    fontSize: "0.75rem",
    fontWeight: 300,
    color: "text.disabled",
    lineHeight: 1.3,
    fontStyle: "italic",
  },
};

export default typographyStyles;