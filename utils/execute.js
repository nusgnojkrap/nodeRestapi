import childProcess from "child_process";
  
function execute(command) {
    return new Promise(function (resolve, reject) {
        childProcess.exec(command, function (error, standardOutput, standardError) {
            if (error) {
                reject();
                return;
            }

            if (standardError) {
                reject(standardError);
                return;
            }

            resolve(standardOutput);
        });
    });
}

export default execute;


/*
(async () => {
    let LS = await execute("ls /root/CDR"); // 현재 폴더에서 파일이 존재하는지를 확인
    console.log(`ls : ${LS}`);
    }
)();
*/
