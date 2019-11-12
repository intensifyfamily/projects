requirejs.config({
    baseUrl: "js/lib",
    //urlArgs: "v=" + (new Date()).getTime(),
    urlArgs: "v=20160801",
    waitSeconds: 0,
    paths: {
        avalon: "avalon/avalon.min",
        mmHistory: "avalon/mmHistory.min",
        mmRouter: "avalon/mmRouter.min",
        jquery: "jquery/jquery.min",
        unslider: "unslider/js/unslider-min",
        md5: "jquery.MD5/jquery.md5.min",
        lodash: "lodash/lodash.min",

        Raphael: "raphael/raphael.min",
        dialog: "ui/dialog.min",
        text: "utils/text.min",
        tips: "ui/tips.min",
        cookies: "utils/cookies.min",
        numbers: "utils/numbers.min",
        dom: "utils/dom.min",
        settle: "trade/settle.min",
        dates: "utils/dates.min",
        validator: "utils/validate.min",
        /* modified in 17.08.19, by doublefish start */
        /*
		sline: "ui/chart/sline.min",
		kline: "ui/chart/kline.min",
		slineBuilder: "ui/slineBuilder.min",
		klineBuilder: "ui/klineBuilder.min",
		*/
        /* modified in 17.08.19, by doublefish end */

        account: "account/account.min",
        fund: "account/fund.min",

        trade: "trade/trade.min",
        stockPrice: "trade/stockPrice.min",
        stockSearch: "trade/stockSearch.min",
        queryString: "utils/queryString.min"
    },
    shim: {
        mmHistory: { deps: ["avalon"] },
        mmRouter: { deps: ["avalon"] },

        unslider: { deps: ["jquery"] },
        md5: { deps: ["jquery"] },
        Raphael: { exports: "Raphael" },

        fund: { deps: ["jquery", "avalon"], exports: "vmFund" },
        stockSearch: {
            exports: "vmStockSearch"
        },
        queryString: { deps: ["jquery"] }
    }
});
/* modified in 17.08.19, by doublefish start */
/*
require(["jquery", "avalon", "stockPrice", "stockSearch", "numbers", "settle", "slineBuilder", "klineBuilder", "cookies", "text", "dialog"],
	function ($, avalon, stockPrice, vmStockSearch, numbers, settle, slineBuilder, klineBuilder, cookies, Text, dialog) {
*/
/* modified in 17.08.19, by doublefish end */
require(["jquery", "avalon", "stockPrice", "stockSearch", "numbers", "settle", "cookies", "text", "dialog", "validator", "queryString", "tips"],
	function ($, avalon, stockPrice, vmStockSearch, numbers, settle, cookies, Text, dialog, validator, queryString, tips) {
	    $(".main-nav li").removeClass("curr");
	    $("#nav-trade").toggleClass("curr");
	    var lastCode = "";
	    var lastTime;
	    var buyTimer;
	    var sellTimer;
	    var allCookie = cookies.getCookie("searchhistorylist");
	    var isShowRiskTip = cookies.getCookie("IsShowRiskTip");//挂单买入风险提示
	    var isShowRiskTip2 = cookies.getCookie("IsShowRiskTip2");//挂单卖出风险提示
	    var tabIndex = parseInt(queryString.GetValue("idx") != undefined ? queryString.GetValue("idx") : 1);
	    var currTickerHistory = "601988";
	    var currSecIdHistory = "601988.XSHG";
	    if (allCookie) {
	        allCookie = JSON.parse(allCookie);
	        if (currTickerHistory.length > 0) {
	            currTickerHistory = allCookie[0].ticker;
	            currSecIdHistory = currSecIdHistory + "." + allCookie[0].exchange;
	        }
	    }

	    //avalonjs ViewModel 定义-持仓
	    var vmPos = avalon.define({
	        $id: "vmPos",

	        pageNumber: 0,
	        pageSize: 200,
	        totalRows: 0,
	        accountBalance: 0,
	        packetMoney: 0,
	        deferFeeTotal: "",
	        totalPages: {
	            get: function () {
	                return Math.ceil(this.totalRows / this.pageSize);
	            }
	        },
	        rows: [],
	        //获取持仓
	        load: function (k) {
	            if (k == "undefined" || k == undefined) {
	                k = "";
	            }
	            $.ajax({
	                url: "ashx/AccountHandler.ashx?action=getStockPosition",
	                type: "POST",
	                data: {
	                    k: k,
	                    Ticker: currTickerHistory,
	                    pageNumber: vmPos.pageNumber,
	                    pageSize: vmPos.pageSize
	                },
	                success: function (data) {
	                    vmTrade.accountNumber = data.accountNumber;
	                    vmTrade.accountBalance = data.balance;
	                    vmTrade.deferFeeTotal = data.deferFee;
	                    vmTrade.restContracts = data.restContracts;
	                    vmTrade.syncType = data.syncType;
	                    vmTrade.packetMoney = data.packetMoney;

	                    vmPos.totalRows = data.total;
	                    vmPos.rows = data.rows;
	                    if (!k) {
	                        vmPos.deferFeeTotal = data.deferFee;
	                        vmPos.accountBalance = data.balance;
	                        vmPos.packetMoney = data.packetMoney;
	                    }

	                    ////根据股票持仓总额，限制止损比例
	                    //if (parseFloat(data.tickerPVTotal) / 10000 <= 200) {
	                    //    vmTrade.curSL = vmTrade.SL[0];
	                    //    vmTrade.curLeverage = vmTrade.leverage[0];
	                    //}
	                    //else if (parseFloat(data.tickerPVTotal) / 10000 <= 300) {
	                    //    vmTrade.curSL = vmTrade.SL[1];
	                    //    vmTrade.curLeverage = vmTrade.leverage[1];
	                    //}
	                    //else {
	                    //    vmTrade.curSL = vmTrade.SL[2];
	                    //    vmTrade.curLeverage = vmTrade.leverage[2];
	                    //}
	                    //vmTrade.ableCurSL = vmTrade.curSL;
	                }
	            });
	        },
	        prev: function () {
	            vmPos.pageNumber = Math.max(0, vmPos.pageNumber - 1);
	        },
	        next: function () {
	            vmPos.pageNumber = Math.min(vmPos.totalPages - 1, vmPos.pageNumber + 1);
	        },
	        setPage: function (n) {
	            vmPos.pageNumber = n;
	        }
	    });
	    vmPos.$watch("pageNumber", vmPos.load);

	    //avalonjs ViewModel 定义-挂单
	    var vmRestingOrder = avalon.define({
	        $id: "vmRestingOrder",
	        pageNumber: 0,
	        pageSize: 20,
	        totalRows: 0,
	        totalPages: {
	            get: function () {
	                return Math.ceil(this.totalRows / this.pageSize);
	            }
	        },
	        rows: [],
	        load: function () {
	            $.ajax({
	                url: "ashx/AccountHandler.ashx?action=getRestingOrder",
	                type: "POST",
	                data: {
	                    pageNumber: vmRestingOrder.pageNumber,
	                    pageSize: vmRestingOrder.pageSize
	                },
	                success: function (data) {
	                    vmRestingOrder.totalRows = data.total;
	                    vmRestingOrder.rows = data.rows;
	                    vmPos.accountBalance = data.balance;
	                }
	            });
	        },
	        cancelOrder: function (o) {
	            var d = dialog,
                   s = new Text();
	            if (o.direction == 1) {
	                s._('<h4 class="font24 txt-c">触发买入撤单<i></h4>');
	                s._('<div class="delegation-sure mt20">');
	                s._('<table border="0" cellpadding="0" cellspacing="0">');
	                s._('<tr class="on"><td><label>账户：</label><span>' + vmTrade.accountNumber + '</span></td></tr>');
	                s._('<tr><td><label>名称：</label><span>' + o.stockName + '</span></td></tr>');
	                s._('<tr><td><label>代码：</label><span>' + o.ticker + '</span></td></tr>');
	                s._('<tr><td><label>倍数：</label><span>' + (vmTrade.curPV / vmTrade.curPB).toFixed(0) + '倍</span></td></tr>');
	                s._('<tr><td><label>数量：</label><span>' + o.quantity + '股</span></td></tr>');
	                s._('<tr class="on"><td><label>委托买入时间：</label><span>' + new Date(o.confirmedTime).Format("yyyy-MM-dd HH:mm:ss") + '</span></td></tr>');
	                s._('<tr><td><label>买入金额：</label><span>' + o.principalValue + '元</span></td>');
	                s._('<td><label>委托价格：</label><span>' + o.restingPrice.toFixed(2) + '元</span></td></tr>');
	                s._('<tr><td><label>止损金额：</label><span>' + o.stopLoss.toFixed(0) + '元</span></td>');
	                s._('<td><label>保证金额：</label><span>' + o.performanceBond.toFixed(0) + '元</span></td></tr>');
	                s._('</table></div>');
	                s._('<div class="btn-group txt-c clear mt30">');
	                s._('<button class="btn btn-ok btn1" id="resting-submitCancelBuy" type="button" dialog-btn-notify="#di#,1">确认</button>');
	                s._('<button class="btn btn-delete btn2" id="resting-buyCancel" type="button" dialog-btn-notify="#di#,2">取消</button>');
	                s._('</div>');
	            }
	            else {
	                s._('<h4 class="font24 txt-c">触发卖出撤单<i></h4>');
	                s._('<div class="delegation-sure mt20">');
	                s._('<table border="0" cellpadding="0" cellspacing="0">');
	                s._('<tr class="on"><td><label>账户：</label><span>' + vmTrade.accountNumber + '</span></td></tr>');
	                s._('<tr><td><label>名称：</label><span>' + o.stockName + '</span></td></tr>');
	                s._('<tr><td><label>代码：</label><span>' + o.ticker + '</span></td></tr>');
	                s._('<tr><td><label>倍数：</label><span>' + (o.principalValue / (o.performanceBond - o.additionalFee)).toFixed(0) + '倍</span></td></tr>');
	                s._('<tr class="on"><td><label>数量：</label><span>' + o.quantity + '股</span></td></tr>');
	                s._('<tr><td><label>委托时间：</label><span>' + new Date(o.confirmedTime).Format("yyyy-MM-dd HH:mm:ss") + '</span></td></tr>');
	                s._('<tr><td><label>买入时间：</label><span>' + new Date(o.buyTime).Format("yyyy-MM-dd HH:mm:ss") + '</span></td></tr>');
	                s._('<tr class="on"><td><label>持仓时间：</label><span>' + o.positionDays + '天</span></td></tr>');
	                s._('<tr><td><label>买入金额：</label><span>' + o.principalValue + '元</span></td>');
	                s._('<td><label>买入价格：</label><span>' + o.buyPrice.toFixed(2) + '元</span></td></tr>');
	                s._('<tr><td><label>止损金额：</label><span>' + o.stopLoss.toFixed(0) + '元</span></td>');
	                s._('<td><label>保证金额：</label><span>' + o.performanceBond.toFixed(0) + '元</span></td></tr>');
	                s._('<tr><td class="' + (o.restingPrice > o.buyPrice ? "red" : o.restingPrice < o.buyPrice ? "blue" : "black") + ' bold"><label>委托价格：</label><span>' + o.restingPrice.toFixed(2) + '元</span></td>');
	                s._('<td class="' + (o.restingPrice > o.buyPrice ? "red" : o.restingPrice < o.buyPrice ? "blue" : "black") + ' bold"><label>参考盈亏：</label><span>' + ((o.restingPrice - o.buyPrice) * o.quantity).toFixed(0) + '元</span></td></tr>');
	                s._('</table></div>');
	                s._('<div class="btn-group txt-c clear mt30">');
	                s._('<button class="btn btn-ok btn1" id="resting-submitCancelBuy" type="button" dialog-btn-notify="#di#,1">确认</button>');
	                s._('<button class="btn btn-delete btn2" id="resting-buyCancel" type="button" dialog-btn-notify="#di#,2">取消</button>');
	                s._('</div>');
	            }
	            d.open(s.ts(), {
	                width: 550,
	                notify: function (nt) {
	                    $("#resting-submitCancelBuy").blur();
	                    $("#resting-buyCancel").blur();
	                    if (nt == 0) return;
	                    if (nt == 1) {
	                        $.ajax({
	                            url: "ashx/TradeHandler.ashx?action=cancelOrder",
	                            type: "POST",
	                            data: {
	                                orderID: o.id
	                            },
	                            success: function (data) {
	                                if (data.code === 1) {
	                                    dialog.alert("撤销成功", 2, {
	                                        title: "温馨提示",
	                                        width: 420,
	                                        notify: function (n) {
	                                            vmRestingOrder.load();
	                                        }
	                                    });
	                                } else {
	                                    dialog.alert("撤销失败：" + data.msg, 1, {
	                                        title: "温馨提示",
	                                        width: 420,
	                                        notify: function (n) {
	                                            vmRestingOrder.load();
	                                        }
	                                    });
	                                }
	                                return false;
	                            }
	                        });
	                    }
	                    dialog.close();
	                }
	            });
	        },
	        //cancelOrder: function (id) {
	        //    dialog.confirm("您确定要撤销此条件单吗？", 0, {
	        //        title: "温馨提示",
	        //        width: 480,
	        //        notify: function (nt) {
	        //            if (nt === 1) {
	        //                $.ajax({
	        //                    url: "ashx/TradeHandler.ashx?action=cancelOrder",
	        //                    type: "POST",
	        //                    data: {
	        //                        orderID: id
	        //                    },
	        //                    success: function (data) {
	        //                        if (data.code === 1) {
	        //                            dialog.alert("撤单成功", 2, {
	        //                                title: "温馨提示",
	        //                                width: 420,
	        //                                notify: function (n) {
	        //                                    vmRestingOrder.load();
	        //                                }
	        //                            });
	        //                        } else {
	        //                            dialog.alert("撤单失败：" + data.msg, 1, {
	        //                                title: "温馨提示",
	        //                                width: 420,
	        //                                notify: function (n) {
	        //                                    vmRestingOrder.load();
	        //                                }
	        //                            });
	        //                        }
	        //                        return false;
	        //                    }
	        //                });
	        //            }
	        //        }
	        //    });
	        //},
	        prev: function () {
	            vmRestingOrder.pageNumber = Math.max(0, vmRestingOrder.pageNumber - 1);
	        },
	        next: function () {
	            vmRestingOrder.pageNumber = Math.min(vmRestingOrder.totalPages - 1, vmRestingOrder.pageNumber + 1);
	        },
	        setPage: function (n) {
	            vmRestingOrder.pageNumber = n;
	        }
	    });
	    vmRestingOrder.$watch("pageNumber", vmRestingOrder.load);



	    //avalonjs ViewModel 定义-结算
	    var vmSettlement = avalon.define({
	        $id: "vmSettlement",
	        pageNumber: 0,
	        pageSize: 10,
	        totalRows: 0,
	        totalPages: {
	            get: function () {
	                return Math.ceil(this.totalRows / this.pageSize);
	            }
	        },
	        rows: [],
	        load: function () {
	            $.ajax({
	                url: "ashx/AccountHandler.ashx?action=getSettlement",
	                type: "POST",
	                data: {
	                    pageNumber: vmSettlement.pageNumber,
	                    pageSize: vmSettlement.pageSize
	                },
	                success: function (data) {
	                    vmSettlement.totalRows = data.total;
	                    vmSettlement.rows = data.rows;
	                }
	            });
	        },
	        prev: function () {
	            vmSettlement.pageNumber = Math.max(0, vmSettlement.pageNumber - 1);
	        },
	        next: function () {
	            vmSettlement.pageNumber = Math.min(vmSettlement.totalPages - 1, vmSettlement.pageNumber + 1);
	        },
	        setPage: function (n) {
	            vmSettlement.pageNumber = n;
	        }
	    });
	    vmSettlement.$watch("pageNumber", vmSettlement.load);



	    //avalonjs ViewModel 定义-交易
	    vmTrade = avalon.define({
	        $id: "vmTrade",
	        //当前活动tab
	        activeTab: 1,
	        //当前活动图表
	        activeChart: 0,
	        isBusy: false,
	        //是否显示搜索框
	        searchVisible: false,
	        inititalized: false,
	        //挂单价
	        restingPrice: 0,
	        //isChange: true,
	        //买入方式 1：直接买入 2：挂单买入
	        category: 1,
	        initPrice: 0,
	        initQuantity: 0,

	        tradeTimeRange: "09:30,11:30|13:00,14:55",
	        currTicker: currTickerHistory,
	        currSecID: currSecIdHistory,
	        curStockPrice: stockPrice,
	        //服务器时间
	        serverTime: new Date(),
	        isOpenTime: false, //是否是证券市场允许的交易时间
	        isTradeTime: false, //是否是平台允许的交易时间
	        isTradeDate: false, //是否为交易日
	        //是否允许点买
	        tradeDisabled: {
	            get: function () {
	                return this.isBusy || !this.isTradeTime || this.curStockPrice.stockRisk.length > 0;
	            }
	        },
	        //点买提示
	        tradePrompt: {
	            get: function () {
	                if (this.isBusy) {
	                    return "处理中...";
	                }
	                if (!this.isTradeTime) {
	                    return "非交易时段";
	                } else {
	                    return this.curStockPrice.stockRisk.length === 0 ? "立即买入" : "高风险禁止交易";
	                }
	            }
	        },
	        btnBuyText: "稍等。。。",
	        //当前选定的点买金额档位对应的保证金
	        curPB: {
	            get: function () {
	                return Math.round(this.curPV / this.curLeverage, 0);
	            }
	        },
	        //当前止损
	        curSLPrice: {
	            get: function () {
	                return Math.round(this.curPV * 0.02 - this.curPB, 0);
	            }
	        },
	        //每千元综合服务费标准
	        serviceFeeRate: 5,
	        deferFeeRate: 15,
	        //风险股系数
	        maxPriceChange: 0.08,
	        //点买股数计算系数
	        syncRate: 0.05,
	        asyncRate: 0.05,
	        //用于计算股数的股票价格
	        stockPrice: {
	            get: function () {
	                var calcPrice = this.curStockPrice.lastPrice;
	                //触发买入
	                if (this.category == 2) {
	                    calcPrice = vmTrade.restingPrice;
	                }

	                //var price1 = GetRounding(this.curStockPrice.prevClosePrice * (1 + this.maxPriceChange), 2).toFixed(2);
	                var price1 = GetRounding(this.curStockPrice.prevClosePrice * 1.1, 2).toFixed(2);
	                var price2 = 0;
	                if (this.syncType == 2) { //同步
	                    price2 = GetRounding(calcPrice * (1 + this.syncRate), 2).toFixed(2);
	                }
	                else { //非同步
	                    price2 = GetRounding(calcPrice * (1 + this.asyncRate), 2).toFixed(2);
	                }
	                var price3 = 0;
	                if (this.syncType == 2) { //同步
	                    price3 = GetRounding(this.curStockPrice.lastPrice * (1 + this.syncRate), 2).toFixed(2);
	                }
	                else { //非同步
	                    price3 = GetRounding(this.curStockPrice.lastPrice * (1 + this.asyncRate), 2).toFixed(2);
	                }
	                this.initPrice = parseFloat(price1) < parseFloat(price3) ? price1 : price3;
	                return parseFloat(price1) < parseFloat(price2) ? price1 : price2;
	            }
	        },
	        //当前选定的点买金额档位对应的综合服务费
	        serviceFee: {
	            get: function () {
	                return this.curPV / 1000 * this.serviceFeeRate;
	            }
	        },
	        //当前选定的点买金额档位对应的每天递延费
	        deferFee: {
	            get: function () {
	                return this.curPV / 1000 * this.deferFeeRate;
	            }
	        },
	        //最大允许点买股数
	        maxShare: {
	            get: function () {
	                //return Math.floor((this.curPV - this.serviceFee) / this.curStockPrice.lastPrice / 100) * 100;
	                this.initQuantity = Math.floor(this.curPV / this.initPrice / 100) * 100;
	                return Math.floor(this.curPV / this.stockPrice / 100) * 100;
	            }
	        },
	        //根据股票当前价计算的实际点买金额
	        maxAmount: {
	            get: function () {
	                if (this.category == 1) {
	                    return this.maxShare * this.curStockPrice.lastPrice;
	                }
	                else if (this.category == 2) {
	                    return this.maxShare * vmTrade.restingPrice;
	                }
	            }
	        },
	        //资金使用率
	        maxFundRate: {
	            get: function () {
	                return (this.maxAmount / this.curPV) * 100.0;
	            }
	        },
	        ////输入挂单价
	        //setPrice: function () {
	        //    vmTrade.isChange = false;
	        //    var rPrice = parseFloat($("#price").val().trim()).toFixed(2);
	        //    $("#price").val(rPrice);
	        //    vmTrade.restingPrice = rPrice;
	        //    if (parseFloat(rPrice) >= parseFloat((vmTrade.curStockPrice.prevClosePrice * 1.08).toFixed(2))) {
	        //        vmTrade.restingPrice = (vmTrade.curStockPrice.prevClosePrice * 1.08).toFixed(2);
	        //        $("#price").val(vmTrade.restingPrice);
	        //    }
	        //    if (parseFloat(rPrice) <= parseFloat((vmTrade.curStockPrice.prevClosePrice * 0.92).toFixed(2))) {
	        //        vmTrade.restingPrice = (vmTrade.curStockPrice.prevClosePrice * 0.92).toFixed(2);
	        //        $("#price").val(vmTrade.restingPrice);
	        //    }
	        //    if (vmTrade.category == 2) {
	        //        $("#checkbox1").click();
	        //        $("#checkbox2").click();
	        //    }
	        //},
	        ////增加挂单价
	        //addPrice: function () {
	        //    vmTrade.isChange = false;
	        //    var rPrice = (parseFloat(vmTrade.restingPrice) + 0.01).toFixed(2);
	        //    if (parseFloat(rPrice) <= parseFloat((vmTrade.curStockPrice.prevClosePrice * 1.08).toFixed(2))) {
	        //        vmTrade.restingPrice = rPrice;
	        //        if (vmTrade.category == 2) {
	        //            $("#checkbox1").click();
	        //            $("#checkbox2").click();
	        //        }
	        //    }
	        //},
	        ////减少挂单价
	        //subPrice: function () {
	        //    vmTrade.isChange = false;
	        //    var rPrice = (parseFloat(vmTrade.restingPrice) - 0.01).toFixed(2);
	        //    if (parseFloat(rPrice) >= parseFloat((vmTrade.curStockPrice.prevClosePrice * 0.92).toFixed(2))) {
	        //        vmTrade.restingPrice = rPrice;
	        //        if (vmTrade.category == 2) {
	        //            $("#checkbox1").click();
	        //            $("#checkbox2").click();
	        //        }
	        //    }
	        //},
	        //输入挂单价
	        setPrice: function () {
	            //vmTrade.isChange = false;
	            var rPrice = parseFloat($("#buyRestingPrice").val().trim()).toFixed(2);
	            if (!validator.isNumber(rPrice)) {
	                rPrice = vmTrade.curStockPrice.lastPrice;
	            }
	            $("#buyRestingPrice").val(rPrice);
	            vmTrade.restingPrice = rPrice;
	            if (parseFloat(rPrice) >= parseFloat((vmTrade.curStockPrice.prevClosePrice * 1.08).toFixed(2))) {
	                vmTrade.restingPrice = (vmTrade.curStockPrice.prevClosePrice * 1.08).toFixed(2);
	                $("#buyRestingPrice").val(vmTrade.restingPrice);
	            }
	            if (parseFloat(rPrice) <= parseFloat((vmTrade.curStockPrice.prevClosePrice * 0.92).toFixed(2))) {
	                vmTrade.restingPrice = (vmTrade.curStockPrice.prevClosePrice * 0.92).toFixed(2);
	                $("#buyRestingPrice").val(vmTrade.restingPrice);
	            }
	            vmTrade.stockPrice;
	            vmTrade.maxShare;
	            vmTrade.maxAmount;
	            vmTrade.maxFundRate;
	            //if (vmTrade.category == 2) {
	            //    $("#checkbox1").click();
	            //    $("#checkbox2").click();
	            //}
	        },
	        //增加挂单价
	        addPrice: function () {
	            //vmTrade.isChange = false;
	            var buyRestingPrice = $("#buyRestingPrice").val();
	            if (!validator.isNumber(buyRestingPrice)) {
	                buyRestingPrice = vmTrade.curStockPrice.lastPrice;
	            }
	            var rPrice = (parseFloat(buyRestingPrice) + 0.01).toFixed(2);
	            if (parseFloat(rPrice) <= parseFloat((vmTrade.curStockPrice.prevClosePrice * 1.08).toFixed(2))) {
	                vmTrade.restingPrice = rPrice;
	                $("#buyRestingPrice").val(rPrice);
	                vmTrade.stockPrice;
	                vmTrade.maxShare;
	                vmTrade.maxAmount;
	                vmTrade.maxFundRate;
	                //if (vmTrade.category == 2) {
	                //    $("#checkbox1").click();
	                //    $("#checkbox2").click();
	                //}
	            }
	        },
	        //减少挂单价
	        subPrice: function () {
	            //vmTrade.isChange = false;
	            var buyRestingPrice = $("#buyRestingPrice").val();
	            if (!validator.isNumber(buyRestingPrice)) {
	                buyRestingPrice = vmTrade.curStockPrice.lastPrice;
	            }
	            var rPrice = (parseFloat(buyRestingPrice) - 0.01).toFixed(2);
	            if (parseFloat(rPrice) >= parseFloat((vmTrade.curStockPrice.prevClosePrice * 0.92).toFixed(2))) {
	                vmTrade.restingPrice = rPrice;
	                $("#buyRestingPrice").val(rPrice);
	                vmTrade.stockPrice;
	                vmTrade.maxShare;
	                vmTrade.maxAmount;
	                vmTrade.maxFundRate;
	                //if (vmTrade.category == 2) {
	                //    $("#checkbox1").click();
	                //    $("#checkbox2").click();
	                //}
	            }
	        },
	        //选择买入方式
	        selectCategory: function (v) {
	            vmTrade.category = v;
	        },
	        //资金余额
	        accountBalance: 0,
	        //红包余额
	        packetMoney: 0,
	        //今日递延费总额
	        deferFeeTotal: 0,
	        //会员账号
	        accountNumber: "",
	        //本日最多可买次数(合约数)
	        restContracts: 0,
	        //点买人同步类型
	        syncType: 1,

	        //选择止损位
	        selectStopLoss: function (idx) {
	            vmStockSearch.currSoptLoss = idx;
	        },
	        //切换tab
	        selectTab: function (idx) {
	            vmTrade.activeTab = idx;
	            if (idx === 1) { vmPos.load(); }
	            if (idx === 2) { vmPos.load(); }
	            if (idx === 3) { vmSettlement.load(); }
	            if (idx === 4) { vmRestingOrder.load(); }
	        },
	        //切换图表
	        toggleChart: function (idx) {
	            vmTrade.activeChart = idx;
	            /* modified in 17.08.19, by doublefish start */
	            if (idx === 0) {
	                _GlobalVar.IsK = false;
	            }
	            else if (idx === 1) {
	                _GlobalVar.IsK = true;
	            }
	            _GetStockInfo();
	            /* modified in 17.08.19, by doublefish end */
	        },
	        //显示搜索
	        showSearch: function () {
	            event.stopPropagation();
	            vmStockSearch.qryKeyword = "";
	            var history = cookies.getCookie("searchhistorylist");
	            if (history)
	                vmStockSearch.queryResult = JSON.parse(history);
	            else
	                vmStockSearch.queryResult = [];
	            vmStockSearch.searchVisible = true;
	        },
	        //隐藏搜索
	        hideSearch: function () {
	            event.stopPropagation();
	            vmStockSearch.searchVisible = false;
	        },

	        //获取当前选择股票的报价
	        getPrice: function () {
	            //获取行情报价
	            vmStockSearch.getPrice(vmTrade.curStockPrice.ticker, function (json) {
	                lastCode = vmTrade.curStockPrice.securityID;
	                lastTime = new Date();
	                if (json.code === 1) {
	                    var q = json.data;
	                    avalon.mix(vmTrade.curStockPrice, q);
	                    //if (vmTrade.isChange) {
	                    //    vmTrade.restingPrice = vmTrade.curStockPrice.lastPrice.toFixed(2);
	                    //}
	                    console.log(q);
	                    //if (q.openPrice === 0 || q.lastPrice === 0) {
	                    if (!q.shortNM) {
	                        vmTrade.curStockPrice.stockRisk = "暂无报价";
	                    } else
	                        if (q.shortNM.indexOf("S") >= 0) {
	                            vmTrade.curStockPrice.stockRisk = "ST高风险";
	                        } else if (q.isRiskStock) {
	                            vmTrade.curStockPrice.stockRisk = "高风险";
	                        } else if (q.suspension == 1) {
	                            vmTrade.curStockPrice.stockRisk = "停牌";
	                        } else {
	                            vmTrade.curStockPrice.stockRisk = "";
	                        }
	                    vmTrade.curStockPrice.format();
	                    vmStockSearch.inititalized = true;

	                    if (!vmTrade.isTradeTime) {
	                        vmTrade.btnBuyText = "非交易时段";
	                    } else {
	                        vmTrade.btnBuyText = vmTrade.curStockPrice.stockRisk.length === 0 ? "立即买入" : "高风险禁止交易";
	                    }

	                    /* modified in 17.08.19, by doublefish start */
	                    /*
						slineBuilder.close = vmTrade.curStockPrice.prevClosePrice;
						slineBuilder.high = parseFloat(vmTrade.curStockPrice.highPrice);
						slineBuilder.low = parseFloat(vmTrade.curStockPrice.lowPrice);
						slineBuilder.querySlineData(vmTrade.curStockPrice.ticker + "." + vmTrade.curStockPrice.exchangeCD);
						klineBuilder.queryKlineData(vmTrade.curStockPrice.ticker);
						*/
	                    /* modified in 17.08.19, by doublefish end */

	                    vmTrade.curStockPrice.amplitude = GetRounding(vmTrade.curStockPrice.amplitude, 2).toFixed(2);

	                } else {
	                    vmTrade.curStockPrice.stockRisk = "行情读取失败";
	                    if (vmTrade.curStockPrice) {
	                        vmTrade.curStockPrice.clear();
	                    }

	                    /* modified in 17.08.19, by doublefish start */
	                    /*
						slineBuilder.clear();
						klineBuilder.clear();
						*/
	                    /* modified in 17.08.19, by doublefish end */
	                    setTimeout(vmTrade.getPrice, 1000);
	                }
	                /* modified in 17.08.19, by doublefish start */
	                _GlobalVar.Stock.ExchangeCode = vmTrade.curStockPrice.exchangeCD;
	                _GlobalVar.Stock.Ticker = vmTrade.curStockPrice.ticker;
	                _GlobalVar.Stock.ClosePrice = vmTrade.curStockPrice.prevClosePrice;
	                _GetStockInfo();
	                /* modified in 17.08.19, by doublefish end */
	            });
	        },
	        //显示结算清单
	        showSettlement: function (data) {
	            event.preventDefault();
	            console.log(data);
	            settle.showDialog(data.$model);
	        },
	        //获取服务器端时间
	        getServerTime: function () {
	            $.ajax({
	                url: "ashx/TradeHandler.ashx?action=getServerTime",
	                type: "POST",
	                success: function (d) {
	                    if (d.code === 1 && d.data) {
	                        vmTrade.serverTime = d.data.serverTime;
	                        vmTrade.isTradeTime = d.data.isTradeTime;
	                        vmTrade.isOpenTime = d.data.isOpenTime;
	                        vmTrade.isTradeDate = d.data.isTradeDate;
	                    }
	                },
	                error: function (xOptions, textStatus) {
	                    console.log(textStatus);
	                    setTimeout(vmTrade.getServerTime, 1000);
	                }
	            });
	        },

	        //选择股票
	        selectTicker: function (t) {
	            //$.ajax({
	            //    url: "ashx/AccountHandler.ashx?action=getTickerBuyTotal",
	            //    type: "POST",
	            //    data: { Ticker: t.ticker },
	            //    success: function (data) {
	            //        //根据股票持仓总额，限制止损比例
	            //        if (parseFloat(data.tickerPVTotal) / 10000 <= 200) {
	            //            vmTrade.curSL = vmTrade.SL[0];
	            //            vmTrade.curLeverage = vmTrade.leverage[0];
	            //        }
	            //        else if (parseFloat(data.tickerPVTotal) / 10000 <= 300) {
	            //            vmTrade.curSL = vmTrade.SL[1];
	            //            vmTrade.curLeverage = vmTrade.leverage[1];
	            //        }
	            //        else {
	            //            vmTrade.curSL = vmTrade.SL[2];
	            //            vmTrade.curLeverage = vmTrade.leverage[2];
	            //        }
	            //        vmTrade.ableCurSL = vmTrade.curSL;
	            //    }
	            //});

	            vmTrade.hideSearch();
	            vmTrade.curStockPrice.securityID = t.ticker + "." + t.exchange;
	            vmTrade.curStockPrice.ticker = t.ticker;
	            currTickerHistory = t.ticker;
	            //保存到股票搜索历史中
	            //cookies.delCookie('searchhistorylist');
	            var allCookie = cookies.getCookie("searchhistorylist");
	            var setCookies = [];
	            //console.log(JSON.stringify(t));
	            setCookies.push({ "ticker": t.ticker, "cnSpell": t.cnSpell, "exchange": t.exchange, "shortName": t.shortName, "highRisk": t.highRisk });
	            if (allCookie) {
	                allCookie = JSON.parse(allCookie);
	                var cookiesLength = allCookie.length;
	                var isIn = 0;
	                for (var i = 0; i < cookiesLength; i++) {
	                    if (t.ticker !== allCookie[i].ticker) {
	                        isIn++;
	                        setCookies.push(allCookie[i]);
	                    }
	                    if (isIn === 9) {
	                        break;
	                    }
	                }
	            }
	            cookies.setCookie("searchhistorylist", JSON.stringify(setCookies));
	            //vmTrade.isChange = true;
	            vmTrade.getPrice();
	        },
	        //挂单买入
	        restingBuy: function (e) {
	            $(this).blur();
	            e = e || window.event;
	            if (e.stopPropagation) { //W3C阻止冒泡方法
	                e.stopPropagation();
	            } else {
	                e.cancelBubble = true; //IE阻止冒泡方法
	            }
	            if (vmTrade.isBusy) {
	                return false;
	            }
	            if (!vmTrade.isTradeTime) {
	                dialog.alert("非交易时间，不允许操作，请稍后再试", 0, {
	                    title: "温馨提示",
	                    width: 420
	                });
	                return false;
	            }

	            if (vmTrade.curStockPrice.stockRisk.length) {
	                dialog.alert("高风险，暂时不能交易", 0, {
	                    title: "温馨提示",
	                    width: 420
	                });
	                return false;
	            }

	            var agree = $("#agree").is(":checked");
	            if (!agree) {
	                dialog.alert('<span>请阅读并同意以下协议:</span><a href="zfbz.html" target="_blank" class="txt-s12">《策略人参与沪深A股交易合作涉及费用及资费标准》</a><br><a href="hzxy.html" target="_blank" class="txt-s12">《上上策投资人与策略人参与沪深A股交易合作协议》</a><br><a href="fwxy.html" target="_blank" class="txt-s12">《上上策服务协议》</a>', 0, { title: "温馨提示", width: 500 });
	                return false;
	            }

	            if (!isShowRiskTip) {
	                var d = dialog,
                     s = new Text();
	                s._('<h4 class="font24 red txt-c">风险提示</h4>');
	                s._('<div class="risk-warning">当实盘成交价出现该触发价时，<b class="bold red">投资人会以该触发时间发起市价买入，最终成交的价格以实际成交价格为准</b>，而非以设置的触发价为准，如有疑问可申请交割单，该功能与券商委托挂单有很大的区别，请谨慎使用！如阅毕并确认无误，点击确认按钮，此次触发买入生效。</div>');
	                s._('<div class="checkbox checkbox2">');
	                s._('<input type="checkbox" id="ckTip" name="checkboox[]">');
	                s._('<label for="ckTip">以后不再提醒</label></div>');
	                s._('<div class="txt-c mt20"><input id="comit-tip" class="btn btn-sure sure" type="button" dialog-btn-notify="#di#,1" value="确 认"></div>');
	                d.open(s.ts(), {
	                    width: 550,
	                    notify: function (nt) {
	                        $("#comit-tip").blur();
	                        if (nt == 0) return;
	                        var ckTip = $("#ckTip").is(":checked");
	                        if (ckTip) {
	                            cookies.setCookie("IsShowRiskTip", false);
	                            isShowRiskTip = true;
	                        }
	                        dialog.close();
	                        vmTrade.restingBuy2(e);
	                    }
	                });
	            }
	            else {
	                vmTrade.restingBuy2(e);
	            }
	        },
	        restingBuy2: function (e) {
	            var bol = true;
	            var d = dialog,
                    s = new Text();
	            s._('<h4 class="font24 txt-c">触发买入</h4>');
	            s._('<div class="clear mt30">');
	            s._('<div class="delegation-left fl txt-c">');
	            s._('<input type="text" placeholder="' + vmTrade.curStockPrice.shortNM + '" class="agu" disabled style="cursor:default">');
	            s._('<p><input id="restingLastPrice" type="text" placeholder="' + vmTrade.curStockPrice.lastPrice.toFixed(2) + '" class="agu" disabled  style="cursor:default"></p>');
	            s._('<p class="clear money-input"><i class="fl" onclick="vmTrade.subPrice()"><img src="images/minus.png"></i><input id="buyRestingPrice" onchange="vmTrade.setPrice()" type="text" value="' + vmTrade.curStockPrice.lastPrice.toFixed(2) + '"><i class="fr" onclick="vmTrade.addPrice()"><img src="images/plus.png"></i></p>');
	            s._('<input id="comit-price" type="button" class="btn btn-delega" dialog-btn-notify="#di#,1" value="确 认">');
	            s._('<p class="clear mt20 pl-pr10"><span class="fl red">涨停' + vmTrade.curStockPrice.surgedLimit.toFixed(2) + '</span><span class="fr blue">跌停' + vmTrade.curStockPrice.declineLimit.toFixed(2) + '</span></p>');
	            s._('</div>');
	            s._('<div id="dialogDivPrice" class="delegation-right fr">');
	            s._('<table border="0" cellpadding="0" cellspacing="0">');
	            s._('<colgroup><col style="width:40px;"><col style="width:55px;"><col style="width:75px;"></colgroup>');
	            for (i = 0; i < vmTrade.curStockPrice.askBook.length; i++) {
	                s._('<tr><td>卖' + vmTrade.curStockPrice.askBookIdx[i] + '</td><td class="txt-r">' + vmTrade.curStockPrice.askBook[i].price.toFixed(2) + '</td><td class="txt-r">' + numberFormat(vmTrade.curStockPrice.askBook[i].volume) + '</td></tr>');
	            }
	            s._('</table>');
	            s._('<table border="0" cellpadding="0" cellspacing="0" class="mt30">');
	            s._('<colgroup><col style="width:40px;"><col style="width:55px;"><col style="width:75px;"></colgroup>');
	            for (i = 0; i < vmTrade.curStockPrice.bidBook.length; i++) {
	                s._('<tr><td>买' + vmTrade.curStockPrice.bidBookIdx[i] + '</td><td class="txt-r">' + vmTrade.curStockPrice.bidBook[i].price.toFixed(2) + '</td><td class="txt-r">' + numberFormat(vmTrade.curStockPrice.bidBook[i].volume) + '</td></tr>');
	            }
	            s._('</table>');
	            s._('</div>');
	            s._('</div>');
	            d.open(s.ts(), {
	                width: 550,
	                notify: function (nt) {
	                    $("#comit-price").blur();
	                    if (nt == 0) {
	                        if (bol) {
	                            vmTrade.selectCategory(1);
	                            clearInterval(buyTimer);
	                        }
	                        return;
	                    }
	                    else {
	                        bol = false;
	                    }
	                    clearInterval(buyTimer);
	                    dialog.close();
	                    vmTrade.restingBuy3();
	                }
	            });
	            vmTrade.restingPrice = vmTrade.curStockPrice.lastPrice.toFixed(2);
	            vmTrade.selectCategory(2);
	            buyTimer = setInterval("vmTrade.loadDialogPrice()", 1000);
	        },
	        restingBuy3: function () {
	            var d = dialog,
                    s = new Text();
	            s._('<h4 class="font24 txt-c">触发买入确认</h4>');
	            s._('<div class="delegation-sure mt20">');
	            s._('<table border="0" cellpadding="0" cellspacing="0">');
	            s._('<tr class="on"><td><label>账户：</label><span>' + vmTrade.accountNumber + '</span></td></tr>');
	            s._('<tr><td><label>名称：</label><span>' + vmTrade.curStockPrice.shortNM + '</span></td></tr>');
	            s._('<tr><td><label>代码：</label><span>' + vmTrade.curStockPrice.ticker + '</span></td></tr>');
	            s._('<tr><td><label>倍数：</label><span>' + (vmTrade.curPV / vmTrade.curPB).toFixed(0) + '倍</span></td></tr>');
	            s._('<tr><td><label>数量：</label><span>' + vmTrade.maxShare + '股</span></td></tr>');
	            s._('<tr class="on"><td><label>委托时间：</label><span>' + new Date().Format("yyyy-MM-dd HH:mm:ss") + '</span></td></tr>');
	            s._('<tr><td><label>买入金额：</label><span>' + vmTrade.curPV + '</span></td></tr>');
	            s._('<tr><td><label>委托价格：</label><span>' + vmTrade.restingPrice + '</span></td></tr>');
	            s._('<tr><td><label>止损金额：</label><span>' + vmTrade.curSLPrice + '元</span></td></tr>');
	            s._('<tr><td><label>保证金额：</label><span>' + vmTrade.curPB + '元</span></td></tr>');
	            s._('</table></div>');
	            s._('<div class="red tips-pop">风险提示：我们将接受您的请求，将在' + vmTrade.restingPrice + '元的价位发起此次股票的点买策略，最终买入价格以实际成交价格为准，股市行情变化快速，当您资金量较大时，请谨慎使用此功能，以避免不需要的损失！>>></div>');
	            s._('<div class="btn-group txt-c clear">');
	            s._('<button class="btn btn-ok btn1" id="comit-restingSubmitBuy" type="button" dialog-btn-notify="#di#,1">确认</button>');
	            s._('<button class="btn btn-delete btn2" id="comit-restingBuyCancel" type="button" dialog-btn-notify="#di#,2">取消</button>');
	            s._('</div>');
	            d.open(s.ts(), {
	                width: 550,
	                notify: function (nt) {
	                    $("#comit-restingSubmitBuy").blur();
	                    $("#comit-restingBuyCancel").blur();
	                    if (nt == 0) {
	                        vmTrade.selectCategory(1);
	                        return;
	                    }
	                    if (nt == 1) {
	                        vmTrade.isBusy = true;
	                        $.ajax({
	                            url: "ashx/TradeHandler.ashx?action=submitBuy",
	                            type: "POST",
	                            data: {
	                                ticker: vmTrade.curStockPrice.ticker,
	                                pv: vmTrade.curPV,
	                                pb: vmTrade.curPB,
	                                sp: vmTrade.curPV / 10000 * vmTrade.curSP,
	                                sl: vmTrade.curSLPrice,
	                                buyQuantity: vmTrade.maxShare,
	                                buyPrice: vmTrade.stockPrice,
	                                restingPrice: vmTrade.restingPrice,
	                                initPrice: vmTrade.initPrice,
	                                initQuantity: vmTrade.initQuantity,
	                                category: vmTrade.category
	                            },
	                            success: function (data) {

	                                vmTrade.isBusy = false;

	                                if (data.code === 1) {
	                                    if (vmTrade.category == 1) {
	                                        //点买成功后，立即切换至点卖页面
	                                        vmTrade.selectTab(2);
	                                        dialog.close();
	                                        dialog.alert("买入" + vmTrade.curStockPrice.shortNM + "委托成功", 2, {
	                                            title: "温馨提示",
	                                            width: 420
	                                        });
	                                    }
	                                    else if (vmTrade.category == 2) {
	                                        //挂单成功后，立即切换至挂单页面
	                                        vmTrade.selectTab(4);
	                                        dialog.close();
	                                        dialog.alert("触发买入" + vmTrade.curStockPrice.shortNM + "成功", 2, {
	                                            title: "温馨提示",
	                                            width: 420
	                                        });
	                                    }
	                                } else {
	                                    dialog.alert("买入" + vmTrade.curStockPrice.shortNM + "委托失败：" + data.msg, 1, {
	                                        title: "温馨提示",
	                                        width: 420
	                                    });
	                                    return false;
	                                }
	                                return false;
	                            },
	                            error: function (xOptions, textStatus) {
	                                console.log(textStatus);
	                                vmTrade.isBusy = false;
	                            }
	                        });
	                    }
	                    if (nt == 2) {
	                        dialog.close();
	                        return false;
	                    }
	                    //dialog.close();
	                }
	            });
	        },
	        //挂单买入弹窗行情数据加载
	        loadDialogPrice: function () {
	            var s = new Text();
	            s._('<table border="0" cellpadding="0" cellspacing="0">');
	            s._('<colgroup><col style="width:40px;"><col style="width:55px;"><col style="width:75px;"></colgroup>');
	            for (i = 0; i < vmTrade.curStockPrice.askBook.length; i++) {
	                s._('<tr><td>卖' + vmTrade.curStockPrice.askBookIdx[i] + '</td><td class="txt-r">' + vmTrade.curStockPrice.askBook[i].price.toFixed(2) + '</td><td class="txt-r">' + numberFormat(vmTrade.curStockPrice.askBook[i].volume) + '</td></tr>');
	            }
	            s._('</table>');
	            s._('<table border="0" cellpadding="0" cellspacing="0"  class="mt30">');
	            s._('<colgroup><col style="width:40px;"><col style="width:55px;"><col style="width:75px;"></colgroup>');
	            for (i = 0; i < vmTrade.curStockPrice.bidBook.length; i++) {
	                s._('<tr><td>买' + vmTrade.curStockPrice.bidBookIdx[i] + '</td><td class="txt-r">' + vmTrade.curStockPrice.bidBook[i].price.toFixed(2) + '</td><td class="txt-r">' + numberFormat(vmTrade.curStockPrice.bidBook[i].volume) + '</td></tr>');
	            }
	            s._('</table>');
	            $("#dialogDivPrice").html(s.ts());
	            $("#restingLastPrice").val(vmTrade.curStockPrice.lastPrice.toFixed(2));
	        },
	        //点买
	        submitBuy: function (e) {
	            $(this).blur();
	            e = e || window.event;
	            if (e.stopPropagation) { //W3C阻止冒泡方法
	                e.stopPropagation();
	            } else {
	                e.cancelBubble = true; //IE阻止冒泡方法
	            }
	            if (vmTrade.isBusy) {
	                return false;
	            }
	            if (!vmTrade.isTradeTime) {
	                dialog.alert("非交易时间，不允许操作，请稍后再试", 0, {
	                    title: "温馨提示",
	                    width: 420
	                });
	                return false;
	            }

	            if (vmTrade.curStockPrice.stockRisk.length) {
	                dialog.alert("高风险，暂时不能交易", 0, {
	                    title: "温馨提示",
	                    width: 420
	                });
	                return false;
	            }

	            var agree = $("#agree").is(":checked");
	            if (!agree) {
	                dialog.alert('请阅读并同意以下协议:<br><br><a href="zfbz.html" target="_blank" class="txt-s12">《策略人参与沪深A股交易合作涉及费用及资费标准》</a><br><a href="hzxy.html" target="_blank" class="txt-s12">《上上策投资人与策略人参与沪深A股交易合作协议》</a><br><a href="fwxy.html" target="_blank" class="txt-s12">《上上策服务协议》</a>', 0, { title: "温馨提示", width: 500 });
	                return false;
	            }

	            var d = dialog,
                    s = new Text();
	            s._('<h4 class="font24 txt-c">买入确认</h4>');
	            s._('<div class="delegation-sure mt20">');
	            s._('<table border="0" cellpadding="0" cellspacing="0">');
	            s._('<tr class="on"><td><label>账户：</label><span>' + vmTrade.accountNumber + '</span></td></tr>');
	            s._('<tr><td><label>名称：</label><span>' + vmTrade.curStockPrice.shortNM + '</span></td></tr>');
	            s._('<tr><td><label>代码：</label><span>' + vmTrade.curStockPrice.ticker + '</span></td></tr>');
	            s._('<tr><td><label>倍数：</label><span>' + (vmTrade.curPV / vmTrade.curPB).toFixed(0) + '倍</span></td></tr>');
	            s._('<tr class="on"><td><label>数量：</label><span>' + vmTrade.maxShare + '股</span></td></tr>');
	            s._('<tr class="on"><td><label>发布时间：</label><span>' + new Date().Format("yyyy-MM-dd HH:mm:ss") + '</span></td></tr>');
	            s._('<tr><td><label>买入金额：</label><span>' + vmTrade.curPV + '</span></td>');
	            s._('<td><label>点买价格：</label><span>' + vmTrade.curStockPrice.lastPrice + '</span></td></tr>');
	            s._('<tr><td><label>止损金额：</label><span>' + vmTrade.curSLPrice + '元</span></td>');
	            s._('<td><label>保证金额：</label><span>' + vmTrade.curPB + '元</span></td></tr>');
	            s._('</table></div>');
	            s._('<div class="btn-group txt-c clear mt30">');
	            s._('<button class="btn btn-ok btn1" id="comit-submitBuy" type="button" dialog-btn-notify="#di#,1">确认</button>');
	            s._('<button class="btn btn-delete btn2" id="comit-buyCancel" type="button" dialog-btn-notify="#di#,2">取消</button>');
	            s._('</div>');
	            d.open(s.ts(), {
	                width: 550,
	                notify: function (nt) {
	                    $("#comit-submitBuy").blur();
	                    $("#comit-buyCancel").blur();
	                    if (nt == 0) return;
	                    if (nt == 1) {
	                        vmTrade.isBusy = true;
	                        $.ajax({
	                            url: "ashx/TradeHandler.ashx?action=submitBuy",
	                            type: "POST",
	                            data: {
	                                ticker: vmTrade.curStockPrice.ticker,
	                                pv: vmTrade.curPV,
	                                pb: vmTrade.curPB,
	                                sp: vmTrade.curPV / 10000 * vmTrade.curSP,
	                                sl: vmTrade.curSLPrice,
	                                buyQuantity: vmTrade.maxShare,
	                                buyPrice: vmTrade.stockPrice,
	                                restingPrice: vmTrade.restingPrice,
	                                initPrice: vmTrade.initPrice,
	                                initQuantity: vmTrade.initQuantity,
	                                category: vmTrade.category
	                            },
	                            success: function (data) {

	                                vmTrade.isBusy = false;

	                                if (data.code === 1) {
	                                    if (vmTrade.category == 1) {
	                                        //点买成功后，立即切换至点卖页面
	                                        vmTrade.selectTab(2);

	                                        dialog.alert("买入" + vmTrade.curStockPrice.shortNM + "委托成功", 2, {
	                                            title: "温馨提示",
	                                            width: 420
	                                        });
	                                    }
	                                    else if (vmTrade.category == 2) {
	                                        //挂单成功后，立即切换至挂单页面
	                                        vmTrade.selectTab(4);

	                                        dialog.alert("触发买入" + vmTrade.curStockPrice.shortNM + "成功", 2, {
	                                            title: "温馨提示",
	                                            width: 420
	                                        });
	                                    }
	                                } else {
	                                    dialog.alert("买入" + vmTrade.curStockPrice.shortNM + "委托失败：" + data.msg, 1, {
	                                        title: "温馨提示",
	                                        width: 420
	                                    });
	                                }
	                                return false;
	                            },
	                            error: function (xOptions, textStatus) {
	                                console.log(textStatus);
	                                vmTrade.isBusy = false;
	                            }
	                        });
	                    }

	                    dialog.close();
	                }
	            });

	            //dialog.confirm("您确定要买入 " + vmTrade.curStockPrice.shortNM + "吗?", 0, {
	            //    title: "温馨提示",
	            //    width: 420,
	            //    notify: function (nt) {
	            //        if (nt === 1) {
	            //            vmTrade.isBusy = true;
	            //            $.ajax({
	            //                url: "ashx/TradeHandler.ashx?action=submitBuy",
	            //                type: "POST",
	            //                data: {
	            //                    ticker: vmTrade.curStockPrice.ticker,
	            //                    pv: vmTrade.curPV,
	            //                    pb: vmTrade.curPB,
	            //                    sp: vmTrade.curPV / 10000 * vmTrade.curSP,
	            //                    sl: vmTrade.curSLPrice,
	            //                    buyQuantity: vmTrade.maxShare,
	            //                    buyPrice: vmTrade.stockPrice,
	            //                    restingPrice: vmTrade.restingPrice,
	            //                    initPrice: vmTrade.initPrice,
	            //                    initQuantity: vmTrade.initQuantity,
	            //                    category: vmTrade.category
	            //                },
	            //                success: function (data) {

	            //                    vmTrade.isBusy = false;

	            //                    if (data.code === 1) {
	            //                        if (vmTrade.category == 1) {
	            //                            //点买成功后，立即切换至点卖页面
	            //                            vmTrade.selectTab(2);

	            //                            dialog.alert("买入" + vmTrade.curStockPrice.shortNM + "委托成功", 2, {
	            //                                title: "温馨提示",
	            //                                width: 420
	            //                            });
	            //                        }
	            //                        else if (vmTrade.category == 2) {
	            //                            //挂单成功后，立即切换至挂单页面
	            //                            vmTrade.selectTab(4);

	            //                            dialog.alert("买入" + vmTrade.curStockPrice.shortNM + "委托成功", 2, {
	            //                                title: "温馨提示",
	            //                                width: 420
	            //                            });
	            //                        }
	            //                    } else {
	            //                        dialog.alert("买入" + vmTrade.curStockPrice.shortNM + "委托失败：" + data.msg, 1, {
	            //                            title: "温馨提示",
	            //                            width: 420
	            //                        });
	            //                    }
	            //                    return false;
	            //                },
	            //                error: function (xOptions, textStatus) {
	            //                    console.log(textStatus);
	            //                    vmTrade.isBusy = false;
	            //                }
	            //            });
	            //        }
	            //    }
	            //});
	            return false;
	        },
	        //点卖
	        submitSell: function (o) {
	            if (!vmTrade.isTradeTime) {
	                dialog.alert("非交易时间，不允许操作，请稍后再试", 0, {
	                    title: "温馨提示",
	                    width: 420
	                });
	                return false;
	            }

	            var d = dialog,
                    s = new Text();
	            s._('<h4 class="font24 txt-c">卖出确认</h4>');
	            s._('<div class="delegation-sure mt20">');
	            s._('<table border="0" cellpadding="0" cellspacing="0">');
	            s._('<tr class="on"><td><label>账户：</label><span>' + vmTrade.accountNumber + '</span></td></tr>');
	            s._('<tr><td><label>名称：</label><span>' + o.stockName + '</span></td></tr>');
	            s._('<tr><td><label>代码：</label><span>' + o.ticker + '</span></td></tr>');
	            s._('<tr><td><label>倍数：</label><span>' + (o.principalValue / (o.performanceBond - o.additionalFee)).toFixed(0) + '倍</span></td></tr>');
	            s._('<tr class="on"><td><label>数量：</label><span>' + o.quantity + '股</span></td></tr>');
	            s._('<tr><td><label>买入时间：</label><span>' + new Date(o.confirmedTime).Format("yyyy-MM-dd HH:mm:ss") + '</span></td></tr>');
	            s._('<tr class="on"><td><label>持仓时间：</label><span>' + o.positionDays + '天</span></td></tr>');
	            s._('<tr><td><label>买入金额：</label><span>' + o.principalValue + '</span></td>');
	            s._('<td class="' + (o.floatingProfitLoss > 0 ? "red" : "blue") + ' bold"><label>浮动盈亏：</label><span>' + o.floatingProfitLoss.toFixed(2) + '元</span></td></tr>');
	            s._('<tr><td><label>止损金额：</label><span>' + o.stopLoss + '元</span></td>');
	            s._('<td class="' + (o.floatingProfitLoss > 0 ? "red" : "blue") + ' bold"><label>参考价格：</label><span>' + o.lastPrice.toFixed(2) + '元</span></td></tr>');
	            s._('</table></div>');
	            s._('<div class="btn-group txt-c clear mt30">');
	            s._('<button class="btn btn-ok btn1" id="comit-submitSell" type="button" dialog-btn-notify="#di#,1">确认</button>');
	            s._('<button class="btn btn-delete btn2" id="comit-sellCancel" type="button" dialog-btn-notify="#di#,2">取消</button>');
	            s._('</div>');
	            d.open(s.ts(), {
	                width: 550,
	                notify: function (nt) {
	                    $("#comit-submitSell").blur();
	                    $("#comit-sellCancel").blur();
	                    if (nt == 0) return;
	                    if (nt == 1) {
	                        $.ajax({
	                            url: "ashx/TradeHandler.ashx?action=submitSell",
	                            type: "POST",
	                            data: {
	                                contractId: o.contractId,
	                                category: 1,
	                                restingPrice: 0
	                            },
	                            success: function (data) {
	                                vmPos.load();
	                                vmSettlement.load();
	                                if (data.code === 1) {
	                                    dialog.alert("卖出" + o.stockName + "委托成功", 0, {
	                                        title: "温馨提示",
	                                        width: 420
	                                    });
	                                } else {
	                                    dialog.alert("卖出" + o.stockName + "委托失败：" + data.msg, 0, {
	                                        title: "温馨提示",
	                                        width: 420
	                                    });
	                                }
	                                return false;
	                            },
	                            error: function (xOptions, textStatus) {
	                                console.log(textStatus);
	                            }
	                        });
	                    }
	                    dialog.close();
	                }
	            });

	            //dialog.confirm("您确定要全部卖出持仓股票：" + o.stockName + " (" + o.ticker + ") 吗?<br/>当前参考价：" + GetRounding(o.lastPrice, 2).toFixed(2) + "元 浮动盈亏：" + GetRounding(o.floatingProfitLoss, 2).toFixed(2) + "元", 0, {
	            //    title: "温馨提示",
	            //    width: 480,
	            //    notify: function (nt) {
	            //        if (nt === 1) {
	            //            $.ajax({
	            //                url: "ashx/TradeHandler.ashx?action=submitSell",
	            //                type: "POST",
	            //                data: {
	            //                    contractId: o.contractId,
	            //                    category: 1,
	            //                    restingPrice: 0
	            //                },
	            //                success: function (data) {
	            //                    vmPos.load();
	            //                    vmSettlement.load();
	            //                    if (data.code === 1) {
	            //                        dialog.alert("卖出" + o.stockName + "委托成功", 0, {
	            //                            title: "温馨提示",
	            //                            width: 420
	            //                        });
	            //                    } else {
	            //                        dialog.alert("卖出" + o.stockName + "委托失败：" + data.msg, 0, {
	            //                            title: "温馨提示",
	            //                            width: 420
	            //                        });
	            //                    }
	            //                    return false;
	            //                },
	            //                error: function (xOptions, textStatus) {
	            //                    console.log(textStatus);
	            //                }
	            //            });
	            //        }
	            //    }
	            //});
	            return false;
	        },
	        //转让
	        transferSell: function (o) {
	            if (!vmTrade.isTradeTime) {
	                dialog.alert("非交易时间，不允许操作，请稍后再试", 0, {
	                    title: "温馨提示",
	                    width: 420
	                });
	                return false;
	            }
	            dialog.confirm("您确定要全部转让持仓股票：" + o.stockName + " (" + o.ticker + ") 吗?", 0, {
	                title: "温馨提示",
	                width: 480,
	                notify: function (nt) {
	                    if (nt === 1) {
	                        $.ajax({
	                            url: "ashx/TradeHandler.ashx?action=transferSell",
	                            type: "POST",
	                            data: {
	                                contractId: o.contractId
	                            },
	                            success: function (data) {
	                                vmPos.load();
	                                vmSettlement.load();
	                                if (data.code === 1) {
	                                    dialog.alert("持仓股票" + o.stockName + "转让成功", 2, {
	                                        title: "温馨提示",
	                                        width: 420
	                                    });
	                                } else {
	                                    dialog.alert("持仓股票" + o.stockName + "转让失败：" + data.msg, 1, {
	                                        title: "温馨提示",
	                                        width: 420
	                                    });
	                                }
	                                return false;
	                            },
	                            error: function (xOptions, textStatus) {
	                                console.log(textStatus);
	                            }
	                        });
	                    }
	                }
	            });
	            return false;
	        },
	        subPrice2: function (prevClosePrice) {
	            vmTrade.restingPrice = $("#sellRestingPrice").val().trim();
	            if (!validator.isNumber(vmTrade.restingPrice)) {
	                vmTrade.restingPrice = $("#restingLastPrice").val();
	            }
	            vmTrade.restingPrice = (parseFloat(vmTrade.restingPrice) - 0.01).toFixed(2);
	            if (parseFloat(vmTrade.restingPrice) >= parseFloat((prevClosePrice * 0.9).toFixed(2))) {
	                $("#sellRestingPrice").val(vmTrade.restingPrice);
	            }
	        },
	        addPrice2: function (prevClosePrice) {
	            vmTrade.restingPrice = $("#sellRestingPrice").val().trim();
	            if (!validator.isNumber(vmTrade.restingPrice)) {
	                vmTrade.restingPrice = $("#restingLastPrice").val();
	            }
	            vmTrade.restingPrice = (parseFloat(vmTrade.restingPrice) + 0.01).toFixed(2);
	            if (parseFloat(vmTrade.restingPrice) <= parseFloat((prevClosePrice * 1.1).toFixed(2))) {
	                $("#sellRestingPrice").val(vmTrade.restingPrice);
	            }
	        },
	        setPrice2: function (prevClosePrice) {
	            vmTrade.restingPrice = $("#sellRestingPrice").val().trim();
	            if (!validator.isNumber(vmTrade.restingPrice)) {
	                vmTrade.restingPrice = $("#restingLastPrice").val();
	            }
	            $("#sellRestingPrice").val(vmTrade.restingPrice);
	            if (parseFloat(vmTrade.restingPrice) >= parseFloat((prevClosePrice * 1.1).toFixed(2))) {
	                vmTrade.restingPrice = (prevClosePrice * 1.1).toFixed(2);
	                $("#sellRestingPrice").val(vmTrade.restingPrice);
	            }
	            if (parseFloat(vmTrade.restingPrice) <= parseFloat((prevClosePrice * 0.9).toFixed(2))) {
	                vmTrade.restingPrice = (prevClosePrice * 0.9).toFixed(2);
	                $("#sellRestingPrice").val(vmTrade.restingPrice);
	            }
	        },
	        //挂单卖出
	        restingSell: function (o) {
	            if (!isShowRiskTip2) {
	                var d = dialog,
                     s = new Text();
	                s._('<h4 class="font24 red txt-c">风险提示</h4>');
	                s._('<div class="risk-warning">当实盘成交价出现该触发价时，<b class="bold blue">投资人会以该触发时间发起市价卖出，最终成交的价格以实际成交价格为准</b>，而非以设置的触发价为准，如有疑问可申请交割单，该功能与券商委托挂单有很大的区别，请谨慎使用！如阅毕并确认无误，点击确认按钮，此次触发卖出生效。</div>');
	                s._('<div class="checkbox checkbox2">');
	                s._('<input type="checkbox" id="ckTip2" name="checkboox[]">');
	                s._('<label for="ckTip2">以后不再提醒</label></div>');
	                s._('<div class="txt-c mt20"><input id="comit-tip" class="btn btn-sure sure" type="button" dialog-btn-notify="#di#,1" value="确 认"></div>');
	                d.open(s.ts(), {
	                    width: 550,
	                    notify: function (nt) {
	                        $("#comit-tip").blur();
	                        if (nt == 0) return;
	                        var ckTip = $("#ckTip2").is(":checked");
	                        if (ckTip) {
	                            cookies.setCookie("IsShowRiskTip2", false);
	                            isShowRiskTip2 = true;
	                        }
	                        dialog.close();
	                        vmTrade.restingSell2(o);
	                    }
	                });
	            }
	            else {
	                vmTrade.restingSell2(o);
	            }
	        },
	        restingSell2: function (o) {
	            var d = dialog,
                    s = new Text();
	            s._('<h4 class="font24 txt-c">触发卖出</h4>');
	            s._('<div class="clear mt30">');
	            s._('<div class="delegation-left fl txt-c">');
	            s._('<input type="text" placeholder="' + o.stockName + '" class="agu blue-agu" disabled style="cursor:default"">');
	            s._('<p><input id="restingLastPrice" type="text" placeholder="' + o.lastPrice.toFixed(2) + '" class="agu blue-agu" disabled style="cursor:default"></p>');
	            s._('<p class="clear money-input sale-input"><i class="fl" onclick="vmTrade.subPrice2(' + o.prevClosePrice + ')"><img src="images/minus.png"></i><input id="sellRestingPrice" onchange="vmTrade.setPrice2(' + o.prevClosePrice + ')" type="text" value="' + o.lastPrice.toFixed(2) + '"><i class="fr" onclick="vmTrade.addPrice2(' + o.prevClosePrice + ')"><img src="images/plus.png"></i></p>');
	            s._('<input id="comit-price" type="button" class="btn btn-delega blue-delega" dialog-btn-notify="#di#,1" value="确 认">');
	            s._('<p class="clear mt20 pl-pr10"><span class="fl red">涨停' + (o.prevClosePrice * 1.1).toFixed(2) + '</span><span class="fr blue">跌停' + (o.prevClosePrice * 0.9).toFixed(2) + '</span></p>');
	            s._('</div>');
	            s._('<div id="dialogDivPrice" class="delegation-right fr blue-delega-right">');
	            s._('</div>');
	            s._('</div>');
	            d.open(s.ts(), {
	                width: 550,
	                notify: function (nt) {
	                    $("#comit-price").blur();
	                    if (nt == 0) {
	                        clearInterval(sellTimer);
	                        return;
	                    }
	                    vmTrade.restingPrice = $("#sellRestingPrice").val().trim();
	                    clearInterval(sellTimer);
	                    dialog.close();
	                    vmTrade.restingSell3(o);
	                }
	            });
	            vmTrade.loadSellDialogPrice(o.ticker);
	            sellTimer = setInterval("vmTrade.loadSellDialogPrice(" + o.ticker + ")", 1000);
	        },
	        restingSell3: function (o) {
	            var d = dialog,
                  s = new Text();
	            s._('<h4 class="font24 txt-c">触发卖出确认</h4>');
	            s._('<div class="delegation-sure mt20">');
	            s._('<table border="0" cellpadding="0" cellspacing="0">');
	            s._('<tr class="on"><td><label>账户：</label><span>' + vmTrade.accountNumber + '</span></td></tr>');
	            s._('<tr><td><label>名称：</label><span>' + o.stockName + '</span></td></tr>');
	            s._('<tr><td><label>代码：</label><span>' + o.ticker + '</span></td></tr>');
	            s._('<tr><td><label>倍数：</label><span>' + (o.principalValue / (o.performanceBond - o.additionalFee)).toFixed(0) + '倍</span></td></tr>');
	            s._('<tr class="on"><td><label>数量：</label><span>' + o.quantity + '股</span></td></tr>');
	            s._('<tr><td><label>委托时间：</label><span>' + new Date().Format("yyyy-MM-dd HH:mm:ss") + '</span></td></tr>');
	            s._('<tr><td><label>买入时间：</label><span>' + new Date(o.confirmedTime).Format("yyyy-MM-dd HH:mm:ss") + '</span></td></tr>');
	            s._('<tr class="on"><td><label>持仓时间：</label><span>' + o.positionDays + '天</span></td></tr>');
	            s._('<tr><td><label>买入金额：</label><span>' + o.principalValue + '</span></td>');
	            s._('<td><label>买入价格：</label><span>' + o.buyPrice.toFixed(2) + '</span></td></tr>');
	            s._('<tr><td><label>止损金额：</label><span>' + o.stopLoss.toFixed(0) + '元</span></td>');
	            s._('<td><label>保证金额：</label><span>' + o.performanceBond.toFixed(0) + '元</span></td></tr>');
	            s._('<tr><td class="' + (vmTrade.restingPrice > o.buyPrice ? "red" : vmTrade.restingPrice < o.buyPrice ? "blue" : "black") + ' bold"><label>委托价格：</label><span>' + vmTrade.restingPrice + '元</span></td>');
	            s._('<td class="' + (vmTrade.restingPrice > o.buyPrice ? "red" : vmTrade.restingPrice < o.buyPrice ? "blue" : "black") + ' bold"><label>参考盈亏：</label><span>' + ((vmTrade.restingPrice - o.buyPrice) * o.quantity).toFixed(2) + '元</span></td></tr>');
	            s._('</table></div>');
	            s._('<div class="blue tips-pop blue-tips">风险提示：我们将接受您的请求，将在' + vmTrade.restingPrice + '元的价位发起此次股票的点卖策略，最终卖出价格以实际成交价格为准，股市行情变化快速，当您资金量较大时，请谨慎使用此功能，以避免不需要的损失！>>></div>');
	            s._('<div class="btn-group txt-c clear">');
	            s._('<button class="btn btn-ok btn3 btn-blue" id="comit-restingSubmitSell" type="button" dialog-btn-notify="#di#,1">确认</button>');
	            s._('<button class="btn btn-delete btn4 btn-blue" id="comit-restingSellCancel" type="button" dialog-btn-notify="#di#,2">取消</button>');
	            s._('</div>');
	            d.open(s.ts(), {
	                width: 550,
	                notify: function (nt) {
	                    $("#comit-restingSubmitSell").blur();
	                    $("#comit-restingSellCancel").blur();
	                    if (nt == 0) return;
	                    if (nt == 1) {
	                        var restingSellPrice = vmTrade.restingPrice;
	                        if (restingSellPrice.length == 0) {
	                            d.alert("请输入挂单价格", 0, { notify: function () { $("#restingSellPrice").focus(); } });
	                            return;
	                        }
	                        if (!/^[+]?\d*\.?\d{0,2}$/.test(restingSellPrice)) {
	                            d.alert("输入价格格式有误", 0, { notify: function () { $("#restingSellPrice").focus(); } });
	                            return;
	                        }
	                        $.ajax({
	                            url: "ashx/TradeHandler.ashx?action=submitSell",
	                            type: "POST",
	                            data: {
	                                contractId: o.contractId,
	                                category: 2,
	                                restingPrice: restingSellPrice
	                            },
	                            success: function (data) {
	                                vmPos.load();
	                                if (data.code === 1) {
	                                    dialog.alert("触发卖出" + o.stockName + "的请求已受理", 2, {
	                                        title: "温馨提示",
	                                        width: 420
	                                    });
	                                } else {
	                                    dialog.alert("触发卖出" + o.stockName + "的请求失败：" + data.msg, 1, {
	                                        title: "温馨提示",
	                                        width: 420
	                                    });
	                                }
	                                return false;
	                            },
	                            error: function (xOptions, textStatus) {
	                                console.log(textStatus);
	                            }
	                        });
	                    }
	                    dialog.close();
	                }
	            });
	        },
	        //挂单卖出弹窗行情数据加载
	        loadSellDialogPrice: function (ticker) {
	            $.ajax({
	                url: "ashx/TradeHandler.ashx?action=getPriceFromSql",
	                type: "POST",
	                data: {
	                    ticker: ticker
	                },
	                success: function (d) {
	                    var s = new Text();
	                    s._('<table border="0" cellpadding="0" cellspacing="0">');
	                    s._('<colgroup><col style="width:40px;"><col style="width:55px;"><col style="width:75px;"></colgroup>');
	                    for (i = 0; i < d.data.askBook.length; i++) {
	                        s._('<tr><td>卖' + FormatIntToCN(Math.abs(i - 5)) + '</td><td class="txt-r">' + d.data.askBook[i].price.toFixed(2) + '</td><td class="txt-r">' + numberFormat(d.data.askBook[i].volume) + '</td></tr>');
	                    }
	                    s._('</table>');
	                    s._('<table border="0" cellpadding="0" cellspacing="0" class="mt30">');
	                    s._('<colgroup><col style="width:40px;"><col style="width:55px;"><col style="width:75px;"></colgroup>');
	                    for (i = 0; i < d.data.bidBook.length; i++) {
	                        s._('<tr><td>买' + FormatIntToCN(i + 1) + '</td><td class="txt-r">' + d.data.bidBook[i].price.toFixed(2) + '</td><td class="txt-r">' + numberFormat(d.data.bidBook[i].volume) + '</td></tr>');
	                    }
	                    s._('</table>');
	                    $("#dialogDivPrice").html(s.ts());
	                    $("#restingLastPrice").val(d.data.lastPrice.toFixed(2));
	                },
	                error: function (xOptions, textStatus) {
	                    console.log(textStatus);
	                }
	            });
	        },
	        //加载业务参数
	        loadTradeSetting: function () {
	            $.ajax({
	                url: "ashx/TradeHandler.ashx?action=getTradeSetting",
	                type: "POST",
	                success: function (data) {
	                    vmTrade.tradeTimeRange = data.tradeTimeRange;
	                    vmTrade.serviceFeeRate = data.serviceFeeRate;
	                    vmTrade.deferFeeRate = data.deferFeeRate;
	                    vmTrade.maxPriceChange = data.maxPriceChange;
	                    vmTrade.syncRate = data.syncRate;
	                    vmTrade.asyncRate = data.asyncRate;

	                    vmTrade.leverage = data.leverage;
	                    vmTrade.SL = data.SL;
	                    vmTrade.SP = data.SP;
	                    vmTrade.PV = data.PV;
	                    //默认选中第一个保证金
	                    vmTrade.setSL(0);
	                },
	                error: function (xOptions, textStatus) {
	                    console.log("业务规则加载失败", textStatus);
	                }
	            });
	        },
	        //补仓
	        addPerformanceBond: function (o) {
	            var d = dialog,
					s = new Text();
	            //s._('<div style="padding:20px">');
	            //s._('<div class="login-box">');
	            //s._('<div style="margin:0px 0px 15px 18px;">当前止损： <span id="spSL">' + o.stopLoss.toFixed(0) + '</span> 元</div>');
	            //s._('<div class="login-box-in">追加金额： <input id="amount" onkeyup="changeLossFee()" type="text" class="ui-input" style="width:150px;" maxLength=10 placeholder="追加金额为100的倍数"> 元</div>');
	            //s._('<div style="margin:0px 0px 10px 18px;">追加后止损： <span id="spDown" class="txt-down">' + o.stopLoss.toFixed(0) + '</span> 元</div>');
	            //s._("</div>");
	            //s._('<div class="login-box-in" style="padding-bottom:20px"><input id="comit-btn" type="button" class="btn btn-dred" dialog-btn-notify="#di#,1" value="提 交"></div>');
	            //s._("</div>");
	            s._('<h4 class="font24 txt-c">追加保证金</h4>');
	            s._('<div class="delegation-sure mt20">');
	            s._('<table border="0" cellpadding="0" cellspacing="0">');
	            s._('<tr class="on"><td><label>账户：</label><span>' + vmTrade.accountNumber + '</span></td></tr>');
	            s._('<tr><td><label>名称：</label><span>' + o.stockName + '</span></td>');
	            s._('<td><label>当前止损金额：</label><span id="spSL">' + o.stopLoss.toFixed(0) + '元</span></td></tr>');
	            s._('<tr><td><label>代码：</label><span>' + o.ticker + '</span></td>');
	            s._('<td><label>追加后止损金额：</label><span id="spDown">' + o.stopLoss.toFixed(0) + '元</span></td></tr>');
	            s._('</table></div>');
	            s._('<div class="add-money txt-c mt50">');
	            s._('<label>追加金额（元）</label>');
	            s._('<input id="amount" onkeyup="changeLossFee()" type="text" placeholder="追加金额为100的倍数">');
	            s._('</div>');
	            s._('<div class="btn-group txt-c clear">');
	            s._('<button class="btn btn-ok btn3 btn-blue" id="comit-submitAddPerformanceBond" type="button" dialog-btn-notify="#di#,1">确认</button>');
	            s._('<button class="btn btn-delete btn4 btn-blue" id="comit-submitCancelPerformanceBond" type="button" dialog-btn-notify="#di#,2">取消</button>');
	            s._("</div>");
	            d.open(s.ts(), {
	                width: 550,
	                notify: function (nt) {
	                    $("#comit-submitAddPerformanceBond").blur();
	                    $("#comit-submitCancelPerformanceBond").blur();
	                    if (nt == 0) return;
	                    if (nt == 1) {
	                        var ao = $("#amount"),
                                an = ao.val();
	                        if (an.length == 0) {
	                            d.alert("请输入追加金额", 0, { notify: function () { ao.focus(); } });
	                            return;
	                        }
	                        if (!/^\+?[1-9][0-9]*$/.test(an)) {
	                            d.alert("输入金额格式有误", 0, { notify: function () { ao.focus(); } });
	                            return;
	                        }
	                        if (parseInt(an) <= 0) {
	                            d.alert("追加金额必须大于0", 0, { notify: function () { ao.focus(); } });
	                            return;
	                        }
	                        if (parseInt(an) % 100 != 0) {
	                            d.alert("追加金额必须为100的倍数", 0, { notify: function () { ao.focus(); } });
	                            return;
	                        }
	                        $.ajax({
	                            url: "ashx/TradeHandler.ashx?action=additionalFee",
	                            type: "POST",
	                            data: {
	                                contractID: o.contractId,
	                                amount: parseInt(an)
	                            },
	                            success: function (data) {

	                                if (data.code === 1) {
	                                    dialog.alert("追加保证金成功", 2, {
	                                        title: "温馨提示",
	                                        width: 420,
	                                        notify: function (n) {
	                                            vmPos.load();
	                                        }
	                                    });
	                                } else {
	                                    dialog.alert("追加保证金失败：" + data.msg, 1, {
	                                        title: "温馨提示",
	                                        width: 420,
	                                        notify: function (n) {
	                                            vmPos.load();
	                                        }
	                                    });
	                                }
	                                return false;
	                            }
	                        });
	                    }
	                    dialog.close();
	                }
	            });
	        },
	        showDeferCondition: function () {
	            var d = dialog,
					s = new Text();
	            s._('<div style="padding:20px;color:#ca9247;">满足以下2个条件，自动递延：<br>1、不是高风险股票<br>2、在交易日14：55，策略满足公式：（浮动盈亏＋保证金）>买入金额*6％ ，并且余额够缴纳递延费。</div>');
	            d.open(s.ts(), {
	                title: "什么是递延条件？",
	                width: 354
	            });
	        },
	        //杠杆比例
	        leverage: [10, 8, 4, 2],
	        //当前选中的杠杆
	        curLeverage: 10,
	        //止损比例设置
	        SL: [-0.8, -0.84, -0.92, -0.96],
	        //设定止损
	        setSL: function (n) {
	            //if (b) {
	            vmTrade.curSL = vmTrade.SL[n];
	            vmTrade.curLeverage = vmTrade.leverage[n];
	            //}
	        },
	        //当前止损位
	        curSL: -0.8,
	        //当前可用止损位
	        ableCurSL: -0.8,
	        //止盈设置
	        SP: [3000, 5000],
	        //设置止盈位
	        setSP: function (v) {
	            vmTrade.curSP = v;
	        },
	        //当前止盈
	        curSP: 3000,
	        //点买金额档位
	        PV: [],
	        //当前点买金额
	        curPV: 10000,
	        //设置点买金额
	        setPV: function (v) {
	            vmTrade.curPV = v;
	        }
	    });
	    vmTrade.getServerTime();
	    avalon.scan();
	    vmTrade.loadTradeSetting();
	    /* modified in 17.08.19, by doublefish start */
	    /*
		slineBuilder.init();
		klineBuilder.init();
		*/
	    /* modified in 17.08.19, by doublefish end */
	    vmTrade.getPrice();
	    vmPos.load();
	    vmRestingOrder.load();
	    vmSettlement.load();
	    //导航菜单显示交易端Tab页
	    vmTrade.selectTab(tabIndex);
	    //从cookies中提取搜索历史

	    //开始实时报价轮询
	    setInterval(function () {
	        vmTrade.getServerTime();
	        if (vmStockSearch.inititalized && !vmTrade.isTradeTime) {
	            return false;
	        }
	        if (lastCode === vmTrade.curStockPrice.securityID && lastTime) {
	            var sec = (new Date().getTime() - lastTime.getTime()) / 1000;
	            if (sec < 2) {
	                return false;
	            }
	        }
	        vmTrade.getPrice();
	        return false;
	    }, 1000);

	    //每分钟刷新一次持仓，主要是保证后台自动强平能及时反映至页面
	    setInterval(function () {
	        if (vmTrade.activeTab === 2) {
	            vmPos.load("k");
	        };
	        if (vmTrade.activeTab === 4) {
	            vmRestingOrder.load();
	        };
	    }, 3000);

	    //初始化动态提示
	    $(".ui-icon-help").each(function () {
	        $(this).tips({ dire: 6 });
	    });
	});

//根据补仓金额重新计算止损
function changeLossFee() {
    var amount = $("#amount").val();
    if (/^\+?[1-9][0-9]*$/.test(amount)) {
        if (parseInt(amount) % 100 != 0) {
            $("#spDown").html("");
        }
        else {
            var sl = parseInt($("#spSL").html()) - parseInt(amount);
            $("#spDown").html(sl);
        }
    }
    else {
        $("#spDown").html("");
    }
}

//数字格式化每三位加逗号
function numberFormat(data) {
    if (data != null) {
        return data.toFixed(0).replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,');
    } else {
        return;
    }
}

//日期格式化
Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "H+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

//保留几位小数四舍五入
function GetRounding(num, digit) {
    var vv = Math.pow(10, digit);
    return Math.round(num * vv) / vv;
}

function FormatIntToCN(i) {
    switch (i) {
        case 1: return "一"; break;
        case 2: return "二"; break;
        case 3: return "三"; break;
        case 4: return "四"; break;
        case 5: return "五"; break;
    }
}
