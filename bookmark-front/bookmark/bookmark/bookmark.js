const API_URL = `http://127.0.0.1:8000`;
const bookmarkForm = document.getElementById('bookmark-form');
const bookmarkList = document.getElementById('bookmark-list');

let token = '';

//УМОВИ ДЗ
// bookmark.js
document.addEventListener("DOMContentLoaded", function () {
    const logoutBtn = document.getElementById("logout-btn");
    const userNameDisplay = document.getElementById("user-name");
    const loginLink = document.getElementById("login-link");
    const logoutLink = document.getElementById("logout-link");
    const registerLink = document.getElementById("register-link");

    // Check login status
    const accessToken = localStorage.getItem('access_token');
    const username = localStorage.getItem('username'); // Assuming you store the username on login

    if (accessToken) {
        // User is logged in
        loginLink.style.display = 'none'; // Hide login link
        logoutLink.style.display = 'block'; // Show logout link
        userNameDisplay.textContent = `Welcome, ${username}`; // Display username
        userNameDisplay.style.display = 'inline'; // Show username
    } else {
        // User is not logged in
        logoutLink.style.display = 'none'; // Hide logout link
        userNameDisplay.style.display = 'none'; // Hide username
    }

    // Logout functionality
    logoutBtn.addEventListener('click', function (e) {
        e.preventDefault(); // Prevent default link behavior
        localStorage.removeItem('access_token'); // Remove access token
        localStorage.removeItem('username'); // Remove username
        location.reload(); // Refresh page
    });

    // Redirect to login page if already logged in
    if (window.location.pathname === '/login.html' && accessToken) {
        window.location.href = 'bookmarks.html'; // Redirect to bookmarks page
    }
});


//BOOKMARK FORM

// Handle adding bookmarks
const handleAddBookmark = async (e) => {
    const token = localStorage.getItem('access_token')

    const url = document.getElementById('bookmark-url').value;
    const title = document.getElementById('bookmark-title').value;
    const category = document.getElementById('bookmark-category').value;

    const newBookmark = { url, title, category, is_favorite: false };

    try {
        const response = await fetch(`${API_URL}/bookmarks/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(newBookmark),
        });

        if (!response.ok) {
            throw new Error('Failed to add bookmark');
        }

        const addedBookmark = await response.json();
       const bookmarks = fetchBookmarks()
        renderBookmarkList(bookmarks); // Re-render bookmarks
    } catch (error) {
        console.error('Error adding bookmark:', error);
    }
};

bookmarkForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent the default form submission
    handleAddBookmark(); // Call addBookmark function
});




//BOOKMARK LIST

// Delete a bookmark
const deleteBookmark = async (id) => {
    const token = localStorage.getItem('access_token')
    try {
        const response = await fetch(`${API_URL}/bookmarks/${id}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            throw new Error('Failed to delete bookmark');
        }

        let bookmarks;
        bookmarks = fetchBookmarks().filter(bookmark => bookmark.id !== id); // Remove from bookmarks array
        renderBookmarkList(bookmarks); // Re-render bookmarks
    } catch (error) {
        console.error('Error deleting bookmark:', error);
    }
};


// Fetch bookmarks from the API
async function fetchBookmarks() {
    const accessToken = localStorage.getItem('access_token');

    if (!accessToken) {
        console.error("No access token found.");
        return;
    }

    const response = await fetch('http://127.0.0.1:8000/bookmarks/', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });

    if (response.ok) {
        const bookmarks = await response.json();
        console.log("Bookmarks:", bookmarks);
        return bookmarks
    } else {
        console.error("Failed to fetch bookmarks:", response.status);
    }
}


let editIndex = null; // Track the index of the bookmark being edited

const renderBookmarkList = (filteredBookmarks) => {
    const bookmarksList = document.getElementById('bookmarks-list');
    const bookmarks = fetchBookmarks()
    bookmarksList.innerHTML = bookmarks.map((bookmark, index) => {
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

//PUT
// Submit the edited bookmark data
const submitEdit = async (index, id) => {
    const url = document.getElementById(`edit-url-${index}`).value;
    const title = document.getElementById(`edit-title-${index}`).value;
    const category = document.getElementById(`edit-category-${index}`).value;

    const updatedBookmarkData = { url, title, category };

    const accessToken = localStorage.getItem('access_token');

    try {
        const response = await fetch(`${API_URL}/bookmarks/${id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(updatedBookmarkData)
        });

        if (!response.ok) {
            throw new Error('Failed to update bookmark');
        }
        let bookmarks;
        bookmarks = fetchBookmarks()


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

//rewrite handleSearch!!!!
const handleSearch = async (token) => {

    if (id === '') {
        renderBookmarkList(bookmarks);
        return;
    }

    try {
        const response = await fetch(`${API_URL}/bookmarks/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Bookmark not found');
        }
        const searchedBookmark = [await response.json()];

        // Render the searched bookmark (pass it as an array)
        renderBookmarkList([searchedBookmark]);
    } catch (error) {
        console.error('Error fetching bookmark:', error);
        // Optionally, display an error message or handle the error
    }
};


//TOKENS



async function refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');

    if (!refreshToken) {
        console.error("No refresh token found.");
        return;
    }

    const response = await fetch('http://127.0.0.1:8000/api/v1/token/refresh/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
    });

    if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access);
        console.log("Access token refreshed.");
    } else {
        console.error("Failed to refresh token:", response.status);
    }
}




//ADDITIONAL

const renderErrorPage = () => {
    const app = document.getElementById('app');
    app.innerHTML = `
        <h1>There's been an error</h1>
        <p>Navigate to the bookmarks page to view or add bookmarks.</p>
        <a href="#bookmarks">Go to Bookmarks</a>
    `;
}




//ROUTER
window.addEventListener('hashchange', () => {
    if (window.location.hash === '#bookmarks') {
        window.location.href = 'bookmark.html'
    } else if (window.location.hash === '#auth'){
        window.location.href = 'auth.html'
    } else if (window.location.hash === '#login'){
        window.location.href = 'login.html'
    }
    else {
        renderErrorPage();
    }
});


