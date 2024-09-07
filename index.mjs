// import express from "express";
// import itemsRoutes from "./routes/items.mjs";

// import cors from "cors";
// import path from "path";
// const app = express();

// const port = 3000;

// app.use(express.json());
// app.use(cors());
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// // To parse JSON request bodies

// app.use("/api/items", itemsRoutes); // Mount the items routes

// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });

import express from "express";
import itemsRoutes from "./routes/items.mjs";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url"; // Needed to resolve __dirname in ES modules

const app = express();

const port = 3000;

// Resolve __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cors({ origin: "*" })); // For development purposes, allow all origins

// Serve static files from the "uploads" folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Mount the items routes
app.use("/api/items", itemsRoutes);

app.get("/", (req, res) => {
  res.send("server running");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
