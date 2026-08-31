document.addEventListener("DOMContentLoaded", () => {
    requireCharacter();
    loadExperience();
    setupExperienceHandlers();
    loadAttributes();
    loadSkills();
    setupSkillAdd();
    setupSkillSort();
});

/* ============================
   EXPERIENCE
============================ */

function loadExperience() {
    const c = getCharacterObject();
    document.getElementById("expAccumulated").value = c.expAccumulated || 0;
    document.getElementById("expSpent").value = c.expSpent || 0;
}

function setupExperienceHandlers() {
    const acc = document.getElementById("expAccumulated");
    const spent = document.getElementById("expSpent");

    acc.addEventListener("input", () => {
        const a = Number(acc.value);
        saveCharacterField("expAccumulated", a);

        if (Number(spent.value) > a) {
            spent.value = a;
            saveCharacterField("expSpent", a);
        }
    });

    spent.addEventListener("input", () => {
        const s = Number(spent.value);
        const a = Number(acc.value);

        if (s > a) {
            spent.value = a;
        }

        saveCharacterField("expSpent", Number(spent.value));
    });
}

/* ============================
   ATTRIBUTE GROUPS
============================ */

const physical = ["Strength", "Toughness", "Stamina", "Agility", "Dexterity"];
const mental = ["Intelligence", "Wisdom", "Charisma", "Fellowship", "Willpower"];
const abilities = ["Melee Attack", "Ranged Attack", "Arcane Aptitude", "Divine Aptitude", "Nature Aptitude"];

function loadAttributes() {
    const c = getCharacterObject();

    buildAttributeGroup("physicalContainer", physical, c);
    buildAttributeGroup("mentalContainer", mental, c);
    buildAttributeGroup("abilitiesContainer", abilities, c);

    populateSkillAttributeDropdowns();
}

function buildAttributeGroup(containerId, list, c) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    list.forEach(attr => {
        const key = attr.replace(/\s+/g, "_");
        const mod = c[key + "_mod"] || 0;
        const total = 20 + mod;

        const div = document.createElement("div");
        div.className = "attributeRow";

        div.innerHTML = `
            <strong>${attr}</strong>
            <button class="minusBtn">-</button>
            <span class="modValue">${mod}</span>
            <button class="plusBtn">+</button>
            <span class="totalValue">${total}</span>
        `;

        div.querySelector(".minusBtn").addEventListener("click", () => {
            updateAttributeModifier(key, -1);
        });

        div.querySelector(".plusBtn").addEventListener("click", () => {
            updateAttributeModifier(key, +1);
        });

        container.appendChild(div);
    });
}

function updateAttributeModifier(key, delta) {
    const c = getCharacterObject();
    const modKey = key + "_mod";
    c[modKey] = (c[modKey] || 0) + delta;
    localStorage.setItem(getCurrentCharacterKey(), JSON.stringify(c));
    loadAttributes();
}

/* ============================
   SKILLS
============================ */

function loadSkills() {
    const c = getCharacterObject();
    if (!c.skills) c.skills = [];

    ensureBaseSkills(c);
    renderSkillList(c.skills);
}

/* OPTION 2 — base skills always update */
function ensureBaseSkills(c) {
    const baseSkills = [
        { 
            name: "Run", 
            a1: "Strength", 
            a2: "Stamina", 
            ability: "Melee", 
            category: "Adventure", 
            div: 10,
            description: "The number of minutes the character can run."
        },
        { 
            name: "Swim", 
            a1: "Toughness", 
            a2: "Stamina", 
            ability: "Melee", 
            category: "Adventure", 
            div: 10,
            description: "The number of minutes the character can swim."
        },
        { 
            name: "Jump (High)", 
            a1: "Strength", 
            a2: "Agility", 
            ability: "Melee", 
            category: "Adventure", 
            div: 40,
            description: "The number of meters the character can jump up or down."
        },
        { 
            name: "Jump (Long)", 
            a1: "Strength", 
            a2: "Agility", 
            ability: "Melee", 
            category: "Adventure", 
            div: 20,
            description: "The number of meters the character can jump across or over."
        },
        { 
            name: "Climb", 
            a1: "Strength", 
            a2: "Dexterity", 
            ability: "Melee", 
            category: "Adventure", 
            div: 20,
            description: "The number of meters a character can climb."
        },
        { 
            name: "Leadership", 
            a1: "Charisma", 
            a2: "Fellowship", 
            ability: "Divine", 
            category: "Command", 
            div: 20,
            description: "The maximum number of followers the character can hire."
        }
    ];

    baseSkills.forEach(base => {
        const existing = c.skills.find(s => s.name === base.name);

        if (!existing) {
            c.skills.push({
                name: base.name,
                attr1: base.a1,
                attr2: base.a2,
                ability: base.ability,
                category: base.category,
                mod: 0,
                divisor: base.div,
                description: base.description
            });
        } else {
            existing.attr1 = base.a1;
            existing.attr2 = base.a2;
            existing.ability = base.ability;
            existing.category = base.category;
            existing.divisor = base.div;
            existing.description = base.description;
        }
    });

    localStorage.setItem(getCurrentCharacterKey(), JSON.stringify(c));
}

