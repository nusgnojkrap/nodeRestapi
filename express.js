import express from "express";
import bodyParser from "body-parser";
import routeHome from "./router/home.js";
import routeError from "./router/error.js";

const app = express(); //create an express app
app.use(bodyParser.json()); //use body parser to parse json
app.use(bodyParser.urlencoded({ extended: true })); //use body parser to parse urlencoded

/** 라우터를 설정하는 구간입니다. */
app.use("/", routeHome); //use routeHome
app.use(routeError); // 라우터에서 존재하지 않는 path 일 경우 에러 처리를 위해 json 형태로 전송합니다.

export default app;
