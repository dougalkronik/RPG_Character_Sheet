document.addEventListener("DOMContentLoaded", () => {
    requireCharacter();
    loadAttackSection();
    loadWeaponSection();
    loadSkillSection();
    loadArmourSection();
    loadBodyStatusSection();
});

/* ============================
   CONSTANTS / HELPERS
============================ */

const physical = ["Strength", "Toughness", "Stamina", "Agility", "Dexterity"];
const mental = ["Intelligence", "Wisdom", "Charisma", "Fellowship", "Willpower"];
const abilitiesFull = [
    "Melee Attack",
    "Ranged Attack",
    "Arcane Aptitude",
    "Divine Aptitude",
    "Nature Aptitude"
];

const abilityShortToFull = {
    "Melee": "Melee Attack",
    "Ranged": "Ranged Attack",
    "Arcane": "Arcane Aptitude",
    "Divine": "Divine Aptitude",
    "Nature": "Nature Aptitude"
};

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

function rollDie(max) {
    return Math.floor(Math.random() * max) + 1;
}

function getAttributeTotal(c, name) {
    const key = name.replace(/\s+/g, "_") + "_mod";
    const mod = c[key] || 0;
    return 20 + mod;
}

function getAbilityTotal(c, fullName) {
    const key = fullName.replace(/\s+/g, "_") + "_mod";
    const mod = c[key] || 0;
    return 20 + mod;
}

function getToughnessDefence(c) {
    const total = getAttributeTotal(c, "Toughness");
    return total / 10;
}

/* ============================
   GEAR BONUS HELPERS
============================ */

function getEquippedBonusesForAbilityFull(c, abilityFullName) {
    let total = 0;
    if (!c.inventory) return 0;

    c.inventory.forEach(item => {
        if (
            item.location === "Worn" ||
            item.location === "Left Hand" ||
            item.location === "Right Hand" ||
            item.location === "Both Hands"
        ) {
            if (item.bonusType === abilityFullName) {
                total += item.bonusValue || 0;
            }
        }
    });

    return total;
}

function getDamageBonusFromEquipped(c) {
    let total = 0;
    if (!c.inventory) return 0;

    c.inventory.forEach(item => {
        if (
            item.location === "Worn" ||
            item.location === "Left Hand" ||
            item.location === "Right Hand" ||
            item.location === "Both Hands"
        ) {
            if (item.bonusType === "Damage") {
                total += item.bonusValue || 0;
            }
        }
    });

    return total;
}

function getSkillBonuses(c, skill) {
    let total = 0;
    if (!c.inventory) return 0;

    c.inventory.forEach(item => {
        if (
            item.location === "Worn" ||
            item.location === "Left Hand" ||
            item.location === "Right Hand" ||
            item.location === "Both Hands"
        ) {
            if (item.bonusType === skill.ability || item.bonusType === skill.category) {
                total += item.bonusValue || 0;
            }
        }
    });

    return total;
}

function getArmourValueForLocation(c, loc) {
    let total = 0;
    if (!c.inventory) return 0;

    c.inventory.forEach(item => {
        if (item.location === "Worn" && item.wornSlot === loc && item.bonusType === "Armour") {
            total += item.bonusValue || 0;
        }
    });

    return total;
}

function applyStatusColor(select) {
    const opt = statusOptions.find(o => o.label === select.value);
    if (!opt) return;
    select.style.backgroundColor = opt.color;
    select.style.color = (opt.color === "black") ? "white" : "black";
}

/* ============================
   ATTACK SECTION
============================ */

function loadAttackSection() {
    const c = getCharacterObject();
    const container = document.getElementById("attackContainer");
    container.innerHTML = "";

    const shortAbilities = ["Melee", "Ranged", "Arcane", "Divine", "Nature"];

    shortAbilities.forEach(short => {
        const full = abilityShortToFull[short];
        const abilityTotal = getAbilityTotal(c, full);
        const bonus = getEquippedBonusesForAbilityFull(c, full);

        const row = document.createElement("div");
        row.style.marginBottom = "8px";

        row.innerHTML = `
            <strong>${short}</strong> |
            Ability: <span class="attackAbility">${abilityTotal}</span> |
            Bonus: <span class="attackBonus">${bonus}</span> |
            Modifier:
            <button class="modMinus">-</button>
            <span class="modValue">0</span>
            <button class="modPlus">+</button>
            Total: <span class="attackTotal">${abilityTotal + bonus}</span>
            <button class="attackRollBtn">Roll 1-100</button>
            <span class="attackResult"></span>
        `;

        const modMinus = row.querySelector(".modMinus");
        const modPlus = row.querySelector(".modPlus");
        const modValueSpan = row.querySelector(".modValue");
        const totalSpan = row.querySelector(".attackTotal");
        const rollBtn = row.querySelector(".attackRollBtn");
        const resultSpan = row.querySelector(".attackResult");

        modMinus.addEventListener("click", () => {
            let mod = Number(modValueSpan.textContent);
            mod -= 1;
            modValueSpan.textContent = mod;
            totalSpan.textContent = abilityTotal + bonus + mod;
        });

        modPlus.addEventListener("click", () => {
            let mod = Number(modValueSpan.textContent);
            mod += 1;
            modValueSpan.textContent = mod;
            totalSpan.textContent = abilityTotal + bonus + mod;
        });

        rollBtn.addEventListener("click", () => {
            const total = Number(totalSpan.textContent);
            const roll = rollDie(100);
            const success = roll <= total;
            resultSpan.textContent = ` Roll: ${roll} → ${success ? "Success" : "Fail"}`;
        });

        container.appendChild(row);
    });
}

