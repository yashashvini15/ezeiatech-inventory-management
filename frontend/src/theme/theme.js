import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#4338CA",       // Soft, classic Indigo (elegant, not harsh)
            light: "#6366F1",
            dark: "#312E81",
            contrastText: "#FFFFFF",
        },
        secondary: {
            main: "#D97706",       // Muted warm Honey / Amber (soft cozy vibe)
            light: "#FDE68A",
            dark: "#92400E",
            contrastText: "#FFFFFF",
        },
        background: {
            default: "#F9FAFB",    // Extremely soft neutral canvas
            paper: "#FFFFFF",      // Clean white cards
        },
        text: {
            primary: "#1E293B",    // Refined slate (calm & readable, not harsh pitch black)
            secondary: "#64748B",  // Soft slate for captions
        },
        success: {
            main: "#059669",
            light: "#ECFDF5",
            dark: "#047857",
        },
        warning: {
            main: "#D97706",
            light: "#FEF3C7",
            dark: "#92400E",
        },
        error: {
            main: "#DC2626",
            light: "#FEF2F2",
            dark: "#991B1B",
        },
        info: {
            main: "#2563EB",
            light: "#EFF6FF",
            dark: "#1D4ED8",
        },
        divider: "rgba(226, 232, 240, 0.8)",
    },
    shape: {
        borderRadius: 10,          // Balanced classic radius
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
        // Refined, calm sizes (no screaming fonts)
        h1: { fontSize: "1.85rem", fontWeight: 600, letterSpacing: "-0.015em", color: "#1E293B" },
        h2: { fontSize: "1.55rem", fontWeight: 600, letterSpacing: "-0.015em", color: "#1E293B" },
        h3: { fontSize: "1.3rem", fontWeight: 600, letterSpacing: "-0.01em", color: "#1E293B" },
        h4: { fontSize: "1.15rem", fontWeight: 600, letterSpacing: "-0.01em", color: "#1E293B" },
        h5: { fontSize: "1.02rem", fontWeight: 600, letterSpacing: "-0.005em", color: "#1E293B" },
        h6: { fontSize: "0.92rem", fontWeight: 600, color: "#1E293B" },
        subtitle1: { fontSize: "0.9rem", color: "#64748B" },
        subtitle2: { fontSize: "0.82rem", color: "#64748B" },
        body1: { fontSize: "0.9rem", color: "#334155" },
        body2: { fontSize: "0.83rem", color: "#64748B" },
        button: {
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.85rem",
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    padding: "6px 14px",
                    boxShadow: "none",
                    "&:hover": {
                        boxShadow: "0 2px 6px rgba(67, 56, 202, 0.12)",
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    border: "1px solid rgba(226, 232, 240, 0.8)",
                    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
                    transition: "all 0.15s ease-in-out",
                    "&:hover": {
                        boxShadow: "0 4px 12px 0 rgba(0, 0, 0, 0.05)",
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 600,
                    borderRadius: 6,
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
                        borderRadius: 8,
                        backgroundColor: "#FFFFFF",
                    },
                },
            },
        },
    },
});
