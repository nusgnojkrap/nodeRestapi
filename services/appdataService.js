import { PARENT_PATH, LBS_NAME, LBS_PORT, LBS_RESULT_PATH } from "../const/const.js";
import { RESULT } from "../const/resultFormat.js";
import fetchkakao from "../utils/kakao.js";
import logger from "../utils/logger.js";
import { createResult } from "../vo/resultVO.js";
import { getCurrentFileName } from "../utils/fileUtil.js";
import { checkParam } from "../utils/checkParam.js"
import { getConnection } from "../utils/mysqlPool.js";
import { ERRORCODE, NOT_EXSIS_PARAMETER, RESPONSE_KNOWNERROR, SUCCESS, LBS_S00000, DATABASE_NOT_CONNECTION } from "../utils/errorCode.js";

//import net from "net";
//import axios from "axios";
const jsName = getCurrentFileName(PARENT_PATH);

/**
 * @description cid 와 did 를 요청받아 LBS 를 요청, 요청에 대한 결과값을 카카오 맵을 사용하여 주소를 받아옴
 * @api {post} /
 * @apiParam {String} did
 * @apiParam {String} cid
 */
export default async function appdataServiceHandler(req, res) {
    logger.info(jsName, "", `appdata start`);
    let resultVO = createResult();
    
    const body = req.body;
    logger.info(jsName, "", `${JSON.stringify(body)}`);
    const cid = body.callernum;
    const did = body.arsnum;

    let s_addr = checkParam(body.s_addr)
    let s_newaddr = checkParam(body.s_newaddr)
    let s_poi = checkParam(body.s_poi)
    const s_latitude = body.s_latitude;
    const s_longitude = body.s_longitude;

    let m_addr = checkParam(body.m_addr)
    let m_newaddr = checkParam(body.m_newaddr)
    let m_poi = checkParam(body.m_poi)
    let m_latitude = checkParam(body.m_latitude)
    let m_longitude = checkParam(body.m_longitude)

    let e_addr = checkParam(body.e_addr)
    let e_newaddr = checkParam(body.e_newaddr)
    let e_poi = checkParam(body.e_poi)
    let e_latitude = checkParam(body.e_latitude)
    let e_longitude = checkParam(body.e_longitude)

    let price = checkParam(body.price)
    let paymethod = checkParam(body.paymethod)

    let sido = checkParam(body.s_sido)
    let gugun = checkParam(body.s_gugun)
    let dong = checkParam(body.s_dong)
    let gibun = checkParam(body.s_gibun)

    // gibun " " => "-" 바꾸기

    logger.info(jsName, "", `[JONG TEST]    gibun : ${gibun}`);
    let newgibun
    if(gibun == "" || gibun == undefined || gibun == null){
        newgibun = ""
    }else{
        let testgibun = gibun.split(" ");
        if (testgibun[1] == "" || testgibun[1] == undefined){
            newgibun = testgibun[0]
        }else{
            newgibun = testgibun[0] + "-" + testgibun[1]
        }
    }
    logger.info(jsName, "", `[JONG TEST] newgibun : ${newgibun}`);

    if (did === undefined || cid === undefined || did == null || cid == null || did == "" || cid == "") {
        // cid, did check
        logger.info(jsName, "", `${cid} ${did} : appData - cid, did : null`);
        resultVO.insertDataChain(RESULT, ERRORCODE.get(NOT_EXSIS_PARAMETER));
        logger.info(jsName, "", `${resultVO.toString()}`);
        return res.end(resultVO.toString());
    }else{
        if (s_latitude == undefined || s_longitude == undefined || s_latitude == null || s_longitude == null || s_latitude == "" || s_longitude == ""){
            // latitude, longitude check
            logger.info(jsName, "", `${cid} ${did} : No data latitude, longitude`);
            resultVO.insertDataChain(RESULT, ERRORCODE.get(NOT_EXSIS_PARAMETER));
            logger.info(jsName, "", `${resultVO.toString()}`);
            return res.end(resultVO.toString());
        }else{
            if (s_poi == undefined || s_poi == null || s_poi == "" || s_addr == undefined || s_addr == null || s_addr == ""){
                // kakao
                const kakao_data = await fetchkakao(s_longitude, s_latitude, cid);
                //위치정보가 없을 경우
                if (kakao_data === "KakaoResponseError") {
                    logger.error(jsName, "", `${cid} ${did} : kakao no data`);
                    s_poi = ""
                } else if (kakao_data === "KakaoAxiosError") {
                    logger.error(jsName, "", `${cid} ${did} : kakao Axios error`);
                    s_poi == ""
                } else{
                    if (kakao_data.documents[0].road_address == undefined || kakao_data.documents[0].road_address == null) {
                        s_poi = ""
                    }else{
                        s_poi = kakao_data.documents[0].road_address.building_name
                    }
                }                
                logger.info(jsName, "", `kakao ok`)
                await LBSDATAinsertORupdate(cid, did, s_addr, s_newaddr, s_poi, s_latitude, s_longitude, m_addr, m_newaddr, m_poi, m_latitude, m_longitude, e_addr, e_newaddr, e_poi, e_latitude, e_longitude, price, paymethod)
            }else{
                // no kakao
                logger.info(jsName, "", `no kakao`);
                await LBSDATAinsertORupdate(cid, did, s_addr, s_newaddr, s_poi, s_latitude, s_longitude, m_addr, m_newaddr, m_poi, m_latitude, m_longitude, e_addr, e_newaddr, e_poi, e_latitude, e_longitude, price, paymethod)
            }
        }
    }



    // 모든 입력값이 정상인 경우 LBSDATA table 에서 데이터가 이미 존재하는지
    // 존재하면 update
    // 없으면   insert
    async function LBSDATAinsertORupdate(cid, did, s_addr, s_newaddr, s_poi, s_latitude, s_longitude, m_addr, m_newaddr, m_poi, m_latitude, m_longitude, e_addr, e_newaddr, e_poi, e_latitude, e_longitude, price, paymethod){
        logger.info(jsName, "", `LBSDATAinsertORupdate start`);
        getConnection((error, con) => {
            if (error) {
                logger.error(jsName, channel, `${cid} ${did} : DB Connection error : ${error}`);
                resultVO.insertDataChain(RESULT, ERRORCODE.get(DATABASE_NOT_CONNECTION));
                logger.info(jsName, "", `${resultVO.toString()}`);
                return res.end(resultVO.toString())
            }
            logger.info(jsName, "", `getConnection success`);
            let sql0 = `select * from LBSDATA where caller="${cid}";`

            con.query(sql0, function(err0, result0){
                if(err0){
                    con.release()
                    logger.error(jsName, "", `${cid} ${did} : DB select query error : ${err0}`);
                    resultVO.insertDataChain(RESULT, ERRORCODE.get(DATABASE_NOT_CONNECTION));                    
                    logger.info(jsName, "", `${resultVO.toString()}`);
                    return res.end(resultVO.toString())
                }else{
                    logger.info(jsName, "", `query OK`)
                    if (result0[0] == undefined || result0[0] == null || result0[0] == ""){
                        // 최근 데이터 없는 경우
                        let sql1 = `insert into LBSDATA(caller,called,x,y,sido,gugun,dong,gibun,addr,newaddr,poi,timestamp,Type, appName, toCDR) values("${cid}","${did}","${s_latitude}","${s_longitude}","${sido}","${gugun}","${dong}","${newgibun}","${s_addr}","${s_newaddr}","${s_poi}",now(),"G", "Uhan", "1");`
                        con.query(sql1, function(errr0, result00){
                            con.release()
                            if(errr0){
                                logger.error(jsName, "", `${cid} ${did} : DB insert query error : ${errr0}`);
                                resultVO.insertDataChain(RESULT, ERRORCODE.get(DATABASE_NOT_CONNECTION));
                                logger.info(jsName, "", `${resultVO.toString()}`);
                                return res.end(resultVO.toString())
                            }
                            logger.info(jsName, "", `query2 OK`)
                            appDatainsertORupdate(cid, did, s_addr, s_newaddr, s_poi, s_latitude, s_longitude, m_addr, m_newaddr, m_poi, m_latitude, m_longitude, e_addr, e_newaddr, e_poi, e_latitude, e_longitude, price, paymethod)
                        })
                    }else{
                        // 최근 데이터 있는 경우
                        let sql1 = `update LBSDATA set x='${s_latitude}', y='${s_longitude}',sido='${sido}',gugun='${gugun}',dong='${dong}',gibun='${newgibun}',addr='${s_addr}',newaddr='${s_newaddr}', poi='${s_poi}', Type='G', timestamp=now(), toCDR='1' where caller='${cid}';`
                        con.query(sql1, function(errr0, result00){
                            con.release()
                            if(errr0){
                                logger.error(jsName, "", `${cid} ${did} : DB update query error1 : ${errr0}`);
                                resultVO.insertDataChain(RESULT, ERRORCODE.get(DATABASE_NOT_CONNECTION));
                                logger.info(jsName, "", `${resultVO.toString()}`);
                                return res.end(resultVO.toString())
                            }
                            logger.info(jsName, "", `query2 OK`)
                            appDatainsertORupdate(cid, did, s_addr, s_newaddr, s_poi, s_latitude, s_longitude, m_addr, m_newaddr, m_poi, m_latitude, m_longitude, e_addr, e_newaddr, e_poi, e_latitude, e_longitude, price, paymethod)
                        })
                    }
                }
            })
        })
    }


    // 모든 입력값이 정상인 경우 appData table 에서 데이터가 이미 존재하는지
    // 존재하면 update
    // 없으면   insert
    async function appDatainsertORupdate(cid, did, s_addr, s_newaddr, s_poi, s_latitude, s_longitude, m_addr, m_newaddr, m_poi, m_latitude, m_longitude, e_addr, e_newaddr, e_poi, e_latitude, e_longitude, price, paymethod){
        logger.info(jsName, "", `appDatainsertORupdate start`);
        getConnection((error, con) => {
            if (error) {
                logger.error(jsName, channel, `${cid} ${did} : DB Connection error : ${error}`);
                resultVO.insertDataChain(RESULT, ERRORCODE.get(DATABASE_NOT_CONNECTION));
                logger.info(jsName, "", `${resultVO.toString()}`);
                return res.end(resultVO.toString())
            }
            logger.info(jsName, "", `getConnection success`);
            let sql0 = `select * from appData where caller="${cid}";`

            con.query(sql0, function(err0, result0){
                if(err0){
                    con.release()
                    logger.error(jsName, "", `${cid} ${did} : DB select query error : ${err0}`);
                    resultVO.insertDataChain(RESULT, ERRORCODE.get(DATABASE_NOT_CONNECTION));                    
                    logger.info(jsName, "", `${resultVO.toString()}`);
                    return res.end(resultVO.toString())
                }else{
                    logger.info(jsName, "", `query OK`)
                    if (result0[0] == undefined || result0[0] == null || result0[0] == ""){
                        // 최근 데이터 없는 경우

                        let sql1 = `insert into appData(caller, called, s_addr, s_newaddr, s_poi, s_lat, s_long, m_addr, m_newaddr, m_poi, m_lat, m_long, e_addr, e_newaddr, e_poi, e_lat, e_long, rdate, price, paymethod) values("${cid}","${did}","${s_addr}","${s_newaddr}","${s_poi}","${s_latitude}","${s_longitude}","${m_addr}","${m_newaddr}","${m_poi}","${m_latitude}","${m_longitude}","${e_addr}","${e_newaddr}","${e_poi}","${e_latitude}","${e_longitude}",now(),"${price}","${paymethod}");`
                        con.query(sql1, function(err0, result0){
                            con.release();
                            if(err0){
                                logger.error(jsName, "", `${cid} ${did} : DB insert query error : ${err0}`);
                                resultVO.insertDataChain(RESULT, ERRORCODE.get(DATABASE_NOT_CONNECTION));                                
                                logger.info(jsName, "", `${resultVO.toString()}`);
                                return res.end(resultVO.toString())
                            }
                            logger.info(jsName, "", `query2 OK`)
                            resultVO.insertDataChain(RESULT, ERRORCODE.get(SUCCESS))
                            logger.info(jsName, "", `${resultVO.toString()}`);
                            return res.end(resultVO.toString())
                        })

                    }else{
                        // 최근 데이터 있는 경우
                        let sql1 = `update appData set s_addr='${s_addr}', s_newaddr='${s_newaddr}', s_poi='${s_poi}', s_lat='${s_latitude}', s_long='${s_longitude}',m_addr='${m_addr}', m_newaddr='${m_newaddr}', m_poi='${m_poi}', m_lat='${m_latitude}', m_long='${m_longitude}',e_addr='${e_addr}', e_newaddr='${e_newaddr}', e_poi='${e_poi}', e_lat='${e_latitude}',e_long='${e_longitude}', rdate=now(), price='${price}', paymethod='${paymethod}' where caller='${cid}';`
                        con.query(sql1, function(err0, result0){
                            con.release();
                            if(err0){
                                logger.error(jsName, "", `${cid} ${did} : DB update query error2 : ${err0}`);
                                resultVO.insertDataChain(RESULT, ERRORCODE.get(DATABASE_NOT_CONNECTION));
                                logger.info(jsName, "", `${resultVO.toString()}`);
                                return res.end(resultVO.toString())
                            }
                            logger.info(jsName, "", `query2 OK`)
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
