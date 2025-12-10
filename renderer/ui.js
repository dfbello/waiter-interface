window.UI = {
    // Switch to table select view
    showTables() {
        document.getElementById("view-tables").style.display = "block";
        document.getElementById("view-orders").style.display = "none";
    },

    // Switch to table detail view
    showOrders(tableNumber) {
        window.currentTable = tableNumber;

        document.getElementById("table-title").innerText = `Table ${tableNumber}`;
        document.getElementById("past-orders").innerHTML = window.tableOrders[tableNumber]
            ?.map(UI.renderOrder)
            .join("") || "<i>No orders yet.</i>";

        document.getElementById("view-tables").style.display = "none";
        document.getElementById("view-orders").style.display = "block";
    },

    // Render a prediction result as a pretty list
    renderPrediction(prediction) {
        console.log("[ui.js] prediciton object:", prediction)
		const items = prediction.items || [];

        return `
            <ul>
                ${items
                    .map(
                        i => `
                        <li>
                            <b>${i.cantidad}  ${i.producto}</b><br>
                            ${i.modificadores.length ?
                                `<small>${i.modificadores.join(", ")}</small>` :
                                `<small></small>`}
                        </li>
                    `
                    )
                    .join("")}
            </ul>
        `;
    },

    // For displaying past orders
    renderOrder(order) {
        return `
            <div style="margin-bottom:10px; padding:5px; border-bottom:1px solid #ddd;">
                ${UI.renderPrediction(order)}
            </div>
        `;
    }
};

// --- INITIALIZE TABLES (8 tables) ---
window.tableOrders = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [] };

window.addEventListener("DOMContentLoaded", () => {
    const tableList = document.getElementById("table-list");

    for (let i = 1; i <= 8; i++) {
        const btn = document.createElement("button");
        btn.innerText = `${i}`;
        btn.style.padding = "10px 20px";
        btn.onclick = () => UI.showOrders(i);
        tableList.appendChild(btn);
    }
});

