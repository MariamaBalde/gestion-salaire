import "dotenv/config";
import express from "express";
import { userRouter } from "./route/UserRoute.js";
import { authRouter } from "./route/AuthRoute.js";
import { employeeRouter } from "./route/EmployeeRoute.js";
import { entrepriseRouter } from "./route/EntrepriseRoute.js";

const app = express();
app.use(express.json());

app.use("/users", userRouter);
app.use("/auth", authRouter);
app.use("/employees", employeeRouter);
app.use("/entreprises", entrepriseRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
