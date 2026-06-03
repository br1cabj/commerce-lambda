// Importo express

import { Router } from "express";

import { getHomeMessage } from "../controllers/home.controllers.js";

// Variables

const router = Router();

router.get('/', getHomeMessage);

export default router;