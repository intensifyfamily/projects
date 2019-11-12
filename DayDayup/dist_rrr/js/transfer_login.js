function loginin() {
    event.preventDefault();
    var username = $("#username").val();
    var password = $("#password").val();

    $.ajax(
        {

            type: "POST",
            url: "http://127.0.0.1:8000/api/v1/login/",
            data: {
                "username": username,
                "pwd": password,
            },
            success(response) {
                if(response['code'] === 1000) {
                    alert(response['msg']);
                sessionStorage.setItem("user_id",response['user_id']);
                sessionStorage.setItem("token",response['token']);
                parent.document.location.href = "index.html"; //如果登录成功则跳到主页
                parent.tb_remove();
                }
                else if(response['code'] === 1002) {
                    alert(response['msg']);
                }
                else {
                    alert(response['msg']);
                }
            }


        }

    )
}

