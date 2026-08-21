document.addEventListener("DOMContentLoaded", () => {
    loadCharacterList();

    const createBtn = document.getElementById("createCharacterBtn");
    createBtn.addEventListener("click", createCharacter);
});

function loadCharacterList() {
    const listElement = document.getElementById("characterList");
    listElement.innerHTML = "";

    const characters = JSON.parse(localStorage.getItem("characterList")) || [];

    characters.forEach(name => {
        const li = document.createElement("li");

        li.innerHTML = `
            ${name}
            <button class="selectBtn">Select</button>
            <button class="deleteBtn">Delete</button>
        `;

        // SELECT CHARACTER
        li.querySelector(".selectBtn").addEventListener("click", () => {
            const key = "character_" + name;
            localStorage.setItem("currentCharacter", key);

            // GitHub Pages supports relative navigation
            window.location.href = "profile.html";
        });

        // DELETE CHARACTER
        li.querySelector(".deleteBtn").addEventListener("click", () => {
            deleteCharacter(name);
        });

        listElement.appendChild(li);
    });
}

function createCharacter() {
    const nameInput = document.getElementById("newCharacterName");
    const name = nameInput.value.trim();

    if (name === "") {
        alert("Enter a character name");
        return;
    }

    const characters = JSON.parse(localStorage.getItem("characterList")) || [];

    // Prevent duplicates
    if (characters.includes(name)) {
        alert("Character already exists");
        return;
    }

    // Add to list
    characters.push(name);
    localStorage.setItem("characterList", JSON.stringify(characters));

    // Create empty character object
    const key = "character_" + name;
    localStorage.setItem(key, JSON.stringify({
        name: name,
        created: Date.now()
    }));

    nameInput.value = "";
    loadCharacterList();
}

function deleteCharacter(name) {
    const characters = JSON.parse(localStorage.getItem("characterList")) || [];

    // Remove from list
    const updated = characters.filter(c => c !== name);
    localStorage.setItem("characterList", JSON.stringify(updated));

    // Remove all character-specific keys
    const key = "character_" + name;
    localStorage.removeItem(key);
    localStorage.removeItem(key + "_inventory");
    localStorage.removeItem(key + "_skills");
    localStorage.removeItem(key + "_equipped_righthand");
    localStorage.removeItem(key + "_equipped_lefthand");
    localStorage.removeItem(key + "_notes");
    localStorage.removeItem(key + "_spells");

    loadCharacterList();
}
