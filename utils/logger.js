import winston from "winston";
import winstonDaily from "winston-daily-rotate-file";
import { addSpace } from "./spaceMaster.js";
import  { LOG_PATH, LOG_SURROGATE_NAME, LOG_DATA_FILENAME, LOG_DATA_DIRECTORY } from "../const/const.js";
import { LoggerStack } from "../jongston/loggerStack.js";

let alignColorsAndTime = winston.format.combine(
    winston.format.colorize({
        all: true,
    }),
    winston.format.label({
        label: "[LOGGER]",
    }),
    winston.format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
    }),
    // winston.format.printf((info) => ` ${info.label}  ${info.timestamp}  ${info.level} : ${info.message}`)
    winston.format.printf((info) => `[${info.timestamp}] [${info.level}] ${info.message}`)
);

let notalignColorsAndTime = winston.format.combine(
    winston.format.label({
        label: "[LOGGER]",
    }),
    winston.format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.printf((info) => `[${info.timestamp}] [${info.level}] ${info.message}`)
);

/**
 * @description logger 객체를 생성합니다.
 * @param {string} level - The level of the log message.
 * @param {string} message - The message to log.
 * @param {string} meta - The meta data to log.
 */
const logger = winston.createLogger({
    level: "debug",
    transports: [
        new winstonDaily({
            filename: "logs/surrogate",
            zippedArchive: false,
            format: winston.format.combine(notalignColorsAndTime),
        }),

        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), alignColorsAndTime),
        }),
    ],
});

const info = function (jsName, channel, msg) {
    if (channel == null) {
        channel = "SIP/sst-undefine";
    }

    logger.info(` [${channel}] [${addSpace(`${jsName}]`, 16)} - ${msg}`);
};

const error = function (jsName, channel, msg) {
    if (channel == null || channel == "" || channel == undefined) {
        channel = "SIP/sst-undefine";
    }

    logger.error(`[${channel}] [${addSpace(`${jsName}]`, 16)} - ${msg}`);
};

//export default { info, error };


const dataLogger = new LoggerStack(LOG_PATH + LOG_DATA_DIRECTORY, LOG_DATA_FILENAME);

const datalog = function(filecount, msg, err){
    dataLogger.filecount = filecount;
    dataLogger.insert(msg, err);
}

export default { info, error, datalog }

/*
module.exports.datalog = function (filecount, msg, err) {
    dataLogger.filecount = filecount;
    dataLogger.insert(msg, err);
};
*/
