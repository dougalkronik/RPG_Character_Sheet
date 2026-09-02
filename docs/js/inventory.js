document.addEventListener("DOMContentLoaded", () => {
    requireCharacter();
    loadInventory();
    loadTreasure();
    setupWornSlotToggle();
    setupDynamicItemFields();
    setupItemAdd();
    setupTreasureAdd();
    setupInventoryFilters();
});

/* WORN SLOT TOGGLE */

function setupWornSlotToggle() {
    const loc = document.getElementById("itemLocation");
    const wornSlot = document.getElementById("wornSlot");

    loc.addEventListener("change", () => {
        const isWorn = (loc.value === "Worn");
        wornSlot.disabled = !isWorn;
        if (!isWorn) wornSlot.value = "Head";
    });
}

/* DYNAMIC FIELDS */

function setupDynamicItemFields() {
    const type = document.getElementById("itemType");

    const weaponCategory = document.getElementById("weaponCategory");
    const ammoUsed = document.getElementById("ammoUsed");
    const weaponUsedBy = document.getElementById("weaponUsedBy");

    const ammoElementName = document.getElementById("ammoElementName");
    const ammoCapacity = document.getElementById("ammoCapacity");
    const ammoQuantity = document.getElementById("ammoQuantity");

    const storageSlots = document.getElementById("itemSlots");

    // Always start weaponCategory at first option (Melee)
    weaponCategory.value = weaponCategory.options[0].value;

    function populateAmmoUsed() {
        const c = getCharacterObject();
        ammoUsed.innerHTML = "";

        const ammoList = (c && c.inventory ? c.inventory : []).filter(i => i.type === "Ammunition");

        if (ammoList.length === 0) {
            ammoUsed.innerHTML = "<option>None</option>";
            return;
        }

        ammoList.forEach(ammo => {
            const opt = document.createElement("option");
            opt.textContent = ammo.name;
            ammoUsed.appendChild(opt);
        });
    }

    function populateWeaponUsedBy() {
        const c = getCharacterObject();
        weaponUsedBy.innerHTML = "";

        const rangedWeapons = (c && c.inventory ? c.inventory : []).filter(i =>
            i.type === "Weapon" && i.weaponCategory === "Ranged"
        );

        if (rangedWeapons.length === 0) {
            weaponUsedBy.innerHTML = "<option>None</option>";
            return;
        }

        rangedWeapons.forEach(w => {
            const opt = document.createElement("option");
            opt.textContent = w.name;
            weaponUsedBy.appendChild(opt);
        });
    }

    function updateFields() {
        const t = type.value;

        // Weapon Category
        weaponCategory.disabled = (t !== "Weapon");
        if (t !== "Weapon") {
            weaponCategory.value = weaponCategory.options[0].value;
        }

        // Ammunition Used (for ranged weapons)
        if (t === "Weapon" && weaponCategory.value === "Ranged") {
            ammoUsed.disabled = false;
            populateAmmoUsed();
        } else {
            ammoUsed.disabled = true;
            ammoUsed.innerHTML = "<option>None</option>";
        }

        // Weapon Used By (for ammunition items)
        if (t === "Ammunition") {
            weaponUsedBy.disabled = false;
            populateWeaponUsedBy();
        } else {
            weaponUsedBy.disabled = true;
            weaponUsedBy.innerHTML = "<option>None</option>";
        }

        // Ammunition fields
        const isAmmo = (t === "Ammunition");

        ammoElementName.disabled = !isAmmo;
        ammoCapacity.disabled = !isAmmo;
        ammoQuantity.disabled = !isAmmo;

        if (!isAmmo) {
            ammoElementName.value = "";
            ammoCapacity.value = 0;
            ammoQuantity.value = 1;
        }

        // Storage slots
        const isStorage = (t === "Storage");
        storageSlots.disabled = !isStorage;
        if (!isStorage) storageSlots.value = 1;
    }

    updateFields();

    type.addEventListener("change", updateFields);
    weaponCategory.addEventListener("change", updateFields);
}

/* INVENTORY LOAD & RENDER */

function loadInventory() {
    const c = getCharacterObject();
    if (!c.inventory) c.inventory = [];
    renderInventoryList(c.inventory);
}

