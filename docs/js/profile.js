document.addEventListener("DOMContentLoaded", () => {
    loadProfile();
    setupAutoSave();
    setupImageUpload();

    document.getElementById("addProfessionBtn")
        .addEventListener("click", addProfessionToHistory);
});

function loadProfile() {
    const key = localStorage.getItem("currentCharacter");
    if (!key) {
        alert("No character selected");
        return;
    }

    const character = JSON.parse(localStorage.getItem(key)) || {};

    // Load basic fields
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

    history.forEach((entry, index) => {
        const li = document.createElement("li");

        li.innerHTML = `
            ${entry}
            <button class="deleteProfessionBtn" data-index="${index}">
                Delete
            </button>
        `;

        li.querySelector(".deleteProfessionBtn").addEventListener("click", () => {
            deleteProfession(index);
        });

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
        });
    });
}

function saveField(key, field, value) {
    const character = JSON.parse(localStorage.getItem(key)) || {};
    character[field] = value.trim();
    localStorage.setItem(key, JSON.stringify(character));
}

function addProfessionToHistory() {
    const key = localStorage.getItem("currentCharacter");
    const character = JSON.parse(localStorage.getItem(key)) || {};

    const professionInput = document.getElementById("charProfession");
    const newProfession = professionInput.value.trim();

    if (newProfession === "") {
        alert("Enter a profession first");
        return;
    }

    if (!character.professionHistory) {
        character.professionHistory = [];
    }

    if (character.professionHistory.includes(newProfession)) {
        alert("Profession already in history");
        return;
    }

    character.professionHistory.push(newProfession);

    localStorage.setItem(key, JSON.stringify(character));

    loadProfile();
}

function deleteProfession(index) {
    const key = localStorage.getItem("currentCharacter");
    const character = JSON.parse(localStorage.getItem(key)) || {};

    if (!character.professionHistory) return;

    character.professionHistory.splice(index, 1);

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
                character.image = reader.result;
                localStorage.setItem(key, JSON.stringify(character));

                img.src = reader.result;
                img.style.display = "block";
            };

            reader.readAsDataURL(file);
        };

        input.click();
    });
}
