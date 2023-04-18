const fs = require("fs")
const PNG = require("pngjs").PNG;

const txMsg = (msg, filein, fileout) => {
    return new Promise( (resolve,reject) => {
        fs.createReadStream(filein)
        .pipe(
            new PNG({
                filterType: 4,
            })
        )
        .on("parsed", function () {
            var y = this.height - 1
            var puntMsg = 0
            for (var x = 0; x < this.width; x++) {
                var idx = (this.width * y + x) << 2;

                // invert color
                this.data[idx+2] = (msg.charCodeAt(puntMsg) || 0)^0x5A;
                puntMsg++
            }
            this.pack().pipe(fs.createWriteStream(fileout));
        })

        .on("end", function () {
            resolve()
        });        
    })

}

module.exports = txMsg