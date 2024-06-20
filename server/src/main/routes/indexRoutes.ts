import express, { Response, Request } from "express";

// const expressIndex = require("express");

const router = express.Router();

// TODO does the frontend ever use this? Delete
router.get("/", (_req: Request, res: Response) => {
  res.json("All good in here!!");
});

export default router;