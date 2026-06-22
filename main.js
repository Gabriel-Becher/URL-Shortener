import express from "express";
import configs from "./src/config/enviromentConfig.js";

import { shortenUrl } from "./src/routes/shortenRoute.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/shorten", shortenUrl);

app.listen(configs.appPort, () => {
  console.log(`Server is running on port ${configs.appPort}`);
});
