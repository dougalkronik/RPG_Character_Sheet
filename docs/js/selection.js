document.addEventListener("DOMContentLoaded", () => {
    // Load the list of characters
    loadCharacterList();

    // Create button
    const createBtn = document.getElementById("createCharacterBtn");
    if (createBtn) {
        createBtn.addEventListener("click", createCharacter);
    }

    // Import button
    const importBtn = document.getElementById("importCharacterBtn");
    if (importBtn) {
        importBtn.addEventListener("click", () => {
            document.getElementById("importFileInput").click();
        });
    }

    // File input for import
    const importInput = document.getElementById("importFileInput");
    if (importInput) {
        importInput.addEventListener("change", importCharacterFile);
    }

    // Close Character button in nav bar
    const closeBtn = document.getElementById("closeCharacter");
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            localStorage.removeItem("currentCharacter");
        });
    }
});


/* ============================================
   LOAD CHARACTER LIST
   ============================================ */

function loadCharacterList() {
    const listElement = document.getElementById("characterList");
    listElement.innerHTML = "";

    const characters = JSON.parse(localStorage.getItem("characterList")) || [];

    characters.forEach(name => {
        const key = "character_" + name;
        const li = document.createElement("li");

        li.innerHTML = `
            ${name}
            <button class="selectBtn">Select</button>
            <button class="deleteBtn">Delete</button>
            <button class="exportBtn">Export</button>
        `;

        // SELECT CHARACTER
        li.querySelector(".selectBtn").addEventListener("click", () => {
            localStorage.setItem("currentCharacter", key);
            window.location.href = "profile.html";
        });

        // DELETE CHARACTER
        li.querySelector(".deleteBtn").addEventListener("click", () => {
            deleteCharacter(name);
        });

        // EXPORT CHARACTER
        li.querySelector(".exportBtn").addEventListener("click", () => {
            exportCharacter(key);
        });

        listElement.appendChild(li);
    });
}


/* ============================================
   CREATE CHARACTER
   ============================================ */

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
        created: Date.now(),
        inventory: [],
        treasure: [
            { name: "Money", value: 1, quantity: 0 }
        ]
    }));

    nameInput.value = "";
    loadCharacterList();
}


/* ============================================
   DELETE CHARACTER
   ============================================ */

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

    // If this was the active character, clear it
    if (localStorage.getItem("currentCharacter") === key) {
        localStorage.removeItem("currentCharacter");
    }

    loadCharacterList();
}


/* ============================================
   EXPORT CHARACTER
   ============================================ */

function exportCharacter(key) {
    const character = JSON.parse(localStorage.getItem(key));

    if (!character) {
        alert("Character not found.");
        return;
    }

    const jsonData = JSON.stringify(character, null, 4);

    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = key + ".json";
    a.click();

    URL.revokeObjectURL(url);

    alert("Character exported as " + key + ".json");
}


/* ============================================
   IMPORT CHARACTER (with overwrite warning)
   ============================================ */

function importCharacterFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
        try {
            const data = JSON.parse(e.target.result);

            if (!data.name) {
                alert("Invalid character file: missing name.");
                return;
            }

            const characters = JSON.parse(localStorage.getItem("characterList")) || [];
            const key = "character_" + data.name;

            // Character already exists → ask user if they want to overwrite
            if (characters.includes(data.name)) {
                const overwrite = confirm(
                    `A character named "${data.name}" already exists.\n\n` +
                    `Do you want to OVERWRITE the existing character with the imported one?`
                );

                if (!overwrite) {
                    alert("Import cancelled.");
                    return;
                }

                // Overwrite existing character
                localStorage.setItem(key, JSON.stringify(data));
                alert(`Character "${data.name}" overwritten successfully.`);
                loadCharacterList();
                return;
            }

            // Character does not exist → normal import
            localStorage.setItem(key, JSON.stringify(data));
            characters.push(data.name);
            localStorage.setItem("characterList", JSON.stringify(characters));

            alert("Character imported: " + data.name);
            loadCharacterList();

        } catch (err) {
            alert("Invalid JSON file.");
        }
    };

    reader.readAsText(file);
}
