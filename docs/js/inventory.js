document.addEventListener("DOMContentLoaded", () => {
    requireCharacter();
    loadInventory();
    loadTreasure();
    setupItemAdd();
    setupTreasureAdd();
    setupInventoryFilters();
});

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
                Location: ${item.location} |
                Qty: ${item.quantity} |
                Bonus: ${item.bonusType} ${item.bonusValue}<br>
                <button class="deleteItemBtn">Delete</button>
            `;

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

        c.inventory.push({
            name,
            type,
            location,
            size,
            stackable,
            quantity,
            bonusType,
            bonusValue,
            slots
        });

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
   TREASURE
============================ */

function loadTreasure() {
    const c = getCharacterObject();
    if (!c.treasure) c.treasure = [];

    ensureBaseMoneyTreasure(c);
    renderTreasureList(c.treasure);
}

function ensureBaseMoneyTreasure(c) {
    if (!c.treasure.some(t => t.name === "Money")) {
        c.treasure.unshift({
            name: "Money",
            value: 1,
            quantity: 0,
            fixed: true
        });
        localStorage.setItem(getCurrentCharacterKey(), JSON.stringify(c));
    }
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
            ${t.fixed ? "" : '<br><button class="deleteTreasureBtn">Delete</button>'}
        `;

        const c = getCharacterObject();

        // Value buttons
        li.querySelector(".valueMinus").addEventListener("click", () => {
            if (t.value > 0) {
                t.value -= 1;
                localStorage.setItem(getCurrentCharacterKey(), JSON.stringify(c));
                renderTreasureList(c.treasure);
            }
        });

        li.querySelector(".valuePlus").addEventListener("click", () => {
            t.value += 1;
            localStorage.setItem(getCurrentCharacterKey(), JSON.stringify(c));
            renderTreasureList(c.treasure);
        });

        // Quantity buttons
        li.querySelector(".qtyMinus").addEventListener("click", () => {
            if (t.name === "Money") {
                if (t.quantity > 0) {
                    t.quantity -= 1;
                }
            } else {
                if (t.quantity > 0) {
                    t.quantity -= 1;
                }
            }
            localStorage.setItem(getCurrentCharacterKey(), JSON.stringify(c));
            renderTreasureList(c.treasure);
        });

        li.querySelector(".qtyPlus").addEventListener("click", () => {
            t.quantity += 1;
            localStorage.setItem(getCurrentCharacterKey(), JSON.stringify(c));
            renderTreasureList(c.treasure);
        });

        // Delete (not for Money)
        if (!t.fixed) {
            li.querySelector(".deleteTreasureBtn").addEventListener("click", () => {
                deleteTreasureItem(index);
            });
        }

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

        c.treasure.push({
            name,
            value,
            quantity,
            fixed: false
        });

        localStorage.setItem(getCurrentCharacterKey(), JSON.stringify(c));

        document.getElementById("treasureName").value = "";

        renderTreasureList(c.treasure);
    });
}

function deleteTreasureItem(index) {
    const c = getCharacterObject();
    const t = c.treasure[index];
    if (t && !t.fixed) {
        c.treasure.splice(index, 1);
        localStorage.setItem(getCurrentCharacterKey(), JSON.stringify(c));
        renderTreasureList(c.treasure);
    }
}
