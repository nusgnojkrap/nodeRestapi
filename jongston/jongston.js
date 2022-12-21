import { PATH_SEPERATOR } from "../const/const.js";
import getDate from "../utils/dateFormat.js";
import { fileExists, directoryCreate, fileWrite, fileAppend } from "../utils/fileUtil2.js";
import execute from "../utils/execute.js";

let server_number = "";

/**
 * @description filepath에 filename의 존재 유무에 따라 Append 처리와 Insert 합니다.
 * @param {string} filepath - path to the file to be converted
 * @param {string} filecount - 파일 이름에 파일카운트를 넣어 파일이 여러개 생성되어 집니다.
 * @param {string} filename - name of the file to be converted
 * @param {string} log - path to the log file
 * @param {string} err - path to the error file
 * @return {Promise} - returns a promise
 */
function jongston(filepath, filename, filecount, log, err) {
    return new Promise(async (resolve, reject) => {
        if (filepath == undefined || filename == undefined) {
            reject("parameter not exists");
        }

        //if the last character is "/"
        if (filepath[filepath.length - 1] == PATH_SEPERATOR) {
            filepath = filepath.substring(0, filepath.length - 1);
        }

        //if the last character is "/"
        if (filename[filename.length - 1] == PATH_SEPERATOR) {
            filename = filename.substring(0, filename.length - 1);
        }

        if (server_number == "") {
            const hostnameResult = await execute("hostname"); //ls -arlt
            server_number = hostnameResult.slice(hostnameResult.length - 3, hostnameResult.length - 1);
        }

        filename = filename + getDate("yymmdd").format + "_" + filecount + "_0000" + "_2" + server_number.toString()[1] + ".534"; //add date to filename
        //if the last character is a newline
        if (log != "") {
            if (log[log.length - 1] == "\n") {
                log = log.substring(0, log.length - 1);
            } else {
                log = log + "\n";
            }
        }

        //if the directory does not exist, create it
        if (fileExists(filepath) == false) directoryCreate(filepath);

        //if the file does not exist
        if (fileExists(filepath + PATH_SEPERATOR + filename) == false) {
            fileWrite(filepath + PATH_SEPERATOR + filename, log);
        } else {
            fileAppend(filepath + PATH_SEPERATOR + filename, log);
        }

        resolve();
    });
}

export default jongston
