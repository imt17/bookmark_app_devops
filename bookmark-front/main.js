const API_URL = 'http://127.0.0.1:8000'; 

// State: An array of bookmarks
let bookmarks = [];

const renderErrorPage = () => {
    const app = document.getElementById('app');
    app.innerHTML = `
        <h1>There's been an error</h1>
        <p>Navigate to the bookmarks page to view or add bookmarks.</p>
        <a href="#bookmarks">Go to Bookmarks</a>
    `;
}

// Render Home Page
const renderHomePage = () => {
    const app = document.getElementById('app');
    app.innerHTML = `
        <h1>Welcome to Bookmark Manager</h1>
        <p>Navigate to the bookmarks page to view or add bookmarks.</p>
        <a href="#bookmarks">Go to Bookmarks</a>
    `;
};

// Render Bookmarks Page
const renderBookmarksPage = () => {
    const app = document.getElementById('app');
    app.innerHTML = `
        <h1>Bookmarks</h1>
        <form id="bookmark-form">
            <input type="url" id="bookmark-url" placeholder="URL" required>
            <input type="text" id="bookmark-title" placeholder="Title" required>
            <input type="text" id="bookmark-category" placeholder="Category">
            <button type="submit">Add Bookmark</button>
        </form>
        
        <input type="text" id="search-bar" placeholder="Search by index..." class="search-bar">
        <button id="search-button" type="button">Search</button>
        
        <div id="bookmarks-list"></div>
    `;

    // Add event listener to the form
    const form = document.getElementById('bookmark-form');
    form.addEventListener('submit', handleAddBookmark);

    // Add event listener for search functionality
    const searchButton = document.getElementById('search-button');
    searchButton.addEventListener('click', () => {
        const searchValue = document.getElementById('search-bar').value;
        console.log(searchValue)
        handleSearch(searchValue);
    });

    // Initially render all bookmarks from the API
    fetchBookmarks();
};

// Fetch bookmarks from the API
const fetchBookmarks = async () => {
    try {
        const response = await fetch(`${API_URL}/bookmarks/`);
        if (!response.ok) {
            throw new Error('Failed to fetch bookmarks');
        }
        bookmarks = await response.json();
        renderBookmarkList(bookmarks);
    } catch (error) {
        console.error('Error fetching bookmarks:', error);
    }
};

let editIndex = null; // Track the index of the bookmark being edited

const renderBookmarkList = (filteredBookmarks) => {
    const bookmarksList = document.getElementById('bookmarks-list');
    bookmarksList.innerHTML = filteredBookmarks.map((bookmark, index) => {
        // Check if the current bookmark is being edited
        if (editIndex === index) {
            return `
                <div class="bookmark-card">
                    <input type="url" id="edit-url-${index}" value="${bookmark.url}" placeholder="URL" required>
                    <input type="text" id="edit-title-${index}" value="${bookmark.title}" placeholder="Title" required>
                    <input type="text" id="edit-category-${index}" value="${bookmark.category}" placeholder="Category">
                    <button onclick="submitEdit(${index}, ${bookmark.id})">Save</button>
                    <button onclick="cancelEdit()">Cancel</button>
                </div>
            `;
        }

        // Normal display mode (not being edited)
        return `
            <div class="bookmark-card ${bookmark.is_favorite ? 'favorite' : ''}">
                <h5>${bookmark.title}</h5>
                <p><a href="${bookmark.url}" target="_blank">${bookmark.url}</a></p>
                <p>Category: ${bookmark.category}</p>
                <button class="favorite-btn" onclick="toggleFavorite(${index})">
                    ${bookmark.is_favorite ? 'Unfavorite' : 'Favorite'}
                </button>
                <button onclick="deleteBookmark(${bookmark.id})">Delete</button>
                <button onclick="editBookmark(${index})">Edit</button>
            </div>
        `;
    }).join('');
};

// Edit a bookmark
const editBookmark = (index) => {
    editIndex = index; // Set the editIndex to the bookmark being edited
    renderBookmarkList(bookmarks); // Re-render the list to show the input fields for editing
};

// Submit the edited bookmark data
const submitEdit = async (index, id) => {
    const url = document.getElementById(`edit-url-${index}`).value;
    const title = document.getElementById(`edit-title-${index}`).value;
    const category = document.getElementById(`edit-category-${index}`).value;

    const updatedBookmarkData = { url, title, category };

    try {
        const response = await fetch(`${API_URL}/bookmarks/${id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedBookmarkData)
        });

        if (!response.ok) {
            throw new Error('Failed to update bookmark');
        }

        // Update the bookmarks array locally
        bookmarks[index] = { ...bookmarks[index], ...updatedBookmarkData };

        // Reset editIndex and re-render the list
        editIndex = null;
        renderBookmarkList(bookmarks);
    } catch (error) {
        console.error('Error updating bookmark:', error);
    }
};

// Cancel the edit
const cancelEdit = () => {
    editIndex = null; // Reset editIndex
    renderBookmarkList(bookmarks); // Re-render the list in normal mode
};


// Handle adding bookmarks
const handleAddBookmark = async (e) => {
    e.preventDefault();

    const url = document.getElementById('bookmark-url').value;
    const title = document.getElementById('bookmark-title').value;
    const category = document.getElementById('bookmark-category').value;

    const newBookmark = { url, title, category, is_favorite: false };

    try {
        const response = await fetch(`${API_URL}/bookmarks/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newBookmark),
        });

        if (!response.ok) {
            throw new Error('Failed to add bookmark');
        }

        const addedBookmark = await response.json();
        bookmarks.push(addedBookmark); // Add to bookmarks array
        renderBookmarkList(bookmarks); // Re-render bookmarks
    } catch (error) {
        console.error('Error adding bookmark:', error);
    }
};

const handleSearch = async (id) => {
    if (id === '') {
        renderBookmarkList(bookmarks);
        return;
    }

    try {
        const response = await fetch(`${API_URL}/bookmarks/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Bookmark not found');
        }
        const searchedBookmark = await response.json();

        // Render the searched bookmark (pass it as an array)
        renderBookmarkList([searchedBookmark]);
    } catch (error) {
        console.error('Error fetching bookmark:', error);
        // Optionally, display an error message or handle the error
    }
};

// Toggle favorite status
const toggleFavorite = async (index) => {
    const bookmark = bookmarks[index];
    bookmark.is_favorite = !bookmark.is_favorite;

    try {
        const response = await fetch(`${API_URL}/bookmarks/${bookmark.id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookmark),
        });

        if (!response.ok) {
            throw new Error('Failed to update favorite status');
        }

        renderBookmarkList(bookmarks); // Re-render bookmarks
    } catch (error) {
        console.error('Error updating bookmark:', error);
    }
};

// Delete a bookmark
const deleteBookmark = async (id) => {
    try {
        const response = await fetch(`${API_URL}/bookmarks/${id}/`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Failed to delete bookmark');
        }

        bookmarks = bookmarks.filter(bookmark => bookmark.id !== id); // Remove from bookmarks array
        renderBookmarkList(bookmarks); // Re-render bookmarks
    } catch (error) {
        console.error('Error deleting bookmark:', error);
    }
};


// Simple client-side routing logic
window.addEventListener('hashchange', () => {
    if (window.location.hash === '#home') {
        renderHomePage();
    } else if (window.location.hash === '#bookmarks') {
        renderBookmarksPage();
    } else {
        renderErrorPage();
    }
});


// Initial render
renderHomePage();
