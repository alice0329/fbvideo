var https = require('https');
var fs = require('fs');
var request = require('request')
const videoshow = require('videoshow')
const jimp = require('jimp')

videoshow.ffmpeg.setFfmpegPath(__dirname + '/ffmpeg/ffmpeg.exe')
videoshow.ffmpeg.setFfprobePath(__dirname + '/ffmpeg/ffprobe.exe')

var audio = __dirname + '/music/About_That_Oldie.mp3'

var audioParams = {
    fade: true,
    delay: 2 // seconds
}

var url = ['https://scontent.xx.fbcdn.net/v/t1.0-9/65025_409216692491695_1287265544_n.jpg?oh=eac9ca267889612421648138b658ac70&oe=5998FFA3', 'https://scontent.xx.fbcdn.net/v/t1.0-9/292792_389869861093045_1482726837_n.jpg?oh=d80a4489b13adbaa7955b1b4ddfb444d&oe=595AE7E8', 'https://scontent.xx.fbcdn.net/v/t1.0-9/534868_385995411480490_218411576_n.jpg?oh=bda7c1df94e9fd26fd36aead765a999e&oe=59635058'];

getImage()
async function getImage() {
    try {
        await urlImage()
        for (let i = 0; i < url.length; i++) {
            //console.log('xxx')
            await imageResize("./image/" + i + ".jpg", 960, 720)
        }
        videoGen()
    } catch (e) {
        console.log(e)
    }
}

function urlImage() {
    return new Promise((resolve, reject) => {
        url.forEach(function (url_data, index, array) {
            let stream = request(url_data).pipe(fs.createWriteStream("./image/" + index + ".jpg"))
            //console.log('urlImage')
            if (index === array.length - 1)
                stream.on('finish', () => resolve())
        })
    })
}

function imageResize(imgPath, width, height) {
    return new Promise((resolve, reject) => {
        jimp.read(imgPath).then((image) => {
            image.resize(960, 720).write(imgPath)
        }).catch((err) => {
            console.log(err)
        }).then(() => resolve())
    })
}

function videoGen() {
    var images = [];
    fs.readdir(__dirname + '/image', function (err, files) {
        if (err) return;
        files.forEach(function (f) {
            images.push(__dirname + '/image/' + f);
            //console.log('Files: ' + f);
            return images;
        });
        console.log(images);
        videoshow(images)
            .audio(audio, audioParams)
            .save('./output/test2.mp4')
            .on('start', function (command) {
                console.log('ffmpeg process started:', command)
            })
            .on('error', function (err) {
                console.error('Error:', err)
            })
            .on('end', function (output) {
                console.log('Video created in:', output)
            })
    });
}