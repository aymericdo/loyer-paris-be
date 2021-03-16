import express, { NextFunction, Request, Response } from "express";
import * as fs from "fs";
import * as path from "path";
import axios from "axios";
import * as rentService from "@db/rent.service";
import { DataBaseItem } from "@interfaces/database-item";
import { groupBy } from "@helpers/functions";
import * as log from "@helpers/log";
import { vegaCommonOpt } from "@helpers/vega";
import { IpService } from "@services/ip";
import { cityList } from "@services/address/city";
const router = express.Router();

interface RentRequest extends Request {
  rents?: DataBaseItem[];
}

router.use("/", function (req: RentRequest, res: Response, next: NextFunction) {
  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.CAPTCHA_SECRET}&response=${req.query.recaptchaToken}`;

  const ipService = new IpService(req);

  if (ipService.isIpCached()) {
    next();
  } else {
    axios
      .post(
        url,
        {},
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
          },
        }
      )
      .then((response) => {
        if (!response.data.success) {
          return res.status(500).json({
            message: response.data["error-codes"].join("."),
          });
        } else {
          ipService.saveIp();
        }

        next();
      })
      .catch(() => {
        return res
          .status(500)
          .json({ message: "oops, something went wrong on our side" });
      });
  }
});

// routes
router.get("/map", getMap);
function getMap(req: RentRequest, res: Response, next: NextFunction) {
  log.info(`-> ${req.baseUrl} getMap`, "blue");

  const parisGeodata = JSON.parse(
    fs.readFileSync(path.join("json-data/quartier_paris_geodata.json"), "utf8")
  );

  rentService
    .getMapData()
    .then((data) => {
      const vegaMap = {
        ...vegaCommonOpt(),
        layer: [
          {
            data: {
              format: { type: "json", property: "features" },
              values: parisGeodata,
            },
            projection: { type: "mercator" },
            mark: {
              type: "geoshape",
              fill: "lightgray",
              stroke: "white",
            },
            encoding: {
              tooltip: { field: "properties.l_qu", type: "nominal" },
            },
          },
          {
            data: {
              values: data,
            },
            transform: [
              { filter: "datum.city === 'paris'" },
              { calculate: "datum.isLegal ? 'Oui' : 'Non'", as: "isLegal" },
            ],
            encoding: {
              longitude: {
                field: "longitude",
                type: "quantitative",
              },
              latitude: {
                field: "latitude",
                type: "quantitative",
              },
              color: {
                field: "isLegal",
                title: "Est légal ?",
                type: "nominal",
                scale: {
                  range: ["red", "green"],
                },
              },
            },
            mark: {
              type: "circle",
              color: "red",
            },
          },
        ],
      };
      res.json(vegaMap);
    })
    .catch((err) => {
      console.log(err);
      if (err.status) {
        res.status(err.status).json(err);
      } else {
        log.error("Error 500");
        res.status(500).json(err);
      }
    });
}

router.get("/price-difference", getPriceDifference);
function getPriceDifference(
  req: RentRequest,
  res: Response,
  next: NextFunction
) {
  log.info(`-> ${req.baseUrl} priceDifference`, "blue");

  rentService
    .getPriceDiffData()
    .then((data) => {
      const vegaMap = {
        ...vegaCommonOpt(),
        data: {
          values: data,
        },
        mark: { type: "bar", tooltip: true },
        transform: [
          { filter: "datum.city === 'paris'" },
          {
            calculate: "datum.priceExcludingCharges - datum.maxPrice",
            as: "priceDifference",
          },
          {
            joinaggregate: [
              {
                op: "count",
                field: "postalCode",
                as: "countOfPostalCode",
              },
            ],
            groupby: ["postalCode"],
          },
          { filter: "datum.isLegal === false" },
        ],
        encoding: {
          x: {
            aggregate: "mean",
            field: "priceDifference",
            type: "quantitative",
            title:
              "Différence moyenne entre prix pratiqué et prix théorique (annonces illégales)",
          },
          y: {
            field: "postalCode",
            type: "ordinal",
            title: "Code postal",
            sort: cityList.paris.postalCodePossibilities,
          },
          tooltip: [{ field: "countOfPostalCode", title: "Nombre d'annonces" }],
        },
      };

      res.json(vegaMap);
    })
    .catch((err) => {
      console.log(err);
      if (err.status) {
        res.status(err.status).json(err);
      } else {
        log.error("Error 500");
        res.status(500).json(err);
      }
    });
}

router.get("/is-legal-per-surface", getLegalPerSurface);
function getLegalPerSurface(
  req: RentRequest,
  res: Response,
  next: NextFunction
) {
  log.info(`-> ${req.baseUrl} isLegalPerSurface`, "blue");

  rentService
    .getLegalPerSurfaceData()
    .then((data) => {
      const vegaMap = {
        ...vegaCommonOpt(),
        data: {
          values: data,
        },
        mark: { type: "bar", tooltip: true },
        transform: [
          { filter: "datum.city === 'paris'" },
          { calculate: "datum.isLegal ? 'Oui' : 'Non'", as: "isLegal" },
        ],
        encoding: {
          x: {
            bin: {
              step: 5,
            },
            field: "surface",
            title: "Surface",
            type: "quantitative",
          },
          y: {
            aggregate: "count",
            field: "isLegal",
            title: "Annonces",
            type: "quantitative",
          },
          color: {
            field: "isLegal",
            title: "Est légal ?",
            type: "nominal",
            scale: {
              range: ["red", "green"],
            },
          },
        },
      };

      res.json(vegaMap);
    })
    .catch((err) => {
      console.log(err);
      if (err.status) {
        res.status(err.status).json(err);
      } else {
        log.error("Error 500");
        res.status(500).json(err);
      }
    });
}

router.get("/adoption", getAdoptionRate);
function getAdoptionRate(req: RentRequest, res: Response, next: NextFunction) {
  log.info(`-> ${req.baseUrl} adoption`, "blue");

  rentService
    .getAdoptionData()
    .then((data) => {
      const vegaMap = {
        ...vegaCommonOpt(),
        data: {
          values: data,
        },
        mark: { type: "line", tooltip: true, interpolate: "monotone" },
        transform: [
          {
            sort: [{ field: "createdAt" }],
            window: [{ op: "count", field: "count", as: "cumulative_count" }],
            frame: [null, 0],
          },
        ],
        encoding: {
          x: {
            field: "createdAt",
            title: "Date",
            type: "temporal",
            timeUnit: "yearmonthdate",
          },
          y: {
            field: "cumulative_count",
            title: "Nombre d'annonces",
            type: "quantitative",
          },
        },
      };
      vegaMap.config["mark"] = { color: "#FBC652" };

      res.json(vegaMap);
    })
    .catch((err) => {
      console.log(err);
      if (err.status) {
        res.status(err.status).json(err);
      } else {
        log.error("Error 500");
        res.status(500).json(err);
      }
    });
}

router.get(
  "/price-variation",
  (req: RentRequest, res: Response, next: NextFunction) => {
    log.info(`-> ${req.baseUrl} priceVariation`, "blue");

    rentService
      .getPriceVarData()
      .then((data) => {
        const vegaMap = {
          ...vegaCommonOpt(),
          data: {
            values: data,
          },
          mark: { type: "area", color: "#f03434", tooltip: true },
          transform: [
            { filter: "datum.city === 'paris'" },
            { filter: "datum.isLegal === false" },
            {
              calculate: "datum.priceExcludingCharges - datum.maxPrice",
              as: "priceDifference",
            },
          ],
          encoding: {
            y: {
              aggregate: "median",
              field: "priceDifference",
              type: "quantitative",
              title: "Différence entre prix pratiqué et prix théorique en €",
            },
            x: {
              field: "createdAt",
              title: "Date",
              type: "temporal",
              timeUnit: "yearweek",
            },
          },
        };

        res.json(vegaMap);
      })
      .catch((err) => {
        console.log(err);
        if (err.status) {
          res.status(err.status).json(err);
        } else {
          log.error("Error 500");
          res.status(500).json(err);
        }
      });
  }
);

router.get(
  "/is-legal-variation",
  (req: RentRequest, res: Response, next: NextFunction) => {
    log.info(`-> ${req.baseUrl} isLegalVariation`, "blue");

    rentService
      .getPriceVarData()
      .then((data) => {
        const vegaMap = {
          ...vegaCommonOpt(),
          data: {
            values: data,
          },
          transform: [
            { filter: "datum.city === 'paris'" },
            { timeUnit: "yearweek", field: "createdAt", as: "date" },
            {
              joinaggregate: [
                {
                  op: "count",
                  field: "id",
                  as: "NumberAds",
                },
              ],
              groupby: ["date"],
            },
            { filter: "datum.isLegal === false" },
            {
              joinaggregate: [
                {
                  op: "count",
                  field: "isLegal",
                  as: "NumberIllegal",
                },
              ],
              groupby: ["date"],
            },
            {
              calculate: "datum.NumberIllegal / datum.NumberAds * 100",
              as: "PercentOfTotal",
            },
          ],
          layer: [
            {
              mark: {
                type: "area",
                color: "#f03434",
                tooltip: true,
              },
              encoding: {
                y: {
                  field: "PercentOfTotal",
                  type: "quantitative",
                  title: "Pourcentage",
                },
                x: {
                  field: "date",
                  title: "Date",
                  type: "temporal",
                },
              },
            },
            {
              mark: { type: "line", color: "#fdcd56" },
              transform: [{ loess: "PercentOfTotal", on: "date" }],
              encoding: {
                y: {
                  field: "PercentOfTotal",
                  type: "quantitative",
                },
                x: {
                  field: "date",
                  title: "Date",
                  type: "temporal",
                },
              },
            },
          ],
        };

        res.json(vegaMap);
      })
      .catch((err) => {
        console.log(err);
        if (err.status) {
          res.status(err.status).json(err);
        } else {
          log.error("Error 500");
          res.status(500).json(err);
        }
      });
  }
);

router.get("/welcome", getWelcomeText);
function getWelcomeText(req: RentRequest, res: Response, next: NextFunction) {
  log.info(`-> ${req.baseUrl} getWelcomeText`, "blue");

  rentService
    .getWelcomeData()
    .then((data) => {
      const rents = data;

      const isIllegalPercentage = Math.round(
        (100 * rents.filter((rent) => !rent.isLegal).length) / rents.length
      );
      const lessThan35SquareMeters = rents.filter((rent) => rent.surface < 35);
      const isSmallSurfaceIllegalPercentage = Math.round(
        (100 * lessThan35SquareMeters.filter((rent) => !rent.isLegal).length) /
          lessThan35SquareMeters.length
      );
      const postalCodeGroupedRents = groupBy(rents, "postalCode");
      const extremePostalCode = getExtremePostalCode(postalCodeGroupedRents);
      const worstPostalCode = extremePostalCode[0];
      const bestPostalCode = extremePostalCode[1];

      return res.json({
        numberRents: rents.length,
        pivotSurface: 35,
        isIllegalPercentage,
        isSmallSurfaceIllegalPercentage,
        worstPostalCode,
        bestPostalCode,
      });
    })
    .catch((err) => {
      console.log(err);
      if (err.status) {
        res.status(err.status).json(err);
      } else {
        log.error("Error 500");
        res.status(500).json(err);
      }
    });
}

function getExtremePostalCode(groupedRents) {
  let worstPc = "";
  let bestPc = "";
  let bestLegalsCount = 0;
  let worstLegalsCount = 0;

  Object.keys(groupedRents).forEach((pc) => {
    if (isNaN(+pc)) {
      return;
    }
    const pcRents = groupedRents[pc];

    const legalsRatio =
      pcRents.filter((rent) => rent.isLegal).length / pcRents.length;
    if (bestLegalsCount < legalsRatio) {
      bestPc = pc;
      bestLegalsCount = legalsRatio;
    }

    const illegalsRatio =
      pcRents.filter((rent) => !rent.isLegal).length / pcRents.length;
    if (worstLegalsCount < illegalsRatio) {
      worstPc = pc;
      worstLegalsCount = illegalsRatio;
    }
  });
  const worstNeighborhood =
    worstPc.slice(-2)[0] === "0" ? worstPc.slice(-1) : worstPc.slice(-2);
  const bestNeighborhood =
    bestPc.slice(-2)[0] === "0" ? bestPc.slice(-1) : bestPc.slice(-2);
  return [worstNeighborhood, bestNeighborhood];
}

module.exports = router;
