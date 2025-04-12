"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  styled,
  useTheme,
  Button,
  Alert,
} from "@mui/material";
import CloudIcon from "@mui/icons-material/Cloud";
import AirIcon from "@mui/icons-material/Air";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import {
  getWeather,
  getHourlyForcast,
  getReverseGeocoding,
} from "../api/weather";
import Image from "next/image";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { useRouter } from "next/navigation";
import Map from "../../components/Map";

// Styled Components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 24,
  height: "100%",
}));

const WeatherCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 24,
  background: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  height: "100%",
}));

const AirCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 24,
  background: "#F3F9EF",
  height: "100%",
}));

const TemperatureCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 24,
  background: "#E8F1FF",
  height: "100%",
}));

const WeatherDashboard = () => {
  const theme = useTheme();

  // State management
  const [weatherData, setWeatherData] = useState({
    temp: 0,
    tempDesc: "",
    chanceOfRain: 0,
    airCondition: "",
    humidity: 0,
    realFeel: 0,
    realFeelDesc: "",
  });

  const [location, setLocation] = useState({
    lat: null,
    lon: null,
    cityName: "Loading...",
    error: null,
  });

  const [forecastData, setForecastData] = useState([]);
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [currentTime, setCurrentTime] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Custom dot component for the chart
  const CustomizedDot = (props) => {
    const { cx, cy } = props;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill="#FFF"
        stroke="#0066FF"
        strokeWidth={2}
      />
    );
  };

  const formatYAxis = (value) => `${value}°C`;

  // Get user's location and fetch weather data
  const getLocation = () => {
    setIsLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // Update location state
          setLocation((prev) => ({
            ...prev,
            lat: latitude,
            lon: longitude,
          }));

          // Get city name
          const geoData = await getReverseGeocoding(latitude, longitude);
          setLocation((prev) => ({
            ...prev,
            cityName: geoData[0].name,
          }));

          // Fetch weather data
          const weatherResponse = await getWeather(`${latitude},${longitude}`);

          setWeatherData({
            temp: (weatherResponse.main.temp - 273.15).toFixed(2),
            tempDesc: weatherResponse.weather[0].description,
            chanceOfRain: Math.min(weatherResponse.clouds.all, 100),
            airCondition: weatherResponse.wind.speed,
            humidity: weatherResponse.main.humidity,
            realFeel: (weatherResponse.main.feels_like - 273.15).toFixed(2),
            realFeelDesc: weatherResponse.weather[0].main,
          });

          // Fetch and process forecast data
          const forecastResponse = await getHourlyForcast(latitude, longitude);
          processHourlyForecast(forecastResponse);
          processTemperatureForecast(forecastResponse);
        } catch (err) {
          setError("Error fetching weather data. Please try again later.");
          console.error("Error:", err);
        } finally {
          setIsLoading(false);
        }
      },
      (err) => {
        setError(
          "Unable to retrieve your location. Please enable location services."
        );
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 22) return "Good Evening";
    return "Good Night";
  };

  // Process hourly forecast data
  const processHourlyForecast = (data) => {
    const timeSlots = ["06:00", "09:00", "12:00", "15:00", "18:00", "21:00"];
    const filtered = data.list
      .filter((forecast) => {
        const forecastTime = forecast.dt_txt.split(" ")[1].slice(0, 5);
        return timeSlots.includes(forecastTime);
      })
      .reduce((acc, current) => {
        const existing = acc.find(
          (forecast) =>
            forecast.dt_txt.split(" ")[1].slice(0, 5) ===
            current.dt_txt.split(" ")[1].slice(0, 5)
        );
        if (!existing) {
          acc.push(current);
        }
        return acc;
      }, []);
    setHourlyForecast(filtered);
  };

  // Process temperature forecast data
  const processTemperatureForecast = (data) => {
    const processedData = data.list.slice(0, 8).map((item) => ({
      forecastTime: item.dt_txt.split(" ")[1].slice(0, 5),
      temp: (item.main.temp - 273.15).toFixed(1),
      timestamp: item.dt,
    }));
    setForecastData(processedData);
  };

  // Update current time
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Initial location fetch
  useEffect(() => {
    getLocation();
  }, []);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography variant="h5">Loading weather data...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 4,
        ml: "120px",
        bgcolor: "#F8F9FA",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Button
          variant="contained"
          startIcon={<LocationOnIcon />}
          onClick={getLocation}
        >
          Update Location
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 3, flex: 1 }}>
        <Grid container spacing={3} sx={{ flex: 3 }}>
          {/* Weather Card */}
          <Grid item xs={12} md={6}>
            <WeatherCard
              elevation={0}
              sx={{
                backgroundImage: `url('/bg-mountain.png')`,
                borderRadius: 6,
                backgroundSize: "cover",
                color: "white",
                border: "1px solid #03045E",
              }}
            >
              <Box
                sx={{
                  mb: 7,
                  mt: 2,
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#FFFFFF",
                  width: "fit-content",
                  borderRadius: 1,
                  p: 1,
                }}
              >
                <CloudIcon sx={{ fontSize: 32, mb: 1, color: "#A4C8FA" }} />
                <Box sx={{ ml: 2 }}>
                  <Typography
                    variant="h9"
                    sx={{ color: "#2B3674", fontWeight: 900 }}
                  >
                    Weather in {location.cityName}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#707EAE" }}>
                    Current Conditions
                  </Typography>
                </Box>
              </Box>

              <Typography
                variant="h1"
                sx={{ mb: 1, fontSize: "55px", fontWeight: 900 }}
              >
                {weatherData.temp}°C
              </Typography>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                {weatherData.tempDesc.replace(/\b\w/g, (char) =>
                  char.toUpperCase()
                )}
              </Typography>
              <Box sx={{ mt: 4 }}>
                <Typography
                  variant="h2"
                  sx={{ fontSize: "55px", fontWeight: 900 }}
                >
                  {weatherData.chanceOfRain}%
                </Typography>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                  Chance of Rain
                </Typography>
              </Box>
            </WeatherCard>
          </Grid>

          {/* Air Condition Card */}
          <Grid item xs={12} md={6}>
            <AirCard
              elevation={0}
              sx={{
                backgroundImage: `url('/bg-green.png')`,
                backgroundSize: "cover",
                borderRadius: 6,
                color: "white",
                border: "1px solid #03045E",
              }}
            >
              <Box
                sx={{
                  mb: 7,
                  mt: 2,
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#FFFFFF",
                  width: "fit-content",
                  borderRadius: 1,
                  p: 1,
                }}
              >
                <AirIcon sx={{ fontSize: 32, mb: 1, color: "#A4C8FA" }} />
                <Box sx={{ ml: 2 }}>
                  <Typography
                    variant="h9"
                    sx={{ color: "#2B3674", fontWeight: 900 }}
                  >
                    Air Condition
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#707EAE" }}>
                    What's the air condition?
                  </Typography>
                </Box>
              </Box>
              <Grid container spacing={2} sx={{ mt: 4 }}>
                <Grid item xs={6}>
                  <Box sx={{ display: "flex", alignItems: "end" }}>
                    <Typography
                      variant="h1"
                      sx={{ mb: 1, fontSize: "55px", fontWeight: 900 }}
                    >
                      {weatherData.airCondition}
                    </Typography>
                    <Typography variant="body1" sx={{ ml: 1, mb: 1 }}>
                      km/h
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 400 }}>
                    Wind
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography
                    variant="h1"
                    sx={{ mb: 1, fontSize: "55px", fontWeight: 900 }}
                  >
                    {weatherData.humidity}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 400 }}>
                    Humidity
                  </Typography>
                </Grid>
              </Grid>
            </AirCard>
          </Grid>

          {/* Temperature Chart */}
          <Grid item xs={12} md={8}>
            <StyledPaper elevation={0}>
              <Typography
                variant="h6"
                sx={{ mb: 2, color: "#2B3674", fontWeight: 700 }}
              >
                Temperature Forecast
              </Typography>
              <Box
                sx={{ height: 300, bgcolor: "white", borderRadius: 2, p: 2 }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={forecastData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#E9EDF7"
                    />
                    <XAxis
                      dataKey="forecastTime"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#707EAE", fontSize: 12 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#707EAE", fontSize: 12 }}
                      domain={["dataMin - 5", "dataMax + 5"]}
                      ticks={[10, 20, 30, 40, 50]}
                      tickFormatter={formatYAxis}
                    />
                    <Line
                      type="monotone"
                      dataKey="temp"
                      stroke="#0066FF"
                      strokeWidth={2}
                      dot={<CustomizedDot />}
                      activeDot={{ r: 6, fill: "#0066FF" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </StyledPaper>
          </Grid>

          {/* Temperature Feel Card */}
          <Grid item xs={12} md={4}>
            <TemperatureCard
              elevation={0}
              sx={{
                backgroundSize: "cover",
                color: "white",
                backgroundImage: `url('/bg-umbrella.png')`,
                border: "1px solid #03045E",
                borderRadius: 6,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "100%",
              }}
            >
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 900 }}>
                  Temperature Feel
                </Typography>
                <Typography
                  variant="h2"
                  sx={{ mb: 1, mt: 2, fontWeight: 900, fontSize: 40 }}
                >
                  {weatherData.realFeelDesc}
                </Typography>
              </Box>
              <Box sx={{ mt: "auto", mb: 2 }}>
                <Typography variant="h4" sx={{ mb: 1, fontWeight: 900 }}>
                  {weatherData.realFeel}°C
                </Typography>
                <Typography variant="h6">
                  {weatherData.tempDesc.replace(/\b\w/g, (char) =>
                    char.toUpperCase()
                  )}
                </Typography>
              </Box>
            </TemperatureCard>
          </Grid>
        </Grid>

        {/* Weather Forecast */}
        <StyledPaper
          elevation={0}
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
            height: "100%",
          }}
        >
          <Box sx={{ textAlign: "center", color: "#2B3674", mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 900 }}>
              {`${getTimeBasedGreeting()} ${location.cityName}`}.
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              {currentTime}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              alignItems: "center",
            }}
          >
            {hourlyForecast.map((forecast, index) => {
              const forecastTime = forecast.dt_txt.split(" ")[1].slice(0, 5);
              const tempInCelsius = (forecast.main.temp - 273.15).toFixed(0);
              const condition = forecast.weather[0].description;

              // Map descriptions to image paths-
              const weatherIcons = {
                "clear sky": "/clear-sky.png",
                "few clouds": "/few-clouds.png",
                "scattered clouds": "/scattered-clouds.png",
                "broken clouds": "/broken-clouds.png",
                "shower rain": "/shower-rain.png",
                rain: "/rain.png",
                thunderstorm: "/thunderstorm.png",
                snow: "/snow.png",
                mist: "/mist.png",
                "overcast clouds": "/overcast-clouds.png",
                "light rain": "/light-rain.png",
              };

              // Default to a generic weather icon if description is not found
              const weatherIcon =
                weatherIcons[condition.toLowerCase()] || "/default-weather.png";

              return (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    padding: "8px 0",
                  }}
                >
                  {/* Dynamic Weather Icon */}
                  <Image
                    src={weatherIcon}
                    width={80}
                    height={80}
                    alt={condition}
                  />

                  {/* Forecast Details */}
                  <Box sx={{ ml: 5 }}>
                    <Typography
                      color="text.secondary"
                      sx={{ fontSize: "16px" }}
                    >
                      {forecastTime}
                    </Typography>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 900,
                        fontSize: "28px",
                        color: "#2B3674",
                      }}
                    >
                      {tempInCelsius}°C
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      {condition.replace(/\b\w/g, (char) => char.toUpperCase())}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </StyledPaper>
      </Box>
    </Box>
  );
};

export default WeatherDashboard;