function renderInventoryList(items) {
    const list = document.getElementById("inventoryList");
    list.innerHTML = "";

    const typeFilter = document.getElementById("filterType").value;
    const locFilter = document.getElementById("filterLocation").value;
    const bonusFilter = document.getElementById("filterBonus").value;

    items
        .filter(item =>
            (typeFilter === "All" || item.type === typeFilter) &&
            (locFilter === "All" || item.location === locFilter) &&
            (bonusFilter === "All" || item.bonusType === bonusFilter)
        )
        .forEach((item, index) => {
            const li = document.createElement("li");

            li.innerHTML = `
                <strong>${item.name}</strong><br>
                Type: ${item.type} |
                Location: ${item.location}${item.location === "Worn" && item.wornSlot ? " (" + item.wornSlot + ")" : ""} |
                Qty: ${item.quantity} |
                Bonus: ${item.bonusType} ${item.bonusValue}<br>

                ${item.type === "Weapon" ? `Category: ${item.weaponCategory}<br>` : ""}
                ${item.ammoUsed ? `Ammo Used: ${item.ammoUsed}<br>` : ""}
                ${item.weaponUsedBy ? `Used By: ${item.weaponUsedBy}<br>` : ""}

                ${item.type === "Ammunition" ? `
                    Element: ${item.elementName} |
                    Capacity: ${item.capacity} |
                    Quantity: ${item.ammoQuantity}<br>
                ` : ""}

                ${item.type === "Storage" ? `Slots: ${item.slots}<br>` : ""}

                <button class="equipItemBtn">Equip</button>
                <button class="editItemBtn">Edit</button>
                <button class="duplicateItemBtn">Duplicate</button>
                <button class="deleteItemBtn">Delete</button>

                <div class="editPanel" style="display:none; margin-top:10px; padding:10px; border:1px solid #ccc;"></div>
            `;

            li.querySelector(".equipItemBtn").addEventListener("click", () => {
                equipItem(item);
            });

            li.querySelector(".editItemBtn").addEventListener("click", () => {
                openEditPanel(item, index, li.querySelector(".editPanel"));
            });

            li.querySelector(".duplicateItemBtn").addEventListener("click", () => {
                duplicateItem(index);
            });

            li.querySelector(".deleteItemBtn").addEventListener("click", () => {
                deleteInventoryItem(index);
            });

            list.appendChild(li);
        });
}

/* ADD ITEM */

function setupItemAdd() {
    document.getElementById("addItemBtn").addEventListener("click", () => {
        const name = document.getElementById("itemName").value.trim();
        const type = document.getElementById("itemType").value;
        const location = document.getElementById("itemLocation").value;
        const wornSlot = document.getElementById("wornSlot").disabled ? "" : document.getElementById("wornSlot").value;

        const size = document.getElementById("itemSize").value;
        const stackable = document.getElementById("itemStackable").checked;
        const quantity = Number(document.getElementById("itemQuantity").value);

        const bonusType = document.getElementById("itemBonusType").value;
        const bonusValue = Number(document.getElementById("itemBonusValue").value);

        const weaponCategory = document.getElementById("weaponCategory").value;
        const ammoUsedValue = document.getElementById("ammoUsed").value;
        const weaponUsedByValue = document.getElementById("weaponUsedBy").value;

        const elementName = document.getElementById("ammoElementName").value;
        const capacity = Number(document.getElementById("ammoCapacity").value);
        const ammoQuantity = Number(document.getElementById("ammoQuantity").value);

        const slots = Number(document.getElementById("itemSlots").value);

        if (!name) {
            alert("Enter an item name");
            return;
        }

        const c = getCharacterObject();
        if (!c.inventory) c.inventory = [];

        const item = {
            name,
            type,
            location,
            wornSlot,
            size,
            stackable,
            quantity,
            bonusType,
            bonusValue,

            slots: type === "Storage" ? slots : 0,

            weaponCategory: type === "Weapon" ? weaponCategory : "",
            ammoUsed: (type === "Weapon" && weaponCategory === "Ranged") ? ammoUsedValue : "",
            weaponUsedBy: (type === "Ammunition") ? weaponUsedByValue : "",

            elementName: type === "Ammunition" ? elementName : "",
            capacity: type === "Ammunition" ? capacity : 0,
            ammoQuantity: type === "Ammunition" ? ammoQuantity : 0
        };

        c.inventory.push(item);
        localStorage.setItem(getCurrentCharacterKey(), JSON.stringify(c));

        document.getElementById("itemName").value = "";
        loadInventory();
    });
}

/* DELETE / DUPLICATE / EQUIP */

