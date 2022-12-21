/**
 * @description LBS 조회 결과 위도와 경도의 유효성을 판단합니다.
 * 예를 들어 234.12354 형식으로 나오게 되는데, "."을 split 하여 숫자가 맞는지 확인합니다.
 * @param {string} str - 위도 및 경도의 스트링 형식을 받습니다.
 * @returns {bool} - True or False
 */
export function isValidNumber(str) {
    try {
        const [a, b] = str.split(".");
        const num1 = Number(a);
        const num2 = Number(b);

        if (num1 === "" || num2 === "") return false;
        if (num1 === null || num2 === null) return false;
        if (num1 === 0 || num2 === 0) return false;
        if (typeof num1 === Number && typeof num2 === Number) {
            return true;
        }
    } catch (err) {
        return false;
    }
}

export function currentGetYYYYMMDD() {
    return new Date(+new Date() + 3240 * 10000).toISOString().split("T")[0];
}
