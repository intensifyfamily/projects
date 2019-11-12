function formatUTC(utc_datetime) {
    // 转为正常的时间格式 年-月-日 时:分:秒
    var T_pos = utc_datetime.indexOf('T');
    var Z_pos = utc_datetime.indexOf('Z');
    var year_month_day = utc_datetime.substr(0, T_pos);
    var hour_minute_second = utc_datetime.substr(T_pos + 1, Z_pos - T_pos - 1);
    var new_datetime = year_month_day + " " + hour_minute_second; // 2017-03-31 08:02:06

    // 处理成为时间戳
    timestamp = new Date(Date.parse(new_datetime));
    timestamp = timestamp.getTime();
    timestamp = timestamp / 1000;

    // 增加8个小时，北京时间比utc时间多八个时区
    var timestamp = timestamp;

    // 时间戳转为时间
    var beijing_datetime = new Date(parseInt(timestamp) * 1000).toLocaleString().replace(/年|月/g, "-").replace(/日/g, " ");
    return beijing_datetime;
}
var userid = sessionStorage.getItem("userid");
var username = sessionStorage.getItem("username");
var token = sessionStorage.getItem("token");
var type = sessionStorage.getItem("type");
var department = sessionStorage.getItem("department");

$().ready(function() {

    $("#usrName").text(username);
    $("#Uid").text(userid);
    if (userid) {
        $.ajax({
            type: "GET",
            url: "http://127.0.0.1:8000/api/v1/doctor/",
            data: {
                "department": department,
                "token": token,
            },
            success: function (response) {

                if (response['code'] === 1201) {
                    var j = 0;
                    for (i = 0; i < response['list'].length; i++) {
                        var id = response["list"][i]['Pid'];
                        var name = response["list"][i]['Pname'];
                        var time = response["list"][i]['add_time'];
                        var age = response["list"][i]['Page'];
                        var sex = response["list"][i]['Psex'];
                        var addr = response["list"][i]['Adds'];
                        $("#patient_list").append("<tr><td>" + id + "</td><td>" + name + "</td><td>" + age + "</td><td>" + sex + "</td><td>" + addr + "</td><td>" + formatUTC(time) + "</td><td><a class=\"btn btn-primary\" href=\"edit/edit.html?name="+name+"\">应诊</a></td><td><form action=\"http://127.0.0.1:8000/api/v1/delete/\" method=\"GET\">\n" +
                            "                            <input style=\"display: none;\" type=\"text\" name=\"username\" readonly=\"readonly\" value=\"" + name + "\">\n" +
                            "                            <input type=\"submit\" class=\"btn btn-danger\" value=\"删除\">\n" +
                            "                        </form></td></td></tr>");

                    }


                    if (response['code'] === 1302) {
                        $("#patient_list").append("<tr><td>" + response['msg'] + "</td></tr>");
                    }
                }

            },
            // complete: function (data) {
            // },
            error: function () {
            }
        });
    }


});




