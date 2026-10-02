import app from "./app.js";
import dotenv from "dotenv"
import { connectDB } from "./config/db.js";


dotenv.config();

const PORT= process.env.PORT

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to DB:", err.message);
  });