function renderSkillList(skills) {
    const list = document.getElementById("skillList");
    list.innerHTML = "";

    const sort = document.getElementById("skillSort").value;

    skills
        .filter(s => sort === "All" || s.ability === sort)
        .forEach((skill, index) => {

            const total = calculateSkillTotal(skill);

            const li = document.createElement("li");

            li.innerHTML = `
                <strong>${skill.name}</strong><br>

                ${skill.attr1} | ${skill.attr2} | ${skill.ability} | ${skill.category}<br>

                <button class="minusSkill">-</button>
                <span class="skillMod">${skill.mod}</span>
                <button class="plusSkill">+</button><br>

                <span class="skillTotal">Total: ${total}</span><br>

                <em>Description: ${skill.description || "No description provided."}</em><br><br>

                <button class="editSkill">Edit</button>
                <button class="deleteSkill">Delete</button>
            `;

            li.querySelector(".minusSkill").addEventListener("click", () => {
                updateSkillMod(index, -1);
            });

            li.querySelector(".plusSkill").addEventListener("click", () => {
                updateSkillMod(index, +1);
            });

            li.querySelector(".editSkill").addEventListener("click", () => {
                editSkill(index);
            });

            li.querySelector(".deleteSkill").addEventListener("click", () => {
                deleteSkill(index);
            });

            list.appendChild(li);
        });
}

function calculateSkillTotal(skill) {
    const c = getCharacterObject();

    const a1Key = skill.attr1.replace(/\s+/g, "_") + "_mod";
    const a2Key = skill.attr2.replace(/\s+/g, "_") + "_mod";

    const a1Total = 20 + (c[a1Key] || 0);
    const a2Total = 20 + (c[a2Key] || 0);

    const raw = a1Total + a2Total + skill.mod;

    return skill.divisor ? Math.floor(raw / skill.divisor) : raw;
}

function updateSkillMod(index, delta) {
    const c = getCharacterObject();
    c.skills[index].mod += delta;
    localStorage.setItem(getCurrentCharacterKey(), JSON.stringify(c));
    renderSkillList(c.skills);
}

/* ============================
   ADD / EDIT / DELETE SKILLS
============================ */

function setupSkillAdd() {
    document.getElementById("addSkillBtn").addEventListener("click", () => {
        const name = document.getElementById("skillName").value.trim();
        const attr1 = document.getElementById("skillAttr1").value;
        const attr2 = document.getElementById("skillAttr2").value;
        const ability = document.getElementById("skillAbility").value;
        const category = document.getElementById("skillCategory").value;
        const description = document.getElementById("skillDescription").value.trim();
        const divisorInput = Number(document.getElementById("skillDivisor").value);

        if (!name) {
            alert("Enter a skill name");
            return;
        }

        if (attr1 === attr2) {
            alert("Attribute 1 and Attribute 2 must be different");
            return;
        }

        const divisor = divisorInput > 0 ? divisorInput : null;

        const c = getCharacterObject();
        if (!c.skills) c.skills = [];

        c.skills.push({
            name,
            attr1,
            attr2,
            ability,
            category,
            mod: 0,
            divisor,
            description
        });

        localStorage.setItem(getCurrentCharacterKey(), JSON.stringify(c));

        document.getElementById("skillName").value = "";
        document.getElementById("skillDescription").value = "";
        document.getElementById("skillDivisor").value = 0;

        renderSkillList(c.skills);
    });
}

function editSkill(index) {
    const c = getCharacterObject();
    const s = c.skills[index];

    document.getElementById("skillName").value = s.name;
    document.getElementById("skillAttr1").value = s.attr1;
    document.getElementById("skillAttr2").value = s.attr2;
    document.getElementById("skillAbility").value = s.ability;
    document.getElementById("skillCategory").value = s.category;
    document.getElementById("skillDescription").value = s.description;
    document.getElementById("skillDivisor").value = s.divisor || 0;

    c.skills.splice(index, 1);
    localStorage.setItem(getCurrentCharacterKey(), JSON.stringify(c));

    renderSkillList(c.skills);
}

function deleteSkill(index) {
    const c = getCharacterObject();
    c.skills.splice(index, 1);
    localStorage.setItem(getCurrentCharacterKey(), JSON.stringify(c));
    renderSkillList(c.skills);
}

function setupSkillSort() {
    document.getElementById("skillSort").addEventListener("change", () => {
        const c = getCharacterObject();
        renderSkillList(c.skills);
    });
}

function populateSkillAttributeDropdowns() {
    const allAttrs = [...physical, ...mental];

    const a1 = document.getElementById("skillAttr1");
    const a2 = document.getElementById("skillAttr2");

    a1.innerHTML = "";
    a2.innerHTML = "";

    allAttrs.forEach(attr => {
        const opt1 = document.createElement("option");
        opt1.textContent = attr;
        a1.appendChild(opt1);

        const opt2 = document.createElement("option");
        opt2.textContent = attr;
        a2.appendChild(opt2);
    });
}
