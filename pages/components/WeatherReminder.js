import React from 'react';
import {
  Box,
  Typography,
  Alert,
  AlertTitle,
  Stack
} from '@mui/material';
import {
  WbSunny as SunIcon,
  Umbrella as UmbrellaIcon,
  Opacity as DropletIcon,
  Air as WindIcon,
  NotificationsActive as BellIcon
} from '@mui/icons-material';

const WeatherReminder = ({ weatherData }) => {
  const getReminders = () => {
    const reminders = [];
    const temp = parseFloat(weatherData.temp);
    const chanceOfRain = parseFloat(weatherData.chanceOfRain);
    const windSpeed = parseFloat(weatherData.wind);

    // Heat-related reminders
    if (temp >= 35) {
      reminders.push({
        severity: 'warning',
        icon: <SunIcon />,
        title: 'Extreme Heat Alert',
        message: 'Stay hydrated! Bring water and avoid prolonged sun exposure.'
      });
    } else if (temp >= 30) {
      reminders.push({
        severity: 'warning',
        icon: <DropletIcon />,
        title: 'Heat Advisory',
        message: 'Remember to drink plenty of water and bring sun protection.'
      });
    }

    // Rain-related reminders
    if (chanceOfRain >= 29) {
      reminders.push({
        severity: 'info',
        icon: <UmbrellaIcon />,
        title: 'Rain Likely',
        message: 'Don\'t forget your umbrella or raincoat!'
      });
    }

    // Cold weather reminders
    if (temp <= 20) {
      reminders.push({
        severity: 'info',
        icon: <WindIcon />,
        title: 'Cool Weather Alert',
        message: 'Bring a light jacket or sweater today.'
      });
    } else if (temp <= 15) {
      reminders.push({
        severity: 'warning',
        icon: <WindIcon />,
        title: 'Cold Weather Alert',
        message: 'Bundle up! Wear warm clothing and bring a jacket.'
      });
    }

    return reminders;
  };

  const reminders = getReminders();

  if (reminders.length === 0) {
    return null;
  }
// In WeatherReminder.js
return (
    <Box sx={{ p: 0, width: "100%" }}>  {/* Removed padding and set full width */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <BellIcon color="primary" />
        <Typography variant="h6">Weather Reminders</Typography>
      </Box>
      <Stack spacing={2} sx={{ mt: 0 }}>  {/* Removed top margin */}
        {reminders.map((reminder, index) => (
          <Alert 
            key={index} 
            severity={reminder.severity}
            icon={reminder.icon}
            sx={{
              '& .MuiAlert-icon': {
                alignItems: 'center'
              }
            }}
          >
            <AlertTitle sx={{ fontWeight: 'bold' }}>{reminder.title}</AlertTitle>
            <Typography variant="body2">{reminder.message}</Typography>
          </Alert>
        ))}
      </Stack>
    </Box>
  );
};

export default WeatherReminder;