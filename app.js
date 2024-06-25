// Import Axios (assuming Axios is imported in index.js)
// Axios default configuration
axios.defaults.baseURL = 'https://api.thecatapi.com/v1/';
axios.defaults.headers.common['x-api-key'] = 'https://api.thecatapi.com/v1/';  // Replace with your actual API key

// Reference to progressBar element
const progressBar = document.getElementById('progressBar');

// Function to update progress bar width
function updateProgress(event) {
    // Calculate percentage completed
    const progress = (event.loaded / event.total) * 100;
    progressBar.style.width = `${progress}%`;

    // Log ProgressEvent object for understanding its structure
    console.log(event);
}

// Axios request interceptor to initialize progress bar and cursor
axios.interceptors.request.use(function (config) {
    // Reset progress bar to 0% for each request
    progressBar.style.width = '0%';
    // Set cursor to "progress" for the body element
    document.body.style.cursor = 'progress';
    return config;
}, function (error) {
    return Promise.reject(error);
});

// Axios response interceptor to handle progress bar and cursor
axios.interceptors.response.use(function (response) {
    // Complete progress bar when response is received
    progressBar.style.width = '100%';
    // Set cursor back to "default" for the body element
    document.body.style.cursor = 'default';
    return response;
}, function (error) {
    // Set cursor back to "default" for the body element on error
    document.body.style.cursor = 'default';
    return Promise.reject(error);
});

// Function to perform initial load
async function initialLoad() {
    const breedSelect = document.getElementById('breedSelect');
    const carousel = document.getElementById('carousel');
    const infoDump = document.getElementById('infoDump');

    try {
        // Fetch list of breeds from the Cat API using Axios
        const response = await axios.get('breeds');

        // Check if request was successful
        if (!response || !response.data || response.status !== 200) {
            throw new Error('Failed to fetch breeds');
        }

        const breeds = response.data;  // Extract data from response

        // Populate breed options
        breeds.forEach(breed => {
            const option = document.createElement('option');
            option.value = breed.id;
            option.textContent = breed.name;
            breedSelect.appendChild(option);
        });

        // Add event listener to breedSelect for breed selection
        breedSelect.addEventListener('change', async () => {
            const selectedBreedId = breedSelect.value;

            // Clear previous carousel items and infoDump
            carousel.innerHTML = '';
            infoDump.innerHTML = '';

            try {
                // Fetch information on the selected breed using Axios
                const breedResponse = await axios.get(`images/search?limit=5&breed_id=${selectedBreedId}`, {
                    onDownloadProgress: updateProgress  // Pass updateProgress function
                });

                // Check if request was successful
                if (!breedResponse || !breedResponse.data || breedResponse.status !== 200) {
                    throw new Error('Failed to fetch breed information');
                }

                const breedInfo = breedResponse.data;  // Extract data from response

                // Create carousel elements
                breedInfo.forEach(image => {
                    const carouselItem = document.createElement('div');
                    carouselItem.classList.add('carousel-item');
                    const img = document.createElement('img');
                    img.src = image.url;
                    img.alt = 'Cat Image';
                    carouselItem.appendChild(img);
                    carousel.appendChild(carouselItem);
                });

                // Fetch breed details from breeds list
                const breedData = breeds.find(breed => breed.id === selectedBreedId);

                // Create informational section in infoDump
                const infoTitle = document.createElement('h2');
                infoTitle.textContent = breedData.name;
                infoDump.appendChild(infoTitle);

                const description = document.createElement('p');
                description.textContent = breedData.description;
                infoDump.appendChild(description);

                const temperamentTitle = document.createElement('h3');
                temperamentTitle.textContent = 'Temperament:';
                infoDump.appendChild(temperamentTitle);

                const temperamentList = document.createElement('ul');
                breedData.temperament.split(', ').forEach(item => {
                    const temperamentItem = document.createElement('li');
                    temperamentItem.textContent = item;
                    temperamentList.appendChild(temperamentItem);
                });
                infoDump.appendChild(temperamentList);

            } catch (error) {
                console.error('Error fetching breed information:', error);
                // Handle error, e.g., display a message or fallback behavior
            }
        });

        // Initialize with the first breed in the list
        if (breeds.length > 0) {
            const initialBreedId = breeds[0].id;
            breedSelect.value = initialBreedId;
            breedSelect.dispatchEvent(new Event('change'));
        }

    } catch (error) {
        console.error('Error fetching breeds:', error);
        // Handle error, e.g., display a message or fallback behavior
    }
}

// Call initialLoad function immediately when script is executed
initialLoad();



// Import Axios (assuming Axios is imported in Carousel.js)
import axios from 'axios';

// Function to toggle favorite status
async function favourite(imageId, isFavourite) {
    const API_URL = 'https://api.thecatapi.com/v1/favourites';
    const headers = {
        'Content-Type': 'application/json',
        'x-api-key': 'your-api-key'  // Replace with your actual API key
    };

    try {
        if (isFavourite) {
            // If already favorited, delete the favorite
            await axios.delete(`${API_URL}/${imageId}`, { headers });
            console.log(`Removed favorite for image ${imageId}`);
        } else {
            // If not favorited, add the favorite
            const data = { image_id: imageId };
            await axios.post(API_URL, data, { headers });
            console.log(`Added favorite for image ${imageId}`);
        }

        // Optionally, you can handle UI updates or other logic after favoriting/unfavoriting
        // For example, updating a heart icon UI

    } catch (error) {
        console.error('Error toggling favorite:', error);
        // Handle error, e.g., display a message or fallback behavior
    }
}

export default favourite;
