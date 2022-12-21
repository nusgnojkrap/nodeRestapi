import { PARENT_PATH, LBS_NAME, LBS_PORT, LBS_RESULT_PATH } from "../const/const.js";
import { LBS_RESULT, LBS_ADDRESS, LBS_MSG_KEY, LBS_MSG_TYPE, LBS_TELECOM, LBS_CID, LBS_DID, LBS_LATIDUE, LBS_LONGITUDE, LBS_POI, LBS_RANGE, LBS_SIDO, LBS_GUGUN, LBS_DONG, LBS_GIBUN, LBS_LBSTYPE } from "../const/lbsFormat.js";
import fetchkakao from "../utils/kakao.js";
import fetchLBS from "../utils/lbs.js";
import logger from "../utils/logger.js";
import { isValidNumber } from "../utils/string.js";
import { createLBS } from "../vo/lbsVO.js";
import { createResult } from "../vo/resultVO.js";
import { getCurrentFileName } from "../utils/fileUtil.js";
import { getConnection } from "../utils/mysqlPool.js";
import { ERRORCODE, NOT_EXSIS_PARAMETER, RESPONSE_KNOWNERROR, SUCCESS, LBS_S00000 } from "../utils/errorCode.js";

import net from "net";
import axios from "axios";
const jsName = getCurrentFileName(PARENT_PATH);

/**
 * @description uhan 솔루션 앱에서 들어오는 데이터를 LBSDATA, appData table 에 저장한다
 * @api {post} /
 * @apiParam {String} did
 * @apiParam {String} cid
 */
