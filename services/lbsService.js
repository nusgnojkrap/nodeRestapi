import { PARENT_PATH, LBS_NAME, LBS_PORT, LBS_RESULT_PATH } from "../const/const.js";
import { LBS_RESULT, LBS_ADDRESS, LBS_MSG_KEY, LBS_MSG_TYPE, LBS_TELECOM, LBS_CID, LBS_DID, LBS_LATIDUE, LBS_LONGITUDE, LBS_POI, LBS_RANGE, LBS_SIDO, LBS_GUGUN, LBS_DONG, LBS_GIBUN, LBS_LBSTYPE } from "../const/lbsFormat.js";
import fetchkakao from "../utils/kakao.js";
import fetchLBS from "../utils/lbs.js";
import logger from "../utils/logger.js";
import { isValidNumber } from "../utils/string.js";
import { createLBS } from "../vo/lbsVO.js";
import { getCurrentFileName } from "../utils/fileUtil.js";
import { ERRORCODE, NOT_EXSIS_PARAMETER, RESPONSE_UNDEFINEDERROR, RESPONSE_MISINFORMATIONERROR, KAKAO_RESPONSEERROR, KAKAO_AXIOSERROR, RESPONSE_KNOWNERROR, SUCCESS, LBS_S00000 } from "../utils/errorCode.js";

import net from "net";
import axios from "axios";
const jsName = getCurrentFileName(PARENT_PATH);

/**
 * @description cid 와 did 를 요청받아 LBS 를 요청, 요청에 대한 결과값을 카카오 맵을 사용하여 주소를 받아옴
 * @api {post} /
 * @apiParam {String} did
 * @apiParam {String} cid
 */
