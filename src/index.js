const path = require("path");
const fs = require("fs-extra");

const core = require("./core");

const list = [".png", ".jpg"];

const MAX_SIZE = 5 * 1024 * 1024;

module.exports = async function coIM(opt) {
    const cwd = process.cwd();
    const { removePath } = opt;
    let realSavePath = "./";
    if (rovePath) {
        realSavePath = path.join(cwd, "../", removePath);
    }
    await readDir({ dirpath: cwd, realSavePath, ...opt });
};

async function readDir({ dirpath, realSavePath, ...other }) {
    try {
        const dirArray = await fs.readdir(dirpath);
        for (const name of dirArray) {
            const pathname = path.join(dirpath, name);
            const saveName = path.join(realSavePath, name);
            checkSave({ pathname, saveName, ...other });
        }
    } catch (e) {
        console.log(e);
    }
}

async function checkSave(opt) {
    const { pathname, recursion, saveName, itemSuccess } = opt;
    try {
        const stat = await fs.stat(pathname);
        if (stat.isDirectory()) {
            if (recursion) {
                readDir(pathname, recursion, saveName);
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
