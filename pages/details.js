import Link from "next/link";
import Head from "next/head";
import Sidebar from "./components/Sidebar";
import WeatherDetails from "./components/WeatherDetails";

export default function Details() {
  return (
    <>
      <Head>
        <title>SkyTrackp</title>
        <meta name="description" content="Weather dashboard application" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="notification-permission" content="weather-alerts" />
        <link rel="icon" type="image/png" href="/weather-logo.png" />
      </Head>
      <Sidebar />
      <WeatherDetails />
    </>
  );
}
