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
            wornSlot.value = "Head"; // reset to default
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
                <button class="deleteItemBtn">Delete</button>
            `;

            li.querySelector(".equipItemBtn").addEventListener("click", () => {
                equipItem(item);
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
   EQUIP LOGIC
============================ */

function equipItem(item) {
    const c = getCharacterObject();
    const sizeKey = item.size.split(" ")[0]; // Tiny, Small, Medium, Large, etc.

    // HANDS (weapon/equipment)
    if (item.location === "Left Hand") {
        if (item.type === "Weapon" || item.type === "Equipment") {
            if (sizeKey === "Tiny" || sizeKey === "Small" || sizeKey === "Medium") {
                c.equipped_lefthand = item.name;
            } else if (sizeKey === "Large") {
                c.equipped_lefthand = item.name;
                c.equipped_righthand = item.name;
            }
        }
    }

    if (item.location === "Right Hand") {
        if (item.type === "Weapon" || item.type === "Equipment") {
            if (sizeKey === "Tiny" || sizeKey === "Small" || sizeKey === "Medium") {
                c.equipped_righthand = item.name;
            } else if (sizeKey === "Large") {
                c.equipped_lefthand = item.name;
                c.equipped_righthand = item.name;
            }
        }
    }

    if (item.location === "Both Hands") {
        if (item.type === "Weapon" || item.type === "Equipment") {
            c.equipped_lefthand = item.name;
            c.equipped_righthand = item.name;
        }
    }

    // WORN ITEMS
    if (item.location === "Worn") {
        switch (item.type) {
            case "Ring":
                if (!c.equipped_rings) c.equipped_rings = [];
                if (c.equipped_rings.length < 10) c.equipped_rings.push(item.name);
                break;
            case "Earring":
                if (!c.equipped_earrings) c.equipped_earrings = [];
                if (c.equipped_earrings.length < 10) c.equipped_earrings.push(item.name);
                break;
            case "Necklace":
                if (!c.equipped_necklaces) c.equipped_necklaces = [];
                if (c.equipped_necklaces.length < 10) c.equipped_necklaces.push(item.name);
                break;
            case "Clothing":
            case "Armour":
                equipClothingArmour(c, item, sizeKey);
                break;
        }
    }

    localStorage.setItem(getCurrentCharacterKey(), JSON.stringify(c));
    alert(item.name + " equipped.");
}

function equipClothingArmour(c, item, sizeKey) {
    const slot = item.wornSlot;

    // Legs
    if (slot === "Left Leg" || slot === "Right Leg") {
        if (sizeKey === "Tiny" || sizeKey === "Small" || sizeKey === "Medium") {
            if (slot === "Left Leg") c.equipped_leftleg = item.name;
            if (slot === "Right Leg") c.equipped_rightleg = item.name;
        } else if (sizeKey === "Large") {
            c.equipped_leftleg = item.name;
            c.equipped_rightleg = item.name;
        }
    }

    // Arms
    if (slot === "Left Arm" || slot === "Right Arm") {
        if (sizeKey === "Tiny" || sizeKey === "Small") {
            if (slot === "Left Arm") c.equipped_leftarm = item.name;
            if (slot === "Right Arm") c.equipped_rightarm = item.name;
        } else if (sizeKey === "Medium") {
            c.equipped_leftarm = item.name;
            c.equipped_rightarm = item.name;
        }
    }

    // Body
    if (slot === "Body") {
        c.equipped_body = item.name;
        if (sizeKey === "Large") {
            // Large body item also covers both arms
            c.equipped_leftarm = item.name;
            c.equipped_rightarm = item.name;
        }
    }

    // Head
    if (slot === "Head") {
        c.equipped_head = item.name;
    }

    // Cloak
    if (slot === "Cloak") {
        c.equipped_cloak = item.name;
    }
}

/* ============================
   TREASURE
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
