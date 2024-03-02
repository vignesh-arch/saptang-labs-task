require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");

const { connectToDB } = require("./db.js");
const { insertImage,getImages,update,deleteImage } = require("./image.js");

const app = express();
const upload = multer({ dest: "uploads/" });
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 4000;

app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const uploadedFile = req.file;
    if (!uploadedFile) {
      return res.status(400).send("No file uploaded");
    }
    const imageBuffer = fs.readFileSync(uploadedFile.path);
    const imageData = Buffer.from(imageBuffer).toString("base64");
    const caption = req.body.caption;
    await insertImage({ image: imageData, caption });
    res.status(200).send("Image uploaded successfully");
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).send(`Error uploading image: ${error.message}`);
  }
});

app.get("/getImages/:data?", async (req, res) => {
  try {
    let filter = {};
    let page = 1;
    const data = req.params.data ? JSON.parse(req.params.data) : {};
    if (data.id) filter.id = parseInt(data.id);
    if (data.from || data.to) {
      filter.created = {};
      if (data.from) filter.created.$gte = new Date(data.from);
      if (data.to) filter.created.$lte = new Date(data.to);
    }
    if (data.search) filter.$text = { $search: search };
    if (data.page) {
      page = parseInt(data.page, 10);
    }
    else {
      page = 1;
    }

    const result = await getImages(filter,page);
    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching images:", err);
    res.status(500).send(`Error fetching images: ${err.message}`);
  }
});

app.post("/update", async (req, res) => {
  try {
    const { id, changes } = req.body;
    const result = await update({ id:parseInt(id), changes });
    res.status(200).json(result);
  } catch (err) {
    console.error("Error Updating the resource", err);
    res.status(500).send(`Error Updating Resource: ${err.message}`);
  }
});

app.delete("/deleteImage/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await deleteImage(id);
    res.status(200).send('Image Deleted Successfully');
  } catch (err) {
    console.error("Error while deleting Image", err);
    res.status(500).send(`Error Deleting Image: ${err.message}`);
  }
});
  
(async function start() {
  try {
    await connectToDB();
    app.listen(port, () => {
      console.log(`Server started at Port ${port}`);
    });
  } catch (err) {
    console.log("Error occured while starting application", err.message);
  }
})();
