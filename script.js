let countryCardsContainer = document.getElementById('country-cards-container');
let displayCount = 12;
let countries = data;

document.addEventListener('DOMContentLoaded', populateCountryCards);

function populateCountryCards() {
  countryCardsContainer.innerHTML = '';
  if (countries.length === 0) {
    countryCardsContainer.innerHTML = '<p>No country found matching the search criteria.</p>';
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
      capitalInfo.innerHTML = `<strong>Capital:</strong> ${country.capital ? country.capital : 'N/A'}`;
      countryInfo.appendChild(capitalInfo);

      let regionInfo = document.createElement('p');
      regionInfo.innerHTML = `<strong>Region:</strong> ${country.region}`;
      countryInfo.appendChild(regionInfo);

      card.appendChild(countryInfo);
      countryCardsContainer.appendChild(card);
    }
    if(countries.length <= displayCount) {
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
    let regex = new RegExp (/^[a-zA-Z -]*$/);
    if(!regex.test(countryName)){
      filter = false;
      let div = document.getElementById('name');
      let errorName = div.querySelector('.error-name');
      if (errorName) {
        errorName.remove();
      }
      let error = document.createElement('p');
      error.className = 'error-name';
      error.textContent = 'Please enter a valid country name.';
      error.style.fontSize = '12px';
      error.style.margin = '0';
      error.style.color = 'red';
      div.appendChild(error);
    }
    if(population > 1500000000) {
      filter = false;
      let div = document.getElementById('population');
      let errorPopulation = div.querySelector('.error-population');
      if (errorPopulation) {
        errorPopulation.remove();
      }
      let error = document.createElement('p');
      error.className = 'error-population';
      error.textContent = 'Country\'s population cannot exceed 1.5 billion.';
      error.style.fontSize = '12px';
      error.style.margin = '0';
      error.style.color = 'red';
      div.appendChild(error);
    }
    if (filter) {
      if (document.querySelector('.error-name')) {
        document.querySelector('.error-name').remove();
      }
      if (document.querySelector('.error-population')) {
        document.querySelector('.error-population').remove();
      }
      countries = data.filter(country => {
        let matchesName = country.name.official.toLowerCase().includes(countryName.toLowerCase()) || country.name.common.toLowerCase().includes(countryName.toLowerCase());
        let matchesRegion = region === 'All' || country.region === region;
        let matchesPopulation = parseInt(population) === 0 || country.population >= parseInt(population) || population === '';
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
    return Object.values(names).map(name => name.name).join(', ');
}

function countryCardHandler(country) {
   let queryString =

    "?name=" +

    encodeURIComponent(country.name.official) +

    "&flag=" +

    encodeURIComponent(country.flags.svg) +

    "&population=" +

    country.population +

    "&region=" +

    country.region +

    "&subRegion=" +

    encodeURIComponent(country.subregion) +

    "&capital=" +

    encodeURIComponent(country.capital) +

    "&currencies=" +

    encodeURIComponent(getFormattedNames(country.currencies)) +

    "&languages=" +

    encodeURIComponent(getFormattedNames(country.languages));

    window.location.href = "/details.html" + queryString;
}