document.getElementById("registerForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const passwordCheck = document.getElementById("passwordCheck").value;

    if (password !== passwordCheck) {
        alert("Passwords do not match!");
        return;
    }

    const data = {
        username: username,
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password,
        password_check: passwordCheck
    };

    fetch("http://127.0.0.1:8000/api/v1/register/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(data => {
            if (data.access && data.refresh) {
                alert("Registration successful!");
                localStorage.setItem('refresh_token', data.refresh);
                localStorage.setItem('access_token', data.access);
                window.location.replace("https://127.0.0.1:8080/bookmark/");
            } else {
                alert("Registration failed!");
            }
    })
        .catch(error => {
            console.error("Error:", error);
            alert("An error occurred during registration.");
    });

});



