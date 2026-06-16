/**
 * JobFinder - Core Application Logic
 * Fetches data from Remotive API and handles filtering, saving, and persistence.
 */

// Application State
const state = {
    allJobs: [],        // Raw jobs from API
    filteredJobs: [],   // Jobs after filters applied
    savedJobs: JSON.parse(localStorage.getItem('savedJobs')) || [],
    currentView: 'all', // 'all' or 'saved'
    filters: {
        keyword: '',
        location: '',
        category: ''
    }
};

// DOM Elements
const elements = {
    jobGrid: document.getElementById('jobGrid'),
    jobCount: document.getElementById('jobCountDisplay'),
    loadingSpinner: document.getElementById('loadingSpinner'),
    noResults: document.getElementById('noResults'),
    keywordInput: document.getElementById('keywordInput'),
    locationInput: document.getElementById('locationInput'),
    categoryInput: document.getElementById('categoryInput'),
    searchBtn: document.getElementById('searchBtn'),
    clearBtn: document.getElementById('clearBtn'),
    viewAllBtn: document.getElementById('viewAllBtn'),
    viewSavedBtn: document.getElementById('viewSavedBtn'),
    savedCountBadge: document.getElementById('savedCountBadge'),
    resultsHeading: document.getElementById('resultsHeading'),
    searchContainer: document.getElementById('searchContainer')
};

/**
 * Initialize App
 */
async function init() {
    updateSavedCountUI();
    attachEventListeners();
    await fetchJobs();
}

/**
 * Fetch Jobs from Remotive API
 */
async function fetchJobs() {
    showLoading(true);
    try {
        const response = await fetch('https://remotive.com/api/remote-jobs');
        if (!response.ok) throw new Error('Failed to fetch jobs');
        
        const data = await response.json();
        state.allJobs = data.jobs;
        
        // Dynamically populate categories based on the data received
        populateCategories(state.allJobs);

        // Initial filter application
        applyFilters();
    } catch (error) {
        console.error('Fetch Error:', error);
        elements.jobCount.textContent = '❌ Error fetching jobs. Please try again later.';
        showLoading(false);
    }
}

/**
 * Populate Category Dropdown from Unique Job Values
 */
function populateCategories(jobs) {
    // Extract unique categories, filter out nulls/undefined, and sort alphabetically
    const categories = [...new Set(jobs.map(job => job.category))]
        .filter(cat => cat)
        .sort();

    // Reset dropdown to just "All Categories"
    elements.categoryInput.innerHTML = '<option value="">All Categories</option>';

    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        elements.categoryInput.appendChild(option);
    });
}

/**
 * Apply all current filters to the dataset
 */
function applyFilters() {
    const { keyword, location, category } = state.filters;

    // We filter from state.allJobs so we always have the full source available
    state.filteredJobs = state.allJobs.filter(job => {
        const matchesKeyword = !keyword || 
            job.title.toLowerCase().includes(keyword.toLowerCase()) || 
            job.company_name.toLowerCase().includes(keyword.toLowerCase());
        
        const matchesLocation = !location || 
            (job.candidate_required_location && 
             job.candidate_required_location.toLowerCase().includes(location.toLowerCase()));
        
        const matchesCategory = !category || job.category === category;

        return matchesKeyword && matchesLocation && matchesCategory;
    });

    render();
}

/**
 * Render the current view
 */
function render() {
    showLoading(false);
    elements.jobGrid.innerHTML = '';
    
    // Choose which list to display
    const listToDisplay = state.currentView === 'all' ? state.filteredJobs : state.savedJobs;
    
    if (listToDisplay.length === 0) {
        elements.noResults.classList.remove('hidden');
        elements.jobCount.textContent = 'No jobs found match your criteria.';
    } else {
        elements.noResults.classList.add('hidden');
        elements.jobCount.textContent = `Showing ${listToDisplay.length} jobs`;
        
        listToDisplay.forEach(job => {
            const card = createJobCard(job);
            elements.jobGrid.appendChild(card);
        });
    }
}

/**
 * Create a Job Card Element
 */