function deleteInventoryItem(index) {
    const c = getCharacterObject();
    c.inventory.splice(index, 1);
    localStorage.setItem(getCurrentCharacterKey(), JSON.stringify(c));
    loadInventory();
}

function duplicateItem(index) {
    const c = getCharacterObject();
    const item = c.inventory[index];
    const copy = JSON.parse(JSON.stringify(item));
    copy.name = item.name + " (Copy)";
    c.inventory.push(copy);
    localStorage.setItem(getCurrentCharacterKey(), JSON.stringify(c));
    loadInventory();
}

function equipItem(item) {
    alert(item.name + " equipped.");
}

/* EDIT PANEL */

function openEditPanel(item, index, panel) {
    panel.style.display = "block";

    panel.innerHTML = `
        <label>Name</label>
        <input type="text" id="editName" value="${item.name}">

        <label>Type</label>
        <select id="editType">
            <option>${item.type}</option>
            <option>Armour</option>
            <option>Weapon</option>
            <option>Ammunition</option>
            <option>Consumable</option>
            <option>Equipment</option>
            <option>Clothing</option>
            <option>Ring</option>
            <option>Earring</option>
            <option>Necklace</option>
            <option>Storage</option>
        </select>

        <label>Location</label>
        <select id="editLocation">
            <option>${item.location}</option>
            <option>None</option>
            <option>Worn</option>
            <option>Belt</option>
            <option>Backpack</option>
            <option>Mount</option>
            <option>Home</option>
            <option>Left Hand</option>
            <option>Right Hand</option>
            <option>Both Hands</option>
        </select>

        <label>Worn Slot</label>
        <select id="editWornSlot">
            <option>${item.wornSlot || ""}</option>
            <option>Head</option>
            <option>Body</option>
            <option>Left Arm</option>
            <option>Left Hand</option>
            <option>Right Arm</option>
            <option>Right Hand</option>
            <option>Left Leg</option>
            <option>Right Leg</option>
            <option>Cloak</option>
            <option>Vest</option>
        </select>

        <label>Bonus Type</label>
        <select id="editBonusType">
            <option>${item.bonusType}</option>
            <option>None</option>
            <option>Armour</option>
            <option>Damage</option>
            <option>Melee Attack</option>
            <option>Ranged Attack</option>
            <option>Arcane Ability</option>
            <option>Divinity Ability</option>
            <option>Nature Ability</option>
            <option>Command</option>
            <option>Tactical Control</option>
            <option>Strategic Control</option>
        </select>

        <label>Bonus Value</label>
        <input type="number" id="editBonusValue" value="${item.bonusValue}">

        ${item.type === "Weapon" ? `
            <label>Weapon Category</label>
            <select id="editWeaponCategory">
                <option>${item.weaponCategory}</option>
                <option>Melee</option>
                <option>Ranged</option>
                <option>Arcane</option>
                <option>Divine</option>
                <option>Nature</option>
            </select>

            ${item.weaponCategory === "Ranged" ? `
                <label>Ammunition Used</label>
                <select id="editAmmoUsed">
                    <option>${item.ammoUsed}</option>
                </select>
            ` : ""}
        ` : ""}

        ${item.type === "Ammunition" ? `
            <label>Weapon Used By</label>
            <select id="editWeaponUsedBy">
                <option>${item.weaponUsedBy}</option>
            </select>

            <label>Element Name</label>
            <input type="text" id="editElementName" value="${item.elementName}">

            <label>Capacity</label>
            <input type="number" id="editCapacity" value="${item.capacity}">

            <label>Quantity</label>
            <input type="number" id="editAmmoQuantity" value="${item.ammoQuantity}">
        ` : ""}

        ${item.type === "Storage" ? `
            <label>Slots</label>
            <input type="number" id="editSlots" value="${item.slots}">
        ` : ""}

        <button id="saveEditBtn">Save</button>
        <button id="saveEquipBtn">Save & Equip</button>
        <button id="cancelEditBtn">Cancel</button>
        <button id="moveStorageBtn">Move to Storage</button>
        <button id="moveBackpackBtn">Move to Backpack</button>
        <button id="moveBeltBtn">Move to Belt</button>
    `;

    panel.querySelector("#saveEditBtn").addEventListener("click", () => {
        saveEditedItem(index);
    });

    panel.querySelector("#saveEquipBtn").addEventListener("click", () => {
        saveEditedItem(index);
        equipItem(getCharacterObject().inventory[index]);
    });

    panel.querySelector("#cancelEditBtn").addEventListener("click", () => {
        panel.style.display = "none";
    });

    panel.querySelector("#moveStorageBtn").addEventListener("click", () => {
        moveItemLocation(index, "Storage");
    });

    panel.querySelector("#moveBackpackBtn").addEventListener("click", () => {
        moveItemLocation(index, "Backpack");
    });

    panel.querySelector("#moveBeltBtn").addEventListener("click", () => {
        moveItemLocation(index, "Belt");
    });
}

