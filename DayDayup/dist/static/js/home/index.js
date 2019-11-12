toastr.options = {  
    closeButton: false,  
    debug: false,  
    positionClass: "toast-top-center",  
    onclick: null,  
    showDuration: "300",  
    hideDuration: "300",  
    timeOut: "1000",  
    extendedTimeOut: "1000",  
    showEasing: "swing",  
    hideEasing: "linear",  
    showMethod: "fadeIn",  
    hideMethod: "fadeOut"  
};


$("#confirm_btn").click(function () {

    // event.preventDefault();  // 阻止form表单的默认提交路径：action指定的路径
    var msg = [];
    var check = 1;
    msg[0] = $("#stu_name").val();
    msg[1] = $("#stu_age").val();
    msg[2] = $("input[name= 'sex']:checked").val();
    msg[3] = $("#stu_num").val();
    msg[4] = $("#phone").val();
    msg[5] = $("#college option:selected").text();
    msg[6] = $("#class_num").val();
    msg[7] = $("#major").val();
    msg[8] = $("#department").val();
    msg[9] = $("#position").val();
    msg[10] = $("#stu_id").val();
    msg[11] = $("#nation").val();
    msg[12] = $("#stu_addr").val();
    msg[13] = $("#others").val();
    msg[14] = $("#stu_birth").val();

    if(!msg[14]) {
        $("#error").css('display', "");
        $("#error").text("请填写生日！");
        $(".msg:eq(14)").css("color", "#DC143C");
        check = 0;
    }
    else $(".msg:eq(14)").css("color", "#212529");

    if(!msg[12]) {
        $("#error").css('display', "");
        $("#error").text("请填写家庭住址！");
        $(".msg:eq(12)").css("color", "#DC143C");
        check = 0;
    }
    else $(".msg:eq(12)").css("color", "#212529");

    if(!msg[11]) {
        $("#error").css('display', "");
        $("#error").text("请填写民族！");
        $(".msg:eq(11)").css("color", "#DC143C");
        check = 0;
    }
    else $(".msg:eq(11)").css("color", "#212529");

    if(msg[10].length!=18) {
        $("#error").css('display', "");
        $("#error").text("请输入正确的身份证号码！");
        $(".msg:eq(10)").css("color", "#DC143C");
        check = 0;
    }
    else $(".msg:eq(10)").css("color", "#212529");

    if(!msg[9]) {
        $("#error").css('display', "");
        $("#error").text("请输入职位！");
        $(".msg:eq(9)").css("color", "#DC143C");
        check = 0;
    }
    else $(".msg:eq(9)").css("color", "#212529");

    if(!msg[8]) {
        $("#error").css('display', "");
        $("#error").text("请输入组织和部门！");
        $(".msg:eq(8)").css("color", "#DC143C");
        check = 0;
    }
    else $(".msg:eq(8)").css("color", "#212529");

    if(!msg[7]) {
        $("#error").css('display', "");
        $("#error").text("请输入专业全称！");
        $(".msg:eq(7)").css("color", "#DC143C");
        check = 0;
    }
    else $(".msg:eq(7)").css("color", "#212529");

    if(!msg[6]) {
        $("#error").css('display', "");
        $("#error").text("请输入班级号！");
        $(".msg:eq(6)").css("color", "#DC143C");
        check = 0;
    }
    else $(".msg:eq(6)").css("color", "#212529");

    if(msg[5][0] == 'C') {
        $("#error").css('display', "");
        $("#error").text("请选择学院！");
        $(".msg:eq(5)").css("color", "#DC143C");
        check = 0;
    }
    else $(".msg:eq(5)").css("color", "#212529");

    if(msg[4].length!=11) {
        $("#error").css('display', "");
        $("#error").text("请输入正确的电话！");
        $(".msg:eq(4)").css("color", "#DC143C");
        check = 0;
    }
    else $(".msg:eq(4)").css("color", "#212529");

    if(msg[3].substring(0,4)!="2017"&&msg[3].substring(0,4)!="2018"&&msg[3].substring(0,4)!="2019"||msg[3].length!=10) {
        $("#error").css('display', "");
        $("#error").text("请输入正确的学号！");
        $(".msg:eq(3)").css("color", "#DC143C");
        check = 0;
    }
    else $(".msg:eq(3)").css("color", "#212529");

    if(!msg[2]) {
        $("#error").css('display', "");
        $("#error").text("请选择性别！");
        $(".msg:eq(2)").css("color", "#DC143C");
        check = 0;
    }
    else {
        if(msg[2] === "1") msg[2] = "男";
        else msg[2] = "女";
        $(".msg:eq(2)").css("color", "#212529");
    }

    if(msg[1]<17||msg[1]>22) {
        $("#error").css('display', "");
        $("#error").text("请输入正确的年龄！");
        $(".msg:eq(1)").css("color", "#DC143C");
        check = 0;
    }
    else $(".msg:eq(1)").css("color", "#212529");

    var i = 0;
    $(".msg").each(function () {
        $(this).text(msg[i]);
        i ++ ;
    });

    if(check === 0) {
        $("#submit_btn").css("display", "none");
    }
    else if(check === 1) {
        $("#submit_btn").css("display", "");
        $("#error").css("display", "none");
    }

});



$("#submit_btn").click(function () {

    event.preventDefault();  // 阻止form表单的默认提交路径：action指定的路径

    var stu_name = $("#stu_name").val();
    var stu_age = $("#stu_age").val();
    var sex = $("input[name= 'sex']:checked").val();
    var stu_num = $("#stu_num").val();
    var phone = $("#phone").val();
    var college = $("#college option:selected").text();
    var class_num = $("#class_num").val();
    var major = $("#major").val();
    var depart = $("#department").val();
    var position = $("#position").val();
    var stu_id = $("#stu_id").val();
    var nation = $("#nation").val();
    var stu_addr = $("#stu_addr").val();
    var others = $("#others").val();
    var stu_birth = $("#stu_birth").val();

    if(!others) others = "0";

    $.ajax({
            type:"POST",
            url:"http://148.70.18.126:8085/api/v1/get_stu_info/",
            data: {
                "stu_name": stu_name,
                "stu_age": stu_age,
                "sex": sex,
                "stu_num": stu_num,
                "phone": phone,
                "college": college,
                "class_num": class_num,
                "major": major,
                "depart": depart,
                "position": position,
                "stu_id": stu_id,
                "nation": nation,
                "stu_addr": stu_addr,
                "others": others,
                "stu_birth": stu_birth,
            },
            success:function(data){
                //初始化编辑按钮
	 		    toastr.success("提交成功！");
	 		    setTimeout(function(){location.reload()}, 1500);

            },
            error:function(){
                toastr.success("未知错误！");     
            }
    });

});