function createJobCard(job) {
    const isSaved = state.savedJobs.some(s => s.id === job.id);
    const div = document.createElement('div');
    div.className = 'job-card';
    
    // Strip HTML tags and truncate description
    const cleanDesc = job.description.replace(/<[^>]*>?/gm, '');
    const truncatedDesc = cleanDesc.substring(0, 150) + '...';

    div.innerHTML = `
        <div class="card-header">
            <img src="${job.company_logo_url || 'https://via.placeholder.com/48'}" 
                 alt="${job.company_name} logo" class="company-logo"
                 onerror="this.src='https://img.icons8.com/color/48/company.png'">
            <div class="card-title-area">
                <p class="company-name">${job.company_name}</p>
                <h3>${job.title}</h3>
            </div>
        </div>
        <div class="card-tags">
            <span class="tag">📍 ${job.candidate_required_location || 'Remote'}</span>
            <span class="tag">💼 ${job.job_type || 'Full Time'}</span>
            <span class="tag">🏷️ ${job.category}</span>
        </div>
        <p class="description">${truncatedDesc}</p>
        <div class="card-footer">
            <a href="${job.url}" target="_blank" class="btn-detail">View Details →</a>
            <button class="btn-save ${isSaved ? 'saved' : ''}" data-id="${job.id}">
                ${isSaved ? '★ Saved' : '☆ Save'}
            </button>
        </div>
    `;

    // Add event listener to save button
    const saveBtn = div.querySelector('.btn-save');
    saveBtn.addEventListener('click', () => toggleSaveJob(job));

    return div;
}

/**
 * Toggle Save/Unsave Job
 */
function toggleSaveJob(job) {
    const index = state.savedJobs.findIndex(s => s.id === job.id);
    
    if (index === -1) {
        state.savedJobs.push(job);
    } else {
        state.savedJobs.splice(index, 1);
    }

    // Save to LocalStorage
    localStorage.setItem('savedJobs', JSON.stringify(state.savedJobs));
    updateSavedCountUI();
    render(); // Re-render to update icon state
}

/**
 * Update UI for Saved Jobs count
 */
function updateSavedCountUI() {
    elements.savedCountBadge.textContent = state.savedJobs.length;
}

/**
 * Debounce helper for live search
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Handle input changes with debounce
 */
const handleInput = debounce(() => {
    state.filters.keyword = elements.keywordInput.value;
    state.filters.location = elements.locationInput.value;
    state.filters.category = elements.categoryInput.value;
    applyFilters();
}, 400);

/**
 * Event Listeners
 */
function attachEventListeners() {
    // Search Inputs
    elements.keywordInput.addEventListener('input', handleInput);
    elements.locationInput.addEventListener('input', handleInput);
    elements.categoryInput.addEventListener('change', handleInput);

    // Search Button
    elements.searchBtn.addEventListener('click', () => {
        state.filters.keyword = elements.keywordInput.value;
        state.filters.location = elements.locationInput.value;
        state.filters.category = elements.categoryInput.value;
        applyFilters();
    });

    // Clear Filters
    elements.clearBtn.addEventListener('click', () => {
        elements.keywordInput.value = '';
        elements.locationInput.value = '';
        elements.categoryInput.value = '';
        state.filters = { keyword: '', location: '', category: '' };
        applyFilters();
    });

    // View Toggles
    elements.viewAllBtn.addEventListener('click', () => {
        state.currentView = 'all';
        elements.viewAllBtn.classList.add('active');
        elements.viewSavedBtn.classList.remove('active');
        elements.resultsHeading.textContent = 'All Remote Jobs';
        elements.searchContainer.classList.remove('hidden');
        render();
    });

    elements.viewSavedBtn.addEventListener('click', () => {
        state.currentView = 'saved';
        elements.viewSavedBtn.classList.add('active');
        elements.viewAllBtn.classList.remove('active');
        elements.resultsHeading.textContent = 'My Saved Jobs';
        elements.searchContainer.classList.add('hidden'); // Optional: hide filters in saved view
        render();
    });
}

function showLoading(show) {
    if (show) {
        elements.loadingSpinner.classList.remove('hidden');
        elements.jobGrid.classList.add('hidden');
        elements.jobCount.textContent = 'Connecting to Remotive API...';
    } else {
        elements.loadingSpinner.classList.add('hidden');
        elements.jobGrid.classList.remove('hidden');
    }
}

// Start the app
init();
