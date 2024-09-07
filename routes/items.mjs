import { Router } from "express";
import fs from "fs";
import path from "path";
import multer from "multer";

const router = Router();
const dataPath = path.join(process.cwd(), "data/items.json");
const uploadsDir = path.join(process.cwd(), "uploads");

// Ensure the uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); // Save files to the uploads directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9); // Create a unique filename
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Save the original file extension
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
  },
});

// Helper function to read the data from the JSON file
const getItemsData = () => {
  const data = fs.readFileSync(dataPath);
  return JSON.parse(data);
};

// Helper function to write the data to the JSON file
const saveItemsData = (data) => {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};

// Get all items
router.get("/", (req, res) => {
  const items = getItemsData();
  res.json(items);
});

// Get a specific item by ID
router.get("/:id", (req, res) => {
  const items = getItemsData();
  const item = items.find((i) => i.id === req.params.id);

  if (!item) {
    return res.status(404).json({ message: "Item not found" });
  }
  res.json(item);
});

// Create a new item with image upload
router.post("/", upload.single("image"), (req, res) => {
  const { name, price, category, selector } = req.body;
  const image = req.file ? req.file.filename : null; // Get the uploaded file's filename

  // Check if all required fields are provided
  if (!name || !price || !category || !selector) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields" });
  }

  const items = getItemsData();
  const newItem = {
    id: Date.now().toString(), // Unique ID based on timestamp
    name,
    price,
    category,
    image: image ? `/uploads/${image}` : null, // Save the image path as /uploads/{filename}
    selector,
  };

  items.push(newItem);
  saveItemsData(items);

  res.status(201).json(newItem); // Respond with the newly created item
});

// Update an existing item
router.patch("/:id", upload.single("image"), (req, res) => {
  const { name, price, category, selector } = req.body;
  console.log("Request received for ID:", req.params.id);
  console.log("Request body:", req.body);

  // If you are using image upload, log the file
  console.log("Uploaded file:", req.file);
  const image = req.file ? req.file.filename : null; // Get the uploaded file's filename
  const items = getItemsData();
  const itemIndex = items.findIndex((i) => i.id === req.params.id);

  if (itemIndex === -1) {
    return res.status(404).json({ message: "Item not found" });
  }

  // Update only the fields that are provided in the request body
  const updatedItem = {
    ...items[itemIndex],
    ...(name && { name }),
    ...(price && { price }),
    ...(category && { category }),
    ...(image && { image: `/uploads/${image}` }), // Save image path
    ...(selector && { selector }),
  };

  items[itemIndex] = updatedItem;
  saveItemsData(items);

  res.json(updatedItem);
});

// Delete an item
router.delete("/:id", (req, res) => {
  const items = getItemsData();
  const filteredItems = items.filter((i) => i.id !== req.params.id);

  if (items.length === filteredItems.length) {
    return res.status(404).json({ message: "Item not found" });
  }

  saveItemsData(filteredItems);
  res.json({ message: "Item deleted successfully" });
});

export default router;
