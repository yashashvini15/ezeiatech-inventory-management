import { Chip } from "@mui/material";

export default function StatusBadge({ status, type = "order" }) {
    if (!status) return null;

    let color = "default";
    let variant = "filled";

    if (type === "payment") {
        switch (status) {
            case "PAID":
                color = "success";
                break;
            case "PENDING":
                color = "warning";
                break;
            case "CANCELLED":
            case "REFUNDED":
                color = "error";
                break;
            default:
                color = "default";
        }
    } else {
        switch (status) {
            case "PLACED":
                color = "info";
                break;
            case "CONFIRMED":
                color = "primary";
                break;
            case "PACKED":
                color = "secondary";
                break;
            case "SHIPPED":
                color = "warning";
                break;
            case "DELIVERED":
                color = "success";
                break;
            case "CANCELLED":
                color = "error";
                break;
            default:
                color = "default";
        }
    }

    return (
        <Chip
            label={status}
            color={color}
            size="small"
            variant={variant}
            sx={{
                fontWeight: 700,
                fontSize: "0.72rem",
                height: 22,
                letterSpacing: "0.03em",
                borderRadius: 1.5,
            }}
        />
    );
}
