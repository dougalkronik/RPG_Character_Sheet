document.addEventListener("DOMContentLoaded", () => {
    requireCharacter();
    loadStatusDropdowns();
    loadEquippedWeapons();
    loadArmourStatus();
    loadClothingStatus();
    loadPurse();
    setupPurseButtons();
    loadBeltStorage();
    loadVestStorage();
    loadBackpackStorage();
});

/* ============================================
   STATUS DROPDOWNS (BODY / ARMOUR / CLOTHING)
   ============================================ */

const STATUS_OPTIONS = [
    { value: "Undamaged", class: "status-undamaged", rowClass: "status-row-undamaged" },
    { value: "Light",     class: "status-light",      rowClass: "status-row-light" },
    { value: "Medium",    class: "status-medium",     rowClass: "status-row-medium" },
    { value: "Heavy",     class: "status-heavy",      rowClass: "status-row-heavy" },
    { value: "Severe",    class: "status-severe",     rowClass: "status-row-severe" }
];

function loadStatusDropdowns() {
    const dropdowns = document.querySelectorAll(".statusDropdown");

    dropdowns.forEach(drop => {
        STATUS_OPTIONS.forEach(opt => {
            const o = document.createElement("option");
            o.textContent = opt.value;
            o.value = opt.value;
            o.classList.add(opt.class);
            drop.appendChild(o);
        });

        drop.addEventListener("change", () => {
            applyStatusRowColour(drop);
            saveStatus(drop.id, drop.value);
        });
    });
}

function applyStatusRowColour(drop) {
    const row = drop.closest("tr");
    STATUS_OPTIONS.forEach(opt => {
        row.classList.remove(opt.rowClass);
    });

    const selected = STATUS_OPTIONS.find(o => o.value === drop.value);
    if (selected) row.classList.add(selected.rowClass);
}

function saveStatus(field, value) {
    const c = getCharacterObject();
    c[field] = value;
    localStorage.setItem(getCurrentCharacterKey(), JSON.stringify(c));
}

/* ============================================
   EQUIPPED WEAPONS (RIGHT / LEFT HAND)
   ============================================ */

function loadEquippedWeapons() {
    const c = getCharacterObject();
    const inv = c.inventory || [];

    const rightHand = inv.find(i => i.location === "Right Hand" && i.type === "Weapon");
    const leftHand  = inv.find(i => i.location === "Left Hand" && i.type === "Weapon");

    const rightCell = document.getElementById("rightHandWeapon");
    const leftCell  = document.getElementById("leftHandWeapon");

    rightCell.textContent = rightHand ? rightHand.name : "None";
    leftCell.textContent  = leftHand ? leftHand.name : "None";

    // Large weapon rule
    if (rightHand && rightHand.size === "Large (5x5)") {
        leftCell.textContent = rightHand.name + " (Two-Handed)";
        leftCell.classList.add("large-weapon-gray");
    }
}

/* ============================================
   ARMOUR STATUS + DISPLAY
   ============================================ */

function loadArmourStatus() {
    const c = getCharacterObject();
    const inv = c.inventory || [];

    const armourSlots = ["Head", "Body", "Left Arm", "Right Arm", "Left Leg", "Right Leg"];

    armourSlots.forEach(slot => {
        const item = inv.find(i =>
            i.type === "Armour" &&
            i.location === "Worn" &&
            i.wornSlot === slot
        );

        const cell = document.getElementById("armourItem_" + slot.toLowerCase().replace(" ", ""));
        if (cell) cell.textContent = item ? item.name : "None";
    });
}

/* ============================================
   CLOTHING STATUS + DISPLAY
   ============================================ */

function loadClothingStatus() {
    const c = getCharacterObject();
    const inv = c.inventory || [];

    const clothingSlots = [
        "Head", "Body", "Left Arm", "Right Arm",
        "Left Leg", "Right Leg", "Cloak", "Gloves",
        "Shoes", "Belt"
    ];

    clothingSlots.forEach(slot => {
        const item = inv.find(i =>
            i.type === "Clothing" &&
            i.location === "Worn" &&
            i.wornSlot === slot
        );

        const cell = document.getElementById("clothingItem_" + slot.toLowerCase().replace(" ", ""));
        if (cell) cell.textContent = item ? item.name : "None";
    });
}

/* ============================================
   PURSE (MONEY)
   ============================================ */

function loadPurse() {
    const c = getCharacterObject();
    const money = (c.treasure || []).find(t => t.name === "Money");

    const purseBox = document.getElementById("purseAmount");
    purseBox.value = money ? money.quantity : 0;

    purseBox.addEventListener("change", () => {
        updatePurse(purseBox.value);
    });
}

