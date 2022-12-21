import CryptoJS from 'crypto-js'

/* [aes 256 인코딩, 디코딩에 필요한 전역 변수 선언] */
var secretKey = "Sejong$%^!telecom@SEJONG1688@#$!"; // key 값 32 바이트
//var Iv = "0123456789abcdef"; //iv 16 바이트

export function encrypt(data) {
    return new Promise(function (resolve) {
        const cipher = CryptoJS.AES.encrypt(data, CryptoJS.enc.Utf8.parse(secretKey), {
            //iv: CryptoJS.enc.Utf8.parse(Iv), // [Enter IV (Optional) 지정 방식]
            padding: CryptoJS.pad.Pkcs7,
            mode: CryptoJS.mode.ECB // [cbc 모드 선택]
        });
    
        const aes256EncodeData = cipher.toString();
        return resolve(aes256EncodeData) 
    });
}

export function decrypt(data) {
    return new Promise(function (resolve) {
	if (data === null || data === undefined || data == ""){
	    return resolve("fail")
	}
        const cipher = CryptoJS.AES.decrypt(data, CryptoJS.enc.Utf8.parse(secretKey), {
            //iv: CryptoJS.enc.Utf8.parse(Iv), // [Enter IV (Optional) 지정 방식]
            padding: CryptoJS.pad.Pkcs7,
            mode: CryptoJS.mode.ECB // [cbc 모드 선택]
        });
    
        const aes256DecodeData = cipher.toString(CryptoJS.enc.Utf8);
        return resolve(aes256DecodeData) 
    });
}

/*
(async () => {
    let a = await encrypt('22112810401032301075761807');
    console.log("a : " + a)
    let b = await decrypt(a)
    console.log("b : " + b)
    }
)();
*/


