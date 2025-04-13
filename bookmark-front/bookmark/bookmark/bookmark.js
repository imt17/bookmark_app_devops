const API_BASE_URL = "http://127.0.0.1:8000/bookmarks/";
let bookmarks = []; // Global variable to store bookmarks

document.addEventListener("DOMContentLoaded", function () {
    const userNameDisplay = document.getElementById("user-name");
    const accessToken = localStorage.getItem('access_token');
    const username = localStorage.getItem('username');
    const loginLink = document.getElementById("login-link");
    const logoutLink = document.getElementById("logout-link");
    const registerLink = document.getElementById("register-link");
    const logoutBtn = document.getElementById("logout-btn");


    logoutBtn.addEventListener('click', function (e) {
        e.preventDefault(); // Prevent default link behavior
        localStorage.removeItem('access_token'); // Remove access token
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username'); // Remove username
        location.reload(); // Refresh page
    });

    if (accessToken){
        userNameDisplay.textContent = `Welcome, ${username}`;
        userNameDisplay.style.display = 'inline';
        loginLink.style.display = 'none';
        logoutLink.style.display = 'block';
    }else{
        logoutLink.style.display = 'none';
        userNameDisplay.style.display = 'none';
    }

})


// Fetch bookmarks and display them
async function fetchBookmarks() {
    try {
        const response = await fetch(API_BASE_URL, {
            headers: { "Authorization": `Bearer ${localStorage.getItem('access_token')}` }
        });
        if (!response.ok) throw new Error("Failed to fetch bookmarks");

        bookmarks = await response.json(); // Store bookmarks in the global variable
        renderBookmarkList(bookmarks);
    } catch (error) {
        displayMessage(error.message, "danger");
    }
}

// Render bookmark list
function renderBookmarkList(bookmarks) {
    const bookmarksList = document.getElementById('bookmarks-list');
    bookmarksList.innerHTML = bookmarks.map((bookmark) => `
        <div class="col-md-4 mb-3">
            <div class="bookmark-card ${bookmark.is_favorite ? 'favorite' : ''}">
                <h5>${bookmark.title}</h5>
                <p><a href="${bookmark.url}" target="_blank">${bookmark.url}</a></p>
                <p>Category: ${bookmark.category}</p>
                <button class="btn btn-sm btn-warning" onclick="toggleFavorite(${bookmark.id})">
                    ${bookmark.is_favorite ? 'Unfavorite' : 'Favorite'}
                </button>
                <button class="btn btn-sm btn-info" onclick="showEditForm(${bookmark.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteBookmark(${bookmark.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Show the edit form with the bookmark's current data
function showEditForm(id) {
    const bookmark = bookmarks.find(b => b.id === id); // Find the bookmark using the global bookmarks array
    if (!bookmark) return;

    // Set the values in the edit form
    document.getElementById('edit-url').value = bookmark.url;
    document.getElementById('edit-title').value = bookmark.title;
    document.getElementById('edit-category').value = bookmark.category;
    document.getElementById('edit-bookmark-id').value = bookmark.id;

    // Display the modal using Bootstrap's modal API
    const modal = new bootstrap.Modal(document.getElementById('editModal'));
    modal.show();
}

// Hide the modal
function hideEditForm() {
    const modal = new bootstrap.Modal(document.getElementById('editModal'));
    modal.hide(); // Use Bootstrap's method to hide the modal
}

// Edit a bookmark
async function editBookmark(event) {
    event.preventDefault();
    const id = document.getElementById('edit-bookmark-id').value;
    const url = document.getElementById('edit-url').value;
    const title = document.getElementById('edit-title').value;
    const category = document.getElementById('edit-category').value;

    try {
        const response = await fetch(`${API_BASE_URL}${id}/`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('access_token')}`
            },
            body: JSON.stringify({ url, title, category })
        });

        if (response.ok) {
            hideEditForm(); // Hide the modal after updating
            fetchBookmarks(); // Refresh bookmarks list
            displayMessage("Bookmark updated successfully!", "success");
        } else {
            throw new Error("Failed to update bookmark");
        }
    } catch (error) {
        displayMessage(error.message, "danger");
    }
}

// Add a new bookmark
async function addBookmark(event) {
    event.preventDefault();
    const url = document.getElementById('url').value;
    const title = document.getElementById('title').value;
    const category = document.getElementById('category').value;

    try {
        const response = await fetch(API_BASE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('access_token')}`
            },
            body: JSON.stringify({ url, title, category })
        });

        if (response.ok) {
            fetchBookmarks(); // Refresh bookmarks list
            document.getElementById('add-bookmark-form').reset(); // Reset form
            displayMessage("Bookmark added successfully!", "success");
        } else {
            throw new Error("Failed to add bookmark");
        }
    } catch (error) {
        displayMessage(error.message, "danger");
    }
}

// Delete a bookmark
async function deleteBookmark(id) {
    try {
        const response = await fetch(`${API_BASE_URL}${id}/`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${localStorage.getItem('access_token')}` }
        });

        if (response.ok) {
            fetchBookmarks(); // Refresh bookmarks list
            displayMessage("Bookmark deleted successfully!", "success");
        } else {
            throw new Error("Failed to delete bookmark");
        }
    } catch (error) {
        displayMessage(error.message, "danger");
    }
}

// Toggle favorite status
async function toggleFavorite(id) {
    try {
        const bookmark = bookmarks.find(b => b.id === id);
        if (!bookmark) throw new Error("Bookmark not found");

        const response = await fetch(`${API_BASE_URL}${id}/`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('access_token')}`
            },
            body: JSON.stringify({ is_favorite: !bookmark.is_favorite }) // Toggle favorite status
        });

        if (response.ok) {
            fetchBookmarks(); // Refresh bookmarks list
        } else {
            throw new Error("Failed to update favorite status");
        }
    } catch (error) {
        displayMessage(error.message, "danger");
    }
}

// Display messages
function displayMessage(message, type) {
    const messageDiv = document.getElementById("message");
    messageDiv.className = `alert alert-${type}`;
    messageDiv.innerText = message;
    messageDiv.style.display = "block";
    setTimeout(() => messageDiv.style.display = "none", 3000);
}

// Initialize
document.getElementById('add-bookmark-form').addEventListener('submit', addBookmark);
document.getElementById('edit-bookmark-form').addEventListener('submit', editBookmark);
fetchBookmarks();
