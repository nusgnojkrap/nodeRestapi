import logger from "../utils/logger.js";
import fs from "fs";
import { getCurrentFileName } from "../utils/fileUtil.js";
import { CDR_DATA_FILENAME, CDR_DATA_PATHNAME, PARENT_PATH } from "../const/const.js";
import { currentGetYYYYMMDD } from "../utils/string.js";
import { CDR_DATA_IS_EMPTY, ERRORCODE, NOT_EXSIS_PARAMETER, SUCCESS } from "../utils/errorCode.js";
import { createLBS } from "../vo/lbsVO.js";
import { LBS_DID, LBS_CID, LBS_LONGITUDE, LBS_LATIDUE, LBS_RANGE, LBS_MSG_TYPE, LBS_MSG_KEY, LBS_SIDO, LBS_GUGUN, LBS_DONG, LBS_GIBUN, LBS_ADDRESS, LBS_POI, LBS_TELECOM, LBS_RESULT, LBS_LBSTYPE } from "../const/lbsFormat.js";


/* GET users listing. */
const jsName = getCurrentFileName(PARENT_PATH);

export default async function cdrMigrationHandler(req, res) {
    const myFtKey = req.body.ftkey;
    const channel = myFtKey;
    const obj = {
        lbs_reqtime: null,
        lbs_restime: null,
        lbs_duration: null,
        lbs_latitude: null,
        lbs_longitude: null,
        lbs_tel_info: null,
        lbs_result: null,
        result: {},
    };

    //logger.info(jsName, channel, `${req.ip} user has accessed the cdrMigrationHandler service. The requested parameters are as follows. ${JSON.stringify(req.body)} `);
    logger.info(jsName, channel, ` request data : ${JSON.sringify(req.body)}`);

    if (myFtKey == null || myFtKey == "" || myFtKey == undefined) {
        obj.result = ERRORCODE.get(NOT_EXSIS_PARAMETER);
        return res.json(obj);
    }

    let filepath = "";
    filepath = filepath + CDR_DATA_PATHNAME + CDR_DATA_FILENAME + currentGetYYYYMMDD();
    //if (fs.existsSync(filepath) == false) fs.mkdirSync(filepath)
    const isExists = fs.existsSync(filepath);

    if (!isExists) {
        obj.result = ERRORCODE.get(CDR_DATA_IS_EMPTY);
        return res.json(obj);
    }

    let readFile = fs.readFileSync(`${CDR_DATA_PATHNAME}${CDR_DATA_FILENAME}${currentGetYYYYMMDD()}`, "utf-8");
    let readFileLineSplit = readFile.split("\n");
    let lbs_reqtime, lbs_restime, lbs_duration, lbs_latitude, lbs_longitude, lbs_tel_info, lbs_result, ftKey;

    for (let i = readFileLineSplit.length - 1; i >= 0; i--) {
        ftKey = readFileLineSplit[i].slice(114);
        ftKey = ftKey.slice(1, ftKey.length - 1);

        if (ftKey == myFtKey) {
            lbs_reqtime = readFileLineSplit[i].slice(54, 68);
            lbs_restime = readFileLineSplit[i].slice(68, 82);

            lbs_duration = readFileLineSplit[i].slice(82, 88);
            lbs_latitude = readFileLineSplit[i].slice(88, 97);
            lbs_longitude = readFileLineSplit[i].slice(99, 109);

            lbs_tel_info = readFileLineSplit[i].slice(110, 113);
            lbs_result = readFileLineSplit[i].slice(113, 114);
            break;
        }
    }

    obj.lbs_reqtime = lbs_reqtime;
    obj.lbs_restime = lbs_restime;
    obj.lbs_duration = lbs_duration;
    obj.lbs_latitude = lbs_latitude;
    obj.lbs_longitude = lbs_longitude;
    obj.lbs_tel_info = lbs_tel_info;
    obj.lbs_result = lbs_result;

    if (lbs_reqtime != null) {
        obj.result = ERRORCODE.get(SUCCESS);
    } else {
        obj.result = ERRORCODE.get(CDR_DATA_IS_EMPTY);
    }

    return res.json(obj);
}
