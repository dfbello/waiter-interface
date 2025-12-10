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
	            ?.map(order => UI.renderOrder(order, false))  // never highlight on load
	            .join("") || "<i>No hay órdenes aún.</i>";

	    document.getElementById("view-tables").style.display = "none";
	    document.getElementById("view-orders").style.display = "block";
	},

    // ---- RENDER A SINGLE ORDER ITEM ----
    renderItem(item) {
        return `
			<div class="order-item-card">
			    <div class="d-flex align-items-center">
			        <div class="order-qty">${item.cantidad}</div>
			        <div class="flex-grow-1">
			            <span class="order-product">${item.producto}</span>
			        </div>
			    </div>

			    ${
			        item.modificadores.length
			            ? `<div class="order-mods">${item.modificadores.join(", ")}</div>`
			            : ``
			    }
			</div>
        `;
    },

    // Render the whole prediction (multiple items)
    renderPrediction(prediction) {
        const items = prediction.items || [];
        return items.map(UI.renderItem).join("");
    },

	renderOrder(order, isNew = false) {
	    if (isNew) {
	        return `
	            <div class="mb-3 order-new-wrapper">
	                ${UI.renderPrediction(order)}
	            </div>
	        `;
	    }

	    // old orders → plain items only
	    return UI.renderPrediction(order);
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

