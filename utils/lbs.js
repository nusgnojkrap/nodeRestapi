import net from "net";
import iconv from "iconv-lite";
import logger from "./logger.js";
import { LBS_CONNECT, PARENT_PATH } from "../const/const.js";
import { getCurrentFileName } from "./fileUtil.js";
import { LBS_S00000, LBS_E00100, LBS_E00200, LBS_E00300, LBS_E00400, LBS_E00500, LBS_E00700, LBS_E00800, LBS_E00900, LBS_E90000, LBS_E90001, LBS_E90002, LBS_E90003, LBS_E90004, LBS_E90005, LBS_E90006, LBS_E90007, LBS_E90009 } from "./errorCode.js";

const jsName = getCurrentFileName(PARENT_PATH);
const brObj = { LBS_S00000, LBS_E00100, LBS_E00200, LBS_E00300, LBS_E00400, LBS_E00500, LBS_E00700, LBS_E00800, LBS_E00900, LBS_E90000, LBS_E90001, LBS_E90002, LBS_E90003, LBS_E90004, LBS_E90005, LBS_E90006, LBS_E90007, LBS_E90009 };

function fetchLBS(ani_num, lbsID, did) {
    return new Promise(function (resolve) {
        //const Id = "sejongdr3";
        //const pwd = "sejongdr3";
        const telnum = ani_num;
        const SubID = lbsID;
	const Did = did;

        //let reQuireAddress = Id + "#" + pwd + "#" + telnum;
        let reQuireAddress = "#" + telnum + " " + SubID + "$";
        //logger.info(jsName, null, `The request parameters are as follows: ${reQuireAddress} [SEJONG RESTAPI->BLUECHIP]`);
        logger.info(jsName, null, `[SEJONG RESTAPI->BLUECHIP]  request data : ${reQuireAddress}`);

        let client;
        try {
            client = net.connect(LBS_CONNECT, () => client.write(reQuireAddress));

            client.on("data", function (data) {
                const strContents = new Buffer.from(data);
                //logger.info(jsName, null, `The data received through the blue chip company for the lbs inquiry API are as follows: [${iconv.decode(strContents, "EUC-KR").toString()}] [SEJONG RESTAPI->BLUECHIP]`);
                logger.info(jsName, null, `[SEJONG RESTAPI<-BLUECHIP] response data : ${iconv.decode(strContents, "EUC-KR").toString()}`);
                const lbsData = iconv.decode(strContents, "EUC-KR").toString().split("#");
                const lData = {
                    lat: lbsData[3].substr(0, 2) + "." + lbsData[3].substr(2, 6),
                    long: lbsData[4].substr(0, 3) + "." + lbsData[4].substr(3, 6),
                    msgKey: lbsData[0].replace(" ", ""),
                    telecom: lbsData[2].replace(" ", ""),
                    msType: lbsData[8].replace(" ", ""),
                    result: lbsData[9].replace(" ", ""),
                };

                lData.result = br2sr(lData.result);

                resolve(lData);
                return client.end();
            });

            client.on("error", function (err) {
                //logger.error(jsName, null, ` An error occurred during socket communication. The errors are as follows: ${err} [SEJONG RESTAPI->BLUECHIP]`);
                logger.error(jsName, null, `[SEJONG RESTAPI<-BLUECHIP] error : ${err}, ${reQuireAddress}, ${Did}`);
                return resolve("noLbsData");
            });
            client.on("timeout", function () {
                //logger.error(jsName, null, `Timeout occurred during socket communication. [SEJONG RESTAPI->BLUECHIP]`);
                logger.error(jsName, null, `[SEJONG RESTAPI<-BLUECHIP] Timeout error, ${reQuireAddress}, ${Did}`);
                client.end();
                return resolve("noLbsData");
            });
        } catch (err2) {
            //logger.error(jsName, null, `An error occurred while processing data. The errors are as follows:${err} [SEJONG RESTAPI->BLUECHIP]`);
            logger.error(jsName, null, `[SEJONG RESTAPI<-BLUECHIP] net Connect error : ${err2}, ${reQuireAddress}, ${Did}`);
            client.end();
            return resolve("noLbsData");
        }
    });
}

function br2sr(result) {
    let str = "";
    Object.entries(brObj).map(([key, value]) => {
        if (key.includes(result)) {
            str = value;
        }
    });
    if (str == "") {
	logger.error(jsName, null, `[SEJONG RESTAPI<-BLUECHI] error : BLUECHIP error 기타 오류.`);
        return LBS_E90000;
    } else {
        return str;
    }
}

export default fetchLBS;
