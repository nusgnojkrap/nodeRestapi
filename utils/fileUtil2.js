import fs from "fs";

/**
 * @description 파일이 존재하는지를 확인합니다.
 * @param {string} path - The path to the file
 * @returns {boolean} - Whether the file exists or not
 */
export function fileExists(path) {
    return fs.existsSync(path);
}

/**
 * @description 파일을 생성합니다.
 * @param {string} path The path to the file to create.
 */
export function fileCreate(path) {
    fs.writeFileSync(path, "");
}

/**
 * @description 디렉토리를 생성합니다.
 * @param {string} path - The path to create the directory at
 */
export function directoryCreate(path) {
    fs.mkdirSync(path);
}

/**
 * @description path 경로에 data 를 작성합니다.
 * @param {string} path - The path to the file to be written.
 * @param {string} data - The data to be written to the file.
 */
export function fileWrite(path, data) {
    fs.writeFileSync(path, data);
}

/**
 * @description path 경로에 data 를 추가합니다.
 * @param {string} path - The path to the file to append to
 * @param {string} data - The data to append to the file
 */
export function fileAppend(path, data) {
    fs.appendFileSync(path, data);
}

export function fileCopy(src, dest) {
    fs.copyFileSync(src, dest);
}

//module.exports.fileExists = fileExists;
//module.exports.fileCreate = fileCreate;
//module.exports.directoryCreate = directoryCreate;
//module.exports.fileWrite = fileWrite;
//module.exports.fileAppend = fileAppend;
//module.exports.fileCopy = fileCopy;

//export default { fileExists, fileCreate, directoryCreate, fileWrite, fileAppend, fileCopy }
