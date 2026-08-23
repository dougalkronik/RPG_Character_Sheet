document.addEventListener("DOMContentLoaded", () => {
    requireCharacter();
    loadGearEquipped();
});

function loadGearEquipped() {
    const c = getCharacterObject();
    const container = document.getElementById("gearContainer");

    const bothHands = (c.equipped_righthand && c.equipped_lefthand &&
                       c.equipped_righthand === c.equipped_lefthand);

    container.innerHTML = `
        <h2>Hands</h2>
        <p><strong>Right Hand:</strong> ${c.equipped_righthand || "None"}</p>
        <p><strong>Left Hand:</strong> <span style="${bothHands ? "opacity:0.4;" : ""}">${c.equipped_lefthand || "None"}</span></p>

        <h2>Head</h2>
        <p>${c.equipped_head || "None"}</p>

        <h2>Body</h2>
        <p>${c.equipped_body || "None"}</p>

        <h2>Arms</h2>
        <p><strong>Left Arm:</strong> ${c.equipped_leftarm || "None"}</p>
        <p><strong>Right Arm:</strong> ${c.equipped_rightarm || "None"}</p>

        <h2>Legs</h2>
        <p><strong>Left Leg:</strong> ${c.equipped_leftleg || "None"}</p>
        <p><strong>Right Leg:</strong> ${c.equipped_rightleg || "None"}</p>

        <h2>Cloak</h2>
        <p>${c.equipped_cloak || "None"}</p>

        <h2>Rings</h2>
        <p>${(c.equipped_rings && c.equipped_rings.length) ? c.equipped_rings.join(", ") : "None"}</p>

        <h2>Earrings</h2>
        <p>${(c.equipped_earrings && c.equipped_earrings.length) ? c.equipped_earrings.join(", ") : "None"}</p>

        <h2>Necklaces</h2>
        <p>${(c.equipped_necklaces && c.equipped_necklaces.length) ? c.equipped_necklaces.join(", ") : "None"}</p>
    `;
}
