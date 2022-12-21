import mysql from "mysql"
import logger from "./logger.js"
import path from "path"
import { MYSQL_HOST1, MYSQL_HOST2, MYSQL_USER, MYSQL_PASSWD, MYSQL_DATABASE, PARENT_PATH } from "../const/const.js"

let pool1 = mysql.createPool({
    host: MYSQL_HOST1,
    user: MYSQL_USER,
    password: MYSQL_PASSWD,
    database: MYSQL_DATABASE,
});

let pool2 = mysql.createPool({
    host: MYSQL_HOST2,
    user: MYSQL_USER,
    password: MYSQL_PASSWD,
    database: MYSQL_DATABASE,
});

export function getConnection(callback) {
    pool1.getConnection(function (err1, conn1) {
        if (err1) {
	    logger.error("mysqlPool.js", "", `DB1 Connection error : ${err1}`);
            pool2.getConnection(function (err2, conn2) {
		logger.error("mysqlPool.js", "", `DB2 Connection error : ${err2}`);
                return callback(err2, conn2);
            });
        } else {
            return callback(err1, conn1);
        }
    });
}

