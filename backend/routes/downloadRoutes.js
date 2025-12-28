import express from "express";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const fileUrl = req.query.url;
    const fileName = decodeURIComponent(fileUrl.split("/").pop());

    const response = await fetch(fileUrl);
    const arrayBuffer = await response.arrayBuffer();

    res.set({
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    });

    res.send(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).send("Failed to download file");
  }
});

export default router;
