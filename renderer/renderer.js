console.log("[Renderer.js] LOADED!");

let mediaRecorder;
let audioChunks = [];

const recordBtn = document.getElementById("recordBtn");
const statusText = document.getElementById("status");

recordBtn.addEventListener("click", async () => {

    if (!mediaRecorder || mediaRecorder.state === "inactive") {
        console.log("[Renderer] Starting recording\u2026");

        audioChunks = [];

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("[Renderer] Microphone OK:", stream);

        mediaRecorder = new MediaRecorder(stream, {
            mimeType: "audio/webm;codecs=opus"
        });

        mediaRecorder.ondataavailable = (e) => {
            console.log("[Renderer] ondataavailable:", e.data.size, "bytes");
            audioChunks.push(e.data);
        };

        mediaRecorder.onstop = async () => {
            console.log("[Renderer] onstop fired");

            statusText.innerText = "Procesando...";

            const blob = new Blob(audioChunks, { type: "audio/webm" });
            const arrayBuffer = await blob.arrayBuffer();
            const buffer = new Uint8Array(arrayBuffer);

            console.log("[Renderer] Sending buffer to main, size =", buffer.length);

            const saveResult = await window.electronAPI.saveAudio(buffer);
            console.log("[Renderer] saveAudio returned:", saveResult);

            if (!saveResult.success) {
                statusText.innerText = "Error saving audio.";
                console.error("[Renderer] ERROR:", saveResult.error);
                return;
            }

            statusText.innerText = "Esperando respuesta...";

            const apiResult = await window.electronAPI.sendToAPI(saveResult.filename);
            console.log("[Renderer] API returned:", apiResult);

            if (!apiResult.success) {
                console.log(apiResult.error);
                statusText.innerText = "Error de predicción.";
                return;
            }

			// STORE ORDER IN MEMORY
		    window.tableOrders[window.currentTable].push(apiResult.data.prediction);

			// Save Markdown version to filesystem
		    await window.electronAPI.saveOrderMD(
		        window.currentTable,
		        apiResult.data.prediction
		    );

			console.log("[Renderer] Markdown order saved.");

			// RE-RENDER past orders with highlight on last item
			const orders = window.tableOrders[window.currentTable];
			document.getElementById("past-orders").innerHTML = orders
			    .map((o, i) => UI.renderOrder(o, i === orders.length - 1)) // highlight last
			    .join("");

            statusText.innerText = "";
        };

        mediaRecorder.start();
        recordBtn.innerText = "Detener";
        statusText.innerText = "Grabando...";
        console.log("[Renderer] Recording started");

    } else {
        console.log("[Renderer] Stopping recording...");
        mediaRecorder.stop();
        recordBtn.innerText = "Grabar";
    }
});

