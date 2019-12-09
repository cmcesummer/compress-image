const fs = require("fs");
// const path = require("path");
const rp = require("request");

// const imgPath = path.join(__dirname, "../aa.png");

function upload(imgPath, cb = () => {}) {
    const file = fs.readFileSync(imgPath);

    if (!file) {
        console.log(`no img in ${imgPath}`);
        return;
    }

    rp(
        {
            url: "https://tinypng.com/web/shrink",
            method: "POST",
            headers: {
                "Cache-Control": "no-cache",
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
            },
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
                console.log(err, res.statusCode);
            }
        }
    );
}

module.exports = function(imgPath, downName, cb = () => {}) {
    if (!imgPath || !downName) {
        console.log(`缺少参数`);
        return;
    }
    return new Promise((resolve, reject) => {
        upload(imgPath, res => {
            const { input, output } = res;
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
        });
    });
};

// coIM(imgPath);
