import * as fs from "fs";
const JSONStream = require("JSONStream");

export const getStream = (path: string) => {
  const jsonData = path;
  const stream = fs.createReadStream(jsonData, { encoding: "utf8" });
  const parser = JSONStream.parse("*");
  return stream.pipe(parser);
};
