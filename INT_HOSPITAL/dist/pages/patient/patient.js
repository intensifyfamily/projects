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

$("#sub_btn").click(function(){
    event.preventDefault();
    var username = $("#username");
    var sex = $("#sex");
    var age = $("#age");
    var phone = $("#phone");
    var addr = $("#addr");
    var blood = $("#blood");
    var idcd = $("#idcd");
    var userid = sessionStorage.getItem("userid");


     $.ajax({
        type: "POST",
        url: "http://127.0.0.1:8000/api/v1/patient/",
        data: {
            "code": 1003,
            "userid": userid,
            "username":username.val(),
            "sex": sex.val(),
            "age": age.val(),
            "phone": phone.val(),
            "addr": addr.val(),
            "blood": blood.val(),
            "idcd": idcd.val(),
        },
        success: function (response) {
            if (response['code'] == 1201) {
                ////parent.tb_remove();
                parent.document.location.href = "../register/index.html";
                parent.tb_remove();
                // alert("success!")
            }
            else {
                alert("code错误")
            }
        },
        complete: function (data) {
        },
        error: function() {
        }
    });
});




