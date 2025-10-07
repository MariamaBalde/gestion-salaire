import "dotenv/config";
import express from "express";
import cors from "cors";
import { userRouter } from "./route/UserRoute.js";
import { authRouter } from "./route/AuthRoute.js";
import { employeeRouter } from "./route/EmployeeRoute.js";
import { entrepriseRouter } from "./route/EntrepriseRoute.js";
import { payRunRouter } from "./route/PayRunRoute.js";
import { payslipRouter } from "./route/PayslipRoute.js";
import { paymentRouter } from "./route/PaymentRoute.js";
import { documentRouter } from "./route/DocumentRoute.js";
import { DashboardRoute } from "./route/DashboardRoute.js";
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurez le dossier uploads pour servir les fichiers statiques
app.use('/uploads', express.static('./uploads'));

app.use("/users", userRouter);
app.use("/auth", authRouter);
app.use("/employees", employeeRouter);
app.use("/entreprises", entrepriseRouter);
app.use("/payruns", payRunRouter);
app.use("/payslips", payslipRouter);
app.use("/payments", paymentRouter);
app.use("/documents", documentRouter);
app.use("/dashboard", DashboardRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
