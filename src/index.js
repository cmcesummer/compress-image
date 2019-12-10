const path = require("path");
const fs = require("fs-extra");

const core = require("./core");

const list = [".png", ".jpg"];

const MAX_SIZE = 5 * 1024 * 1024;

async function cc(val) {
    return new Promise(res => {
        setTimeout(() => {
            res(val);
        }, 1000 + 5000 * Math.random());
    });
}

module.exports = async function coIM(opt) {
    const cwd = process.cwd();
    const {
        // 压缩并复制到新的文件夹
        removePath,
        // 是否递归
        recursion,
        // 压缩完成一个的回调
        itemSuccess,
        // 全部压缩完成的回调
        allSuccess
    } = opt;
    let realSavePath = path.join(cwd, "./");
    if (removePath) {
        realSavePath = path.join(cwd, "../", removePath);
    }
    await readDir({ dirpath: cwd, realSavePath, recursion, itemSuccess });
    if (allSuccess) allSuccess();
};

async function readDir(opt) {
    const {
        // 目标文件路径 （只有path部分: path.dirname）
        dirpath,
        // 压缩后保存文件路径 （只有path部分: path.dirname）
        realSavePath,
        // 是否递归
        recursion,
        // 压缩完成一个的回调
        itemSuccess
    } = opt;
    try {
        const dirArray = await fs.readdir(dirpath);
        const asyncArray = [];
        for (const filename of dirArray) {
            opt.filename = filename;
            asyncArray.push(checkSave(opt));
        }
        await Promise.all(asyncArray);
    } catch (e) {
        console.log(e);
    }
}

async function checkSave(opt) {
    const {
        // 目标文件路径 （只有path部分: path.dirname）
        dirpath,
        // 压缩后保存文件路径 （只有path部分: path.dirname）
        realSavePath,
        // 文件名
        filename,
        // 是否递归
        recursion,
        // 压缩完成一个的回调
        itemSuccess
    } = opt;
    try {
        const pathname = path.join(dirpath, filename);
        const saveName = path.join(realSavePath, filename);
        const stat = await fs.stat(pathname);
        if (stat.isDirectory()) {
            if (recursion) {
                opt.dirpath = pathname;
                opt.realSavePath = saveName;
                await readDir(opt);
                return;
            } else {
                return;
            }
        }
        if (stat.isFile() && list.includes(path.extname(pathname)) && stat.size <= MAX_SIZE) {
            await fs.ensureDir(path.dirname(saveName));
            const { input, output } = await core(pathname, saveName);
            if (itemSuccess) itemSuccess({ input, output, pathname, saveName });
        }
    } catch (e) {
        console.log(e);
    }
}
