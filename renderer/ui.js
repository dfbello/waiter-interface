window.UI = {

    showTables() {
        document.getElementById("view-tables").style.display = "block";
        document.getElementById("view-orders").style.display = "none";
    },

    showOrders(tableNumber) {
        window.currentTable = tableNumber;

        document.getElementById("table-title").innerText = `Mesa ${tableNumber}`;

        document.getElementById("past-orders").innerHTML =
            window.tableOrders[tableNumber]
                ?.map(UI.renderOrder)
                .join("") || "<i>No hay órdenes aún.</i>";

        document.getElementById("view-tables").style.display = "none";
        document.getElementById("view-orders").style.display = "block";
    },

    // ---- RENDER A SINGLE ORDER ITEM ----
    renderItem(item) {
        return `
            <div class="order-item-card">
                <div class="d-flex align-items-start">
                    <div class="order-qty">${item.cantidad}</div>
                    <div>
                        <div class="order-product">${item.producto}</div>
                        ${
                            item.modificadores.length
                                ? `<div class="order-mods">${item.modificadores.join(", ")}</div>`
                                : `<div class="order-mods"></div>`
                        }
                    </div>
                </div>
            </div>
        `;
    },

    // Render the whole prediction (multiple items)
    renderPrediction(prediction) {
        const items = prediction.items || [];
        return items.map(UI.renderItem).join("");
    },

    renderOrder(order) {
        return `
            <div class="mb-3">
                ${UI.renderPrediction(order)}
            </div>
        `;
    }
};

// ---- INIT 8 TABLES ----
window.tableOrders = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [] };

window.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("table-list");

    for (let i = 1; i <= 8; i++) {
        const btn = document.createElement("button");
        btn.className = "btn btn-outline-light table-btn";
        btn.innerText = `${i}`;
        btn.onclick = () => UI.showOrders(i);
        container.appendChild(btn);
    }
});

