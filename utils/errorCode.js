/** 000 : 성공 코드 */
const SUCCESS = "000";

/** 010 : 파라미터 에러 및 사용자 에러코드 */
const NOT_EXSIS_PARAMETER = "011"; // 파라미터가 존재하지 않습니다.
const RESPONSE_NOTEXSISKEY = "012"; //키가 존재하지 않습니다.

/** 020 : 서버관리측면에서의 에러코드 */
const RESPONSE_DATA_NOTING = "020"; //  응답시간이 타임아웃되었습니다.
const DATABASE_NOT_CONNECTION = "021"; // 데이터베이스 연결에 실패하였습니다.
const DATABASE_QUERY_ERROR = "022";    // 데이터베이스 쿼리문 에러
const DATABASE_RELEASE_ERROR = "023";  // 데이터베이스 릴리즈 에러
const DECRYPT_FAIL = "024"; // 콜게이트 연동 암복호화 실패

/** 030 : LBS 관련 에러코드 */
const LBS_S00000 = "030"; // LBS 성공
const LBS_E00100 = "031"; // 전원꺼짐/통화권이탈
const LBS_E00200 = "032"; // 단말기 형식 오류
const LBS_E00300 = "033"; // 메세지 OVEFLOW
const LBS_E00400 = "034"; // 위치요청거부
const LBS_E00500 = "035"; // 비가입자, 결번, 서비스정지
const LBS_E00700 = "037"; // 이동통신사 장애
const LBS_E00800 = "038"; // 원격통신오류
const LBS_E00900 = "039"; // 결과수신오류
const LBS_E90000 = "900"; // 기타
const LBS_E90001 = "901"; // 암복호화 관련오류
const LBS_E90002 = "902"; // 통신전문 오류
const LBS_E90003 = "903"; // 필수파라미터 오류
const LBS_E90004 = "904"; // 권한 오류
const LBS_E90005 = "905"; // 서버 시스템 오류
const LBS_E90006 = "906"; // 정보 서버 오류
const LBS_E90007 = "907"; // 정보서버 타임아웃
const LBS_E90009 = "909"; // 제한 사용량 초과

/** 040 : CDR 관련 에러코드 */
const CDR_DATA_IS_EMPTY = "040"; // 데이터가 존재하지 않습니다.

/** 060 : kakao 관련 에러코드 */
const KAKAO_RESPONSEERROR = "060";  // 카카오 응답 결과가 존재하지 않습니다.
const KAKAO_AXIOSERROR = "061";     // 카카오 Axios 에러

/** 990 : 알수없는 에러코드 */
const RESPONSE_UNDEFINEDERROR = "991";  // 응답 결과가 존재하지 않습니다.
const RESPONSE_MISINFORMATIONERROR = "992" // 위도 경도 데이터가 잘못된 값입니다.
const RESPONSE_KNOWNERROR = "999"; // 알 수 없는 에러가 발생하였습니다.

/* ****************** */ /* ****************** */ /* ****************** */ /* ****************** */ /* ****************** */ /* ****************** */ /* ****************** */
/* ****************** */ /* ****************** */ /* ****************** */ /* ****************** */ /* ****************** */ /* ****************** */ /* ****************** */

const ERRORCODE = new Map();
ERRORCODE.set(SUCCESS, { resultCode: SUCCESS, resultMessage: "성공" });

ERRORCODE.set(NOT_EXSIS_PARAMETER, { resultCode: NOT_EXSIS_PARAMETER, resultMessage: "파라미터가 존재하지 않습니다." });
ERRORCODE.set(RESPONSE_NOTEXSISKEY, { resultCode: RESPONSE_NOTEXSISKEY, resultMessage: "키가 존재하지 않습니다." });

ERRORCODE.set(RESPONSE_DATA_NOTING, { resultCode: RESPONSE_DATA_NOTING, resultMessage: "응답시간이 타임아웃되었습니다." });
ERRORCODE.set(DATABASE_NOT_CONNECTION, { resultCode: DATABASE_NOT_CONNECTION, resultMessage: "데이터베이스 연결에 실패하였습니다." });
ERRORCODE.set(DATABASE_QUERY_ERROR, { resultCode: DATABASE_QUERY_ERROR, resultMessage: "데이터베이스 쿼리문 에러." });
ERRORCODE.set(DATABASE_RELEASE_ERROR, { resultCode: DATABASE_RELEASE_ERROR, resultMessage: "데이터베이스 쿼리문 에러." });
ERRORCODE.set(DECRYPT_FAIL, { resultCode: DECRYPT_FAIL, resultMessage: "cid 암복호화 실패." });


ERRORCODE.set(LBS_S00000, { resultCode: LBS_S00000, resultMessage: "LBS가 조회되지 않는 번호입니다." });

