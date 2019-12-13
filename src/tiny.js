const fs = require("fs");
const rp = require("request");

let cou = 0;

const MAX_SIZE = 1;
let overIndex = 0,
    SLEEP_TIME = 1000,
    nowIndex = 0;

function sleep(time = 1000) {
    return new Promise(res => {
        setTimeout(res, time);
    });
}

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
                    "Cache-Control": "no-cache",
                    "Content-Type": "application/x-www-form-urlencoded",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
                },
                timeout: 10000,
                body: file
            },
            (err, res, body) => {
                let obj = {};
                if (!err && body) {
                    try {
                        obj = JSON.parse(body);
                    } catch (e) {
                        console.log(e);
                    }
                } else {
                    if (retryError <= retryTime) {
                        retryError++;
                        setTimeout(post, SLEEP_TIME);
                        console.log(imgPath, `retry`, retryError);
                        return;
                    }
                    if (err && err.code && err.code === "ESOCKETTIMEDOUT") {
                        console.log(`请求超时，请重试： ${imgPath}`);
                    } else {
                        console.log(imgPath, err);
                    }
                }
                cb(obj);
            }
        );
    }
    post();
}

const cacheList = {
    list: [],
    request(param) {
        nowIndex++;
        if (nowIndex <= MAX_SIZE) {
            upload(param);
        } else {
            this.list.push(param);
        }
    },
    async over() {
        overIndex++;
        if (overIndex !== MAX_SIZE) return;
        overIndex = 0;
        nowIndex = 0;
        const doArray = this.list.splice(0, MAX_SIZE);
        await sleep(SLEEP_TIME);
        for (const param of doArray) {
            upload(param);
        }
    }
};

module.exports = function(imgPath, downName, retryTime = 2) {
    if (!imgPath || !downName) {
        console.log(`缺少参数`);
        return;
    }
    return new Promise((resolve, reject) => {
        const param = {
            imgPath,
            retryTime,
            cb: res => {
                cacheList.over();
                const { input, output } = res;
                if (!output) {
                    reject(`output is undefined`);
                    console.log(imgPath, res);
                    if (res.error === "too_many_requests") {
                        SLEEP_TIME += 1000;
                    }
                    return;
                }
                rp(output.url)
                    .pipe(fs.createWriteStream(downName))
                    .on("close", () => {
                        // cb({ input, output });
                        cou++;
                        console.log(`==============  ${cou}`);
                        resolve({ input, output });
                    })
                    .on("error", e => {
                        reject(e);
                        console.log(e);
                    });
            }
        };
        cacheList.request(param);
    });
};
