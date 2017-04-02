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

var url = ['https://scontent.xx.fbcdn.net/v/t31.0-8/1274700_414957458604554_792950999_o.jpg?oh=f9e02b194e08a2cfc66a97e1588221a7&oe=595A4803',
    'https://scontent.xx.fbcdn.net/v/t1.0-9/1392475_414957341937899_122814137_n.jpg?oh=a51835b4aeb4fec0749f1b57aed1a7a2&oe=5960A61E',
    'https://scontent.xx.fbcdn.net/v/t1.0-9/1379687_414957298604570_189339144_n.jpg?oh=f11beeb6d2d4e8f3f9403fa36287738e&oe=599A3BCF'
];

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
            .save('./output/test.mp4')
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