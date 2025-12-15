window.UI = {

	initTables() {
		const container = document.getElementById("table-list");

		for (let i = 1; i <= 8; i++) {
			const btn = document.createElement("button");
			btn.className = "btn btn-outline-light table-btn";
			btn.innerText = i;
			btn.onclick = () => window.showOrders(i);
			container.appendChild(btn);
		}
	},

	showTables() {
		document.getElementById("view-tables").style.display = "block";
		document.getElementById("view-orders").style.display = "none";
	},

	showOrders(table) {
		document.getElementById("table-title").innerText = `Mesa ${table}`;
		UI.renderPastOrders(table);

		document.getElementById("view-tables").style.display = "none";
		document.getElementById("view-orders").style.display = "block";
	},

	renderPastOrders(table) {
		const orders = window.tableOrders[table] || [];
		const container = document.getElementById("past-orders");

		if (!orders.length) {
			container.innerHTML = "<i>No hay órdenes aún.</i>";
			return;
		}

		container.innerHTML = orders
			.map(order => UI.renderPrediction(order))
			.join("");
	},

	renderDraft(draft) {
		const container = document.getElementById("past-orders");

		container.innerHTML = `
			<div class="order-new-wrapper">
				${draft.prediction.items
					.map((item, idx) => UI.renderDraftItem(item, idx))
					.join("")}

				<button class="btn btn-success w-100 mt-3"
					onclick="confirmDraftOrder()">
					Confirmar orden
				</button>
			</div>
		`;
	},

	renderDraftItem(item, index) {
		return `
			<div class="order-item-card order-item-new">
				<div class="d-flex align-items-center">
					<div class="order-qty">${item.cantidad}</div>
					<div class="flex-grow-1">${item.producto}</div>
					<button class="btn btn-sm btn-outline-danger"
						onclick="removeDraftItem(${index})">✕</button>
				</div>

				${item.modificadores.length
					? `<div class="order-mods">${item.modificadores.join(", ")}</div>`
					: ""}
			</div>
		`;
	},

	renderPrediction(prediction) {
    return prediction.items
        .map(item => UI.renderConfirmedItem(item))
        .join("");
	},

	renderConfirmedItem(item) {
	    return `
	        <div class="order-item-card">
	            <div class="d-flex align-items-center">
	                <div class="order-qty">${item.cantidad}</div>
	                <div class="flex-grow-1">
	                    <span class="order-product">${item.producto}</span>
	                </div>
	            </div>

	            ${
	                item.modificadores && item.modificadores.length
	                    ? `<div class="order-mods">${item.modificadores.join(", ")}</div>`
	                    : ``
	            }
	        </div>
	    `;
	},
};

