import React, { useState, useEffect } from "react";
import { IonModal, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons, IonIcon } from "@ionic/react";
import { closeOutline } from "ionicons/icons";
import "./TimeRangeModal.css";

interface TimeRangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (value: string, label: string, customRange?: { start: string; end: string }) => void;
    selectedRange: string;
    theme: "dark" | "light";
    title?: string;
    customTitle?: string;
}

type ThemeVars = React.CSSProperties & {
    "--bg-main": string;
    "--text-main": string;
    "--card-bg": string;
    "--border-color": string;
    "--input-bg": string;
    "--shadow": string;
};

const TimeRangeModal: React.FC<TimeRangeModalProps> = ({
    isOpen,
    onClose,
    onSelect,
    selectedRange,
    theme,
    title,
    customTitle,
}) => {
    const [showCustomModal, setShowCustomModal] = useState(false);
    const [customStartDate, setCustomStartDate] = useState("");
    const [customStartTime, setCustomStartTime] = useState("");
    const [customEndDate, setCustomEndDate] = useState("");
    const [customEndTime, setCustomEndTime] = useState("");

    // Get default datetime values for custom range
    useEffect(() => {
        if (showCustomModal && !customStartDate) {
            const now = new Date();
            const defaultStartDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
            const defaultStartDateStr = defaultStartDate.toISOString().split('T')[0];
            const defaultStartTimeStr = defaultStartDate.toTimeString().split(' ')[0].substring(0, 5);
            const defaultEndDateStr = now.toISOString().split('T')[0];
            const defaultEndTimeStr = now.toTimeString().split(' ')[0].substring(0, 5);
            
            setCustomStartDate(defaultStartDateStr);
            setCustomStartTime(defaultStartTimeStr);
            setCustomEndDate(defaultEndDateStr);
            setCustomEndTime(defaultEndTimeStr);
        }
    }, [showCustomModal, customStartDate]);

    if (!isOpen) return null;

    const fixedOptions = [
        { label: "5 min", value: "5m" },
        { label: "30 min", value: "30m" },
        { label: "6 hr", value: "6h" },
        { label: "12 hr", value: "12h" },
        { label: "24 hr", value: "24h" },
        { label: "This Week", value: "thisWeek" },
        { label: "Last Week", value: "lastWeek" },
        { label: "This Month", value: "thisMonth" },
        { label: "Last Month", value: "lastMonth" },
        { label: "Custom", value: "custom" }
    ];

    const handleOptionClick = (option: { label: string; value: string }) => {
        if (option.value === "custom") {
            setShowCustomModal(true);
        } else {
            onSelect(option.value, option.label);
            onClose();
        }
    };

    const handleCustomApply = () => {
        if (customStartDate && customStartTime && customEndDate && customEndTime) {
            const startDateTime = `${customStartDate}T${customStartTime}`;
            const endDateTime = `${customEndDate}T${customEndTime}`;
            onSelect("custom", `Custom (${customStartDate} ${customStartTime} - ${customEndDate} ${customEndTime})`, {
                start: startDateTime,
                end: endDateTime
            });
            onClose();
        }
    };

    const handleCustomCancel = () => {
        setShowCustomModal(false);
        setCustomStartDate("");
        setCustomStartTime("");
        setCustomEndDate("");
        setCustomEndTime("");
    };

    const themeStyles: ThemeVars = theme === "light" ? {
        "--bg-main": "#f9fafb",
        "--text-main": "#1f2937",
        "--card-bg": "#ffffff",
        "--border-color": "#d1d5db",
        "--input-bg": "#f3f4f6",
        "--shadow": "0 4px 12px rgba(0,0,0,0.1)",
    } : {
        "--bg-main": "#020617",
        "--text-main": "#f9fafb",
        "--card-bg": "#0f172a",
        "--border-color": "rgba(255,255,255,0.15)",
        "--input-bg": "#1e293b",
        "--shadow": "0 4px 12px rgba(0,0,0,0.4)",
    };

    // Smaller breakpoint for the simple grid view (avoids extra empty space).
    // Larger breakpoint for the custom form (needs more room).
    const initialBreakpoint = showCustomModal ? 0.85 : 0.55;
    const breakpoints = showCustomModal ? [0, 0.85, 0.95] : [0, 0.55, 0.85];

    return (
        <IonModal
            isOpen={isOpen}
            onDidDismiss={onClose}
            initialBreakpoint={initialBreakpoint}
            breakpoints={breakpoints}
            className="time-range-modal"
            style={themeStyles}
        >
            <IonHeader className="ion-no-border">
                <IonToolbar>
                    <IonTitle>
                        {showCustomModal
                            ? (customTitle ?? "Custom Date Range")
                            : (title ?? "Select Time Range")}
                    </IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={showCustomModal ? handleCustomCancel : onClose}>
                            <IonIcon icon={closeOutline} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                {showCustomModal ? (
                    <div className="custom-range-form" style={{ marginTop: '1rem' }}>
                        <div className="form-group">
                            <label>Start Date & Time</label>
                            <div className="datetime-inputs">
                                <input
                                    type="date"
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                    max={customEndDate || new Date().toISOString().split('T')[0]}
                                />
                                <input
                                    type="time"
                                    value={customStartTime}
                                    onChange={(e) => setCustomStartTime(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="form-group" style={{ marginTop: '1rem' }}>
                            <label>End Date & Time</label>
                            <div className="datetime-inputs">
                                <input
                                    type="date"
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                    min={customStartDate}
                                    max={new Date().toISOString().split('T')[0]}
                                />
                                <input
                                    type="time"
                                    value={customEndTime}
                                    onChange={(e) => setCustomEndTime(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                            <button className="btn cancel-btn" onClick={handleCustomCancel}>
                                Cancel
                            </button>
                            <button
                                className="btn apply-btn"
                                onClick={handleCustomApply}
                                disabled={!customStartDate || !customStartTime || !customEndDate || !customEndTime}
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="time-range-options">
                        {fixedOptions.map((option) => (
                            <div
                                key={option.value}
                                className={`time-range-option ${selectedRange === option.value ? "selected" : ""}`}
                                onClick={() => handleOptionClick(option)}
                            >
                                {option.label}
                            </div>
                        ))}
                    </div>
                )}
            </IonContent>
        </IonModal>
    );
};

export default TimeRangeModal;
