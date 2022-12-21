import _ from "lodash";
import { RESULT_FORMAT } from "../const/resultFormat.js";

const LBS = {
    parameter: RESULT_FORMAT,
    createData: function () {
        let self = this;
        self.parameter.map((val) => {
            self[val] = "";
        });
    },

    insertData: function (args) {
        let self = this;
        Object.entries(args).map(([key, value], idx) => {
            self[self.parameter[idx]] = value;
        });
    },

    initData: function (args) {
        this.createData.apply(this);
        this.insertData.apply(this, [args]);
    },

    insertDataChain: function (type, data) {
        let self = this;
        if (self.parameter.some((value) => value == type)) {
            self[type] = data;
        }
        return self;
    },

    toString: function () {
        let self = this;
        let obj = {};
        self.parameter.map((val) => {
            obj[val] = self[val];
        });

        return JSON.stringify(obj);
    },
};

export function createResult() {
    let myLBS = _.cloneDeep(LBS);
    if (arguments.length == RESULT_FORMAT.length - 1) {
        myLBS.initData.apply(myLBS, [arguments]);
    } else {
        myLBS.createData.apply(myLBS);
    }
    return myLBS;
}
