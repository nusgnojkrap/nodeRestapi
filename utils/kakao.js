import axios from "axios";
import logger from "./logger.js";
import { getCurrentFileName } from "./fileUtil.js";
import { PARENT_PATH } from "../const/const.js";

const jsName = getCurrentFileName(PARENT_PATH);
axios.defaults.timeout = 3000;

const REST_API_KEY = "6ec42a5672076bab2b0f25ad524dd04c";
const urldata = "https://dapi.kakao.com/v2/local/geo/coord2address.json";

function fetchkakao(lo01, la01, telnum) {
    return new Promise(function (resolve) {
        const urldata01 = urldata + "?x=" + lo01 + "&y=" + la01;
        //const urldata01 = urldata + "?x=" + 126.932215 + "&y=" + 37.556108;

        let config = {
            method: "get",
            url: urldata01,
            headers: {
                Authorization: "KakaoAK " + REST_API_KEY,
            },
            timeout: 3000,
        };
        logger.info(jsName, null, `[SEJONG RESTAPI->KAKAO]  request data : ${JSON.stringify(config)}`);

        try {
            axios(config).then(function (response) {
                if (response) {
                    logger.info(jsName, null, `[SEJONG RESTAPI<-KAKAO] response data : ${JSON.stringify(response.data)}`);
                    resolve(response.data);
                } else {
                    resolve("KakaoResponseError");
                }
            });
        } catch (err) {
            logger.error(jsName, null, `[SEJONG RESTAPI->KAKAO] Axios error : ${JSON.stringify(err)}`);
            return resolve("KakaoAxiosError");
        }
    });
}

export default fetchkakao;
