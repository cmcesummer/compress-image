const path = require("path");
const imagemin = require("imagemin");
const imageminJpegtran = require("imagemin-mozjpeg");
const imageminPngquant = require("imagemin-pngquant");

module.exports = async function(pathname, saveName, stat) {
    const realSavePath = path.dirname(saveName);
    const files = await imagemin([pathname], {
        glob: false,
        destination: realSavePath,
        plugins: [
            imageminJpegtran({
                progressive: true
                // arithmetic: true
            }),
            imageminPngquant({
                // quality: [0.6, 0.8]
            })
        ]
    });
    const input = { size: stat.size };
    const output = { size: files[0].data.length };
    return { input, output };
};
