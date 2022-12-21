import { CURRENT_PATH, PARENT_PATH } from "../const/const.js";
import path from "path";

/**
 * Gets the current file name.
 * @param type - the type of file to get the name of.
 * @returns the current file name.
 */
export function getCurrentFileName(type) {
    let filename = {};

    try {
        Error.prepareStackTrace = function (err, stack) {
            return stack;
        };
        var err = new Error();
        filename[CURRENT_PATH] = err.stack.shift().getFileName();
        filename[PARENT_PATH] = err.stack.shift().getFileName();
    } catch (err) {
        filename[CURRENT_PATH] = "Error";
        filename[PARENT_PATH] = "Error";
    }

    return path.basename(filename[type]);
}
