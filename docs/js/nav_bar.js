
// nav_bar.js

async function injectNavBar() {
    try {
        const response = await fetch("../nav_bar.html");
        const navHTML = await response.text();

        // Create wrapper
        const wrapper = document.createElement("div");
        wrapper.innerHTML = navHTML;

        // Insert at top of body
        document.body.prepend(wrapper);

        // Highlight active page
        const currentPage = location.pathname.split("/").pop();
        document.querySelectorAll("#globalNav a").forEach(link => {
            if (link.getAttribute("href") === currentPage) {
                link.classList.add("active");
            }
        });

/*
        // Close Character -logic removed due to the Close Character link goes back to the selection.html
        const closeLink = document.getElementById("closeCharacter");
        if (closeLink) {
            closeLink.addEventListener("click", () => {
                localStorage.removeItem("activeCharacter");
            });
        }
*/

    } catch (err) {
        console.error("Failed to load nav bar:", err);
    }
}