/* ============================
   WEAPON SECTION
============================ */

function loadWeaponSection() {
    const c = getCharacterObject();
    const container = document.getElementById("weaponContainer");
    container.innerHTML = "";

    const right = c.equipped_righthand || "None";
    const left = c.equipped_lefthand || "None";
    const bothHands = right && left && right === left && right !== "None";

    const damageBonus = getDamageBonusFromEquipped(c);

    ["Right Hand", "Left Hand"].forEach(hand => {
        const weaponName = hand === "Right Hand" ? right : left;

        const row = document.createElement("div");
        row.style.marginBottom = "8px";

        const disabledLeft = bothHands && hand === "Left Hand";

        row.innerHTML = `
            <strong>${hand}</strong> |
            Weapon: <span class="weaponName">${weaponName}</span> |
            Damage Bonus: <span class="weaponBonus">${damageBonus}</span> |
            Modifier:
            <button class="wModMinus"${disabledLeft ? " disabled" : ""}>-</button>
            <span class="wModValue">0</span>
            <button class="wModPlus"${disabledLeft ? " disabled" : ""}>+</button>
            Total Bonus: <span class="wTotal">${damageBonus}</span>
            <button class="weaponRollBtn"${disabledLeft ? " disabled" : ""}>Roll 1-8</button>
            <span class="weaponResult"></span>
        `;

        if (disabledLeft) {
            row.style.opacity = "0.4";
        }

        const modMinus = row.querySelector(".wModMinus");
        const modPlus = row.querySelector(".wModPlus");
        const modValueSpan = row.querySelector(".wModValue");
        const totalSpan = row.querySelector(".wTotal");
        const rollBtn = row.querySelector(".weaponRollBtn");
        const resultSpan = row.querySelector(".weaponResult");

        if (!disabledLeft) {
            modMinus.addEventListener("click", () => {
                let mod = Number(modValueSpan.textContent);
                mod -= 1;
                modValueSpan.textContent = mod;
                totalSpan.textContent = damageBonus + mod;
            });

            modPlus.addEventListener("click", () => {
                let mod = Number(modValueSpan.textContent);
                mod += 1;
                modValueSpan.textContent = mod;
                totalSpan.textContent = damageBonus + mod;
            });

            rollBtn.addEventListener("click", () => {
                const total = Number(totalSpan.textContent);
                const roll = rollDie(8);
                const result = roll + total;
                resultSpan.textContent = ` Roll: ${roll} + ${total} = ${result}`;
            });
        }

        container.appendChild(row);
    });
}

/* ============================
   SKILL SECTION
============================ */

function calculateSkillTotal(skill) {
    const c = getCharacterObject();

    const a1Key = skill.attr1.replace(/\s+/g, "_") + "_mod";
    const a2Key = skill.attr2.replace(/\s+/g, "_") + "_mod";

    const a1Total = 20 + (c[a1Key] || 0);
    const a2Total = 20 + (c[a2Key] || 0);

    const raw = a1Total + a2Total + (skill.mod || 0);

    return skill.divisor ? Math.floor(raw / skill.divisor) : raw;
}

