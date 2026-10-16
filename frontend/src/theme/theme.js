import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#4F46E5",       // Sleek Indigo (NexaERP vibe)
            light: "#818CF8",
            dark: "#3730A3",
            contrastText: "#FFFFFF",
        },
        secondary: {
            main: "#F59E0B",       // Warm Amber (Materio cozy vibe)
            light: "#FDE68A",
            dark: "#D97706",
            contrastText: "#FFFFFF",
        },
        background: {
            default: "#F8FAFC",    // Soft, crisp off-white for less eye strain
            paper: "#FFFFFF",      // Clean white cards
        },
        text: {
            primary: "#0F172A",    // Deep slate for sharp readability
            secondary: "#64748B",  // Soft slate for subtitles & metadata
        },
        success: {
            main: "#10B981",
            light: "#D1FAE5",
            dark: "#047857",
        },
        warning: {
            main: "#F59E0B",
            light: "#FEF3C7",
            dark: "#B45309",
        },
        error: {
            main: "#EF4444",
            light: "#FEE2E2",
            dark: "#B91C1C",
        },
        info: {
            main: "#3B82F6",
            light: "#DBEAFE",
            dark: "#1D4ED8",
        },
        divider: "#E2E8F0",
    },
    shape: {
        borderRadius: 12,          // Cozy rounded feel (Materio style)
    },
    typography: {
        fontFamily: [
            "-apple-system",
            "BlinkMacSystemFont",
            '"Segoe UI"',
            "Roboto",
            '"Helvetica Neue"',
            "Arial",
            "sans-serif",
        ].join(","),
        h1: { fontWeight: 700, letterSpacing: "-0.02em" },
        h2: { fontWeight: 700, letterSpacing: "-0.01em" },
        h3: { fontWeight: 600, letterSpacing: "-0.01em" },
        h4: { fontWeight: 600 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
        subtitle1: { color: "#64748B" },
        subtitle2: { color: "#64748B" },
        button: {
            textTransform: "none", // Capitalize ALL CAPS ko hatata hai taaki modern lage
            fontWeight: 600,
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    padding: "8px 18px",
                    boxShadow: "none",
                    "&:hover": {
                        boxShadow: "0 4px 12px rgba(79, 70, 229, 0.15)",
                    },
                },
                containedPrimary: {
                    "&:hover": {
                        backgroundColor: "#4338CA",
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.06), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 600,
                    borderRadius: 8,
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                size: "small",
            },
            styleOverrides: {
                root: {
                    "& .MuiOutlinedInput-root": {
                        borderRadius: 10,
                        backgroundColor: "#FFFFFF",
                    },
                },
            },
        },
    },
});
