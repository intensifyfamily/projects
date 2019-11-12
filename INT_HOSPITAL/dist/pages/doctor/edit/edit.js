$().ready(function() {
    var username = window.location.href.split("?")[1].split("=")[1];
         $.ajax({

        type: "GET",
        url: "http://127.0.0.1:8000/api/v1/patient/",
        data: {
            "Pname": username,
        },
        success: function (response) {
            if (response['code'] === 1201) {
                for (i = 0; i < response['list'].length; i++) {
                    $("#idcd").attr('value', response["list"][i]['Psfz']);
                    $("#name").attr('value', response["list"][i]['Pname']);
                    $("#age").attr('value', response["list"][i]['Page']);
                    $("#sex").attr('value', response["list"][i]['Psex']);
                    $("#blood").attr('value', response["list"][i]['blood']);
                    $("#phone").attr('value', response["list"][i]['Phone']);
                    $("#addr").attr('value', response["list"][i]['Addr']);
                }

            }
            else {

            }
        },
         error: function() {
            alert("errors");
        },
        // complete: function (data) {
        // },

    });

});


$("#sub_btn").click(function(){
    event.preventDefault();
    var idcd = $("#idcd").val();
    var name = $("#name").val();
    var age = $("#age").val();
    var sex = $("#sex").val();
    var blood = $("#blood").val();
    var cost = $("#cost").val();
    var phone = $("#phone").val();
    var addr = $("#addr").val();
    var condition = $("#condition").val();
    if (sex == 'null') {
        alert("请选择正确的性别");
        return
    }
     $.ajax({

        type: "GET",
        url: "http://127.0.0.1:8000/api/v1/edit/",
        data: {
            "idcd": idcd,
            "name": name,
            "age": age,
            "sex": sex,
            "blood": blood,
            "cost": cost,
            "phone": phone,
            "addr": addr,
            "condition": condition,
        },
        success: function (response) {
            if (response['code'] === 1201) {
                alert('sucess!');
                parent.document.location.href = "../index.html"; //如果登录成功则跳到管理界面
                parent.tb_remove();
            }
            else {

            }
        },
         error: function() {
            alert("errors");
        },
        // complete: function (data) {
        // },

    });

});
