document.addEventListener("DOMContentLoaded", () => {
    requireCharacter();
    loadBodyStatus();
    loadArmourStatus();
    loadClothingList();
    loadPurse();
    setupPurseButtons();
    loadBelt();
    loadBackHarness();
    loadQuiver();
    loadBackpack();
});

/* ============================
   BODY STATUS
============================ */

const bodyLocations = [
    "Head",
    "Body",
    "Left Arm",
    "Right Arm",
    "Left Leg",
    "Right Leg"
];

const statusOptions = [
    { label: "Undamaged", color: "green" },
    { label: "Light", color: "yellow" },
    { label: "Medium", color: "orange" },
    { label: "Heavy", color: "red" },
    { label: "Severe", color: "black" }
];

function loadBodyStatus() {
    const c = getCharacterObject();
    if (!c.bodyStatus) c.bodyStatus = {};

    const container = document.getElementById("bodyStatusContainer");
    container.innerHTML = "";

    bodyLocations.forEach(loc => {
        if (!c.bodyStatus[loc]) c.bodyStatus[loc] = "Undamaged";

        const div = document.createElement("div");

        const select = document.createElement("select");
        statusOptions.forEach(opt => {
            const o = document.createElement("option");
            o.textContent = opt.label;
            if (opt.label === c.bodyStatus[loc]) o.selected = true;
            select.appendChild(o);
        });

        select.addEventListener("change", () => {
            c.bodyStatus[loc] = select.value;
            localStorage.setItem(getCurrentCharacterKey(), JSON.stringify(c));
            applyStatusColor(select);
        });

        applyStatusColor(select);

        div.innerHTML = `<strong>${loc}</strong>: `;
        div.appendChild(select);
        container.appendChild(div);
    });
}

function applyStatusColor(select) {
    const opt = statusOptions.find(o => o.label === select.value);
    select.style.backgroundColor = opt.color;
    select.style.color = (opt.color === "black") ? "white" : "black";
}

/* ============================
   ARMOUR STATUS
============================ */

function loadArmourStatus() {
    const c = getCharacterObject();
    if (!c.armourStatus) c.armourStatus = {};

    const container = document.getElementById("armourStatusContainer");
    container.innerHTML = "";

    bodyLocations.forEach(loc => {
        if (!c.armourStatus[loc]) c.armourStatus[loc] = "Undamaged";

        const div = document.createElement("div");

        const select = document.createElement("select");
        statusOptions.forEach(opt => {
            const o = document.createElement("option");
            o.textContent = opt.label;
            if (opt.label === c.armourStatus[loc]) o.selected = true;
            select.appendChild(o);
        });

        select.addEventListener("change", () => {
            c.armourStatus[loc] = select.value;
            localStorage.setItem(getCurrentCharacterKey(), JSON.stringify(c));
            applyStatusColor(select);
        });

        applyStatusColor(select);

        div.innerHTML = `<strong>${loc}</strong>: `;
        div.appendChild(select);
        container.appendChild(div);
    });
}

/* ============================
   CLOTHING LIST
============================ */

const clothingSlots = [
    "Head",
    "Body",
    "Left Arm",
    "Right Arm",
    "Left Leg",
    "Right Leg",
    "Cloak",
    "Gloves",
    "Shoes",
    "Belt"
];

function loadClothingList() {
    const c = getCharacterObject();
    const container = document.getElementById("clothingContainer");
    container.innerHTML = "";

    clothingSlots.forEach(slot => {
        const item = c["equipped_" + slot.toLowerCase().replace(" ", "")] || "None";
        const div = document.createElement("div");
        div.innerHTML = `<strong>${slot}:</strong> ${item}`;
        container.appendChild(div);
    });
}

/* ============================
   PURSE
============================ */

function loadPurse() {
    const c = getCharacterObject();
    const money = c.treasure?.find(t => t.name === "Money");
    document.getElementById("purseAmount").textContent = money ? money.quantity : 0;
}

function setupPurseButtons() {
    const minus = document.getElementById("purseMinus");
    const plus = document.getElementById("pursePlus");

    minus.addEventListener("click", () => {
        const c = getCharacterObject();
        const money = c.treasure.find(t => t.name === "Money");
        if (money.quantity > 0) money.quantity -= 1;
        localStorage.setItem(getCurrentCharacterKey(), JSON.stringify(c));
        loadPurse();
    });

    plus.addEventListener("click", () => {
        const c = getCharacterObject();
        const money = c.treasure.find(t => t.name === "Money");
        money.quantity += 1;
        localStorage.setItem(getCurrentCharacterKey(), JSON.stringify(c));
        loadPurse();
    });
}

/* ============================
   BELT
============================ */

function loadBelt() {
    const c = getCharacterObject();
    const container = document.getElementById("beltContainer");
    container.innerHTML = "";

    const beltItem = c.equipped_belt || "None";
    const slots = c.beltSlots || 0;

    container.innerHTML = `
        <strong>Belt:</strong> ${beltItem}<br>
        Storage Slots: ${slots}<br>
        Hand Weapons Allowed: ${slots >= 2 ? "2" : slots === 1 ? "1" : "None"}
    `;
}

/* ============================
   BACK HARNESS
============================ */

function loadBackHarness() {
    const c = getCharacterObject();
    const container = document.getElementById("backHarnessContainer");

    if (!c.backHarness) c.backHarness = [];

    container.innerHTML = `
        <strong>Back Harness (max 2):</strong><br>
        ${c.backHarness.length ? c.backHarness.join(", ") : "None"}
    `;
}

/* ============================
   QUIVER
============================ */

function loadQuiver() {
    const c = getCharacterObject();
    const container = document.getElementById("quiverContainer");

    const quiver = c.equipped_quiver || "None";
    const ammo = c.quiverAmmo || 0;

    container.innerHTML = `
        <strong>Quiver:</strong> ${quiver}<br>
        Ammunition: ${ammo} / 20
    `;
}

/* ============================
   BACKPACK
============================ */

function loadBackpack() {
    const c = getCharacterObject();
    const container = document.getElementById("backpackContainer");

    if (!c.backpackGrid) {
        c.backpackGrid = Array(6).fill(null).map(() => Array(8).fill("Empty"));
    }

    container.innerHTML = "";

    c.backpackGrid.forEach(row => {
        const rowDiv = document.createElement("div");
        rowDiv.style.display = "flex";

        row.forEach(cell => {
            const cellDiv = document.createElement("div");
            cellDiv.textContent = cell;
            cellDiv.style.border = "1px solid black";
            cellDiv.style.width = "60px";
            cellDiv.style.height = "30px";
            cellDiv.style.textAlign = "center";
            cellDiv.style.margin = "2px";
            rowDiv.appendChild(cellDiv);
        });

        container.appendChild(rowDiv);
    });
}
