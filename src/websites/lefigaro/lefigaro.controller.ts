import express, { Request, Response, NextFunction } from "express";
const router = express.Router();
import * as log from "@helpers/log";
import { LeFigaro } from "./lefigaro";

// routes
router.post("/data", getByData);
function getByData(req: Request, res: Response, next: NextFunction) {
  log.info(
    `-> ${req.baseUrl}/${req.body.id} getByData (${req.body.platform})`,
    "blue"
  );
  const leFigaro = new LeFigaro(res, { body: req.body });
  leFigaro.analyse();
}

router.post("/data/v2", getByDataV2);
function getByDataV2(req: Request, res: Response, next: NextFunction) {
  log.info(
    `-> v2${req.baseUrl}/${req.body.id} getByData (${req.body.platform})`,
    "blue"
  );
  const leFigaro = new LeFigaro(res, { body: req.body }, true);
  leFigaro.analyse();
}

module.exports = router;
