console.log("[Renderer] loaded");

let mediaRecorder;
let audioChunks = [];

window.currentTable = null;
window.currentDraftOrder = null;

// PERSISTED CONFIRMED ORDERS
window.tableOrders = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [] };

const recordBtn = document.getElementById("recordBtn");
const statusText = document.getElementById("status");

/* ---------------- RECORDING ---------------- */

recordBtn.addEventListener("click", async () => {
	if (!mediaRecorder || mediaRecorder.state === "inactive") {
		audioChunks = [];

		const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

		mediaRecorder = new MediaRecorder(stream, {
			mimeType: "audio/webm;codecs=opus"
		});

		mediaRecorder.ondataavailable = e => audioChunks.push(e.data);

		mediaRecorder.onstop = async () => {
			statusText.innerText = "Procesando...";

			const blob = new Blob(audioChunks);
			const buffer = new Uint8Array(await blob.arrayBuffer());

			const saved = await window.electronAPI.saveAudio(buffer);
			if (!saved.success) return;

			const api = await window.electronAPI.sendToAPI(saved.filename);
			if (!api.success) return;

			// CREATE DRAFT (NOT SAVED)
			window.currentDraftOrder = {
				table: window.currentTable,
				prediction: api.data.prediction
			};

			UI.renderDraft(window.currentDraftOrder);
			statusText.innerText = "";
		};

		mediaRecorder.start();
		recordBtn.innerHTML = '<i class="bi bi-stop-fill"></i>';
		statusText.innerText = "Grabando...";

	} else {
		mediaRecorder.stop();
		recordBtn.innerHTML = '<i class="bi bi-mic-fill"></i>';
	}
});

/* ---------------- DRAFT ACTIONS ---------------- */

window.removeDraftItem = (index) => {
	window.currentDraftOrder.prediction.items.splice(index, 1);
	UI.renderDraft(window.currentDraftOrder);
};

window.confirmDraftOrder = async () => {
	const draft = window.currentDraftOrder;
	if (!draft || !draft.prediction.items.length) return;

	// SAVE IN MEMORY
	window.tableOrders[draft.table].push(draft.prediction);

	// SAVE TO FILESYSTEM
	await window.electronAPI.saveOrderMD(draft.table, draft.prediction);

	window.currentDraftOrder = null;
	UI.renderPastOrders(draft.table);
};

/* ---------------- TABLE NAV ---------------- */

window.showTables = () => UI.showTables();

window.showOrders = (table) => {
	window.currentTable = table;
	UI.showOrders(table);
};

/* ---------------- INIT ---------------- */

window.addEventListener("DOMContentLoaded", () => {
	UI.initTables();
});

