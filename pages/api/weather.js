export async function getWeather(query) {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;
  let url;

  if (query.includes(",")) {
    const [lat, lon] = query.split(",");
    url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  } else {
    url = `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${apiKey}`;
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch weather data");
  }
  return await res.json();
}

export async function getHourlyForcast(lat, lon) {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`
  );
  if (!res.ok) {
    throw new Error("Failed to fetch forecast data");
  }
  return await res.json();
}

export async function getReverseGeocoding(lat, lon) {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OpenWeatherMap API key");
  }

  const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;
  console.log("Fetching:", url); // helpful for debugging

  const res = await fetch(url);
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(
      `Failed to fetch location data: ${res.status} - ${errorText}`
    );
  }

  return await res.json();
}
