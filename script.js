let countryCardsContainer = document.getElementById('country-cards-container');
let displayCount = 12;

let allCountries = [];
let countries = [];
let isLoading = true;

// fetchData() returns a promise that resolves with the JSON payload from
// the server's /countries endpoint.
function fetchData() {
  return fetch('/countries')
    .then(function (response) {
      if (!response.ok) {
        throw new Error('HTTP error! Status: ' + response.status);
      }
      return response.json();
    })
    .catch(function (error) {
      console.error('Error fetching countries data', error);
      throw error; // propagate so caller can handle
    });
}

// Helpers that build comma-separated lists from the API shapes
function getFormattedCurrencies(currencies) {
  if (!currencies) return '';
  if (Array.isArray(currencies)) {
    return currencies.map((c) => c.name || '').join(', ');
  }
  if (typeof currencies === 'object') {
    return Object.keys(currencies)
      .map((code) => currencies[code]?.name || '')
      .join(', ');
  }
  return '';
}

function getFormattedLanguages(languages) {
  if (!languages) return '';
  if (Array.isArray(languages)) {
    return languages.map((l) => l.name || '').join(', ');
  }
  if (typeof languages === 'object') {
    return Object.keys(languages)
      .map((code) => languages[code] || '')
      .join(', ');
  }
  return '';
}

// load the data after DOMContentLoaded, then render
document.addEventListener('DOMContentLoaded', () => {
  isLoading = true;
  populateCountryCards();

  fetchData()
    .then((data) => {
      allCountries = Array.isArray(data) ? data : [];
      countries = allCountries;
    })
    .catch((err) => {
      countries = [];
      allCountries = [];
      countryCardsContainer.innerHTML =
        '<p>Unable to load country data. Please try again later.</p>';
    })
    .finally(() => {
      isLoading = false;
      displayCount = 12;
      populateCountryCards();
    });
});

function mapCountry(country) {
  const name = {
    common: country?.name?.common ?? '',
    official: country?.name?.official ?? '',
  };

  // REST Countries returns capital as an array (or sometimes missing)
  const capital = Array.isArray(country?.capital)
    ? country.capital[0] ?? ''
    : country?.capital ?? '';

  const flags = {
    svg: country?.flags?.svg ?? '',
    png: country?.flags?.png ?? '',
  };

  // currencies may come from the API as an object keyed by code, or from
  // our local `data.js` as an array of {name,symbol,...} objects.  Normalize
  // both shapes into an array of {code?,name,symbol} objects.
  let currencies = [];
  if (country?.currencies) {
    if (Array.isArray(country.currencies)) {
      currencies = country.currencies.map((c) => ({
        code: c?.code || '',
        name: c?.name || '',
        symbol: c?.symbol || '',
      }));
    } else {
      currencies = Object.entries(country.currencies).map(([code, info]) => ({
        code,
        name: info?.name ?? '',
        symbol: info?.symbol ?? '',
      }));
    }
  }

  // languages may come as an array of objects (local data) or as an object of
  // simple strings (API).  Produce [{name,nativeName},...].
  let languages = [];
  if (country?.languages) {
    if (Array.isArray(country.languages)) {
      languages = country.languages.map((l) => ({
        name: l?.name || String(l) || '',
        nativeName: l?.nativeName || l?.name || '',
      }));
    } else {
      languages = Object.values(country.languages).map((langName) => ({
        name: langName ?? '',
        nativeName: langName ?? '',
      }));
    }
  }

  return {
    name,
    capital,
    subregion: country?.subregion ?? '',
    region: country?.region ?? '',
    population: country?.population ?? 0,
    flags,
    currencies,
    languages,
  };
}

async function fetchCountries() {
  // local data loaded via data.js
  const raw = Array.isArray(window.countryData) ? window.countryData : [];
  const mapped = Array.isArray(raw) ? raw.map(mapCountry) : [];

  // Consistent ordering (same as before)
  mapped.sort((a, b) => a.name.official.localeCompare(b.name.official));

  return mapped;
}

