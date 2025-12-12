const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
const { AUDIO_DIR, API_URL, ORDER_DIR } = require("./config");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
ffmpeg.setFfmpegPath(ffmpegPath);

function createWindow() {
	const win = new BrowserWindow({
		width: 500,
		height: 600,
		webPreferences: {
			preload: path.join(__dirname, "preload.js")
		}
	});

	win.loadFile("renderer/index.html");
}

app.whenReady().then(() => {
	createWindow();
});


// Receive audio blob data from renderer and save it to the filesystem
ipcMain.handle("save-audio", async (_, audioBuffer) => {
	console.log("[Main.js] save-audio called, buffer size =", audioBuffer.length);

	try {
		if (!fs.existsSync(AUDIO_DIR)) {
			console.log("[Main.js] Creating audio_samples directory:", AUDIO_DIR);
			fs.mkdirSync(AUDIO_DIR, { recursive: true });
		}
		const id = uuidv4();
		const webmPath = path.join(AUDIO_DIR, id + ".webm");
		const wavPath  = path.join(AUDIO_DIR, id + ".wav");

		console.log("[Main.js] Writing WebM file:", webmPath);

		// Save WebM first
		fs.writeFileSync(webmPath, Buffer.from(audioBuffer));

		console.log("Starting ffmpeg conversion");

		// Convert to WAV
		await new Promise((resolve, reject) => {
			ffmpeg(webmPath)
				.outputOptions("-ac 1")	   // mono
				.outputOptions("-ar 16000") // 16kHz
				.toFormat("wav")
				.save(wavPath)
				.on("end", resolve)
				.on("error", reject);
		});

		fs.unlinkSync(webmPath);

		return { success: true, filename: id + ".wav" };

	} catch (err) {
		console.error(err);
		return { success: false, error: err.message };
	}
});


// Call prediction API
ipcMain.handle("send-to-api", async (_, filename) => {
	try {
		const response = await axios.get(API_URL, {
			headers: { "Content-Type": "application/json" },
			data: { filename }
		});

		return { success: true, data: response.data };
	} catch (err) {
		return { success: false, error: err.response?.data || err.message };
	}
});

// Save order as .md file
ipcMain.handle("save-order-md", async (_, payload) => {
    try {
        const { table, prediction } = payload;

        if (!fs.existsSync(ORDER_DIR)) {
            fs.mkdirSync(ORDER_DIR, { recursive: true });
        }

        const id = uuidv4();
        const filePath = path.join(ORDER_DIR, `order_${table}_${id}.md`);

        // --- Build timestamp ---
        const now = new Date();

        const options = {
            weekday: "long",
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        };

        const formattedDate = now
            .toLocaleString("es-CO", options)
            .replace(".", "")                // remove extra dots
            .replace(/(\b[a-z])/g, c => c.toUpperCase());  // capitalize first letters

        // Example output:
        // "Viernes, 12 Dic 2025, 11:27 a. m."

        const friendlyDate = formattedDate.replace(",", ""); 
        // "Viernes 12 Dic 2025 11:27 a. m."

        // --- Convert prediction to Markdown ---
        const itemsMd = prediction.items.map(item => {
            const header = `### ${item.cantidad} ${item.producto}`;
            const mods = item.modificadores?.length
                ? `> ${item.modificadores.join(", ")}`
                : "";
            return `${header}\n${mods}`;
        }).join("\n\n");

        // --- Final MD file ---
        const md = `
## Mesa ${table}
** *${friendlyDate}* **

${itemsMd}
        `.trim();

        fs.writeFileSync(filePath, md, "utf8");

        console.log(`[Main] Markdown order saved: ${filePath}`);

        return { success: true, path: filePath };

    } catch (error) {
        console.error("[Main] Error writing MD order:", error);
        return { success: false, error: error.message };
    }
});
