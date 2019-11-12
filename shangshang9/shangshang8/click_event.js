$(".list1").click(function () {
    window.location.href = "买入.html";
});
$(".list2").click(function () {
    window.location.href = "持仓.html";
});
$(".list3").click(function () {
    window.location.href = "结算.html";
});
$(".list4").click(function () {
    window.location.href = "触发.html";
});
$("#login").click(function () {
    window.location.href = "我的账户.html";
});
$("#chongzhijilu").click(function () {
    window.location.href = "充值记录.html";
});
$("#tixianjilu").click(function () {
    window.location.href = "提现记录.html";
});
$("#xianxiazhifu").click(function () {
    window.location.href = "充值.html";
});
$("#tixian").click(function () {
    window.location.href = "提现.html";
});

$(".buy-money-list li").click(function(){
          $(".buy-money-list li").removeClass("active");
          $(this).addClass("active");
          var buy_money = $(this).text();
          if (buy_money == '0.2万') {
              $(".lvyue span:eq(0)").text(2000*0.125);
              $(".lvyue span:eq(1)").text(2000*0.25);
              $(".lvyue span:eq(2)").text(2000*0.5);
              $("#zonghefei").text(2000*0.002);
              $("#zhisun").text(2000*(-0.105));
              $("#baozhengjin").text(2000*0.06);
          }
          else if (buy_money == '0.5万') {
              $(".lvyue span:eq(0)").text(5000*0.125);
              $(".lvyue span:eq(1)").text(5000*0.25);
              $(".lvyue span:eq(2)").text(5000*0.5);
              $("#zonghefei").text(5000*0.002);
              $("#zhisun").text(5000*(-0.105));
              $("#baozhengjin").text(5000*0.06);

          }
          else if (buy_money == '1万') {
              $(".lvyue span:eq(0)").text(10000*0.125);
              $(".lvyue span:eq(1)").text(10000*0.25);
              $(".lvyue span:eq(2)").text(10000*0.5);
              $("#zonghefei").text(10000*0.002);
              $("#zhisun").text(10000*(-0.105));
              $("#baozhengjin").text(10000*0.06);
          }
          else if (buy_money == '2万') {
              $(".lvyue span:eq(0)").text(20000*0.125);
              $(".lvyue span:eq(1)").text(20000*0.25);
              $(".lvyue span:eq(2)").text(20000*0.5);
              $("#zonghefei").text(20000*0.002);
              $("#zhisun").text(20000*(-0.105));
              $("#baozhengjin").text(20000*0.06);
          }
          else if (buy_money == '3万') {
              $(".lvyue span:eq(0)").text(30000*0.125);
              $(".lvyue span:eq(1)").text(30000*0.25);
              $(".lvyue span:eq(2)").text(30000*0.5);
              $("#zonghefei").text(30000*0.002);
              $("#zhisun").text(30000*(-0.105));
              $("#baozhengjin").text(30000*0.06);
          }
          else if (buy_money == '5万') {
              $(".lvyue span:eq(0)").text(50000*0.125);
              $(".lvyue span:eq(1)").text(50000*0.25);
              $(".lvyue span:eq(2)").text(50000*0.5);
              $("#zonghefei").text(50000*0.002);
              $("#zhisun").text(50000*(-0.105));
              $("#baozhengjin").text(50000*0.06);
          }
          else if (buy_money == '10万') {
              $(".lvyue span:eq(0)").text(100000*0.125);
              $(".lvyue span:eq(1)").text(100000*0.25);
              $(".lvyue span:eq(2)").text(100000*0.5);
              $("#zonghefei").text(100000*0.002);
              $("#zhisun").text(100000*(-0.105));
              $("#baozhengjin").text(100000*0.06);
          }
          else if (buy_money == '20万') {
              $(".lvyue span:eq(0)").text(200000*0.125);
              $(".lvyue span:eq(1)").text(200000*0.25);
              $(".lvyue span:eq(2)").text(200000*0.5);
              $("#zonghefei").text(200000*0.002);
              $("#zhisun").text(200000*(-0.105));
              $("#baozhengjin").text(200000*0.06);
          }
          else {

          }


});

$(".lvyue span").click(function(){
          $(".lvyue span").removeClass("active");
          $(this).addClass("active");
});

