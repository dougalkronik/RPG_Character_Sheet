document.addEventListener("DOMContentLoaded", () => {
    requireCharacter();
    loadExperience();
    loadAttributes();
    loadSkills();
    setupExperienceHandlers();
    setupSkillAdd();
    setupSkillSort();
});

// =========================
// EXPERIENCE
// =========================

function loadExperience() {
    const c = getCharacterObject();
    document.getElementById("expAccumulated").value = c.expAccumulated || 0;
    document.getElementById("expSpent").value = c.expSpent || 0;
}

function setupExperienceHandlers() {
    const acc = document.getElementById("expAccumulated");
    const spent = document.getElementById("expSpent");

    acc.addEventListener("input", () => {
        saveCharacterField("expAccumulated", Number(acc.value));
        if (Number(spent.value) > Number(acc.value)) {
            spent.value = acc.value;
            saveCharacterField("expSpent", Number(acc.value));
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

// =========================
// ATTRIBUTE GROUPS
// =========================

const physical = ["Strength", "Toughness", "Stamina", "Agility", "Dexterity"];
const mental = ["Intelligence", "Wisdom", "Charisma", "Fellowship", "Willpower"];
const abilities = ["Melee Attack", "Ranged Attack", "Arcane Aptitude", "Divine Aptitude", "Nature Aptitude"];

function loadAttributes() {
    const c = getCharacterObject();

    buildAttributeGroup("physicalContainer", physical, c);
    buildAttributeGroup("mentalContainer", mental, c);
    buildAttributeGroup("abilitiesContainer", abilities, c);

    populateSkillDropdowns();
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
    const newMod = (c[modKey] || 0) + delta;

    c[modKey] = newMod;
    localStorage.setItem(getCurrentCharacterKey(), JSON.stringify(c));

    loadAttributes();
}

// =========================
// SKILLS
// =========================

function loadSkills() {
    const c = getCharacterObject();
    if (!c.skills) c.skills = [];

    ensureBaseSkills(c);

    renderSkillList(c.skills);
}

function ensureBaseSkills(c) {
    const baseSkills = [
        { name: "Run", phys: "Strength", ment: "Stamina", ability: "Melee", formula: "run" },
        { name: "Swim", phys: "Toughness", ment: "Stamina", ability: "Melee", formula: "swim" },
        { name: "Jump (High)", phys: "Strength", ment: "Agility", ability: "Melee", formula: "jumpHigh" },
        { name: "Jump (Long)", phys: "Strength", ment: "Agility", ability: "Melee", formula: "jumpLong" },
        { name: "Climb", phys: "Strength", ment: "Dexterity", ability: "Melee", formula: "climb" },
        { name: "Leadership", phys: "Charisma", ment: "Fellowship", ability: "Divine", formula: "lead" }
    ];

    baseSkills.forEach(base => {
        if (!c.skills.some(s => s.name === base.name)) {
            c.skills.push({
                name: base.name,
                phys: base.phys,
                ment: base.ment,
                ability: base.ability,
                mod: 0,
                formula: base.formula
            });
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
            const li = document.createElement("li");

            li.innerHTML = `
                <strong>${skill.name}</strong>
                <span>${skill.phys}</span>
                <span>${skill.ment}</span>
                <span>${skill.ability}</span>
                <button class="minusSkill">-</button>
                <span class="skillMod">${skill.mod}</span>
                <button class="plusSkill">+</button>
            `;

            li.querySelector(".minusSkill").addEventListener("click", () => {
                updateSkillMod(index, -1);
            });

            li.querySelector(".plusSkill").addEventListener("click", () => {
                updateSkillMod(index, +1);
            });

            list.appendChild(li);
        });
}

function updateSkillMod(index, delta) {
    const c = getCharacterObject();
    c.skills[index].mod += delta;
    localStorage.setItem(getCurrentCharacterKey(), JSON.stringify(c));
    renderSkillList(c.skills);
}

function setupSkillAdd() {
    document.getElementById("addSkillBtn").addEventListener("click", () => {
        const name = document.getElementById("skillName").value.trim();
        const phys = document.getElementById("skillPhysical").value;
        const ment = document.getElementById("skillMental").value;
        const ability = document.getElementById("skillAbility").value;

        if (!name) {
            alert("Enter a skill name");
            return;
        }

        const c = getCharacterObject();
        if (!c.skills) c.skills = [];

        c.skills.push({
            name,
            phys,
            ment,
            ability,
            mod: 0,
            formula: null
        });

        localStorage.setItem(getCurrentCharacterKey(), JSON.stringify(c));

        document.getElementById("skillName").value = "";
        renderSkillList(c.skills);
    });
}

function setupSkillSort() {
    document.getElementById("skillSort").addEventListener("change", () => {
        const c = getCharacterObject();
        renderSkillList(c.skills);
    });
}

function populateSkillDropdowns() {
    const physSel = document.getElementById("skillPhysical");
    const mentSel = document.getElementById("skillMental");

    physSel.innerHTML = "";
    mentSel.innerHTML = "";

    physical.forEach(p => {
        const opt = document.createElement("option");
        opt.textContent = p;
        physSel.appendChild(opt);
    });

    mental.forEach(m => {
        const opt = document.createElement("option");
        opt.textContent = m;
        mentSel.appendChild(opt);
    });
}
