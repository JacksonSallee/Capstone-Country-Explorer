const https = require('https');
const EventEmitter = require('events');

const countryAPI = new EventEmitter();

let countriesData = null;

function mapCountry(country) {
  const name = {
    common: country?.name?.common ?? "",
    official: country?.name?.official ?? "",
  };

  const capital = Array.isArray(country?.capital)
    ? country.capital[0] ?? ""
    : country?.capital ?? "";

  const flags = {
    svg: country?.flags?.svg ?? "",
    png: country?.flags?.png ?? "",
  };

  const currencies = country?.currencies
    ? Object.entries(country.currencies).map(([code, info]) => ({
        code,
        name: info?.name ?? "",
        symbol: info?.symbol ?? "",
      }))
    : [];

  const languages = country?.languages
    ? Object.values(country.languages).map((langName) => ({
        name: langName ?? "",
        nativeName: langName ?? "",
      }))
    : [];

  return {
    name,
    capital,
    subregion: country?.subregion ?? "",
    region: country?.region ?? "",
    population: country?.population ?? 0,
    flags,
    currencies,
    languages,
  };
}

function fetchCountries() {
  return new Promise(function (resolve, reject) {
    const API_URL =
      'https://restcountries.com/v3.1/all?fields=name,capital,flags,currencies,languages,region,subregion,population&fullText=True';

    let req = https.get(API_URL, function (res) {
      let data = '';

      // A chunk of data has been received.
      res.on('data', function (chunk) {
        data += chunk;
      });

      // The whole response has been received.
      res.on('end', function () {
        try {
          const parsed = JSON.parse(data);
          const mapped = Array.isArray(parsed)
            ? parsed.map(mapCountry)
            : [];
          countriesData = mapped;
          resolve(mapped);
        } catch (err) {
          reject(err);
        }
      });
    });

    // Handle errors in the request
    req.on('error', function (error) {
      reject(error);
    });

    req.end();
  });
}

// If anywhere you were calling countryAPI.fetchCountries(), keep it working too:
countryAPI.fetchCountries = fetchCountries;

// Optional: keep your error logging centralized
countryAPI.on("error", (err) => {
  console.error("Error fetching countries data:", err?.message || err);
});

module.exports = {
  fetchCountries, // ✅ keeps controller.js working as-is
  countryAPI,     // ✅ lets you keep using events if you want
};
