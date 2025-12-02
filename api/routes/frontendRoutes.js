import { Router } from "express";
import path from "path";
import { fileURLToPath } from "url";
const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get("/", (req, res) => {
  if (req.authenticate()) {
    res.sendFile(path.join(__dirname, "../../templates", "loged", "index.html"));
  } else {
    res.sendFile(path.join(__dirname, "../../templates", "home", "index.html"));
  }
});

export default router;
