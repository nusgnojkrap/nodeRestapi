/**
 * @description param 파라미터 길이의 값과 space 길이를 비교하여 space 길이 만큼 param 값을 넣고, 공백을 추가합니다.
 * @param {string} param
 * @param {string} space
 * @return {string}
 */
function spaceMaster(param, space) {
    param = param.toString();
    let result = "";
    if (space < param.length) {
        for (let i = 0; i < space; i++) {
            result = result + param[i];
        }
    } else {
        let rest = space - param.length;
        result = result + param;
        for (let i = 0; i < rest; i++) {
            result = result + " ";
        }
    }

    return result;
}

function addSpace(param, maximum) {
    let space = "";
    for (let i = 0; i < maximum - param.length; i++) {
        space += " ";
    }
    return space + param;
}

function followMsgSpaceMaster(data) {
    let param = "\n";

    for (let i = 0; i < 66; i++) {
        param += " ";
    }

    param = param + data;
    return param;
}

export { spaceMaster, addSpace, followMsgSpaceMaster };
