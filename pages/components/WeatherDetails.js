import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  styled,
  Divider,
} from "@mui/material";
import {
  Search as SearchIcon,
  WbSunny as SunIcon,
  Cloud as CloudIcon,
  CloudRain as RainIcon,
  Air as WindIcon,
  Opacity as RainDropIcon,
  DeviceThermostat as TempIcon,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { getWeather, getHourlyForcast } from "../api/weather";
import dynamic from "next/dynamic";
import WeatherReminder from "./WeatherReminder";
import WeatherAlert from "./WeatherAlert";
import Image from "next/image";

// Dynamic import for Map component
const Map = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => (
    <Box
      sx={{
        height: "220px",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f5f5f5",
      }}
    >
      Loading map...
    </Box>
  ),
});

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  height: "auto",
  boxShadow: "0px 4px 12px rgba(255, 255, 255, 0.1)",
}));

const ForecastPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  height: "460px",
  overflow: "hidden",
  border: "1px solid #03045E",
}));

const WeatherCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  height: "100%",
  background: "linear-gradient(135deg, #95AFEB 0%, #6B8AE5 100%)",
  color: "#FFFFFF",
}));

const WeatherDashboard = () => {
  const [city, setCity] = useState("Manila");
  const [searchValue, setSearchValue] = useState("");
  const [weatherData, setWeatherData] = useState({
    temp: 0,
    description: "",
    realFeel: 0,
    wind: 0,
    uvIndex: 2,
    chanceOfRain: 0,
  });
  const [hourlyData, setHourlyData] = useState([]);
  const [forecastData, setForecastData] = useState([]);

  const [coordinates, setCoordinates] = useState({
    lat: 14.5995, // Manila's default coordinates
    lon: 120.9842,
  });
  const [zoom, setZoom] = useState(11);

  const popularCities = {
    Manila: [120.9822, 14.6042],
    Dubai: [55.2708, 25.2048],
    Tokyo: [139.6917, 35.6895],
    Seoul: [126.978, 37.5665],
    Rome: [12.4964, 41.9028],
  };
  const [popularCityWeather, setPopularCityWeather] = useState({});

  useEffect(() => {
    const fetchWeatherForPopularCities = async () => {
      const weatherData = {};
      for (const city in popularCities) {
        const data = await getWeather(city);
        const weatherDescription = data.weather[0].description.replace(
          /\b\w/g,
          (char) => char.toUpperCase()
        );
        weatherData[city] = {
          description: weatherDescription,
          icon: data.weather[0].main.toLowerCase(),
        };
      }
      setPopularCityWeather(weatherData);
    };
    fetchWeatherForPopularCities();
  }, []);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const data = await getWeather(city);
        const temp = (data.main.temp - 273.15).toFixed(1);
        const description = data.weather[0].description;
        const realFeel = (data.main.feels_like - 273.15).toFixed(1);
        const wind = (data.wind.speed * 3.6).toFixed(1);

        // Calculate chance of rain based on weather conditions
        const calculateRainChance = (weatherData) => {
          const { clouds, main, weather } = weatherData;
          const weatherId = weather[0].id;
          const humidity = main.humidity;
          const cloudiness = clouds.all;

          // Weather condition codes for rain/precipitation
          const isRainy = weatherId >= 200 && weatherId < 700;

          if (isRainy) {
            // If it's already raining, high chance
            return Math.min(90 + humidity / 10, 100);
          } else {
            // Calculate based on humidity and cloudiness
            const baseChance = cloudiness * 0.3 + humidity * 0.3;

            // Adjust based on weather conditions
            let adjustedChance = baseChance;

            // Increase chance for cloudy conditions
            if (weatherId >= 801 && weatherId <= 804) {
              adjustedChance += 20;
            }

            // Decrease chance for clear conditions
            if (weatherId === 800) {
              adjustedChance *= 0.3;
            }

            console.log("Current Weather Data:", weatherData);
            return Math.min(Math.max(adjustedChance, 0), 100).toFixed(0);
          }
        };

        setCoordinates({
          lat: data.coord.lat,
          lon: data.coord.lon,
        });

        setWeatherData({
          temp,
          description:
            description.charAt(0).toUpperCase() + description.slice(1),
          realFeel,
          wind,
          uvIndex: 2,
          chanceOfRain: calculateRainChance(data),
        });

        // Fetch hourly forecast
        const hourlyForecast = await getHourlyForcast(
          data.coord.lat,
          data.coord.lon
        );
        const formattedHourlyData = hourlyForecast.list
          .slice(0, 8)
          .map((item) => ({
            time: new Date(item.dt * 1000).getHours() + ":00",
            temp: (item.main.temp - 273.15).toFixed(1),
            chanceOfRain: calculateRainChance(item), // Add rain chance to hourly data
          }));
        setHourlyData(formattedHourlyData);

        // Process 7-day forecast data
        const dailyForecasts = processDailyForecasts(hourlyForecast.list);
        setForecastData(dailyForecasts);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    };

    fetchWeatherData();
  }, [city]);

  // New function to process daily forecasts
  const processDailyForecasts = (forecastList) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Group forecasts by day
    const dailyData = {};

    forecastList.forEach((forecast) => {
      const date = new Date(forecast.dt * 1000);
      const dateKey = date.toISOString().split("T")[0];

      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          temps: [],
          date: date,
          weather: forecast.weather[0].main,
        };
      }

      dailyData[dateKey].temps.push(forecast.main.temp - 273.15);
    });

    // Process each day's data
    return Object.values(dailyData)
      .slice(0, 7)
      .map((day) => {
        const temps = day.temps;
        const high = Math.max(...temps).toFixed(1);
        const low = Math.min(...temps).toFixed(1);
        const date = day.date;

        return {
          date: `${date.getDate()} ${months[date.getMonth()]}, ${
            days[date.getDay()]
          }`,
          high: `${high}°`,
          low: `${low}°`,
          weather: day.weather,
        };
      });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      setCity(searchValue);
      setSearchValue("");
    }
  };

  const getWeatherIcon = (condition) => {
    if (!condition) return null; // Check if condition is undefined or null

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
      "default icon": "/default-weather.png",
    };

    const iconPath = weatherIcons[condition.toLowerCase()];

    if (iconPath) {
      return (
        <img src={iconPath} alt={condition} style={{ width: 50, height: 50 }} />
      );
    }
    return null; // Return null if no icon is found
  };

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

  return (
    <>
      <WeatherAlert weatherData={weatherData} />
      <Box
        sx={{
          bgcolor: "#F8F9FA",
          p: 4,
          ml: "120px",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        {/* Search Bar */}
        <Box sx={{ width: "100%" }}>
          <form onSubmit={handleSearch}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search for location"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              sx={{
                mb: 4,
                maxWidth: "none", // Remove max-width for full-row expansion
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  backgroundColor: "white",
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton type="submit">
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </form>
        </Box>

        {/* Content Grid */}
        <Grid container spacing={3}>
          {/* Current Weather */}
          <Grid item xs={12} md={3}>
            <WeatherCard
              sx={{
                height: "290px",
                borderRadius: 10,
                border: "1px solid #03045E",
              }}
            >
              <Typography
                variant="body1"
                sx={{ mb: 1, color: "rgba(255,255,255,0.9)" }}
              >
                Current Weather
              </Typography>
              <Typography variant="h4" sx={{ mb: 2, color: "white" }}>
                Hello {city}!
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {getWeatherIcon(weatherData.description)}
                <Box>
                  <Typography variant="h3" sx={{ color: "white" }}>
                    {weatherData.temp}°C
                  </Typography>
                  <Typography sx={{ color: "rgba(255,255,255,0.9)" }}>
                    {weatherData.description}
                  </Typography>
                </Box>
              </Box>
            </WeatherCard>
          </Grid>

          {/* Map */}
          <Grid item xs={12} md={6}>
            <StyledPaper sx={{ height: "290px", borderRadius: 10 }}>
              <Map
                center={[coordinates.lat, coordinates.lon]}
                zoom={zoom}
                city={city}
                weather={weatherData}
              />
            </StyledPaper>
          </Grid>

          {/* Popular Cities */}
          <Grid item xs={12} md={3}>
            <StyledPaper
              sx={{ height: "290px", overflow: "hidden", borderRadius: 10 }}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#2B3674",
                }}
              >
                Popular Cities
              </Typography>
              <Box>
                {Object.entries(popularCities).map(
                  ([cityName, coordinates]) => (
                    <Box
                      key={cityName}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingY: "9px",
                        "&:not(:last-child)": {
                          // borderBottom: "1px solid #eee",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          marginLeft: "16px",
                        }}
                      >
                        <Box
                          sx={{
                            width: "28px",
                            height: "28px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "4px",
                            boxSizing: "border-box",
                          }}
                        >
                          {getWeatherIcon(
                            popularCityWeather[cityName]?.description
                          )}
                        </Box>
                        <Typography
                          sx={{ fontSize: "14px", ml: 2, color: "#2B3674" }}
                        >
                          {cityName}
                        </Typography>
                      </Box>
                      <Typography
                        sx={{
                          fontSize: "14px",
                          textAlign: "right",
                          color: "#2B3674",
                        }}
                      >
                        {popularCityWeather[cityName]?.description ||
                          "Loading..."}
                      </Typography>
                    </Box>
                  )
                )}
              </Box>
            </StyledPaper>
          </Grid>

          {/* 7 Day Forecast */}
          <Grid item xs={12} md={3}>
            <ForecastPaper sx={{ borderRadius: 10 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#2B3674",
                }}
              >
                7 Day Forecast
              </Typography>
              <Box>
                {forecastData.map((day, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      py: 1.5,
                      color: "#2B3674",
                    }}
                  >
                    <Image
                      src="/default-weather.png"
                      width={40}
                      height={40}
                      alt={day.weather}
                    />
                    <Typography>{day.date}</Typography>
                    <Typography>
                      {day.high} / {day.low}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </ForecastPaper>
          </Grid>

          {/* Summary and Temperature Graph */}
          <Grid item xs={12} md={9}>
            <StyledPaper sx={{ height: "460px", borderRadius: 10 }}>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  {/* Left side content */}
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom>
                        Summary
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Grid container spacing={4}>
                        {/* Summary Items */}
                        <Grid item xs={4}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <RainDropIcon color="primary" />
                            <Box>
                              <Typography variant="body2">
                                Chance of Rain
                              </Typography>
                              <Typography variant="h4">
                                {weatherData.chanceOfRain}%
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={4}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <TempIcon color="primary" />
                            <Box>
                              <Typography variant="body2">Real Feel</Typography>
                              <Typography variant="h4">
                                {weatherData.realFeel}°
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={4}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <WindIcon color="primary" />
                            <Box>
                              <Typography variant="body2">Wind</Typography>
                              <Typography variant="h4">
                                {weatherData.wind} km/h
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </Grid>
                    {/* Temperature Graph */}
                    <Grid item xs={12}>
                      <Box sx={{ width: "100%", height: 300 }}>
                        <LineChart
                          width={600}
                          height={300}
                          data={hourlyData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
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
                            strokeWidth={3}
                            dot={<CustomizedDot />}
                            activeDot={{ r: 2, fill: "#0066FF" }}
                          />
                        </LineChart>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Weather Reminder - Right side */}
                <Grid item xs={4} sx={{ mt: 0 }}>
                  <Box sx={{ height: "100%" }}>
                    <WeatherReminder weatherData={weatherData} />
                  </Box>
                </Grid>
              </Grid>
            </StyledPaper>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default WeatherDashboard;
