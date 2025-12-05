import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import sessionConfig from "./middlewares/sessionConfig.js";
import authRoutes from "./routes/authRoutes.js";
import appointmentRoutes from "./routes/appointmentsRoute.js";
import frontendRoutes from "./routes/frontendRoutes.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('trust proxy', 1);
app.use(sessionConfig);
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.authenticate = () => !!req.session.user?.id;
  req.login = (user) =>
    new Promise((resolve, reject) => {
      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email
      };
      req.session.save((err) => (err ? reject(err) : resolve()));
    });
  next();
});

app.use(express.static(path.join(__dirname, "../templates")));
app.use("/", authRoutes);
app.use("/", appointmentRoutes);
app.use("/", frontendRoutes)

export default app;
