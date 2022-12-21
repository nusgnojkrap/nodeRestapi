import express from "express";
import cdrMigrationHandler from "../services/cdrService.js";
import lbsServiceHandler from "../services/lbsService.js";
import appdataHandler from "../services/appdataService.js";
import uhanTestHandler from "../services/uhanTestService.js";
import sdkdataHandler from "../services/sdkdataService.js";
import pingpongHandler from "../services/pingpong.js";

const router = express.Router(); // get an instance of the express Router
router.post("/lbsSearch", lbsServiceHandler); // use the router to handle the route
router.post("/cdrMigration", cdrMigrationHandler);
router.post("/appdata", appdataHandler);
router.post("/uhanTest", uhanTestHandler);
router.post("/sdkdata", sdkdataHandler);
router.get("/ping", pingpongHandler);

export default router;
