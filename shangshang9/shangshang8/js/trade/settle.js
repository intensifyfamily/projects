define(["dialog", "dates", "text"], function (dialog, dates, Text) {

    function formatMoney(num, n) {
        num = String(num.toFixed(n ? n : 2));
        var re = /(-?\d+)(\d{3})/;
        while (re.test(num)) num = num.replace(re, "$1,$2");
        return n ? num : num.replace(/^([0-9,]+\.[1-9])0$/, "$1").replace(/^([0-9,]+)\.00$/, "$1");
    }

    return {
        showDialog: function (data) {
            var s = new Text();
            var color = "";
            if (data.contractStateCode != 0) {
                color = "red bold";
            }
            var plColor = "";
            var flag = "";
            if (data.totalPL < 0) {
                plColor = "blue";
            }
            else if (data.totalPL > 0) {
                plColor = "red";
                flag = "+";
            }
            s._('<div class="strategy-db-wrap">');
            s._("<table>");
            s._('<tr><th>账户信息</th></tr>');
            s._('<tr><td>账户：' + data.operatorUserName + '</td><td>交易单号：' + data.serialNumber + '</td><td>投资人ID：' + data.investorAccountNumber + '</td></tr>');
            s._('<tr><th>' + data.stockName + " &nbsp;" + data.ticker + '</th></tr>');
            s._('<tr><td>交易本金：' + formatMoney(parseFloat(data.principalValue), 2) + '</td><td>交易数目：' + data.sellQuantity + '股</td><td>买入类型：市价买入</td></tr>');
            s._('<tr><td>买入价格：' + data.buyPrice + '</td><td>买入时间：' + dates.formatJson(data.openTime) + '</td><td>卖出类型：委托卖出</td></tr>');
            s._('<tr><td>卖出价格：' + formatMoney(parseFloat(data.sellPrice), 2) + '</td><td>卖出时间：' + dates.formatJson(data.closeTime) + '</td><td>递延次数：' + data.deferredDays + '次</td></tr>');
            s._('<tr><td>持仓天数：' + data.positionDays + '</td><td>交易盈亏：<span class="' + plColor + '">' + flag + formatMoney(parseFloat(data.totalPL), 2) + '</span>元 </td></tr>');
            s._('<tr><th>盈亏分配</th></tr>');
            s._('<tr><td>盈利分配：' + (data.operPL > 0 ? formatMoney(data.operPL, 2) : "0.00") + '元</td><td>亏损赔付：' + (data.operPL < 0 ? formatMoney(parseFloat(data.operPL), 2) : "0.00") + '元</td><td>收益率：' + formatMoney(parseFloat(data.totalPL) * 100 / data.performanceBond, 2) + '%</td></tr>');
            s._('<tr><td>合约保证金：' + formatMoney(data.performanceBond, 2) + '元</td><td>扣减资金：' + (data.operPL < 0 ? formatMoney(parseFloat(data.operPL), 2) : "0.00") + '元</td><td>返还资金：' + formatMoney(data.operPL < 0 ? data.performanceBond + data.operPL : data.performanceBond, 2) + "元</td></tr>");
            //s._('<tr><td>扣减服务费：<span class=\"blue\">' + formatMoney(data.serviceFee, 2) + '</span>元</td><td>扣减递延费：<span class=\"blue\">' + formatMoney(data.deferFee, 2) + '</span>元</td><td class="' + color + '">结算状态：' + data.contractState + '</td></tr>');
            s._('<tr><td>扣减服务费：<span class=\"blue\">' + formatMoney(data.serviceFee, 2) + '</span>元</td><td class="' + color + '">结算状态：' + data.contractState + '</td></tr>');

            s._("</table>");
            s._('<div style="padding-top:20px; text-align:center;"><input id="dialog-btn-b-#di#" type="button" class="btn btn-sure sure" value="确认"></div></div>');
            dialog.open(s.ts(), { width: 1090 });
        }
    };
});
