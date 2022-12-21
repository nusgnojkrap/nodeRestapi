import logger from "../utils/logger.js";

/* GET users listing. */
export default async function pingpongHandler(req, res) {
    let resultob = {
	result:"pong",
    }
    return res.json(resultob);
}
