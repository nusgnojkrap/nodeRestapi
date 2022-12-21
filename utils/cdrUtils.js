import getDate from "./dateFormat.js";
import execute from "./execute.js";
import { fileCreate, fileCopy } from "./fileUtil2.js";
import logger from "./logger.js";

function num2StrLengthFour(param) {
    let a = 4 - param.toString().length;
    for (let i = 0; i < a; i++) {
        param = "0" + param;
    }
    return param;
}

function fileCopyName(b, date, filecount, hostname, fileline) {
    let str = "";
    if (b) {
        str += "/root/CDR/IVR";
    } else {
        str += "/root/CDR_send/IVR";
    }

    str += date + "_" + filecount + "_" + fileline + "_" + "2" + hostname + ".534";
    return str;
}

/**
 * @description CDR filename을 체크하여 생성되는 날짜의 CDR fileCount를 알아내는 함수입니다.
 * CDR fileCount 란 0000-9999 까지 수 이며, 파일이 존재하지 않는 경우 0001 부터 시작하여 로그를 기록합니다.
 * 로그의 길이가 1000 줄 이상이라면 CDR fileCount 를 1 증가하여 또 다른 파일에 로그를 기록합니다.
 * @returns
 */
export async function checkFileName() {
    let LS = await execute("ls /root/CDR"); // 현재 폴더에서 파일이 존재하는지를 확인
    let filecount = "0001";

    // 현재 폴더에 파일이 존재하지 않으면 0001 부터 시작
    if (LS == null || LS == "") {
        filecount = "0001";
        return filecount;
    }

    // 서버의 hostname을 받아옴 [ AI-asterisk-01 => 1]
    let hostname = await execute(`hostname`);
    hostname = hostname.slice(hostname.length - 3, hostname.length);
    hostname = hostname.slice(1, hostname.length - 1);

    // 현재 날짜를 yymmdd 형식으로 받아옴
    let currentDate = getDate("yymmdd").format;

    // 현재 날짜의 파일을 확인
    let filename = await execute(`ls -tcr /root/CDR | grep ${currentDate} | tail -1`);

    // 현재 날짜의 파일이 존재하지 않으면
    if (filename == null || filename == "") {
        let date = Number(currentDate);
        let TF = true;

        // 파일이 존재할 때 까지 Date를 -1
        while (TF) {
            date = date - 1;
            filename = await execute(`ls -tcr /root/CDR | grep ${date} | tail -1`);
            if (filename != "") {
                TF = false;
                break;
            }
        }

        // 파일 카운트롤 slice 해준 후
        filecount = filename.split("_")[1].slice(0, 4);

        // 파일 라인을 확인
        let testLine = `wc -l /root/CDR/IVR${date}_${filecount}_0000_2${hostname}.534`;
        let fileline = await execute(testLine);
        //let fileline = await execute(`wc -l /root/CDR/IVR${date}_${filecount}_0000_2${hostname}.534`);
        fileline = Number(fileline.split(" ")[0]);

        // 파일 라인이 1000줄이 되지 않는다면 현재 날짜가 아니므로 fileCount를 1증가 하여 리턴
        if (1000 > fileline) {
            // 박종선 추가 - 파일카피 (1) - 1000줄 이 아닌 경우

            fileCopy(fileCopyName(true, date, filecount, hostname, "0000"), fileCopyName(false, date, filecount, hostname, num2StrLengthFour(fileline)));
            filecount = num2StrLengthFour(Number(filecount) + 1);
            return filecount;
        } else {
            // 파일 라인이 1000줄 이상이라면 아래 행위를 반복
            TF = true;
            while (TF) {
                // 파일 카운트를 1 증가시키고
                filecount = num2StrLengthFour(Number(filecount) + 1);

                // 파일라인을 확인
                try {
                    fileline = await execute(`wc -l /root/CDR/IVR${date}_${filecount}_0000_2${hostname}.534`);
                } catch (eerror) {
                    return filecount;
                }
                fileline = Number(fileline.split(" ")[0]);

                // 파일 라인이 1000줄이 되지 않는다면 현재 날짜가 아니므로 fileCount를 1증가 하여 리턴
                if (1000 > fileline) {
                    TF = false;
                    fileCopy(fileCopyName(true, date, filecount, hostname, "0000"), fileCopyName(false, date, filecount, hostname, num2StrLengthFour(fileline)));
                    // 박종선 추가 - 파일카피 (2) - 1000줄 이 아닌 경우
                    filecount = num2StrLengthFour(Number(filecount) + 1);
                    return filecount;
                }
            }
        }
    } else {
        // 현재 날짜에 파일이 존재 하면 저장된 filename의 카운트를 가져오고,
        filecount = filename.split("_")[1].slice(0, 4);

        // 파일 라인을 확인
        let fileline = await execute(`wc -l /root/CDR/IVR${currentDate}_${filecount}_0000_2${hostname}.534`);
        fileline = Number(fileline.split(" ")[0]);

        // 파일 라인이 100줄이 되지 않는다면 현재 날짜이므로 fileCount를 리턴
        if (1000 > fileline) {
            return filecount;
        } else {
            // 파일 라인이 1000줄 이상이라면 아래 행위를 반복
            let TF = true;
            while (TF) {
                // 파일 카운트를 1 증가시키고
                // 박종선 추가 - 파일카피 (3) - 1000줄 인 경우
                fileCopy(fileCopyName(true, currentDate, filecount, hostname, "0000"), fileCopyName(false, currentDate, filecount, hostname, num2StrLengthFour(fileline)));
                filecount = num2StrLengthFour(Number(filecount) + 1);
                // 파일 라인을 확인
                // filecount 에러
                try {
                    fileline = await execute(`wc -l /root/CDR/IVR${currentDate}_${filecount}_0000_2${hostname}.534`);
                } catch (eerror) {
                    return filecount;
                }
                fileline = Number(fileline.split(" ")[0]);
                // 파일 라인이 1000줄이 되지 않는다면 현재 날짜이므로 현재 날짜이므로 fileCount를 리턴
                if (1000 > fileline) {
                    TF = false;
                    return filecount;
                }
            }
        }
    }
}

