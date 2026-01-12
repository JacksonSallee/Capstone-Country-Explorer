document.addEventListener('DOMContentLoaded', generateCountryCard);

function generateCountryCard() {
  let params = new URLSearchParams(window.location.search);
  let countryName = decodeURIComponent(params.get('name'));
  let population = decodeURIComponent(params.get('population'));
  let region = decodeURIComponent(params.get('region'));
  let capital = decodeURIComponent(params.get('capital'));
  let flag = decodeURIComponent(params.get('flag'));
  let languages = decodeURIComponent(params.get('languages'));
  let currencies = decodeURIComponent(params.get('currencies'));
  let subRegion = decodeURIComponent(params.get('subRegion'));

  let card = document.createElement('div');
  card.className = 'country-card-details';
  let countryNameElem = document.createElement('h2');
  countryNameElem.textContent = countryName;
  card.appendChild(countryNameElem);
  let countryFlag = document.createElement('img');
  countryFlag.src = flag;
  countryFlag.alt = `Flag of ${countryName}`;
  card.appendChild(countryFlag);
  let countryDetails = document.createElement('div');
  countryDetails.className = 'country-details';
  let countryPopulation = document.createElement('p');
  countryPopulation.innerHTML = `<strong>Population:</strong> ${parseInt(population).toLocaleString()}`;
  countryDetails.appendChild(countryPopulation);
  let countryRegion = document.createElement('p');
  countryRegion.innerHTML = `<strong>Region:</strong> ${region}`;
  countryDetails.appendChild(countryRegion);
  let countrySubRegion = document.createElement('p');
  countrySubRegion.innerHTML = `<strong>Sub Region:</strong> ${subRegion}`;
  countryDetails.appendChild(countrySubRegion);
  let countryCapital = document.createElement('p');
  countryCapital.innerHTML = `<strong>Capital:</strong> ${capital}`;
  countryDetails.appendChild(countryCapital);
  let countryLanguages = document.createElement('p');
  countryLanguages.innerHTML = `<strong>Languages:</strong> ${languages}`;
  countryDetails.appendChild(countryLanguages);
  let countryCurrencies = document.createElement('p');
  countryCurrencies.innerHTML = `<strong>Currencies:</strong> ${currencies}`;
  countryDetails.appendChild(countryCurrencies);

  card.appendChild(countryDetails);

  document.body.appendChild(card);

}

document.getElementById('back-btn').addEventListener('click', backButtonHandler);

function backButtonHandler() {
  window.location.href = 'index.html';
}