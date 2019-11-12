// Example starter JavaScript for disabling form submissions if there are invalid fields
(function () {
  'use strict'

  window.addEventListener('load', function () {
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.getElementsByClassName('needs-validation')

    // Loop over them and prevent submission
    Array.prototype.filter.call(forms, function (form) {
      form.addEventListener('submit', function (event) {
        if (form.checkValidity() === false) {
          event.preventDefault()
          event.stopPropagation()
        }
        form.classList.add('was-validated')
      }, false)
    })
  }, false)
}());


// $.ajaxSetup({
//     data: {csrfmiddlewaretoken: '{{ csrf_token }}' },
// });

$("#signup_btn").click(function(){
    event.preventDefault();
    var username = $("#username");
    var pwd1 = $("#password1");
    var pwd2 = $("#password2");
    var sex = $("#sex");
    var age = $("#age");
    var type = $("input[name='type']:checked");
    var department = $("#department");

    if(!username.val()){
        $("#mistake").text("真实姓名必填!");
        username.focus();//获取焦点
        return ;
    }
    if(!pwd1.val()){
        $("#mistake").text("请输入密码!");
        password1.focus();//获取焦点
        return ;
    }
    if(!pwd2.val()){
        $("#mistake").text("请输入密码");
        password2.focus();//获取焦点
        return ;
    }
    if(pwd1.val() !== pwd2.val()) {
        $("#mistake").text("两次输入密码不同，请重新输出！");
        password2.focus();//获取焦点
        return ;
    }


     $.ajax({
        type: "POST",
        url: "http://127.0.0.1:8000/api/v1/signup/",
        data: {
            "code": 1002,
            "username":username.val(),
            "password":pwd2.val(),
            "sex": sex.val(),
            "age": age.val(),
            "type": type.val(),
            "department": department.val(),
        },
        success: function (response) {
            if (response['code'] === 1201) {

                parent.document.location.href = "../signin/index.html";
                parent.tb_remove();
            }
            else if (response['code'] === 1301) {
                $("#mistake").text(response['msg']);
                $("#mistake").attr('css', "");
            }
            else {
                alert(response['msg'])
            }
        },
        complete: function (data) {
        },
        error: function() {
        }
    });
});




