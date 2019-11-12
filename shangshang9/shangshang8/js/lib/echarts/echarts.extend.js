/* requires start */
if (!Date.prototype.ToString) {
	Date.prototype.ToString = function (format) {
		var o = {
			"M+": this.getMonth() + 1, //month 
			"d+": this.getDate(), //day 
			"h+": this.getHours(), //hour 
			"m+": this.getMinutes(), //minute 
			"s+": this.getSeconds(), //second 
			"q+": Math.floor((this.getMonth() + 3) / 3), //quarter 
			"S": this.getMilliseconds() //millisecond 
		}

		if (/(y+)/.test(format)) {
			format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
		}

		for (var k in o) {
			if (new RegExp("(" + k + ")").test(format)) {
				format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
			}
		}
		return format;
	};
}

/* requires end */

echarts.extend = {
	chartK: {
		charts: {},
		setting: { showX: false, showY: false },
		init: function (selector, json, full, option) {
			$.extend(this.setting, option || {});
			if (!json || !json.records) {
				return false;
			}
			var chart = echarts.init($(selector).get(0));

			var xdata = [], ydata = [];
			//var kmin = json.records[0][3], kmax = json.records[0][2];
			//var count = 0;
			var records = json.records;
			var len = records.length, item;
			// 取最后60个
			var startIndex = len > 60 ? 60 : len;
			var record = json.records[len - startIndex];
			var kmin = record[3], kmax = record[2];
			for (var i = 0; i < startIndex; i++) {
				item = records[len - startIndex + i];
				xdata.push(item[0]);
				//开盘，收盘，最低，最高
				var yarry = [item[1], item[4], item[3], item[2]];
				ydata.push(yarry);

				kmin = Math.min(kmin, item[3]);
				kmax = Math.max(kmax, item[2]);
			}
			full = full || startIndex;
			for (var j = 0; j < full - xdata.length; j++) {
				xdata.push("-");
				ydata.push(["-", "-", "-", "-"]);
			}
			var kminv = kmin - ((kmax - kmin)),
				kmaxv = kmax + ((kmax - kmin));
			var config = {
				title: { show: false },
				grid: { x: 0, x2: 0, y: 0, y2: 0, borderColor: "#ccc" },
				tooltip: {
					trigger: 'axis',
					borderColor: "#ccc",
					showDelay: 10,
					hideDelay: 10,
					transitionDuration: 0.1,
					borderWidth: 1,
					backgroundColor: "#ffffff",
					textStyle: { color: "#666", fontSize: 11, fontFamily: "微软雅黑" },
					padding: 10,
					formatter: function (data) {
						var date = new Date(data[0].name);
						if (data[0].data[0] === "-") {
							date = new Date();
						}
						var dom = date.ToString("yyyy年MM月dd日");
						if (data[0].data[0] === 0) {
							//开盘，收盘，最低，最高
							dom += "<br/>开盘：<span style='color:#F96900;'>" + data[0].data[0] + "</span>";
						}
						dom += "<br/>最高：<span style='color:#DD2200;'>" + data[0].data[3] + "</span>";
						dom += "<br/>最低：<span style='color:#00A800;'>" + data[0].data[2] + "</span>";
						dom += "<br/>收盘：<span style='color:#F96900;'>" + data[0].data[1] + "</span>";
						return dom;
					},
					axisPointer: {
						type: 'line',
						lineStyle: { width: 1, type: 'solid', color: '#ccc' }
					}
				},
				legend: { show: false, data: ['-'] },
				toolbox: { show: false },
				calculable: false,
				dataZoom: { show: false, realtime: true, start: 0, end: 100 },
				xAxis: [
					{
						show: false,
						type: 'category',
						boundaryGap: true,
						data: xdata,
						axisLine: { show: false },
						axisTick: { show: false },
						splitNumber: 2,
						splitLine: {
							show: true,
							lineStyle: { width: 1, type: 'dashed', color: ['#ccc'] }
						}
					}
				],
				yAxis: [
					{
						show: false,
						type: 'value',
						position: "left",
						scale: true,
						boundaryGap: [0.01, 0.01],
						axisLabel: {
							show: false,
							formatter: function (data) {
								return data.toFixed(2);
							},
							textStyle: { color: '#c8c8c8' }
						},
						//min: kminv,//kmin - ((kmax - kmin) / 5),//kmin * 0.93,
						//max: kmaxv,//kmax + ((kmax - kmin) / 5),//kmax * 1.16,
						splitNumber: 4,
						axisLine: { show: false },
						axisTick: { show: false },
						splitLine: {
							show: true,
							lineStyle: { width: 1, type: 'dashed', color: ['#ccc'] }
						}
					},
					{
						show: false,
						type: 'value',
						position: "right",
						scale: true,
						boundaryGap: [0.01, 0.01],
						axisLabel: {
							show: false,
							formatter: function (data) {
								return data.toFixed(2);
							},
							textStyle: { color: '#c8c8c8' }
						},
						splitNumber: 4,
						//axisLine: { show: false },
						splitLine: { lineStyle: { width: 1, type: 'solid', color: 'rgba(150,150,150,0.1)' } },
						axisLine: { lineStyle: { width: 1, type: 'solid', color: 'rgba(150,150,150,0.1)' } }
					}
				],
				series: [
					{
						name: '上证指数',
						type: 'k',
						smooth: false,
						itemStyle: {
							normal: {
								areaStyle: { type: 'default', color: "#C4E1FF" },
								color: "#DD2200",
								colorO: "#00A800",
								lineStyle: { width: 2, color: '#DD2200',/*阳线边框颜色*/color0: '#00A800'/*阴线边框颜色*/ }
							},
							emphasis: {
								color: 'black',/*阳线填充颜色*/
								color0: 'white'/*阴线填充颜色*/
							}
						},
						//data: ydata,/*开盘，收盘，最低，最高*/
						symbol: "none"
					}
				]
			};
			config.yAxis[0].min = kmin - (kmax - kmin) / 5;//* 0.93;
			config.yAxis[0].max = kmax + (kmax - kmin) / 5;//* 1.16;
			config.yAxis[1].min = kmin - (kmax - kmin) / 5;
			config.yAxis[1].max = kmax + (kmax - kmin) / 5;
			config.series[0].data = ydata;
			if (this.setting.showX) {
				config.xAxis[0].show = true;
				config.grid.y = 0;
				config.grid.y2 = 5;
			}
			if (this.setting.showY) {
				config.yAxis[0].show = true;
				config.yAxis[1].show = true;
				config.grid.x = 0;
				config.grid.x2 = 5;
			}
			chart.setOption(config);
			$(selector).css("background", "none");
			this.charts[selector] = chart;
		}
	},
	chartLine: {
		charts: {},
		setting: { showX: false, showY: false, showY1: false },
		init: function (selector, json, full, option) {
			$.extend(this.setting, option || {});
			if (!json || !json.records) {
				return false;
			}
			var chart = echarts.init($(selector).get(0));

			var xdata = [], ydata = [];
			var ymin, ymax;
			$.each(json.records, function (i, n) {
				if (i === 0) {
					ymin = ymax = n[1];
				}
				xdata.push(n[0]);
				ymin = ymin > n[1] ? n[1] : ymin;
				ymax = ymax < n[1] ? n[1] : ymax;
				ydata.push(n[1]);
			});
			var a = ymin, b = json.y_close, c = ymax;
			var ab = Math.abs(b - a);
			var cb = Math.abs(c - b);

			var speed = ab > cb ? ab : cb;//中心线
			//console.log(speed, b);
			//var min = a > b ? (b > c ? c : b) : a;
			var abc = [a, b, c];
			for (var i = abc.length; i > -1; i--) {
				if (!abc[i]) {
					abc.splice(i, 1);
				}
			}
			var min = Math.min.apply(null, abc);
			if (a >= b && c >= b) {
				min = min - speed;
			}
			//ymin = 0;
			//ymax = speed * 2;
			ymin = json.y_close - speed * 1.2;
			ymax = json.y_close * 1 + speed * 1.2;
			for (var i = 0; i < ydata.length; i++) {
				//ydata[i] = ydata[i] - min
			}
			full = full || 242;
			for (var j = 0; j < full - xdata.length; j++) {
				xdata.push("-");
				ydata.push("-");
			}
			var markLineData = [
				[
					{ name: '', xAxis: 0, yAxis: json.y_close },
					{ name: '', xAxis: xdata.length - 1, yAxis: json.y_close }
				]
			];
			//ymax = ymax * 1.01;
			//ymin = ymin * 0.99;
			//var markLineData = [
			//     [
			//          { name: '昨日收盘', xAxis: 0, yAxis: json.y_close },
			//          { name: json.y_close, xAxis: xdata.length - 1, yAxis: json.y_close }
			//     ]
			//];
			var config = {
				animation: false,
				title: { show: false },
				grid: { x: 0, x2: 0, y: 0, y2: 0, borderColor: "#eee" },
				tooltip: {
					trigger: 'axis',
					borderColor: "#ccc",
					showDelay: 10,
					hideDelay: 10,
					transitionDuration: 0.1,
					borderWidth: 1,
					backgroundColor: "#ffffff",
					textStyle: { color: "#666", fontSize: 11, fontFamily: "微软雅黑" },
					padding: 10,
					formatter: function (data) {
						var date = new Date(data[0].name);
						var price = data[0].data;
						var dom = date.ToString("yyyy年MM月dd日");
						if (price === "-") {
							dom = new Date().ToString("yyyy年MM月dd日");
							dom += "<br/>时间：-";
							dom += "<br/>价格：-";
							dom += "<br/>涨跌：-";
							dom += "<br/>涨跌幅：-";
						}
						else {
							//price = parseFloat(price)+parseFloat( min);
							price = parseFloat(price);
							var p = (price - json.y_close).toFixed(2);
							var pr = (p / json.y_close * 100).toFixed(2) + "%";
							dom += "<br/>时间：" + date.ToString("hh:mm:ss");
							dom += "<br/>价格：<span style='color:#F96900;'>" + price.toFixed(2) + "</span>";
							dom += "<br/>涨跌：<span style='color:" + (p > 0 ? "red" : "green") + ";'>" + p + "</span>";
							dom += "<br/>涨跌幅：<span style='color:" + (p > 0 ? "red" : "green") + ";'>" + pr + "</span>";
						}
						return dom;
					},
					axisPointer: {
						lineStyle: { width: 1, type: 'solid', color: '#ccc' }
					}
				},
				legend: { show: false, data: ['-'] },
				toolbox: { show: false },
				calculable: false,
				xAxis: [
					{
						show: false,
						type: 'category',
						boundaryGap: false,
						data: xdata,
						axisLine: { show: false },
						axisTick: { show: false },
						splitNumber: 0,
						splitLine: {
							show: false,
							lineStyle: { width: 1, type: 'dashed', color: ['#ccc'] }
						}
					}
				],
				yAxis: [
					{
						show: false,
						type: 'value',
						//position: 'left',
						min: ymin,
						max: ymax,
						boundaryGap: false,
						splitNumber: 4,
						axisLine: { show: false },
						axisTick: { show: false },
						axisLabel: {
							formatter: function (data) {
								return data.toFixed(2);
							},
							textStyle: {
								color: function (data) {
									var d = 1 * (+data).toFixed(2);
									if (d > json.y_close) return '#dd2200';
									if (d < json.y_close) return '#33aa60';
									if (json.y_close === "--") return '#c8c8c8';
									return '#c8c8c8';
								}
							}
						},
						splitLine: {
							show: true,
							lineStyle: { width: 1, type: 'dashed', color: ['#ccc'] }
						}
					},
					{
						show: false,
						type: 'value',
						position: 'right',
						min: (ymin - json.y_close) / json.y_close * 100,
						max: (ymax - json.y_close) / json.y_close * 100,
						boundaryGap: false,
						splitLine: { lineStyle: { color: '#f1f1f1', width: 1, type: 'solid' } },
						axisLine: { lineStyle: { color: '#f1f1f1', width: 0, type: 'solid' } },
						splitNumber: 4,
						axisLabel: {
							formatter: function (data) { return Math.abs(data).toFixed(2) + "%"; },
							textStyle: {
								color: function (data) {
									if (json.y_close === "--") return '#c8c8c8';
									var d = 1 * parseFloat(data).toFixed(3);
									if (d >= 0.001) return '#dd2200';
									if (d < 0) return '#33aa60';
									return '#c8c8c8';
								}
							}
						}
					}
				],
				series: [
					{
						name: '-',
						type: 'line',
						smooth: false,
						itemStyle: {
							normal: {
								areaStyle: { type: 'default' },
								color: "#d5e1f2",
								borderColor: "#3b98d3",
								lineStyle: { width: 1, color: ['#3b98d3'] }
							}
						},
						data: ydata,
						symbol: "circle",
						symbolSize: 1,
						markLine: {
							symbol: "none",
							clickable: false,
							large: true,
							itemStyle: {
								normal: {
									lineStyle: { width: 1, type: 'dashed', color: ['#F96900'] }
								}
							},
							data: markLineData
						}
					}
				]
			};
			if (this.setting.showX) {
				config.xAxis[0].show = true;
				config.grid.y = 5;
				config.grid.y2 = 5;
			}
			if (this.setting.showY) {
				config.yAxis[0].show = true;
				config.yAxis[1].show = true;
				config.grid.x = 40;
				config.grid.x2 = 45;
			}
			else if (this.setting.showY1) {
				config.yAxis[0].show = true;
				config.yAxis[1].show = true;
				config.grid.x = 0;
				config.grid.x2 = 0;
				config.yAxis[0].axisLabel.margin = -30;
				config.yAxis[1].axisLabel.margin = -40;
			}
			chart.setOption(config);
			$(selector).css("background", "none");
			this.charts[selector] = chart;
		},
		push: function (json, full) {
			//console.log(this.chart);
			if (!this.chart) return;
			if (!json || !json.records)
				return false;
			var option = this.chart.getOption();
			var xdata = [], ydata = [];
			var ymin, ymax;
			$.each(json.records, function (i, n) {
				if (i === 0) {
					ymin = ymax = n[1];
				}
				xdata.push(n[0]);
				ymin = ymin > n[1] ? n[1] : ymin;
				ymax = ymax < n[1] ? n[1] : ymax;
				ydata.push(n[1]);
			});

			var a = ymin, b = json.y_close, c = ymax;
			var ab = Math.abs(b - a);
			var cb = Math.abs(c - b);

			var speed = ab > cb ? ab : cb;//中心线
			console.log(speed, b);
			//var min = a > b ? (b > c ? c : b) : a;
			var abc = [a, b, c];
			for (var i = abc.length; i > -1; i--) {
				if (!abc[i]) {
					abc.splice(i, 1);
				}
			}
			var min = Math.min.apply(null, abc);

			if (a >= b && c >= b) {
				min = min - speed;
			}
			ymin = 0;
			ymax = speed * 2;

			for (var i = 0; i < ydata.length; i++) {
				ydata[i] = ydata[i] - min;
			}

			full = full || 270;
			for (var j = 0; j < full - xdata.length; j++) {
				xdata.push("-");
				ydata.push("-");
			}
			var markLineData = [
				[
					{ name: '', xAxis: 0, yAxis: speed },
					{ name: '', xAxis: xdata.length - 1, yAxis: speed }
				]
			];
			//ymax = ymax * 1.01;
			//ymin = ymin * 0.99;
			option.yAxis[0].min = ymin;
			option.yAxis[0].max = ymax;
			option.xAxis[0].data = xdata;
			option.series[0].data = ydata;
			option.series[0].markLine.data = markLineData;
			this.chart.setOption(option);
		}
	}
};