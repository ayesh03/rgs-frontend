import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Switch, FormControlLabel,
    Typography, Box
} from "@mui/material";
import { useState, useEffect, useRef } from "react";

/* ──────────────────────────────────────────────
   Reusable Color Picker with Apply button
   ────────────────────────────────────────────── */
function ColorPickerWithApply({ label, value, onChange }) {
    const inputRef = useRef(null);
    const [pendingColor, setPendingColor] = useState(null); // holds un-applied color

    // Reset pending when the parent value changes from outside
    useEffect(() => {
        setPendingColor(null);
    }, [value]);

    const handleInputChange = (e) => {
        setPendingColor(e.target.value);           // store but don't apply yet
    };

    const handleApply = () => {
        if (pendingColor) {
            onChange(pendingColor);                 // commit to parent state
            setPendingColor(null);
        }
    };

    const handleDiscard = () => {
        setPendingColor(null);                     // revert to current
    };

    const displayColor = pendingColor || value;

    const hasPendingChange = pendingColor !== null && pendingColor !== value;

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1.5
            }}
        >
            <Typography sx={{ fontSize: "0.9rem", fontWeight: 500 }}>
                {label}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {/* Color swatch – clicking it opens the native picker */}
                <Box
                    onClick={() => inputRef.current?.click()}
                    sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 1,
                        border: "2px solid",
                        borderColor: hasPendingChange ? "#ffa726" : "#ccc",
                        backgroundColor: displayColor,
                        cursor: "pointer",
                        boxShadow: hasPendingChange
                            ? "0 0 0 2px rgba(255,167,38,0.35)"
                            : "none",
                        transition: "all 0.15s",
                        "&:hover": { opacity: 0.85 }
                    }}
                />

                {/* Hidden native input */}
                <input
                    ref={inputRef}
                    type="color"
                    value={displayColor}
                    onChange={handleInputChange}
                    style={{
                        position: "absolute",
                        width: 0,
                        height: 0,
                        opacity: 0,
                        pointerEvents: "none"
                    }}
                />

                {/* Apply / Discard buttons – only shown when there's a pending change */}
                {hasPendingChange && (
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                        <Button
                            size="small"
                            variant="contained"
                            onClick={handleApply}
                            sx={{
                                minWidth: 0,
                                px: 1.5,
                                py: 0.3,
                                fontSize: "0.75rem",
                                textTransform: "none",
                                backgroundColor: "#2e7d32",
                                "&:hover": { backgroundColor: "#1b5e20" }
                            }}
                        >
                            Apply
                        </Button>
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={handleDiscard}
                            sx={{
                                minWidth: 0,
                                px: 1.5,
                                py: 0.3,
                                fontSize: "0.75rem",
                                textTransform: "none",
                                borderColor: "#999",
                                color: "#666",
                                "&:hover": { borderColor: "#666", color: "#333" }
                            }}
                        >
                            ✕
                        </Button>
                    </Box>
                )}
            </Box>
        </Box>
    );
}

/* ──────────────────────────────────────────────
   Main Dialog
   ────────────────────────────────────────────── */
export default function GraphPropertiesPopup({
    open,
    onClose,
    onApply,
    current
}) {
    const [local, setLocal] = useState(current);

    useEffect(() => {
        setLocal(current);
    }, [current]);

    const handleChange = (key, value) => {
        setLocal(prev => ({ ...prev, [key]: value }));
    };

    return (
        <Dialog
            open={open}
            maxWidth="xs"
            fullWidth
            disableEscapeKeyDown
            onClose={(e, reason) => {
                if (reason === "backdropClick") return;
                onClose();
            }}
        >
            <DialogTitle sx={{ fontWeight: 700 }}>
                Graph Properties
            </DialogTitle>

            <DialogContent dividers>
                {/* ===== COLORS (each with its own Apply) ===== */}
                <ColorPickerWithApply
                    label="Nominal"
                    value={local.nominalColor}
                    onChange={(v) => handleChange("nominalColor", v)}
                />

                <ColorPickerWithApply
                    label="Reverse"
                    value={local.reverseColor}
                    onChange={(v) => handleChange("reverseColor", v)}
                />

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 1.5
                    }}
                >
                    <Typography sx={{ fontSize: "0.9rem", fontWeight: 500 }}>
                        Line Width
                    </Typography>
                    <input
                        type="number"
                        value={local.lineWidth}
                        onChange={(e) =>
                            handleChange("lineWidth", Number(e.target.value))
                        }
                        style={{ width: 60 }}
                    />
                </Box>

                <ColorPickerWithApply
                    label="Background"
                    value={local.bgColor}
                    onChange={(v) => handleChange("bgColor", v)}
                />

                <ColorPickerWithApply
                    label="Foreground"
                    value={local.fgColor}
                    onChange={(v) => handleChange("fgColor", v)}
                />

                <ColorPickerWithApply
                    label="Nominal Alt 1"
                    value={local.nominalAlt1 || "#f6f6f6"}
                    onChange={(v) => handleChange("nominalAlt1", v)}
                />

                <ColorPickerWithApply
                    label="Nominal Alt 2"
                    value={local.nominalAlt2 || "#2cb631"}
                    onChange={(v) => handleChange("nominalAlt2", v)}
                />

                <ColorPickerWithApply
                    label="Reverse Alt 1"
                    value={local.reverseAlt1 || "#90caf9"}
                    onChange={(v) => handleChange("reverseAlt1", v)}
                />

                <ColorPickerWithApply
                    label="Reverse Alt 2"
                    value={local.reverseAlt2 || "#c42d2d"}
                    onChange={(v) => handleChange("reverseAlt2", v)}
                />

                {/* ===== SWITCHES ===== */}
                <Box mt={2}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={local.showNominalShades || false}
                                onChange={(e) =>
                                    handleChange("showNominalShades", e.target.checked)
                                }
                            />
                        }
                        label="Show Nominal Shades"
                    />

                    <FormControlLabel
                        control={
                            <Switch
                                checked={local.showReverseShades || false}
                                onChange={(e) =>
                                    handleChange("showReverseShades", e.target.checked)
                                }
                            />
                        }
                        label="Show Reverse Shades"
                    />

                    <FormControlLabel
                        control={
                            <Switch
                                checked={local.showGrid}
                                onChange={(e) =>
                                    handleChange("showGrid", e.target.checked)
                                }
                            />
                        }
                        label="Show Grid Line"
                    />
                </Box>
            </DialogContent>

            {/* Bottom Apply still commits everything and closes the dialog */}
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={() => {
                        onApply(local);
                        onClose();
                    }}
                >
                    Apply
                </Button>
            </DialogActions>
        </Dialog>
    );
}