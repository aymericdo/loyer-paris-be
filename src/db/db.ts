import { connectionString } from "../config";
const mongoose = require("mongoose");

const rentConnection = mongoose.createConnection(
  process.env.MONGODB_URI || connectionString,
  {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const empriseBatieConnection = mongoose.createConnection(
  process.env.MONGODB_URI_EMPRISE_BATIE || connectionString,
  {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const rentSchema = require("./rent.model");
const empriseBatieSchema = require("./emprisebatie.model");

export const Rent = rentConnection.model("Rent", rentSchema);
export const EmpriseBatie = empriseBatieConnection.model(
  "Batie",
  empriseBatieSchema
);