function saveEditedItem(index) {
    const c = getCharacterObject();
    const item = c.inventory[index];

    item.name = document.getElementById("editName").value;
    item.type = document.getElementById("editType").value;
    item.location = document.getElementById("editLocation").value;
    item.wornSlot = document.getElementById("editWornSlot").value;
    item.bonusType = document.getElementById("editBonusType").value;
    item.bonusValue = Number(document.getElementById("editBonusValue").value);

    if (item.type === "Weapon") {
        item.weaponCategory = document.getElementById("editWeaponCategory").value;

        if (item.weaponCategory === "Ranged") {
            item.ammoUsed = document.getElementById("editAmmoUsed").value;
        } else {
            item.ammoUsed = "";
        }
    }

    if (item.type === "Ammunition") {
        item.weaponUsedBy = document.getElementById("editWeaponUsedBy").value;
        item.elementName = document.getElementById("editElementName").value;
        item.capacity = Number(document.getElementById("editCapacity").value);
        item.ammoQuantity = Number(document.getElementById("editAmmoQuantity").value);
    }

    if (item.type === "Storage") {
        item.slots = Number(document.getElementById("editSlots").value);
    }

    localStorage.setItem(getCurrentCharacterKey(), JSON.stringify(c));
    loadInventory();
}

/* MOVE ITEM LOCATION */

function moveItemLocation(index, newLocation) {
    const c = getCharacterObject();
    const item = c.inventory[index];

    item.location = newLocation;
    item.wornSlot = "";

    localStorage.setItem(getCurrentCharacterKey(), JSON.stringify(c));
    loadInventory();
}

/* INVENTORY FILTERS */

function setupInventoryFilters() {
    const typeFilter = document.getElementById("filterType");
    const locFilter = document.getElementById("filterLocation");
    const bonusFilter = document.getElementById("filterBonus");

    [typeFilter, locFilter, bonusFilter].forEach(sel => {
        sel.addEventListener("change", () => {
            loadInventory();
        });
    });
}

/* TREASURE SYSTEM */

function loadTreasure() {
    const c = getCharacterObject();
    if (!c.treasure) c.treasure = [];

    if (!c.treasure.some(t => t.name === "Money")) {
        c.treasure.unshift({
            name: "Money",
            value: 1,
            quantity: 0
        });
        localStorage.setItem(getCurrentCharacterKey(), JSON.stringify(c));
    }

    renderTreasureList(c.treasure);
}

function renderTreasureList(treasure) {
    const list = document.getElementById("treasureList");
    list.innerHTML = "";

    let totalAssets = 0;

    treasure.forEach((t, index) => {
        const total = t.value * t.quantity;
        totalAssets += total;

        const li = document.createElement("li");
        li.innerHTML = `
            <strong>${t.name}</strong> — Value: ${t.value}, Qty: ${t.quantity}, Total: ${total}
            <button class="deleteTreasureBtn">Delete</button>
        `;

        li.querySelector(".deleteTreasureBtn").addEventListener("click", () => {
            deleteTreasureItem(index);
        });

        list.appendChild(li);
    });

    document.getElementById("totalAssets").textContent = totalAssets;
}

function setupTreasureAdd() {
    document.getElementById("addTreasureBtn").addEventListener("click", () => {
        const name = document.getElementById("treasureName").value.trim();
        const value = Number(document.getElementById("treasureValue").value);
        const quantity = Number(document.getElementById("treasureQuantity").value);

        if (!name) {
            alert("Enter a treasure name");
            return;
        }

        const c = getCharacterObject();
        if (!c.treasure) c.treasure = [];

        c.treasure.push({ name, value, quantity });
        localStorage.setItem(getCurrentCharacterKey(), JSON.stringify(c));

        document.getElementById("treasureName").value = "";
        loadTreasure();
    });
}

function deleteTreasureItem(index) {
    const c = getCharacterObject();
    c.treasure.splice(index, 1);
    localStorage.setItem(getCurrentCharacterKey(), JSON.stringify(c));
    loadTreasure();
}
