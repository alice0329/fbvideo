var express = require('express');
var http = require('http');
var session = require('express-session');
var request = require('request');
var app = express();
var https = require('https');
var fs = require('fs');
var request = require('request')
var videoshow = require('videoshow')
var jimp = require('jimp')

app.use(session({
    secret: process.env.sessionKEY,
    cookie: {
        maxAge: 10 * 60 * 1000
    },
    resave: true,
    saveUninitialized: true
}))

videoshow.ffmpeg.setFfmpegPath(__dirname + '/ffmpeg/ffmpeg.exe')
videoshow.ffmpeg.setFfprobePath(__dirname + '/ffmpeg/ffprobe.exe')

// 通訊埠，放在 Azure 上會開啟預設 80 號，我們在 local server 先使用 1337 
var port = process.env.port || 1337;
// 放靜態資源，也就是我們主要 html js 等等前端的東西
app.use('/', express.static('static'));
http.createServer(app).listen(port);

app.get('/api/user', (req, res) => {
    var re;
    if (req.session.name)
        re = {
            statu: 'ok',
            name: req.session.name
        };
    else
        re = {
            statu: 'not login',
            url: 'https://www.facebook.com/v2.8/dialog/oauth?client_id=' + process.env.appID + '&redirect_uri=' + process.env.redirect + '/api/code&scope=user_posts&scope=manage_pages&scope=user_photos'
        };
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(re));
});

app.get('/api/code', (req, res) => {
    request('https://graph.facebook.com/v2.8/oauth/access_token?client_id=' + process.env.appID + '&redirect_uri=' + process.env.redirect + '/api/code' + '&client_secret=' + process.env.appKEY + '&code=' + req.query.code, (error, response, body) => {

        var userdata = JSON.parse(body);
        req.session.key = userdata.access_token;
        /*  */
        getUser(userdata.access_token).then((data) => {
            req.session.name = data.name;
            req.session.fbid = data.id;
            res.redirect('../');
        });
    });
});
// 向 FB 要求使用者名稱和 ID
function getUser(key) {
    return new Promise((resolve, reject) => {
        request('https://graph.facebook.com/v2.8/me?fields=id%2Cname&access_token=' + key, (error, response, body) => {
            resolve(JSON.parse(body));
        });
    });
}

app.get('/api/albums', (req, res) => {
    getAlbums(req.session.key).then((data) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
    });
});

app.get('/api/create', (req, res) => {
    getPhotos(req.session.key, req.query.id).then((data) => {
        getImage(data, res);
        // res.setHeader('Content-Type', 'application/json');
        // res.end("");
    });
});

/* 讀粉絲頁 */
function getAlbums(key) {
    return new Promise((resolve, reject) => {
        var qs = {
            access_token: key
        };
        request({
            url: 'https://graph.facebook.com/v2.8/me/albums',
            qs
        }, (error, response, body) => {
            resolve(JSON.parse(body));
        });
    });
}
// 讀取特定相簿的相片列表
function getPhotos(key, id) {
    return new Promise((resolve, reject) => {
        var qs = {
            fields: 'images',
            access_token: key
        };
        request({
            url: 'https://graph.facebook.com/v2.8/' + id + '/photos',
            qs
        }, (error, response, body) => {
            //console.log(body);
            var photo_data = JSON.parse(body);
            var photos = [];
            for (var i in photo_data.data) {
                if (photo_data.data[i].images[0].height = '960')
                    photos.push(photo_data.data[i].images[0].source);
            }
            resolve(photos);
        });
    });
}

async function getImage(key, res) {
    try {
        //console.log(key);
        await clearFolder();
        await urlImage(key);
        for (let i = 0; i < key.length; i++) {
            //console.log('xxx')
            await imageResize("./image/" + i + ".jpg", 960, 720);
        }
        videoGen(res);
    } catch (e) {
        console.log(e);
    }
}
//清空資料夾
function clearFolder() {  
    return new Promise((resolve, reject) => {
        var fileUrl = "./image";
        if(fs.existsSync(fileUrl)){
            var files = fs.readdirSync(fileUrl);
            files.forEach(function (file) {
                fs.unlinkSync(fileUrl + '/' + file);
                console.log("删除文件" + fileUrl + '/' + file + "成功");
            });
        }
        else{
            fs.mkdirSync(fileUrl);
        }      
        resolve();
    })
}

//下載相片
function urlImage(url) {   
    return new Promise((resolve, reject) => {
        url.forEach(function (url_data, index, array) {
            let stream = request(url_data).pipe(fs.createWriteStream("./image/" + index + ".jpg"))
            //console.log('urlImage')
            if (index === array.length - 1)
                stream.on('finish', () => resolve())
        })
    })
}

//改變圖片大小
function imageResize(imgPath, width, height) {
    return new Promise((resolve, reject) => {
        jimp.read(imgPath).then((image) => {
            image.resize(960, 720).write(imgPath)
        }).catch((err) => {
            console.log(err)
        }).then(() => resolve())
    })
}

var videoOptions = {
    fps: 25,
    loop: 5, // seconds
    transition: true,
    transitionDuration: 1, // seconds
    videoBitrate: 1024,
    videoCodec: 'libx264',
    size: '640x?',
    audioBitrate: '128k',
    audioChannels: 2,
    format: 'mp4',
    pixelFormat: 'yuv420p'
}

var audioParams = {
    fade: true,
    delay: 2 // seconds
}

//製作影片
function videoGen(res) {
    var images = [];
    fs.readdir(__dirname + '/image', function (err, files) {
        if (err) return;
        files.forEach(function (f) {
            images.push(__dirname + '/image/' + f);
            //console.log('Files: ' + f);
            return images;
        });
        console.log(images);
        var audio = __dirname + '/music/About_That_Oldie.mp3'
        videoshow(images, videoOptions)
            .audio(audio, audioParams)
            .save('./static/output/video.mp4')
            .on('start', function (command) {
                console.log('ffmpeg process started:', command)
            })
            .on('error', function (err) {
                console.error('Error:', err)
            })
            .on('end', function (output) {
                console.log('Video created in:', output)
                var re;
                re = {
                    statu: 'ok',
                };
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(re));
            })
    });
}