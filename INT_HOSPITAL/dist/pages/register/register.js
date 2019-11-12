$(document).ready(function () {
    var userid = sessionStorage.getItem("userid");
    var username = sessionStorage.getItem("username");
    var token = sessionStorage.getItem("token");
    if (userid) {
        $("#usrName").text(username);
        $("#userId").text(userid);
      $.ajax({
        type: "GET",
        url: "http://127.0.0.1:8000/api/v1/register/",
        data: {
          "userid": userid,
          "token": token
        },
        success: function (response) {

          if (response['code'] === 1201) {
            for (i = 0; i < response['list'].length; i++) {
            var Uid = response["list"][i]['Uid'];
            var Uname = response["list"][i]['Uname'];
            var department = response["list"][i]['Office'];
            $("#register_list").append(
                      "<tr><td>"+i+"</td><td>"+Uid+"</td><td>"+Uname+"</td><td>"+department+"</td></tr>"
              )}
            if (response['code'] === 1301) {
              alert(response['msg']);
            }
          if (response['code'] === 1302) {
              $("#register_list").append("<tr><td>"+response['msg']+"</td></tr>");
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

$("#sub_btn").click(function(){
   alert("挂号成功！")
});
