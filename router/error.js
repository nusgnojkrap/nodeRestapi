/**
 * @description path 가 존재하지 않는 경우 사용자에게 전송하는 에러처리 로직입니다.
 * @api noting path
 */
export default function errorHanlder(req, res) {
    const errorObj = {
        code: "404",
        message: "Error: Not Found",
    };

    return res.json(errorObj);
}