export function callStandardCDR(
    src_type,
    unique_id,
    service_number,
    calling_number,
    called_number,
    rdnis,
    callerch,
    firstcall_starttime,
    firstcall_answertime,
    firstcall_endtime,
    consultcall_starttime,
    consultcall_answertime,
    consultcall_endtime,
    firstcall_duration,
    firstcall_billduration,
    consultcall_duration,
    consultcall_billduration,
    lbs_reqtime,
    lbs_restime,
    lbs_duration,
    lbs_latitude,
    lbs_longitude,
    lbs_tel_info,
    lbs_result,
    a_category,
    bill_type
) {
    let result = "";

    result = result + src_type;
    result = spaceMaster(result, 1, src_type);
    result = result + unique_id;
    result = spaceMaster(result, 15, unique_id);
    result = result + service_number;
    result = spaceMaster(result, 15, service_number);
    result = result + calling_number;
    result = spaceMaster(result, 20, calling_number);
    result = result + called_number;
    result = spaceMaster(result, 20, called_number);
    result = result + rdnis;
    result = spaceMaster(result, 20, rdnis);
    result = result + callerch;
    result = spaceMaster(result, 20, callerch);
    result = result + firstcall_starttime;
    result = spaceMaster(result, 14, firstcall_starttime);
    result = result + firstcall_answertime;
    result = spaceMaster(result, 14, firstcall_answertime);
    result = result + firstcall_endtime;
    result = spaceMaster(result, 14, firstcall_endtime);
    result = result + consultcall_starttime;
    result = spaceMaster(result, 14, consultcall_starttime);
    result = result + consultcall_answertime;
    result = spaceMaster(result, 14, consultcall_answertime);
    result = result + consultcall_endtime;
    result = spaceMaster(result, 14, consultcall_endtime);
    result = result + firstcall_duration;
    result = spaceMaster(result, 5, firstcall_duration);
    result = result + firstcall_billduration;
    result = spaceMaster(result, 5, firstcall_billduration);
    result = result + consultcall_duration;
    result = spaceMaster(result, 5, consultcall_duration);
    result = result + consultcall_billduration;
    result = spaceMaster(result, 5, consultcall_billduration);
    result = result + a_category;
    result = spaceMaster(result, 2, a_category);
    result = result + bill_type;
    result = spaceMaster(result, 1, bill_type);
    result = result + lbs_reqtime;
    result = spaceMaster(result, 14, lbs_reqtime);
    result = result + lbs_restime;
    result = spaceMaster(result, 14, lbs_restime);
    result = result + lbs_duration;
    result = spaceMaster(result, 5, lbs_duration);
    result = result + lbs_latitude;
    result = spaceMaster(result, 11, lbs_latitude);
    result = result + lbs_longitude;
    result = spaceMaster(result, 11, lbs_longitude);
    result = result + lbs_tel_info;
    result = spaceMaster(result, 3, lbs_tel_info);
    result = result + lbs_result;
    result = spaceMaster(result, 1, lbs_result);

    return result;
}

function spaceMaster(result, len, param) {
    for (let i = 0; i < len - param.length; i++) {
        result = result + " ";
    }
    return result;
}


/*
(async () => {
    let LS = await execute("ls /root/CDR"); // 현재 폴더에서 파일이 존재하는지를 확인
    console.log(`ls : ${LS}`);
    }
)();
*/

//module.exports.callStandardCDR = callStandardCDR;
//module.exports.checkFileName = checkFileName;