export default async function uhanTestHandler(req, res) {
    const lbsVO = createLBS();
    const resultVO = createResult();
    
    const body = req.body;

    const cid = body.tellnumber;
    const did = body.myid;

    const s_poi = body.s_position;
    const s_latitude = body.s_latitude;
    const s_longitude = body.s_longitude;

    const m_poi = body.m_position;
    const m_latitude = body.m_latitude;
    const m_longitude = body.m_longitude;

    const e_poi = body.e_position;
    const e_latitude = body.e_latitude;
    const e_longitude = body.e_longitude;

    const rdate = body.rdate;                           // 접수 시간
    const price = body.price                            // 가격

    let lbsdata = 0;                                    // 해당 caller LBSDATA 존재 유무
    let appdata = 0;                                    // app에서 온 데이터가 정상인지 
    
    //logger.info(jsName, null, `${req.ip} user has accessed the lbsServiceHandler service. The requested parameters are as follows. ${JSON.stringify(body)} `);

    //입력값이 없을 경우
    if (did === undefined || cid === undefined || did == null || cid == null || did == "" || cid == "") {
        logger.error(jsName, "", `appData - cid, did : null`);
        resultVO.insertDataChain(LBS_RESULT, ERRORCODE.get(NOT_EXSIS_PARAMETER));
        logger.info(jsName, "", `[JONG TEST] resultVO : ${resultVO.toString()}`)
        return res.end(resultVO.toString());
    }

    if (s_latitude == "" || s_latitude == undefined || s_latitude == null || s_longitude == "" || s_longitude == undefined || s_longitude == null){
        logger.info(jsName, "", `appData 위도 경도가 정상값이 아닙니다.`);
        // app data 가 이상한 값인 경우
        appdata = 0        
    }else{
        // app data 가 정상인 경우 : kakao 주소파악

        if (s_poi == "" || s_poi == undefined || s_poi == null){
            logger.info(jsName, "", `s_poi 가 존재하지 않아 kakao 에서 가져옵니다.`);
            //  appData 의 s_poi 가 존재하지 않는 경우 kakao 에서 주소 가져온다.
            const kakao_data = await fetchkakao(s_longitude, s_latitude, cid);
            appdata = 1
            //위치정보가 없을 경우
            if (kakao_data === "noReceiveKakaoData") {
                logger.info(jsName, "", `kakao no data`);
                appdata = 0;
            }
        
            if (kakao_data.documents[0].road_address == undefined || kakao_data.documents[0].road_address == null) {
                // lbsVO.poi = ""
                // lbsVO.addr = ""
                lbsVO.insertDataChain(LBS_POI, "");
                lbsVO.insertDataChain(LBS_ADDRESS, "");
            } else {
                // lbsVO.poi = kakao_data.documents[0].road_address.building_name
                // lbsVO.addr = kakao_data.documents[0].road_address.address_name;
                lbsVO.insertDataChain(LBS_POI, kakao_data.documents[0].road_address.building_name);
                lbsVO.insertDataChain(LBS_ADDRESS, kakao_data.documents[0].road_address.address_name);
            }
            let range = "0";
            let gibun = kakao_data.documents[0].address.sub_address_no ? kakao_data.documents[0].address.main_address_no + "-" + kakao_data.documents[0].address.sub_address_no : kakao_data.documents[0].address.main_address_no;
       
            // lbsVO.did = did
            // lbsVO.cid = cid
            // lbsVO.LBS_LONGITUDE = s_longitude
            // lbsVO.LBS_LATITUDE = s_latitude
            // lbsVO.RANGE = range
            // lbsVO.LBS_SIDO = kakao_data.documents[0].address.region_1depth_name
            // lbsVO.LBS_GUGUN = kakao_data.documents[0].address.region_2depth_name
            // lbsVO.LBS_DONG = kakao_data.documents[0].address.region_3depth_name
            // lbsVO.LBS_GIBUN = gibun
            // lbsVO.LBS_LBSTYPE = "G"

        
            lbsVO
               .insertDataChain(LBS_RESULT, ERRORCODE.get(SUCCESS))
               .insertDataChain(LBS_DID, did)
               .insertDataChain(LBS_CID, cid)
               .insertDataChain(LBS_LONGITUDE, s_longitude)
               .insertDataChain(LBS_LATIDUE, s_latitude)
               .insertDataChain(LBS_RANGE, range)
               .insertDataChain(LBS_SIDO, kakao_data.documents[0].address.region_1depth_name)
               .insertDataChain(LBS_GUGUN, kakao_data.documents[0].address.region_2depth_name)
               .insertDataChain(LBS_DONG, kakao_data.documents[0].address.region_3depth_name)
               .insertDataChain(LBS_GIBUN, gibun)
               .insertDataChain(LBS_LBSTYPE, "G")
        }else{
            //  appData 의 s_poi 가 존재하는 경우 kakao 에서 주소 가져오지마세요.

            // lbsVO.LBS_POI = s_poi
            // lbsVO.LBS_ADDRESS = ""
            // lbsVO.LBS_DID = did
            // lbsVO.LBS_CID = cid
            // lbsVO.LBS_LONGITUDE = s_longitude
            // lbsVO.LBS_LATITUDE = s_latitude
            // lbsVO.LBS_RANGE = "0"
            // lbsVO.LBS_SIDO = ""
            // lbsVO.LBS_GUGUN = ""
            // lbsVO.LBS_DONG = ""
            // lbsVO.LBS_GIBUN = ""
            // lbsVO.LBS_LBSTYPE ="G"

            lbsVO.insertDataChain(LBS_POI, s_poi);
            lbsVO.insertDataChain(LBS_ADDRESS, "");

            lbsVO
               .insertDataChain(LBS_RESULT, ERRORCODE.get(SUCCESS))
               .insertDataChain(LBS_DID, did)
               .insertDataChain(LBS_CID, cid)
               .insertDataChain(LBS_LONGITUDE, s_longitude)
               .insertDataChain(LBS_LATIDUE, s_latitude)
               .insertDataChain(LBS_RANGE, '0')
               .insertDataChain(LBS_SIDO, '')
               .insertDataChain(LBS_GUGUN, '')
               .insertDataChain(LBS_DONG, '')
               .insertDataChain(LBS_GIBUN, '')
               .insertDataChain(LBS_LBSTYPE, "G")
            logger.info(jsName, '', `s_poi 가 존재하여 바로 DB에 저장`);
        }
    }

    getConnection((error, con) => {
        if (error) {
            logger.error(jsName, channel, `DB Connection error : ${error}`);
            resultVO.insertDataChain(LBS_RESULT, ERRORCODE.get(DATABASE_NOT_CONNECTION));

            return res.end(resultVO.toString());
        }

        let sql0 = `select * from LBSDATA where caller="${cid}";`

        con.query(sql0, function(err0, result0){
            if(err0){
                logger.error(jsName, "", `DB query error : ${err0}`);
                resultVO.insertDataChain(LBS_RESULT, ERRORCODE,get(DATABASE_NOT_CONNECTION));
                try{
                    con.release();
                }catch(errr0){}
                return res.end(resultVO.toString());

            }else{
                if (result0[0] == undefined || result0[0] == null || result0[0] == ""){
                    lbsdata = "0"
                }else{
                    lbsdata = "1"
                }

                let sql1= `select * from appData where caller="${cid}";`

                con.query(sql1, function (err, result) {
                    if (err) {
                        logger.error(jsName, "", `DB query error : ${err}`);
                        resultVO.insertDataChain(LBS_RESULT, ERRORCODE.get(DATABASE_NOT_CONNECTION));
                        // 혹시 모를 에러에 대비하여 
                        try {
                            con.release();
                        } catch (err2) {}
                        return res.end(resultVO.toString());
                    
                    }
                    else{
                        if (result[0] == undefined || result[0] == null || result[0] ==""){
                            // appData에 해당 데이터의 값이 존재하지 않는 경우    insert        => LBSDATA table 에 값이 있는 경우 어떤게 더 큰 비중?
                            let sql2 = `insert into appData values("${cid}","${did}","${lbsVO.poi}","${s_latitude}","${s_longitude}","${m_poi}","${m_latitude}","${m_longitude}","${e_poi}","${e_latitude}","${e_longitude}",now(),"${price}");`
        
                            con.query(sql2, function (err2, result2){
                                if (err2){
                                    logger.error(jsName, "", `DB query2 error : ${err2}`);
                                    resultVO.insertDataChain(LBS_RESULT, ERRORCODE.get(DATABASE_NOT_CONNECTION));
                                    try{
                                        con.release();
                                    } catch (err2) {}
                                    return res.end(resultVO.toString());

                                }else{
                                    if (lbsdata == "0"){
                                        // LBSDATA 존재하지 않음        insert
                                        let sql3 = `insert into LBSDATA(caller,called,x,y,\`range\`, sido, gugun, dong, gibun, addr,poi,Type, appdata,timestamp) values("${cid}","${did}","${s_latitude}","${s_longitude}","${lbsVO.range}","${lbsVO.sido}","${lbsVO.gugun}","${lbsVO.dong}","${lbsVO.gibun}","${lbsVO.addr}","${lbsVO.poi}","${lbsVO.lbstype}","1",now());`

                                        con.query(sql3, function (err3, result3){
                                            if (err3){
                                                logger.error(jsName, "", `DB query3 error : ${err3}`);
                                                resultVO.insertDataChain(LBS_RESULT, ERRORCODE.get(DATABASE_NOT_CONNECTION));
                                                try{
                                                    con.release();
                                                } catch (errr3) {}
                                                return res.end(resultVO.toString());
                                            }else{
                                                con.release();
						logger.info(jsName, "", `[JONG TEST] 1 : ${resultVO.toString().toString()}`);
						logger.info(jsName, "", `[JONG TEST] 2 : ${resultVO.result.toString().toString()}`);
						logger.info(jsName, "", `[JONG TEST] 3 : ${ERRORCODE.get(SUCCESS).toString()}`);
						logger.info(jsName, "", `[JONG TEST] 4 : ${ERRORCODE.get(SUCCESS).toString().toString()}`);
                                                resultVO.insertDataChain(LBS_RESULT, ERRORCODE.get(SUCCESS));
                                                return res.end(resultVO.toString());
                                            }
                                        })

                                    }else if(lbsdata == "1"){
                                        // LBSDATA 존재함               update
                                        let sql3 = `update LBSDATA set x='${s_latitude}', y='${s_longitude}', \`range\`='${lbsVO.range}', sido='${lbsVO.sido}', gugun='${lbsVO.gugun}', dong='${lbsVO.dong}', gibun='${lbsVO.gibun}',addr='${lbsVO.addr}',poi='${lbsVO.poi}', Type='${lbsVO.lbstype}', timestamp=now(), appdata='1' where caller='${cid}';`

                                        con.query(sql3, function (err3, result3){
                                            if (err3){
                                                logger.error(jsName, "", `DB query3 error : ${err3}`);
                                                resultVO.insertDataChain(LBS_RESULT, ERRORCODE.get(DATABASE_NOT_CONNECTION));
                                                try{
                                                    con.release();
                                                } catch (errr3) {}
                                                return res.end(resultVO.toString());
                                            }else{
                                                con.release();
                                                resultVO
                                                .insertDataChain(LBS_RESULT, ERRORCODE.get(SUCCESS));
                                                return res.end(resultVO.toString());
                                            }
                                        })

                                    }else{
                                        //error errorcode 추가해줘야 함
                                        logger.error(jsName, '', `LBSDATA table appdata column error lbsdata : ${lbsdata}`);
                                        resultVO.insertDataChain(LBS_RESULT, ERRORCODE.get(DATABASE_NOT_CONNECTION));
                                        con.release();
                                        return res.end(resultVO.toString());
                                    }
                                }
                            })
            
                        }else{
                            // appData에 해당 데이터의 값이 존재하는 경우    update
                            let sql2 = `update appData set caller="${cid}", called="${did}", s_poi="${s_poi}" ,s_lat="${s_latitude}",s_long="${s_longitude}", m_poi="${m_poi}", m_lat="${m_latitude}", m_long="${m_longitude}", e_poi="${e_poi}", e_lat="${e_latitude}", e_long="${e_longitude}", rdate=now(), price="${price}";`

                            con.query(sql2, function (err2, result2){
                                if (err2){
                                    logger.error(jsName, "", `DB query2 error : ${err2}`);
                                    resultVO.insertDataChain(LBS_RESULT, ERRORCODE.get(DATABASE_NOT_CONNECTION));
                                    try{
                                        con.release();
                                    } catch (err2) {}
                                    return res.end(resultVO.toString());
                                }else{

                                    if (s_latitude == "" || s_latitude  == null || s_latitude == undefined || s_longitude == "" || s_longitude == null || s_longitude == undefined ){
                                        //새로 들어온 데이터가 junkData 인 경우
					logger.info(jsName, "", `${cid} : latitude : ${s_latitude}, longitude : ${s_longitude}  error`);
					resultVO.insertDataChain(LBS_RESULT, ERRORCODE.get(SUCCESS));
					return res.end(resultVO.toString());
                                    }else{
                                        //새로 들어온 데이터가 정상 데이터인 경우
                                        if(lbsdata == "0"){
                                            //LBSDATA 존재하지 않는 경우 : insert
                                            let sql3 = `insert into LBSDATA(caller,called,x,y,poi,appdata) values("${cid}","${did}","${s_latitude}","${s_longitude}","${s_poi}","1");`
                                        
                                            con.query(sql3, function(err3, result3){
                                                if(err3){
                                                    logger.error(jsName, "", `DB query3 error : ${err3}`)
                                                    resultVO.insertDataChain(LBS_RESULT, ERRORCODE.get(DATABASE_NOT_CONNECTION));
                                                    try{
                                                        con.release();
                                                    }catch(errr3){}
                                                    return res.end(resultVO.toString());
                                                }else{
                                                    logger.info(jsName, "", `success`);
                                                    resultVO.insertDataChain(LBS_RESULT, ERRORCODE.get(SUCCESS));
                                                    return res.end(resultVO.toString());
                                                }
                                            })

                                        }else if(lbsdata == "1"){
                                            //LBSDATA 존재하는 경우 : update
                                            let sql3 = `update LBSDATA set x='${s_latitude}', y='${s_longitude}', \`range\`='${lbsVO.range}', sido='${lbsVO.sido}', gugun='${lbsVO.gugun}', dong='${lbsVO.dong}', gibun='${lbsVO.gibun}', addr='${lbsVO.addr}', poi='${lbsVO.poi}', Type='${lbsVO.lbstype}', timestamp=now(), appdata='1' where caller='${cid}';`
                                        
                                            con.query(sql3, function(err3, result3){
                                                if(err3){
                                                    logger.error(jsName, "", `DB query3 error : ${err3}`)
                                                    resultVO.insertDataChain(LBS_RESULT, ERRORCODE.get(DATABASE_NOT_CONNECTION));
                                                    try{
                                                        con.release();
                                                    }catch(errr3){}
                                                    return res.end(resultVO.toString());
                                                }else{
                                                    logger.info(jsName, "", `success`);
                                                    resultVO.insertDataChain(LBS_RESULT, ERRORCODE.get(SUCCESS));
                                                    return res.end(resultVO.toString());
                                                }
                                            })
                                        
                                        }else{
                                            //error : return errorCode data error
                                            logger.error(jsName, "", `DATA Error`)
                                            resultVO.insertDataChain(LBS_RESULT, ERRORCODE.get(DATABASE_NOT_CONNECTION));
                                            con.release();
                                            return res.end(resultVO.toString());
                                        }
                                    }
                                }
                            })
                        }
                    }
                });
            }
        })
    });
}
