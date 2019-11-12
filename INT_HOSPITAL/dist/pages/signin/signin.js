
$("#submit").click(function(){
    event.preventDefault();
    var type = $("#type");
    var username = $("#username");
    var pwd = $("#password");
    if(pwd.val() == 'null') {
        $("#mistake").text("请选择类型!");
        type.focus();//获取焦点
        return ;
    }
    if(!username.val()){
        $("#mistake").text("用户名必填!");
        username.focus();//获取焦点
        return ;
    }
    if(!pwd.val()){
        $("#mistake").text("用户名必填!");
        password.focus();//获取焦点
        return ;
    }
    if(type == 'null'){
        $("#mistake").text("请选择类型!");
        type.focus();//获取焦点
        return ;
    }

     $.ajax({
        type: "POST",
        url: "http://127.0.0.1:8000/api/v1/log/",
        data: {
            "code": 1001,
            "type": type.val(),
            "username": username.val(),
            "pwd": pwd.val(),
        },
        success: function (response) {
            if (response['code'] === 1201) {
                sessionStorage.setItem("userid",response['Uid']);
                sessionStorage.setItem("token",response['token']);
                sessionStorage.setItem("username",response['Uname']);
                sessionStorage.setItem("type",response['type']);
                if (response['type'] == 'registration') {
                    parent.document.location.href = "../patient/index.html"; //如果登录成功则跳到主页
                    parent.tb_remove();
                }
                else {
                    sessionStorage.setItem("department",response['department']);
                    parent.document.location.href = "../doctor/index.html"; //如果登录成功则跳到主页
                    parent.tb_remove();
                }

            }
            else if (response['code'] === 1301) {
                alert(response['msg']);
            }
            else if(response['code'] === 1302) {
                alert(response['msg']);
            }
            else {
                toastr.success("登录失败！");
            }
        },
        // complete: function (data) {
        // },
        error: function() {
            alert("未知错误")
        }
    });
});