function loadSkillSection() {
    const c = getCharacterObject();
    if (!c.skills) c.skills = [];

    const abilityFilter = document.getElementById("skillAbilityFilter");
    const categoryFilter = document.getElementById("skillCategoryFilter");
    const container = document.getElementById("skillContainer");

    function renderSkills() {
        container.innerHTML = "";
        const af = abilityFilter.value;
        const cf = categoryFilter.value;

        c.skills
            .filter(s =>
                (af === "All" || s.ability === af) &&
                (cf === "All" || s.category === cf)
            )
            .forEach(skill => {
                const baseTotal = calculateSkillTotal(skill);
                const bonuses = getSkillBonuses(c, skill);

                const row = document.createElement("div");
                row.style.marginBottom = "10px";

                row.innerHTML = `
                    <strong>${skill.name}</strong><br>
                    Attribute 1: ${skill.attr1} |
                    Attribute 2: ${skill.attr2} |
                    Ability: ${skill.ability} |
                    Category: ${skill.category}<br>
                    Test Value: <span class="skillTest">${baseTotal}</span> |
                    Bonus: <span class="skillBonus">${bonuses}</span> |
                    Modifier:
                    <button class="sModMinus">-</button>
                    <span class="sModValue">0</span>
                    <button class="sModPlus">+</button>
                    Total: <span class="skillTotal">${baseTotal + bonuses}</span>
                    <button class="skillRollBtn">Roll 1-100</button>
                    <span class="skillResult"></span>
                `;

                const modMinus = row.querySelector(".sModMinus");
                const modPlus = row.querySelector(".sModPlus");
                const modValueSpan = row.querySelector(".sModValue");
                const totalSpan = row.querySelector(".skillTotal");
                const rollBtn = row.querySelector(".skillRollBtn");
                const resultSpan = row.querySelector(".skillResult");

                modMinus.addEventListener("click", () => {
                    let mod = Number(modValueSpan.textContent);
                    mod -= 1;
                    modValueSpan.textContent = mod;
                    totalSpan.textContent = baseTotal + bonuses + mod;
                });

                modPlus.addEventListener("click", () => {
                    let mod = Number(modValueSpan.textContent);
                    mod += 1;
                    modValueSpan.textContent = mod;
                    totalSpan.textContent = baseTotal + bonuses + mod;
                });

                rollBtn.addEventListener("click", () => {
                    const total = Number(totalSpan.textContent);
                    const roll = rollDie(100);
                    const success = roll <= total;
                    resultSpan.textContent = ` Roll: ${roll} → ${success ? "Success" : "Fail"}`;
                });

                container.appendChild(row);
            });
    }

    abilityFilter.addEventListener("change", renderSkills);
    categoryFilter.addEventListener("change", renderSkills);

    renderSkills();
}

/* ============================
   ARMOUR SECTION
============================ */

function loadArmourSection() {
    const c = getCharacterObject();
    const container = document.getElementById("armourContainer");
    container.innerHTML = "";

    if (!c.armourStatus) c.armourStatus = {};

    bodyLocations.forEach(loc => {
        if (!c.armourStatus[loc]) c.armourStatus[loc] = "Undamaged";

        const armourValue = getArmourValueForLocation(c, loc);
        const toughness = getToughnessDefence(c);
        const totalDefence = armourValue + toughness;

        const row = document.createElement("div");
        row.style.marginBottom = "8px";

        const select = document.createElement("select");
        statusOptions.forEach(opt => {
            const o = document.createElement("option");
            o.textContent = opt.label;
            if (opt.label === c.armourStatus[loc]) o.selected = true;
            select.appendChild(o);
        });

        applyStatusColor(select);

        select.addEventListener("change", () => {
            c.armourStatus[loc] = select.value;
            localStorage.setItem(getCurrentCharacterKey(), JSON.stringify(c));
            applyStatusColor(select);
        });

        row.innerHTML = `<strong>${loc}</strong> | `;
        row.appendChild(select);
        row.innerHTML += `
            &nbsp; Armour: <span class="armourVal">${armourValue}</span>
            &nbsp; Toughness: <span class="toughVal">${toughness}</span>
            &nbsp; Total Defence: <span class="defTotal">${totalDefence}</span>
        `;

        container.appendChild(row);
    });
}

/* ============================
   BODY STATUS SECTION
============================ */

function loadBodyStatusSection() {
    const c = getCharacterObject();
    const container = document.getElementById("bodyStatusContainer");
    container.innerHTML = "";

    if (!c.bodyStatus) c.bodyStatus = {};

    bodyLocations.forEach(loc => {
        if (!c.bodyStatus[loc]) c.bodyStatus[loc] = "Undamaged";

        const row = document.createElement("div");
        row.style.marginBottom = "8px";

        const select = document.createElement("select");
        statusOptions.forEach(opt => {
            const o = document.createElement("option");
            o.textContent = opt.label;
            if (opt.label === c.bodyStatus[loc]) o.selected = true;
            select.appendChild(o);
        });

        applyStatusColor(select);

        select.addEventListener("change", () => {
            c.bodyStatus[loc] = select.value;
            localStorage.setItem(getCurrentCharacterKey(), JSON.stringify(c));
            applyStatusColor(select);
        });

        row.innerHTML = `<strong>${loc}</strong> | `;
        row.appendChild(select);

        container.appendChild(row);
    });
}
