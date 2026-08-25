document.addEventListener("DOMContentLoaded", () => {
    requireCharacter();
    setupWornSlotToggle();
    loadInventory();
    loadTreasure();
    setupItemAdd();
    setupTreasureAdd();
    setupInventoryFilters();
});

/* ============================
   WORN SLOT ENABLE/DISABLE
============================ */

function setupWornSlotToggle() {
    const loc = document.getElementById("itemLocation");
    const wornSlot = document.getElementById("wornSlot");

    loc.addEventListener("change", () => {
        if (loc.value === "Worn") {
            wornSlot.disabled = false;
        } else {
            wornSlot.disabled = true;
            wornSlot.value = "Head"; // reset default
        }
    });
}

/* ============================
   INVENTORY
============================ */

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
            slots
        };

        c.inventory.push(item);

        localStorage.setItem(getCurrentCharacterKey(), JSON.stringify(c));

        document.getElementById("itemName").value = "";

        loadInventory();
    });
}

function deleteInventoryItem(index) {
    const c = getCharacterObject();
    c.inventory.splice(index, 1);
    localStorage.setItem(getCurrentCharacterKey(), JSON.stringify(c));
    loadInventory();
}

function setupInventoryFilters() {
    ["filterType", "filterLocation", "filterBonus"].forEach(id => {
        document.getElementById(id).addEventListener("change", () => {
            const c = getCharacterObject();
            renderInventoryList(c.inventory || []);
        });
    });
}

/* ============================
   EDIT PANEL
============================ */

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

    localStorage.setItem(getCurrentCharacterKey(), JSON.stringify(c));
    loadInventory();
}

/* ============================
   MOVE ITEM LOCATION
============================ */

function moveItemLocation(index, newLocation) {
    const c = getCharacterObject();
    const item = c.inventory[index];

    item.location = newLocation;
    item.wornSlot = "";

    localStorage.setItem(getCurrentCharacterKey(), JSON.stringify(c));
    loadInventory();
}

/* ============================
   DUPLICATE ITEM
============================ */

function duplicateItem(index) {
    const c = getCharacterObject();
    const item = c.inventory[index];

    const copy = JSON.parse(JSON.stringify(item));
    copy.name = item.name + " (Copy)";

    c.inventory.push(copy);

    localStorage.setItem(getCurrentCharacterKey(), JSON.stringify(c));
    loadInventory();
}

/* ============================
   EQUIP BUTTON (unchanged)
============================ */

function equipItem(item) {
    alert(item.name + " equipped.");
}

/* ============================
   TREASURE SYSTEM
============================ */

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
    const c = getCharacterObject();

    treasure.forEach((t, index) => {
        const total = t.value * t.quantity;
        totalAssets += total;

        const li = document.createElement("li");

        li.innerHTML = `
            <strong>${t.name}</strong><br>
            Value:
            <button class="valueMinus">-</button>
            <span class="valueDisplay">${t.value}</span>
            <button class="valuePlus">+</button>
            &nbsp;|&nbsp;
            Qty:
            <button class="qtyMinus">-</button>
            <span class="qtyDisplay">${t.quantity}</span>
            <button class="qtyPlus">+</button>
            &nbsp;|&nbsp;
            Total: ${total}
            ${t.name === "Money" ? "" : '<br><button class="deleteTreasureBtn">Delete</button>'}
        `;

        li.querySelector(".valueMinus").addEventListener("click", () => {
            const item = c.treasure[index];
            if (item.value > 0) item.value -= 1;
            saveTreasureAndRefresh(c);
        });

        li.querySelector(".valuePlus").addEventListener("click", () => {
            const item = c.treasure[index];
            item.value += 1;
            saveTreasureAndRefresh(c);
        });

        li.querySelector(".qtyMinus").addEventListener("click", () => {
            const item = c.treasure[index];

            if (item.name === "Money") {
                if (item.quantity > 0) item.quantity -= 1;
            } else {
                item.quantity -= 1;
                if (item.quantity < 1) {
                    c.treasure.splice(index, 1);
                }
            }

            saveTreasureAndRefresh(c);
        });

        li.querySelector(".qtyPlus").addEventListener("click", () => {
            const item = c.treasure[index];
            item.quantity += 1;
            saveTreasureAndRefresh(c);
        });

        if (t.name !== "Money") {
            li.querySelector(".deleteTreasureBtn").addEventListener("click", () => {
                c.treasure.splice(index, 1);
                saveTreasureAndRefresh(c);
            });
        }

        list.appendChild(li);
    });

    document.getElementById("totalAssets").textContent = totalAssets;
}

function saveTreasureAndRefresh(c) {
    localStorage.setItem(getCurrentCharacterKey(), JSON.stringify(c));
    renderTreasureList(c.treasure);
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

        c.treasure.push({
            name,
            value,
            quantity
        });

        localStorage.setItem(getCurrentCharacterKey(), JSON.stringify(c));

        document.getElementById("treasureName").value = "";

        renderTreasureList(c.treasure);
    });
}