function populateCountryCards() {
  countryCardsContainer.innerHTML = '';

  if (isLoading) {
    countryCardsContainer.innerHTML = '<p>Loading countries…</p>';
    document.getElementById('load-more-btn').style.display = 'none';
    return;
  }

  if (countries.length === 0) {
    countryCardsContainer.innerHTML =
      '<p>No country found matching the search criteria.</p>';
  } else {
    let loopCount = Math.min(displayCount, countries.length);

    for (let i = 0; i < loopCount; i++) {
      let card = document.createElement('div');
      card.className = 'country-card';
      card.onclick = () => countryCardHandler(countries[i]);

      let country = countries[i];

      let countryFlag = document.createElement('img');
      countryFlag.src = country.flags.png;
      countryFlag.alt = `Flag of ${country.name.official}`;
      card.appendChild(countryFlag);

      let countryName = document.createElement('h2');
      countryName.textContent = country.name.official;
      card.appendChild(countryName);

      let countryInfo = document.createElement('div');
      countryInfo.className = 'country-info';

      let populationInfo = document.createElement('p');
      populationInfo.innerHTML = `<strong>Population:</strong> ${country.population.toLocaleString()}`;
      countryInfo.appendChild(populationInfo);

      let capitalInfo = document.createElement('p');
      capitalInfo.innerHTML = `<strong>Capital:</strong> ${
        country.capital ? country.capital : 'N/A'
      }`;
      countryInfo.appendChild(capitalInfo);

      let regionInfo = document.createElement('p');
      regionInfo.innerHTML = `<strong>Region:</strong> ${country.region}`;
      countryInfo.appendChild(regionInfo);

      card.appendChild(countryInfo);
      countryCardsContainer.appendChild(card);
    }

    if (countries.length <= displayCount) {
      document.getElementById('load-more-btn').style.display = 'none';
    } else {
      document.getElementById('load-more-btn').style.display = 'block';
    }
  }
}

document.getElementById('country-name').addEventListener('input', filterCountries);
document.getElementById('region-select').addEventListener('change', filterCountries);
document.getElementById('population-search').addEventListener('input', filterCountries);

function filterCountries() {
  let countryName = document.getElementById('country-name').value;
  let region = document.getElementById('region-select').value;
  let population = document.getElementById('population-search').value;

  let filter = true;
  let regex = new RegExp(/^[a-zA-Z -]*$/);

  if (!regex.test(countryName)) {
    filter = false;
    let div = document.getElementById('name');
    let errorName = div.querySelector('.error-name');
    if (errorName) errorName.remove();

    let error = document.createElement('p');
    error.className = 'error-name';
    error.textContent = 'Please enter a valid country name.';
    error.style.fontSize = '12px';
    error.style.margin = '0';
    error.style.color = 'red';
    div.appendChild(error);
  }

  if (population > 1500000000) {
    filter = false;
    let div = document.getElementById('population');
    let errorPopulation = div.querySelector('.error-population');
    if (errorPopulation) errorPopulation.remove();

    let error = document.createElement('p');
    error.className = 'error-population';
    error.textContent = "Country's population cannot exceed 1.5 billion.";
    error.style.fontSize = '12px';
    error.style.margin = '0';
    error.style.color = 'red';
    div.appendChild(error);
  }

  if (filter) {
    if (isLoading) return;

    if (document.querySelector('.error-name')) document.querySelector('.error-name').remove();
    if (document.querySelector('.error-population')) document.querySelector('.error-population').remove();

    countries = allCountries.filter((country) => {
      let matchesName =
        country.name.official.toLowerCase().includes(countryName.toLowerCase()) ||
        country.name.common.toLowerCase().includes(countryName.toLowerCase());

      let matchesRegion = region === 'All' || country.region === region;

      let matchesPopulation =
        parseInt(population) === 0 ||
        country.population >= parseInt(population) ||
        population === '';

      return matchesName && matchesRegion && matchesPopulation;
    });

    displayCount = 12;
    populateCountryCards();
  }
}

document.getElementById('load-more-btn').addEventListener('click', () => {
  displayCount += 10;
  populateCountryCards();
});

function getFormattedNames(names) {
  if (!names) return '';

  // when data comes as an array of objects
  if (Array.isArray(names)) {
    return names
      .map((item) => {
        if (item && typeof item === 'object' && 'name' in item) {
          return item.name;
        }
        return String(item);
      })
      .join(', ');
  }

  // when data comes as an object keyed by code or similar
  return Object.values(names)
    .map((item) => {
      if (item && typeof item === 'object' && 'name' in item) {
        return item.name;
      }
      return String(item);
    })
    .join(', ');
}

function countryCardHandler(country) {
  let queryString =
    '?name=' +
    encodeURIComponent(country.name.official) +
    '&flag=' +
    encodeURIComponent(country.flags.svg) +
    '&population=' +
    country.population +
    '&region=' +
    country.region +
    '&subRegion=' +
    encodeURIComponent(country.subregion) +
    '&capital=' +
    encodeURIComponent(country.capital) +
    '&currencies=' +
    encodeURIComponent(getFormattedCurrencies(country.currencies)) +
    '&languages=' +
    encodeURIComponent(getFormattedLanguages(country.languages));

  window.location.href = './details.html' + queryString;
}
