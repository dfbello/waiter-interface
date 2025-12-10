console.log("[Renderer.js] LOADED!");

let mediaRecorder;
let audioChunks = [];

const recordBtn = document.getElementById("recordBtn");
const statusText = document.getElementById("status");
const resultBox = document.getElementById("result");

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
                resultBox.innerText = JSON.stringify(apiResult.error, null, 2);
                statusText.innerText = "Error de predicción.";
                return;
            }

			// STORE ORDER IN MEMORY
		    window.tableOrders[window.currentTable].push(apiResult.data.prediction);

		    // RENDER NICELY
		    resultBox.innerHTML = UI.renderPrediction(apiResult.data.prediction);

		    // UPDATE PAST ORDERS LIST
		    document.getElementById("past-orders").innerHTML =
		        window.tableOrders[window.currentTable].map(UI.renderOrder).join("");

            statusText.innerText = "Completado!";
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

