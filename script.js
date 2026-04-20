const scriptURL = "https://script.google.com/macros/s/AKfycbwWTUTRX2zV6HBDdF_rMsLzCks5PmbRtapoO01BXZ9jADFOWMq2rf1m3YhF4qrRjsj0/exec";

document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const form = this;
    const formData = new FormData(form);

    const statusElement = document.getElementById("status");
    const submitButton = document.querySelector("button[type='submit']");
    const buttonText = document.getElementById("button-text");

    const usernameRaw = document.getElementById("username").value || "";
    const username = usernameRaw.trim().toLowerCase();

    submitButton.disabled = true;
    buttonText.innerHTML = `<span class="loading-spinner"></span> Logging in...`;
    statusElement.textContent = "";
    statusElement.className = "";

    fetch(scriptURL, {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(result => {

        console.log("LOGIN RESPONSE:", result);
        console.log("USERNAME RAW:", usernameRaw);
        console.log("USERNAME CLEAN:", username);

        if (result.status === "success") {

            statusElement.className = "success";
            statusElement.textContent = "Login successful! Redirecting...";

            // Save user info
            localStorage.setItem("maintenanceUser", result.name || usernameRaw);
            localStorage.setItem("userPosition", result.position || "Maintenance Staff");
            localStorage.setItem("userFullName", result.data?.name || "");
            localStorage.setItem("userActualPosition", result.data?.position || "");

            setTimeout(() => {

                let targetPage = "window.html";

                // STRICT CHECK (no ambiguity)
                const isStockUser = username === "stock";

                if (isStockUser) {
                    targetPage = "StockTest.html";
                }

                window.location.href =
                    `${targetPage}?username=${encodeURIComponent(usernameRaw)}&name=${encodeURIComponent(result.data?.name || usernameRaw)}&position=${encodeURIComponent(result.data?.position || "Maintenance Staff")}`;

            }, 1000);

        } else {
            statusElement.className = "error";
            statusElement.textContent = result.message || "Invalid username or password";
        }
    })
    .catch(error => {
        console.error("LOGIN ERROR:", error);
        statusElement.className = "error";
        statusElement.textContent = "Error connecting to server. Please try again.";
    })
    .finally(() => {
        submitButton.disabled = false;
        buttonText.textContent = "Login";
    });
});
