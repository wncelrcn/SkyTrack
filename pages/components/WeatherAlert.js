import React, { useEffect, useState } from "react";
import { Alert, AlertTitle, IconButton, Box, Slide } from "@mui/material";
import { VolumeUp, VolumeOff, Close } from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const AlertContainer = styled(Box)(({ theme }) => ({
  position: "fixed",
  top: theme.spacing(2),
  right: theme.spacing(2),
  zIndex: 1500,
  width: "400px",
  "& > * + *": {
    marginTop: theme.spacing(2),
  },
}));

const StyledAlert = styled(Alert)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  "& .MuiAlert-message": {
    width: "100%",
  },
}));

const WeatherAlert = ({ weatherData }) => {
  console.log("Weather data in WeatherAlert:", weatherData);
  const [alerts, setAlerts] = useState([]);
  const [isMuted, setIsMuted] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [audioContext, setAudioContext] = useState(null);

  const initializeAudio = () => {
    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      setAudioContext(context);
      setAudioEnabled(true);
      setIsMuted(false);
      if (context.state === "suspended") {
        context.resume();
      }
    } catch (error) {
      console.error("Failed to initialize audio context:", error);
    }
  };

  useEffect(() => {
    if (weatherData) {
      checkForSevereConditions(weatherData);
    }
  }, [weatherData]);

  const kelvinToCelsius = (kelvin) => kelvin - 273.15;

  const checkForSevereConditions = (data) => {
    const newAlerts = [];

    const tempCelsius = parseFloat(data.temp || 0);
    const realFeel = parseFloat(data.realFeel || 0);
    const windSpeed = parseFloat(data.wind || 0);
    const rainfall = parseFloat(data.rain || 0); // Assuming data.rain is provided in mm
    const description = data.description?.toLowerCase() || "";

    // Extreme Heat Warning
    if (tempCelsius > 40) {
      newAlerts.push({
        severity: "error",
        title: "Extreme Heat Warning",
        message: `Current temperature is ${tempCelsius.toFixed(
          1
        )}°C. Stay indoors, stay hydrated, and avoid prolonged sun exposure.`,
        audio: "Extreme heat warning. Please stay indoors and stay hydrated.",
      });
    }

    // Extreme Cold Warning
    if (tempCelsius < -10) {
      newAlerts.push({
        severity: "warning",
        title: "Extreme Cold Warning",
        message: `Current temperature is ${tempCelsius.toFixed(
          1
        )}°C. Dress warmly and avoid prolonged exposure to the cold.`,
        audio:
          "Extreme cold warning. Please dress warmly and avoid exposure to the cold.",
      });
    }

    // Severe Storm Warning
    if (
      description.includes("thunderstorm") ||
      description.includes("storm") ||
      description.includes("tornado")
    ) {
      newAlerts.push({
        severity: "error",
        title: "Severe Storm Warning",
        message:
          "Severe storm detected in your area. Seek shelter immediately.",
        audio: "Severe storm warning. Please seek shelter immediately.",
      });
    }

    // High Wind Warning
    if (windSpeed > 40) {
      newAlerts.push({
        severity: "warning",
        title: "High Wind Warning",
        message: `Strong winds of ${windSpeed.toFixed(
          1
        )} km/h detected. Secure loose objects and avoid outdoor activities.`,
        audio:
          "High wind warning. Please secure outdoor objects and avoid travel if possible.",
      });
    }

    // Heavy Rainfall Warning
    if (description.includes("rain") && rainfall > 50) {
      newAlerts.push({
        severity: "warning",
        title: "Heavy Rainfall Warning",
        message: `Heavy rainfall detected: ${rainfall.toFixed(
          1
        )} mm. Watch out for flooding and avoid waterlogged areas.`,
        audio:
          "Heavy rainfall warning. Please avoid waterlogged areas and watch out for flooding.",
      });
    }

    // Log generated alerts for debugging
    console.log("Generated alerts:", newAlerts);

    // Update alerts and play audio if necessary
    setAlerts(newAlerts);
    if (newAlerts.length > 0 && audioEnabled && !isMuted) {
      playAlerts(newAlerts);
    }
  };

  const playAlerts = async (alertsToPlay) => {
    if (!audioContext || !audioEnabled) return;

    for (const alert of alertsToPlay) {
      await playAudioAlert(alert.audio);
    }
  };

  const playAudioAlert = (text) => {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = resolve;
      window.speechSynthesis.speak(utterance);
    });
  };

  const toggleMute = () => {
    if (!audioEnabled) {
      initializeAudio();
    } else {
      setIsMuted(!isMuted);
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    }
  };

  const removeAlert = (index) => {
    setAlerts((prevAlerts) => prevAlerts.filter((_, i) => i !== index));
  };

  if (!weatherData || alerts.length === 0) return null;

  return (
    <AlertContainer>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
        <IconButton
          onClick={toggleMute}
          sx={{
            bgcolor: "background.paper",
            boxShadow: 1,
            "&:hover": {
              bgcolor: "grey.100",
            },
          }}
        >
          {isMuted || !audioEnabled ? <VolumeOff /> : <VolumeUp />}
        </IconButton>
      </Box>
      {!audioEnabled && alerts.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <AlertTitle>Enable Audio Alerts</AlertTitle>
          Click the mute button above to enable audio alerts for severe weather
          conditions.
        </Alert>
      )}
      {alerts.map((alert, index) => (
        <Slide direction="left" in={true} key={index}>
          <StyledAlert
            severity={alert.severity}
            action={
              <IconButton
                size="small"
                onClick={() => removeAlert(index)}
                aria-label="close"
              >
                <Close fontSize="small" />
              </IconButton>
            }
          >
            <AlertTitle sx={{ fontWeight: "bold" }}>{alert.title}</AlertTitle>
            {alert.message}
          </StyledAlert>
        </Slide>
      ))}
    </AlertContainer>
  );
};

export default WeatherAlert;
