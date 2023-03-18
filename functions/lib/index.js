"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors");
admin.initializeApp();
const corsHandler = cors({ origin: true });
exports.downloadImage = functions.https.onRequest(async (req, res) => {
    corsHandler(req, res, async () => {
        const imageUrl = req.query.imageUrl;
        if (!imageUrl) {
            res.status(400).send("Bad Request: Image URL is required.");
            return;
        }
        const storage = admin.storage();
        const storageRef = storage.bucket().file(imageUrl);
        try {
            const downloadUrl = await storageRef.getSignedUrl({
                action: "read",
                expires: "03-18-2024",
            });
            res.set("Content-Disposition", `attachment; filename=${storageRef.name}`);
            res.redirect(downloadUrl[0]);
        }
        catch (error) {
            console.error(`Error getting download URL for ${imageUrl}`, error);
            res.status(500).send("Internal Server Error");
        }
    });
});
//# sourceMappingURL=index.js.map