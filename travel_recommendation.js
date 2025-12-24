//Load and parse the JSON data

let destinationData = null;
const cityString = 'city';
const templeString = 'temple';

async function loadDestinationData() {
    try {
        const response = await fetch('./travel_recommendation_api.json');
        destinationData = await response.json();
    } catch (error) {
        console.error('Error loading destination data:', error)
    }
}


// Search function that accepts keywords and searches across all destination values
function searchDestinations(keyword) {
    if (!keyword || !destinationData) {
        console.log('No results');
        return [];
    }

    const searchTerm = keyword.toLowerCase().trim();
    const results = [];


    // Search in countries and cities
    if (destinationData.countries) {
        destinationData.countries.forEach(country => {
            // Check if country name matches
            if (country.name.toLowerCase().includes(searchTerm)) {
                // Get first city's image if available
                let imageUrl = null;
                if (country.cities && country.cities.length > 0) {
                    imageUrl = country.cities[0].imageUrl;
                }

                results.push({
                    type: 'country',
                    name: country.name,
                    description: `Country: ${country.name}`,
                    imageUrl: imageUrl
                });
            }

            // Check if city name or description matches
            if (country.cities) {
                country.cities.forEach(city => {
                    if (city.name.toLowerCase().includes(searchTerm) ||
                        city.description.toLowerCase().includes(searchTerm) ||
                        cityString.includes(searchTerm)) {
                        results.push({
                            type: 'city',
                            name: city.name,
                            description: city.description,
                            imageUrl: city.imageUrl
                        });
                    }
                });
            }
        });
    }

    // Search in temples
    if (destinationData.temples) {
        destinationData.temples.forEach(temple => {
            if (temple.name.toLowerCase().includes(searchTerm) ||
                temple.description.toLowerCase().includes(searchTerm) ||
                templeString.includes(searchTerm)) {
                results.push({
                    type: 'temple',
                    name: temple.name,
                    description: temple.description,
                    imageUrl: temple.imageUrl
                });
            }
        });
    }

    // Search in beaches
    if (destinationData.beaches) {
        destinationData.beaches.forEach(beach => {
            if (beach.name.toLowerCase().includes(searchTerm) ||
                beach.description.toLowerCase().includes(searchTerm)) {
                results.push({
                    type: 'beach',
                    name: beach.name,
                    description: beach.description,
                    imageUrl: beach.imageUrl
                });
            }
        });
    }

    return results;
}

//Initializing data and adding event listeners to buttons
document.addEventListener('DOMContentLoaded', function () {
    loadDestinationData();

    // Add search functionality
    const searchBtn = document.querySelector('.search-btn');
    const clearBtn = document.querySelector('.clear-btn');
    const searchInput = document.querySelector('.search-input');
    const resultsContainer = document.querySelector('.search-results-container');

    if (!resultsContainer) {
        console.error('Error: .search-results-container element not found in HTML');
        return;
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', function () {
            const keyword = searchInput.value;
            const results = searchDestinations(keyword);

            displaySearchResults(results, resultsContainer);
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            searchInput.value = '';
            resultsContainer.innerHTML = '';
            resultsContainer.classList.remove('active');
            searchInput.focus();
        });
    }

    // Also allow search on Enter key press
    if (searchInput) {
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                searchBtn.click();
            }
        });
    }
});

// Map of timezone strings by city name.

const timezoneMap = {
    'Sydney, Australia': 'Australia/Sydney',
    'Melbourne, Australia': 'Australia/Melbourne',
    'Tokyo, Japan': 'Asia/Tokyo',
    'Kyoto, Japan': 'Asia/Tokyo',
    'Rio de Janeiro, Brazil': 'America/Sao_Paulo',
    'São Paulo, Brazil': 'America/Sao_Paulo',
    'Angkor Wat, Cambodia': 'Asia/Bangkok',
    'Taj Mahal, India': 'Asia/Kolkata',
    'Bora Bora, French Polynesia': 'Pacific/Tahiti',
    'Copacabana Beach, Brazil': 'America/Sao_Paulo',
    'Australia': 'Australia/Sydney',
    'Japan': 'Asia/Tokyo',
    'Brazil': 'America/Sao_Paulo'
};

// Function to get local time for a destination
function getLocalTime(destinationName) {
    const timezone = timezoneMap[destinationName];
    if (!timezone) return 'Time unavailable';

    const options = {
        timeZone: timezone,
        hour12: true,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit'
    };

    return new Date().toLocaleString('en-US', options);
}

// Function for displaying recommendations in the UI
function displaySearchResults(results, container) {
    container.innerHTML = '';

    if (results.length === 0) {
        container.innerHTML = '<p style="padding: 10px; text-align: center; color: #aaa;">No destinations found</p>';
        container.classList.add('active');
        return;
    }

    results.forEach(result => {
        const resultElement = document.createElement('div');
        resultElement.className = 'search-result-item';

        // Create image element
        const img = document.createElement('img');
        img.src = result.imageUrl || 'placeholder.jpg';
        img.alt = result.name;

        // Create name element
        const name = document.createElement('h3');
        name.textContent = result.name;

        // Create description element
        const description = document.createElement('p');
        description.textContent = result.description;

        // Create local time element
        const timeElement = document.createElement('p');
        timeElement.style.fontSize = '0.8rem';
        timeElement.style.color = '#00d4d4';
        timeElement.style.marginTop = '8px';
        timeElement.textContent = `Local time: ${getLocalTime(result.name)}`;

        // Create visit button
        const visitBtn = document.createElement('button');
        visitBtn.className = 'visit-btn';
        visitBtn.textContent = 'Visit';
        visitBtn.addEventListener('click', function () {
            alert(`You selected: ${result.name}`);
        });

        // Append all elements to result item
        resultElement.appendChild(img);
        resultElement.appendChild(name);
        resultElement.appendChild(description);
        // resultElement.appendChild(timeElement);
        resultElement.appendChild(visitBtn);

        // Append result item to container
        container.appendChild(resultElement);
    });

    container.classList.add('active');
}