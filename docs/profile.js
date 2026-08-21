document.addEventListener("DOMContentLoaded", () => {
    loadProfile();
    setupAutoSave();
    setupImageUpload();
});

function loadProfile() {
    const key = localStorage.getItem("currentCharacter");
    if (!key) {
        alert("No character selected");
        return;
    }

    const character = JSON.parse(localStorage.getItem(key)) || {};

    document.getElementById("charName").value = character.name || "";
    document.getElementById("charSpecies").value = character.species || "";
    document.getElementById("charGender").value = character.gender || "";
    document.getElementById("charHeight").value = character.height || "";
    document.getElementById("charWeight").value = character.weight || "";
    document.getElementById("charSkin").value = character.skin || "";
    document.getElementById("charHair").value = character.hair || "";
    document.getElementById("charProfession").value = character.profession || "";

    // Load profession history
    const history = character.professionHistory || [];
    const list = document.getElementById("professionHistory");
    list.innerHTML = "";
    history.forEach(entry => {
        const li = document.createElement("li");
        li.textContent = entry;
        list.appendChild(li);
    });

    // Load image
    if (character.image) {
        const img = document.getElementById("charImage");
        img.src = character.image;
        img.style.display = "block";
    }
}

function setupAutoSave() {
    const key = localStorage.getItem("currentCharacter");

    const fields = {
        charName: "name",
        charSpecies: "species",
        charGender: "gender",
        charHeight: "height",
        charWeight: "weight",
        charSkin: "skin",
        charHair: "hair",
        charProfession: "profession"
    };

    Object.keys(fields).forEach(id => {
        const input = document.getElementById(id);
        input.addEventListener("input", () => {
            saveField(key, fields[id], input.value);

            // If profession changes, add to history
            if (id === "charProfession") {
                updateProfessionHistory(key, input.value);
            }
        });
    });
}

function saveField(key, field, value) {
    const character = JSON.parse(localStorage.getItem(key)) || {};
    character[field] = value.trim();
    localStorage.setItem(key, JSON.stringify(character));
}

function updateProfessionHistory(key, newProfession) {
    const character = JSON.parse(localStorage.getItem(key)) || {};

    if (!character.professionHistory) {
        character.professionHistory = [];
    }

    // Only add if different from last entry
    const history = character.professionHistory;
    if (history.length === 0 || history[history.length - 1] !== newProfession) {
        history.push(newProfession);
    }

    localStorage.setItem(key, JSON.stringify(character));
    loadProfile();
}

function setupImageUpload() {
    const container = document.getElementById("imageContainer");
    const img = document.getElementById("charImage");
    const key = localStorage.getItem("currentCharacter");

    container.addEventListener("click", () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";

        input.onchange = () => {
            const file = input.files[0];
            const reader = new FileReader();

            reader.onload = () => {
                const character = JSON.parse(localStorage.getItem(key)) || {};
                character.image = reader.result; // Base64 string
                localStorage.setItem(key, JSON.stringify(character));

                img.src = reader.result;
                img.style.display = "block";
            };

            reader.readAsDataURL(file);
        };

        input.click();
    });
}