export default async function lbsServiceHandler(req, res) {
    const body = req.body;
    const did = body.did;
    const cid = body.cid;
    const lbsID = body.lbsID;
    const lbsVO = createLBS();
    const notiFlag = body.notiFlag;
    const companyURL = body.url;
    const company = body.company;
    let IDcode = "03001";
    let bodySize = "152";
    let stx = "#";
    let msgKey;
    let notiType;
    let url;
    let etx = "$";

    logger.info(jsName, null, ` request data : ${JSON.stringify(body)}`);

    //입력값이 없을 경우
    if (did === undefined || cid === undefined || did == null || cid == null || did == "" || cid == "") {
        lbsVO.insertDataChain(LBS_RESULT, ERRORCODE.get(NOT_EXSIS_PARAMETER));
        return res.end(lbsVO.toString());
    }

    const lbs_data = await fetchLBS(cid, lbsID, did);  // BLUECHIP 조회
    logger.info(jsName, null, `fetchLBS data result : ${JSON.stringify(lbs_data)}`);

    //no data
    if (lbs_data.result == undefined) {
        lbsVO.insertDataChain(LBS_RESULT, ERRORCODE.get(RESPONSE_UNDEFINEDERROR));
        return res.end(lbsVO.toString());
    }

    if ((lbs_data.result == LBS_S00000) == false) {
        lbsVO.insertDataChain(LBS_RESULT, ERRORCODE.get(lbs_data.result));
        return res.end(lbsVO.toString());
    }

    if (isValidNumber(lbs_data.long) === false || isValidNumber(lbs_data.lat) === false) {
        lbsVO.insertDataChain(LBS_RESULT, ERRORCODE.get(RESPONSE_MISINFORMATIONERROR));
        return res.end(lbsVO.toString());
    }
    const kakao_data = await fetchkakao(lbs_data.long, lbs_data.lat, cid);

    //위치정보가 없을 경우
    if (kakao_data === "KakaoResponseError") {
        logger.info(jsName, "", `kakao no data`);
        lbsVO.insertDataChain(LBS_RESULT, ERRORCODE.get(KAKAO_RESPONSEERROR));
        return res.end(lbsVO.toString());
    } else if (kakao_data === "KakaoAxiosError") {
        logger.error(jsName, "", `kakao Axios error`);
        lbsVO.insertDataChain(LBS_RESULT, ERRORCODE.get(KAKAO_AXIOSERROR));
        return res.end(lbsVO.toString())
    }

    if (kakao_data.documents[0].road_address == undefined || kakao_data.documents[0].road_address == null) {
        lbsVO.insertDataChain(LBS_POI, "");
        lbsVO.insertDataChain(LBS_ADDRESS, "");
    } else {
        lbsVO.insertDataChain(LBS_POI, kakao_data.documents[0].road_address.building_name);
        lbsVO.insertDataChain(LBS_ADDRESS, kakao_data.documents[0].road_address.address_name);
    }
    let range = "0";
    let gibun = kakao_data.documents[0].address.sub_address_no ? kakao_data.documents[0].address.main_address_no + "-" + kakao_data.documents[0].address.sub_address_no : kakao_data.documents[0].address.main_address_no;

    let lbstype = ""
    lbstype = lbs_data.telecom + "(" + lbs_data.msType + ")"

    lbsVO
        .insertDataChain(LBS_RESULT, ERRORCODE.get(SUCCESS))
        .insertDataChain(LBS_DID, did)
        .insertDataChain(LBS_CID, cid)
        .insertDataChain(LBS_LONGITUDE, lbs_data.long)
        .insertDataChain(LBS_LATIDUE, lbs_data.lat)
        .insertDataChain(LBS_RANGE, range)
        .insertDataChain(LBS_SIDO, kakao_data.documents[0].address.region_1depth_name)
        .insertDataChain(LBS_GUGUN, kakao_data.documents[0].address.region_2depth_name)
        .insertDataChain(LBS_DONG, kakao_data.documents[0].address.region_3depth_name)
        .insertDataChain(LBS_GIBUN, gibun)
        .insertDataChain(LBS_TELECOM, lbs_data.telecom)
        .insertDataChain(LBS_MSG_KEY, lbs_data.msgKey)
        .insertDataChain(LBS_MSG_TYPE, lbs_data.msType)
        .insertDataChain(LBS_LBSTYPE, lbstype)

    logger.info(jsName, null, `[SEJONG RESTAPI->${company}] request data : ${lbsVO.toString()}`);
    axios.post(`${companyURL}${LBS_RESULT_PATH}`, lbsVO.toString()).then((response) => {
        logger.info(jsName, null, `[SEJONG RESTAPI<-${company}] response data : ${JSON.stringify(response.data)}`);

        url = response.data.result.always_agreement_url;
        msgKey = lbs_data.msgKey;
        if (notiFlag == "0") {
            notiType = "01";
        } else if (notiFlag == "9") {
            notiType = "02";
        } else {
            notiType = "00";
        }
        let header = spaceMaster("03001", 5) + spaceMaster("164", 7) + spaceMaster(lbsID, 20);
        let body = spaceMaster(stx, 1) + spaceMaster(msgKey, 20) + spaceMaster(cid, 12) + spaceMaster(lbsID, 6) + spaceMaster(did, 12) + spaceMaster(notiType, 2) + spaceMaster(url, 110) + spaceMaster(etx, 1);

        let completeData = header + body;
        let client;

        try {
            client = net.connect("9702", "211.216.53.30", () => {
                logger.info(jsName, null, `[SEJONG RESTAPI->BLUECHIP] request data : ${completeData}`);
                client.write(completeData);
            });

            client.on("data", (serverData) => {
                let resultServerData = serverData.toString();
                logger.info(jsName, null, `[SEJONG RESTAPI<-BLUECHIP] response data : ${resultServerData}`);
                client.destroy();
            });

            client.on("close", () => {
                logger.info(jsName, null, `net close`);
            });
        } catch (err) {
            logger.error(jsName, null, `net connection error : ${err}`);
        }
    })
    .catch((err111) => {
        logger.error(jsName, "", `[SEJONG RESTAPI<-${company}] axios error : ${err111}`)           // 이 부분 에러 왜 뜨는지 모르겠음 (가끔 뜸)
    })
    return res.end(lbsVO.toString());
}

function spaceMaster(param, space) {
    param = param.toString();
    let result = "";
    if (space < param.length) {
        for (let i = 0; i < space; i++) {
            result = result + param[i];
        }
    } else {
        let rest = space - param.length;
        result = result + param;
        for (let i = 0; i < rest; i++) {
            result = result + " ";
        }
    }
    return result;
}
