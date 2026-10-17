import { Box, Button, Typography, Paper, Alert } from "@mui/material";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";

export default function ErrorBoundaryFallback({ error, resetErrorBoundary }) {
    const handleHomeClick = () => {
        window.location.href = "/";
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "background.default",
                p: 3,
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    maxWidth: 520,
                    width: "100%",
                    p: { xs: 3, sm: 5 },
                    textAlign: "center",
                    borderRadius: 4,
                    border: "1px solid",
                    borderColor: "divider",
                }}
            >
                <Box
                    sx={{
                        width: 72,
                        height: 72,
                        borderRadius: "50%",
                        backgroundColor: "error.light",
                        color: "error.main",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                        mb: 2.5,
                    }}
                >
                    <ErrorOutlineRoundedIcon sx={{ fontSize: 40 }} />
                </Box>

                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: "text.primary" }}>
                    Oops! Something went wrong
                </Typography>

                <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
                    An unexpected error occurred while rendering this component. You can try refreshing the view or returning to the dashboard.
                </Typography>

                {error?.message && (
                    <Alert
                        severity="error"
                        sx={{
                            mb: 3,
                            textAlign: "left",
                            borderRadius: 2,
                            wordBreak: "break-word",
                            fontSize: "0.85rem",
                        }}
                    >
                        {error.message}
                    </Alert>
                )}

                <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
                    <Button
                        variant="outlined"
                        color="inherit"
                        startIcon={<RefreshRoundedIcon />}
                        onClick={resetErrorBoundary}
                    >
                        Try Again
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<HomeRoundedIcon />}
                        onClick={handleHomeClick}
                    >
                        Back to Home
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}
