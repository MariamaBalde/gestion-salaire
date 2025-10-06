import "dotenv/config";
import express from "express";
import cors from "cors";
import { userRouter } from "./route/UserRoute.js";
import { authRouter } from "./route/AuthRoute.js";
import { employeeRouter } from "./route/EmployeeRoute.js";
import { entrepriseRouter } from "./route/EntrepriseRoute.js";
import { payRunRouter } from "./route/PayRunRoute.js";
import { paymentRouter } from "./route/PaymentRoute.js";
import { DashboardRoute } from "./route/DashboardRoute.js";
const app = express();
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use("/users", userRouter);
app.use("/auth", authRouter);
app.use("/employees", employeeRouter);
app.use("/entreprises", entrepriseRouter);
app.use("/payruns", payRunRouter);
app.use("/payments", paymentRouter);
app.use("/dashboard", DashboardRoute);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
//# sourceMappingURL=main.js.map