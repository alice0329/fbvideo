check();
var gettingPost = false;

function check() {
    $.get('../api/user', function (data) {
        if (data.statu == 'ok') {
            $("#tit").html(data.name + '，你好！');
            $("#start").html('開始製作');
            $("#start").click(function () {
                $("#start").html('選擇資料夾');
                postAlbums();
            });
        } else {
            $("#start").html('登入 Facebook');
            $("#start").click(function () {
                window.location = data.url;
            });
        }
    });
}

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
            $("#albdiv").addClass('remove');
            $("#start").html('正在讀取資料...');
            var req_id = this.getAttribute("value");
            //console.log(req_id);
            $.get('/api/create?id=' + req_id, function (data) {
                console.log(data);
                if (data.statu == 'ok') {
                    $("#post").removeClass('remove');
                    $("#post").html('<video width="100%" height="95%" controls><source src="/output/video.mp4" type="video/mp4"></video>');
                    $('html, body').animate({
                        scrollTop: $("#post").offset().top
                    });
                } else {
                    console.log(err);
                }
            });
        });
    })
}