ERRORCODE.set(LBS_E00100, { resultCode: LBS_E00100, resultMessage: "단말기의 전원이 꺼져있거나 통화권이 이탈된 상태로 LBS가 조회되지 않았습니다." });
ERRORCODE.set(LBS_E00200, { resultCode: LBS_E00200, resultMessage: "단말기 형식의 오류가 발생하여 LBS가 조회되지 않았습니다." });
ERRORCODE.set(LBS_E00300, { resultCode: LBS_E00300, resultMessage: "블루칩으로 보내는 메시지의 OVERFLOW가 발생하였습니다." });
ERRORCODE.set(LBS_E00400, { resultCode: LBS_E00400, resultMessage: "해당 단말기는 위치요청 거부로 LBS가 조회되지 않습니다." });
ERRORCODE.set(LBS_E00500, { resultCode: LBS_E00500, resultMessage: "해당 단말기는 비가입자 혹은 결번이거나 서비스정지 고객이므로 LBS가 조회되지 않습니다. " });
ERRORCODE.set(LBS_E00700, { resultCode: LBS_E00700, resultMessage: "이동통신사의 장애가 있어 LBS가 조회되지 않았습니다." });
ERRORCODE.set(LBS_E00800, { resultCode: LBS_E00800, resultMessage: "원격통신 오류." });
ERRORCODE.set(LBS_E00900, { resultCode: LBS_E00900, resultMessage: "결과 수신 오류." });
ERRORCODE.set(LBS_E90000, { resultCode: LBS_E90000, resultMessage: "기타." });
ERRORCODE.set(LBS_E90001, { resultCode: LBS_E90001, resultMessage: "블루칩에서 암호화 복호화 과정에서 오류가 발생하였습니다." });
ERRORCODE.set(LBS_E90002, { resultCode: LBS_E90002, resultMessage: "블루칩에서 통신전문 오류가 발생하였습니다." });
ERRORCODE.set(LBS_E90003, { resultCode: LBS_E90003, resultMessage: "블루칩에서 필수파라미터 오류가 발생하였습니다." });
ERRORCODE.set(LBS_E90004, { resultCode: LBS_E90004, resultMessage: "블루칩에서 권한 오류가 발생하였습니다." });
ERRORCODE.set(LBS_E90005, { resultCode: LBS_E90005, resultMessage: "블루칩에서 서버 시스템 오류가 발생하였습니다." });
ERRORCODE.set(LBS_E90006, { resultCode: LBS_E90006, resultMessage: "블루칩에서 정보 서버 오류가 발생하였습니다." });
ERRORCODE.set(LBS_E90007, { resultCode: LBS_E90007, resultMessage: "블루칩에서 정보 서버 타임아웃이 발생하였습니다." });
ERRORCODE.set(LBS_E90009, { resultCode: LBS_E90009, resultMessage: "블루칩에서 제한 사용량 초과가 발생하였습니다." });

ERRORCODE.set(CDR_DATA_IS_EMPTY, { resultCode: CDR_DATA_IS_EMPTY, resultMessage: "CDR 데이터가 존재하지 않습니다." });

ERRORCODE.set(KAKAO_RESPONSEERROR, { resultCode: KAKAO_RESPONSEERROR, resultMessage: "카카오 응답 결과가 존재하지 않습니다." });
ERRORCODE.set(KAKAO_AXIOSERROR, { resultCode: KAKAO_AXIOSERROR, resultMessage: "카카오 Axios 에러." });

ERRORCODE.set(RESPONSE_UNDEFINEDERROR, { resultCode: RESPONSE_UNDEFINEDERROR, resultMessage: "블루칩의 응답 결과가 존재하지 않습니다." });
ERRORCODE.set(RESPONSE_MISINFORMATIONERROR, { resultCode: RESPONSE_MISINFORMATIONERROR, resultMessage: "블루칩에서 온 위도 경도 데이터가 잘못된 값입니다." });

ERRORCODE.set(RESPONSE_KNOWNERROR, { resultCode: RESPONSE_KNOWNERROR, resultMessage: "알 수 없는 에러가 발생하였습니다." });


/* ****************** */ /* ****************** */ /* ****************** */ /* ****************** */ /* ****************** */ /* ****************** */ /* ****************** */
/* ****************** */ /* ****************** */ /* ****************** */ /* ****************** */ /* ****************** */ /* ****************** */ /* ****************** */

export {
    SUCCESS,
    NOT_EXSIS_PARAMETER,
    RESPONSE_NOTEXSISKEY,
    RESPONSE_DATA_NOTING,
    DATABASE_NOT_CONNECTION,
    DATABASE_QUERY_ERROR,
    DATABASE_RELEASE_ERROR,
    DECRYPT_FAIL,
    ERRORCODE,
    CDR_DATA_IS_EMPTY,
    KAKAO_RESPONSEERROR,
    KAKAO_AXIOSERROR,
    RESPONSE_KNOWNERROR,
    RESPONSE_UNDEFINEDERROR,
    RESPONSE_MISINFORMATIONERROR,
    LBS_S00000,
    LBS_E00100,
    LBS_E00200,
    LBS_E00300,
    LBS_E00400,
    LBS_E00500,
    LBS_E00700,
    LBS_E00800,
    LBS_E00900,
    LBS_E90000,
    LBS_E90001,
    LBS_E90002,
    LBS_E90003,
    LBS_E90004,
    LBS_E90005,
    LBS_E90006,
    LBS_E90007,
    LBS_E90009,
};
