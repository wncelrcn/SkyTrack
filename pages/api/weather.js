// weather.js
export async function getWeather(query) {
  let url;
  // Check if query is coordinates (contains comma) or city name
  if (query.includes(",")) {
    const [lat, lon] = query.split(",");
    url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHERMAP_API_KEY}`;
  } else {
    url = `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${process.env.OPENWEATHERMAP_API_KEY}`;
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch weather data");
  }
  const data = await res.json();
  return data;
}

export async function getHourlyForcast(lat, lon) {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHERMAP_API_KEY}`
  );
  if (!res.ok) {
    throw new Error("Failed to fetch forecast data");
  }
  const data = await res.json();
  return data;
}

export async function getReverseGeocoding(lat, lon) {
  const res = await fetch(
    `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${process.env.OPENWEATHERMAP_API_KEY}`
  );
  if (!res.ok) {
    throw new Error("Failed to fetch location data");
  }
  const data = await res.json();
  return data;
}
