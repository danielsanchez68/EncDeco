const fs = require("fs")
const PNG = require("pngjs").PNG;

const rxMsg = filein => {
    return new Promise( (resolve,reject) => {
        fs.createReadStream(filein)
            .pipe(
                new PNG({
                    filterType: 4,
                })
            )
            .on("parsed", function () {
                var msg = ""
                var y = this.height - 1
                for (var x = 0; x < this.width; x++) {
                    var idx = (this.width * y + x) << 2;

                    if(this.data[idx+2]^0x5A) msg += String.fromCharCode(this.data[idx+2]^0x5A);
                }
                resolve(msg)
            })
    })
}

module.exports = rxMsg