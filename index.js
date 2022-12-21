import expressApp from "./express.js";
import { PARENT_PATH, SERVER_PORT } from "./const/const.js";
import logger from "./utils/logger.js";
import { getCurrentFileName } from "./utils/fileUtil.js";

const jsName = getCurrentFileName(PARENT_PATH);

/**
 * @description express.js 에서 정의한 핸들러를 이용하여 서버를 open 합니다.
 * @param {SERVER_PORT} 서버포트
 */
expressApp.listen(SERVER_PORT, () => {
    //logger.info(jsName, null, `The Sejong RESTAPI service has been started. The port numbers are as follows: ${SERVER_PORT}`);
    logger.info(jsName, null, `restAPI Service Start - port : ${SERVER_PORT}`)
});
