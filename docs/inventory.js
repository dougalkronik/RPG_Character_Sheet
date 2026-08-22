document.addEventListener("DOMContentLoaded", () => {
    requireCharacter();
    loadInventory();
    loadTreasure();
    setupItemAdd();
    setupTreasureAdd();
});

/* ============================
   INVENTORY
============================ */

function loadInventory() {
    const c = getCharacterObject();
    if (!c.inventory) c.inventory = [];

    const list = document.getElementById("inventoryList");
    list.innerHTML = "";

    c.inventory.forEach((item, index) => {
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

/* ============================
   TREASURE
============================ */

function loadTreasure() {
    const c = getCharacterObject();
    if (!c.treasure) c.treasure = [];

    const list = document.getElementById("treasureList");
    list.innerHTML = "";

    let totalAssets = 0;

    c.treasure.forEach((t, index) => {
        const total = t.value * t.quantity;
        totalAssets += total;

        const li = document.createElement("li");

        li.innerHTML = `
            <strong>${t.name}</strong><br>
            Value: ${t.value} |
            Qty: ${t.quantity} |
            Total: ${total}<br>
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

        c.treasure.push({
            name,
            value,
            quantity
        });

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
