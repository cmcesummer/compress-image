const fs = require("fs");
const rp = require("request");

function upload({ imgPath, cb = () => {}, retryTime = 2 }) {
    const file = fs.readFileSync(imgPath);

    if (!file) {
        console.log(`no img in ${imgPath}`);
        return;
    }

    let retryError = 0;

    function post() {
        rp(
            {
                url: "https://tinypng.com/web/shrink",
                method: "POST",
                headers: {
                    rejectUnauthorized: false,
                    "Postman-Token": Date.now(),
                    "Cache-Control": "no-cache",
                    "Content-Type": "application/x-www-form-urlencoded",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
                },
                timeout: 10000,
                body: file
            },
            (err, res, body) => {
                if (!err && body) {
                    try {
                        const obj = JSON.parse(body);
                        cb(obj);
                    } catch (e) {
                        console.log(e);
                    }
                } else {
                    if (retryError <= retryTime) {
                        retryError++;
                        post();
                        console.log(imgPath, `retry`, retryError);
                        return;
                    }
                    if (err && err.code && err.code === "ESOCKETTIMEDOUT") {
                        console.log(`请求超时，请重试： ${imgPath}`);
                    } else {
                        console.log(imgPath, err);
                    }
                }
            }
        );
    }
    post();
}

module.exports = function(imgPath, downName, cb = () => {}, retryTime = 2) {
    if (!imgPath || !downName) {
        console.log(`缺少参数`);
        return;
    }
    return new Promise((resolve, reject) => {
        upload({
            imgPath,
            retryTime,
            cb: res => {
                const { input, output } = res;
                if (!output) {
                    reject(`output is undefined`);
                    console.log(res);
                    return;
                }
                rp(output.url)
                    .pipe(fs.createWriteStream(downName))
                    .on("close", () => {
                        cb({ input, output });
                        resolve({ input, output });
                    })
                    .on("error", e => {
                        reject(e);
                        console.log(e);
                    });
            }
        });
    });
};
