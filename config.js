const path = require("path");

module.exports = {
    AUDIO_DIR: "/home/diego/Projects/TDG/voice-ordering-module/prediction-api/audio_samples",
    API_URL: "http://localhost:5000/predict",
	ORDER_DIR: path.join(__dirname, "data/orders")
};

