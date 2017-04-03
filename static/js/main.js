check();
var gettingPost = false;

function check() {
    $.get('../api/user', function (data) {
        if (data.statu == 'ok') {
            $("#tit").html(data.name + '，你好！');
            $("#start").html('開始製作');
            $("#start").click(function () {

                // if (!gettingPost) {
                //     gettingPost = true;
                //     $("#start").html('正在讀取資料...');
                $("#start").html('選擇資料夾');
                postAlbums();
                //getPost();
                //  }
            });
        } else {
            $("#start").html('登入 Facebook');
            $("#start").click(function () {
                window.location = data.url;
            });
        }
    });
}

// function getPost() {
//     $.get('../api/post', function (data) {
//         var s = '';
//         for (var d in data) {
//             s += data[d];
//         }

//         //console.log(data);
//         var options = {
//             workerUrl: '../js/wordfreq.worker.js'
//         };
//         // Initialize and run process() function
//         var lis = '';
//         var wordfreq = WordFreq(options).process(s, function (list) {
//             // console.log the list returned in this callback.
//             // console.log(list);
//             for (var l in list) {
//                 list[l][1] *= (list[l][1] < 10) ? 10 : 1;
//             }
//             $("#post").removeClass('remove');


//             // $('#start').addClass('remove');
//             $('html, body').animate({
//                 scrollTop: $("#post").offset().top
//             }, 500, function () {
//                 WordCloud(document.getElementById('post'), {
//                     list: list
//                 });
//             });
//             $("#start").html('再試一次！');
//             gettingPost = false;
//         });

//     });
// }

function postAlbums() {
    $.get('../api/albums', function (data) {
        var albums_id = [];
        var albums_name = [];
        var albums_data = [];
        for (var i in data.data) {
            albums_id.push(data.data[i].id);
            albums_name.push(data.data[i].name);
        }
        for (var i in albums_id) {
            albums_data.push('<button type="button" class="albbtn" id="' + albums_id[i] + '" value="' + albums_id[i] + '">' + albums_name[i] + '</button>');
        }
        $("#albdiv").html(albums_data);
        $(".albbtn").click(function () {
            if (!gettingPost) {
                gettingPost = true;
                $("#start").html('正在讀取資料...');
            }
            var req_id = this.getAttribute("value");
            //console.log(req_id);
            $.get('/api/create?id=' + req_id);
        });
    })
}

getFinish();
function getFinish() {
    $.get('/api/finish', function (data) {
            console.log(data);
        if (data.statu == 'ok') {
            $("#albdiv").addClass('remove');
            $("#start").html('觀看影片');
            $("#start").click(function () {

            });
        } else {
            console.log(123);
            getFinish();
        }
    });
}