function setupPurseButtons() {
    document.getElementById("pursePlus").addEventListener("click", () => {
        const box = document.getElementById("purseAmount");
        box.value = Number(box.value) + 1;
        updatePurse(box.value);
    });

    document.getElementById("purseMinus").addEventListener("click", () => {
        const box = document.getElementById("purseAmount");
        box.value = Math.max(0, Number(box.value) - 1);
        updatePurse(box.value);
    });
}

function updatePurse(amount) {
    const c = getCharacterObject();
    const money = (c.treasure || []).find(t => t.name === "Money");

    if (money) {
        money.quantity = Number(amount);
        localStorage.setItem(getCurrentCharacterKey(), JSON.stringify(c));
    }
}

/* ============================================
   BELT STORAGE
   ============================================ */

function loadBeltStorage() {
    const c = getCharacterObject();
    const inv = c.inventory || [];

    const belt = inv.find(i =>
        i.type === "Storage" &&
        i.location === "Worn" &&
        i.wornSlot === "Belt"
    );

    const beltInfo = document.getElementById("beltInfo");
    const beltWeapons = document.getElementById("beltWeapons");

    beltWeapons.innerHTML = "";

    if (!belt) {
        beltInfo.textContent = "No belt equipped.";
        return;
    }

    beltInfo.textContent = `Belt Slots: ${belt.slots}`;

    const weapons = inv.filter(i =>
        i.type === "Weapon" &&
        i.location === "Belt"
    );

    weapons.slice(0, belt.slots).forEach(w => {
        const li = document.createElement("li");
        li.textContent = w.name;
        beltWeapons.appendChild(li);
    });
}

/* ============================================
   VEST STORAGE
   ============================================ */

function loadVestStorage() {
    const c = getCharacterObject();
    const inv = c.inventory || [];

    const vest = inv.find(i =>
        i.type === "Clothing" &&
        i.location === "Worn" &&
        i.wornSlot === "Vest"
    );

    const vestInfo = document.getElementById("vestInfo");
    const vestWeapons = document.getElementById("vestWeapons");
    const vestAmmo = document.getElementById("vestAmmo");

    vestWeapons.innerHTML = "";
    vestAmmo.innerHTML = "";

    if (!vest) {
        vestInfo.textContent = "No vest equipped.";
        return;
    }

    vestInfo.textContent = "Vest Equipped";

    const largeWeapons = inv.filter(i =>
        i.type === "Weapon" &&
        i.size === "Large (5x5)" &&
        i.location === "Vest"
    );

    largeWeapons.slice(0, 2).forEach(w => {
        const li = document.createElement("li");
        li.textContent = w.name;
        vestWeapons.appendChild(li);
    });

    const ammoItems = inv.filter(i =>
        i.type === "Ammunition" &&
        i.location === "Vest"
    );

    ammoItems.forEach(a => {
        const li = document.createElement("li");
        li.textContent = `${a.name} — Qty: ${a.ammoQuantity}`;
        vestAmmo.appendChild(li);
    });
}

/* ============================================
   BACKPACK STORAGE (GRID + STRAPS)
   ============================================ */

function loadBackpackStorage() {
    const c = getCharacterObject();
    const inv = c.inventory || [];

    const backpack = inv.find(i =>
        i.type === "Storage" &&
        i.location === "Worn" &&
        i.wornSlot === "Backpack"
    );

    const grid = document.getElementById("backpackGrid");

    grid.innerHTML = "";

    if (!backpack) {
        grid.textContent = "No backpack equipped.";
        return;
    }

    // Build 6x8 grid
    for (let i = 0; i < 48; i++) {
        const cell = document.createElement("div");
        cell.classList.add("backpack-cell");
        cell.textContent = "";
        grid.appendChild(cell);
    }

    // Fill grid with tiny/small/medium items
    const gridItems = inv.filter(i =>
        i.location === "Backpack" &&
        (i.size === "Tiny (1x1)" ||
         i.size === "Small (2x2)" ||
         i.size === "Medium (3x3)")
    );

    gridItems.forEach((item, idx) => {
        if (idx < 48) {
            grid.children[idx].textContent = item.name;
        }
    });

    // Large items → straps
    const largeItems = inv.filter(i =>
        i.location === "Backpack" &&
        i.size === "Large (5x5)"
    );

    const strapTop = document.getElementById("backpackStrap_top");
    const strapLeft = document.getElementById("backpackStrap_left");
    const strapRight = document.getElementById("backpackStrap_right");
    const strapBottom = document.getElementById("backpackStrap_bottom");

    strapTop.textContent = "Top Strap";
    strapLeft.textContent = "Left Strap";
    strapRight.textContent = "Right Strap";
    strapBottom.textContent = "Bottom Strap";

    if (largeItems[0]) strapTop.textContent += ": " + largeItems[0].name;
    if (largeItems[1]) strapLeft.textContent += ": " + largeItems[1].name;
    if (largeItems[2]) strapRight.textContent += ": " + largeItems[2].name;
    if (largeItems[3]) strapBottom.textContent += ": " + largeItems[3].name;
}
