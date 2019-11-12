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

$(document).ready(function () {
    var user_id = sessionStorage.getItem("user_id");
    var token = sessionStorage.getItem("token");
    $.ajax(
        {
            type: "GET",
            url: "http://127.0.0.1:8000/api/v1/get_user/",
            data: {
                "user_id": user_id,
                "token": token,
            },
            success(response) {
                if(response['code'] === 1000) {
                     for (i = 0; i < response['msg'].length; i++) {
                        $("#order_table").append("<tr> <td>" + i + "</td> <td>" + response["msg"][i]['username'] + "</td> <td>" + response["msg"][i]['email']+ "</td> <td>" + response["msg"][i]['sex'] + "</td> <td>" + formatUTC(response["msg"][i]['add_time']) + "</td> </tr>");
                    }
                }
                else if(response['code'] === 1004) {
                    alert(response['msg']);
                }
                else {
                    alert(response['msg']);
                }
            }
        }
    );
}
);




