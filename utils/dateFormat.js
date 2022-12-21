import Dateformat from "dateformat";
  
/**
 * @description 파라미터 형식에 따라서 날짜 데이터 포맷을 변경합니다. 날짜 데이터는 함수를 요청한 current realtime 시간입니다.
 * @param {string} dateFormat - The format of the date to be returned.
 * @returns {string} - The date in the requested format.
 */
function getDate(dateFormat) {
    let current = new Date();
    let date = {
        ms: current.getTime(),
        format: Dateformat(current, dateFormat),
    };
    return date;
}

export default getDate;
