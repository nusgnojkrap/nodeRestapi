import jongston from "./jongston.js";

/**
 * @description 해당 클래스를 이용하여 CDR 전용 로거 객체를 생성합니다. 로그는 스택으로 처리됩니다.
 * @param {string} filepath - The filepath of the logger.
 * @param {string} filename - The filename of the logger.
 * @returns {Logger} - The logger that was added.
 */
export class LoggerStack {
    constructor(filepath, filename, filecount) {
        this.logger = [];
        this.start = false;
        this.currentLogger = null;
        this.filepath = filepath;
        this.filename = filename;
        this.filecount = "0001";
    }

    pop() {
        this.currentLogger = this.logger.pop();
    }

    process() {
        return new Promise(async (resolve) => {
            while (true) {
                if (this.logger.length === 0) {
                    this.start = false;
                    return resolve();
                } else {
                    this.pop();
                    await jongston(this.filepath, this.filename, this.filecount, this.currentLogger[0], this.currentLogger[1]);
                }
            }
        });
    }

    insert(logger, err) {
        this.logger.push([logger, err]);

        if (this.start) {
        } else {
            this.start = true;
            this.process();
        }
    }
}

//export default LoggerStack;
