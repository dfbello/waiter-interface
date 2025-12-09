const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
const { AUDIO_DIR, API_URL } = require("./config");
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

