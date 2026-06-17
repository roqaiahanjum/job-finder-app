/**
 * JobFinder Full-Stack - Frontend Logic
 */

const state = {
    allJobs: [],
    filteredJobs: [],
    savedJobs: [],
    currentView: 'all',
    filters: { keyword: '', location: '', category: '' },
    token: localStorage.getItem('token') || null
};

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
    searchContainer: document.getElementById('searchContainer'),
    loginBtn: document.getElementById('loginBtn'),
    logoutBtn: document.getElementById('logoutBtn')
};

async function init() {
    setupAuthUI();
    attachEventListeners();
    if (state.token) {
        await fetchSavedJobs();
    }
    await fetchJobs();
}

/**
 * Update UI for Logged In/Out state
 */
function setupAuthUI() {
    if (state.token) {
        elements.loginBtn.classList.add('hidden');
        elements.logoutBtn.classList.remove('hidden');
    } else {
        elements.loginBtn.classList.remove('hidden');
        elements.logoutBtn.classList.add('hidden');
    }
}

/**
 * Fetch Jobs via Backend Proxy
 */
async function fetchJobs() {
    showLoading(true);
    try {
        const { keyword, category } = state.filters;
        let url = `/api/jobs/search?`;
        if (keyword) url += `search=${encodeURIComponent(keyword)}&`;
        if (category) url += `category=${encodeURIComponent(category)}`;

        const response = await fetch(url);
        const data = await response.json();
        
        state.allJobs = data.jobs || [];
        populateCategories(state.allJobs);
        applyFilters();
    } catch (error) {
        elements.jobCount.textContent = '❌ Error fetching jobs from server.';
        showLoading(false);
    }
}

/**
 * Fetch Saved Jobs from MongoDB
 */
async function fetchSavedJobs() {
    try {
        const response = await fetch('/api/jobs/saved', {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const result = await response.json();
        if (result.success) {
            state.savedJobs = result.data;
            updateSavedCountUI();
        } else if (response.status === 401) {
            handleLogout(); // Token expired
        }
    } catch (error) {
        console.error('Error fetching saved jobs:', error);
    }
}

function applyFilters() {
    const { keyword, location, category } = state.filters;

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

function render() {
    showLoading(false);
    elements.jobGrid.innerHTML = '';
    
    const listToDisplay = state.currentView === 'all' ? state.filteredJobs : state.savedJobs;
    
    if (listToDisplay.length === 0) {
        elements.noResults.classList.remove('hidden');
        elements.jobCount.textContent = 'No jobs found.';
    } else {
        elements.noResults.classList.add('hidden');
        elements.jobCount.textContent = `Showing ${listToDisplay.length} jobs`;
        
        listToDisplay.forEach(job => {
            const card = createJobCard(job);
            elements.jobGrid.appendChild(card);
        });
    }
}

function createJobCard(job) {
    // Check if job is saved in our locally synced state.savedJobs array
    // Remotive IDs are numbers, SavedJob IDs are stored as strings in our DB
    const jobId = (job.id || job.jobId).toString();
    const isSaved = state.savedJobs.some(s => s.jobId === jobId);
    
    const div = document.createElement('div');
    div.className = 'job-card';
    const cleanDesc = (job.description || '').replace(/<[^>]*>?/gm, '');
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
            ${state.token ? 
                `<button class="btn-save ${isSaved ? 'saved' : ''}" data-id="${jobId}">
                    ${isSaved ? '★ Saved' : '☆ Save'}
                </button>` : 
                `<a href="login.html" class="tag" style="text-decoration:none">Log in to save</a>`
            }
        </div>
    `;

    if (state.token) {
        const saveBtn = div.querySelector('.btn-save');
        saveBtn.addEventListener('click', () => toggleSaveJob(job));
    }

    return div;
}

async function toggleSaveJob(job) {
    const jobId = (job.id || job.jobId).toString();
    const isCurrentlySaved = state.savedJobs.some(s => s.jobId === jobId);

    try {
        if (isCurrentlySaved) {
            // Delete from MongoDB
            const res = await fetch(`/api/jobs/saved/${jobId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${state.token}` }
            });
            if (res.ok) {
                state.savedJobs = state.savedJobs.filter(s => s.jobId !== jobId);
            }
        } else {
            // Save to MongoDB
            const res = await fetch('/api/jobs/saved', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.token}`
                },
                body: JSON.stringify(job)
            });
            const data = await res.json();
            if (data.success) {
                state.savedJobs.push(data.data);
            }
        }
        updateSavedCountUI();
        render();
    } catch (err) {
        console.error('Error toggling job save:', err);
    }
}

function updateSavedCountUI() {
    elements.savedCountBadge.textContent = state.savedJobs.length;
}

function populateCategories(jobs) {
    const categories = [...new Set(jobs.map(job => job.category))]
        .filter(cat => cat)
        .sort();
    elements.categoryInput.innerHTML = '<option value="">All Categories</option>';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        elements.categoryInput.appendChild(option);
    });
}

function handleLogout() {
    localStorage.removeItem('token');
    state.token = null;
    state.savedJobs = [];
    window.location.reload();
}

const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

const handleInput = debounce(() => {
    state.filters.keyword = elements.keywordInput.value;
    state.filters.location = elements.locationInput.value;
    state.filters.category = elements.categoryInput.value;
    
    // If user typed in keyword or changed category, we re-fetch from API proxy
    // If they just filtered by location, we filter client-side
    // To keep it simple, we re-fetch on keyword/category changes
    fetchJobs();
}, 400);

function attachEventListeners() {
    elements.keywordInput.addEventListener('input', handleInput);
    elements.locationInput.addEventListener('input', () => {
        state.filters.location = elements.locationInput.value;
        applyFilters();
    });
    elements.categoryInput.addEventListener('change', handleInput);

    elements.searchBtn.addEventListener('click', fetchJobs);

    elements.clearBtn.addEventListener('click', () => {
        elements.keywordInput.value = '';
        elements.locationInput.value = '';
        elements.categoryInput.value = '';
        state.filters = { keyword: '', location: '', category: '' };
        fetchJobs();
    });

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
        elements.searchContainer.classList.add('hidden');
        render();
    });

    elements.logoutBtn.addEventListener('click', handleLogout);
}

function showLoading(show) {
    if (show) {
        elements.loadingSpinner.classList.remove('hidden');
        elements.jobGrid.classList.add('hidden');
        elements.jobCount.textContent = 'Searching server...';
    } else {
        elements.loadingSpinner.classList.add('hidden');
        elements.jobGrid.classList.remove('hidden');
    }
}

init();
