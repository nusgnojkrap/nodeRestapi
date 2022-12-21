import { PARENT_PATH, LBS_NAME, LBS_PORT, LBS_RESULT_PATH } from "../const/const.js";
import { RESULT } from "../const/resultFormat.js";
import fetchkakao from "../utils/kakao.js";
import logger from "../utils/logger.js";
import { createResult } from "../vo/resultVO.js";
import { getCurrentFileName } from "../utils/fileUtil.js";
import { checkFileName, callStandardCDR } from "../utils/cdrUtils.js";
import { checkParam } from "../utils/checkParam.js"
import { getConnection } from "../utils/mysqlPool.js";
import { decrypt } from "../utils/crypto.js";
import { ERRORCODE, NOT_EXSIS_PARAMETER, DECRYPT_FAIL, RESPONSE_KNOWNERROR, SUCCESS, LBS_S00000, DATABASE_NOT_CONNECTION } from "../utils/errorCode.js";

const jsName = getCurrentFileName(PARENT_PATH);

/**
 * @description sdk CallGate 서버에서 데이터를 받는 기능
 * @api {post} /
 * @apiParam {String} did
 * @apiParam {String} cid
 */
export default async function sdkdataServiceHandler(req, res) {
    logger.info(jsName, "", `start sdkdata`);
    const resultVO = createResult();
    
    const body = req.body;
    logger.info(jsName, "", `${JSON.stringify(body)}`);
    const encryptcid = body.callid;// 복호화 해야함
    
    logger.info(jsName, null, `encryptcid : ${encryptcid}`)
    let timecid
    try{
	timecid = await decrypt(encryptcid);
    }catch(err){
        logger.info(jsName, null, `decrypt fail`)
        resultVO.insertDataChain(RESULT, ERRORCODE.get(DECRYPT_FAIL));
        return res.end(resultVO.toString());
    }
    //const timecid = await decrypt(encryptcid);

    if (timecid == "fail"){
	logger.info(jsName, null, `decrypt fail`)
        resultVO.insertDataChain(RESULT, ERRORCODE.get(DECRYPT_FAIL));
        return res.end(resultVO.toString());
    }
    logger.info(jsName, "", `time + cid : ${timecid}`);
    
    const insertTime = timecid.substr(0,14)
    const cid = timecid.substr(15,)
    logger.info(jsName, "", `cid : ${cid}`);

    const did = body.arsnum;
    let addr = checkParam(body.s_addr);
    let newaddr = checkParam(body.s_newaddr);
    let poi = checkParam(body.s_poi);               // 없으면 카카오로 바꿔야하기 때문에 let 세팅
    const latitude = body.s_latitude;
    const longitude = body.s_longitude;
    let rdate = checkParam(body.rdate); 

    let sido = checkParam(body.s_sido)
    let gugun = checkParam(body.s_gugun)
    let dong = checkParam(body.s_dong)
    let gibun = checkParam(body.s_gibun)

    if (did === undefined || cid === undefined || did == null || cid == null || did == "" || cid == "") {
        // cid, did check
        logger.info(jsName, "", `appData - cid, did : null`);
        resultVO.insertDataChain(RESULT, ERRORCODE.get(NOT_EXSIS_PARAMETER));
        logger.info(jsName, "", `${resultVO.toString()}`);
        return res.end(resultVO.toString());
    }else{
        if (latitude == undefined || longitude == undefined || latitude == null || longitude == null || latitude == "" || longitude == ""){
            // latitude, longitude check
            resultVO.insertDataChain(RESULT, ERRORCODE.get(NOT_EXSIS_PARAMETER));
            logger.info(jsName, "", `${cid} ${did} : No data latitude, longitude`);
            logger.info(jsName, "", `${resultVO.toString()}`);
            return res.end(resultVO.toString());
        }else{
            // 모든 입력값이 정상인 경우 LBSDATA table 에서 데이터가 이미 존재하는지
            // 존재하면 update
            // 없으면   insert

            if (poi == undefined || poi == null || poi == ""){
                // kakao
                const kakao_data = await fetchkakao(longitude, latitude, cid);
                //위치정보가 없을 경우
                if (kakao_data === "KakaoResponseError") {
                    logger.error(jsName, "", `kakao no data`);
                    poi = ""
                } else if (kakao_data === "KakaoAxiosError") {
                    logger.error(jsName, "", `kakao Axios error`);
                    poi == ""
                } else{
                    if (kakao_data.documents[0].road_address == undefined || kakao_data.documents[0].road_address == null) {
                        poi = ""
                    }else{
                        poi = kakao_data.documents[0].road_address.building_name
                    }    
                }
                await insertORupdate(cid, did, latitude, longitude, poi, resultVO)
                //let resultString = callStandardCDR("2", "", did, cid, "555", "666", "777", "888", "999", "000", "111", "222", "333", "444", "555", "666", "777", "888", "999", "000", latitude, longitude, "", "0", "", "");
                let resultString = callStandardCDR("2", "", did, cid, "", "", "", insertTime, "", "", "", "", "", "", "", "", "", "", "", "", latitude, longitude, "", "0", "", "1");
                //let resultString = "박종선 테스트"
                let fileName
                try{
                    fileName = await checkFileName()
                    logger.info(jsName, "", `fileName : ${fileName}`);
                }catch(jongerr){
                    logger.error(jsName, "", `checkFileName error : ${jongerr}`);
                }
                logger.datalog(fileName, resultString, null);
            }else{
                // no kakao
                await insertORupdate(cid, did, latitude, longitude, poi, resultVO)
                let resultString = callStandardCDR("2", "", did, cid, "", "", "", insertTime, "", "", "", "", "", "", "", "", "", "", "", "", latitude, longitude, "", "0", "", "1");                let fileName
                try{
                    fileName = await checkFileName()
                    logger.info(jsName, "", `fileName : ${fileName}`);
                }catch(jongerr){
                    logger.error(jsName, "", `checkFileName error : ${jongerr}`);

                }
                logger.datalog(fileName, resultString, null);
            }
        }
    }

    async function insertORupdate(cid, did, latitude, longitude, poi, resultVO){
        logger.info(jsName, "", `insertORupdate start`);
        getConnection( (error, con) => {
            if (error) {
                logger.error(jsName, channel, `${cid} ${did} : DB Connection error : ${error}`);
                resultVO.insertDataChain(RESULT, ERRORCODE.get(DATABASE_NOT_CONNECTION));
                logger.info(jsName, "", `${resultVO.toString()}`);
                return res.end(resultVO.toString());
            }

            let sql0 = `select * from LBSDATA where caller="${cid}";`
            logger.info(jsName, "", `query start`);

            con.query(sql0, function(err0, result0){
                if(err0){
                    con.release();
                    logger.error(jsName, "", `${cid} ${did} : DB query error : ${err0}`);
                    resultVO.insertDataChain(RESULT, ERRORCODE.get(DATABASE_NOT_CONNECTION));
                    return res.end(resultVO.toString());
                }else{
                    if (result0[0] == undefined || result0[0] == null || result0[0] == ""){
                        logger.info(jsName, "", `최근 데이터 없는 경우`);
                        // 최근 데이터 없는 경우
                        let sql1 = `insert into LBSDATA(caller,called,x,y,sido,gugun,dong,gibun,addr,newaddr,poi,timestamp,Type) values("${cid}","${did}","${latitude}","${longitude}","${sido}","${gugun}","${dong}","${gibun}","${addr}","${newaddr}","${poi}",now(),"G");`
                        con.query(sql1, function(err0, result0){
                            con.release();
                            if(err0){
                                logger.error(jsName, "", `${cid} ${did} : DB query error : ${err0}`);
                                resultVO.insertDataChain(RESULT, ERRORCODE.get(DATABASE_NOT_CONNECTION));
                                logger.info(jsName, "", `${resultVO.toString()}`);
                                return res.end(resultVO.toString());
                            }
                            resultVO.insertDataChain(RESULT, ERRORCODE.get(SUCCESS))
                            logger.info(jsName, "", `${resultVO.toString()}`);
                            return res.end(resultVO.toString())
                        })
                    }else{
                        logger.info(jsName, "", `최근 데이터 있는 경우`);
                        // 최근 데이터 있는 경우
                        let sql1 = `update LBSDATA set x='${latitude}', y='${longitude}', sido='${sido}', gugun='${gugun}', dong='${dong}', gibun='${gibun}', addr='${addr}', newaddr='${newaddr}',poi='${poi}', Type='G', timestamp=now() where caller='${cid}';`
                        con.query(sql1, function(err0, result0){
                            con.release();
                            if(err0){
                                logger.error(jsName, "", `${cid} ${did} : DB query error : ${err0}`);
                                resultVO.insertDataChain(RESULT, ERRORCODE.get(DATABASE_NOT_CONNECTION));
                                logger.info(jsName, "", `${resultVO.toString()}`);
                                return res.end(resultVO.toString());
                            }
                            resultVO.insertDataChain(RESULT, ERRORCODE.get(SUCCESS))
                            logger.info(jsName, "", `${resultVO.toString()}`);
                            return res.end(resultVO.toString())
                        })
                    }
                }
            })
        })
    }

}  
