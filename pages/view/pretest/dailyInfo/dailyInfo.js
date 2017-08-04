//index.js
//获取应用实例
var template = require("../../../../utils/template.js");
var app = getApp();
var letter = ["A", "B", "C", "D", "E", "F", "G", "K"];
Page({
	data: {
		isLoading: true, //加载
		swiper: {
			active: 0
		},
		answers: {
			isShowRemove: false, //是否显示移除按钮  
			start: 0, //初始题号
			end: 0, //结束题号
			allLists: [], //题号数据
			activeNum: 0, //当前条数
			showActiveNum: 0, //当前显示条数
			onceLoadLength: 5, //一次向俩端加载条数
		},
		threeQuestion: [],
		answerSheetNegative: true,
		error_num: 0,
		multiselect: false,
		dbClick: false,
		canView: true,
		isFirstLeft: true, //判断是否需要付费时，canView有延时，需要在第一次向左滑动时再调是否付费的接口
		payLoading:true

	},
	//单选逻辑
	tapRadio: function(e) {
		var that = this;
		//判断是否为已答题
		if(this.data.threeQuestion[1].answer.user_content) {
			return false;
		}
		var thisOption = e.currentTarget.dataset.option,

			list = this.data.threeQuestion[1].items.map(function(option, i) {
				option.isSelect = false;
				if(thisOption == option.item) {
					if(!option.isSelect) {
						// option.isActive = true;
						option.isSelect = true;
					} else {
						// option.isActive = false;
						option.isSelect = false;
					}
				}

				return option
			});
		// this.data.answers.allLists[this.data.answers.activeNum].options = list;
		this.data.threeQuestion[1].items = list;
		for(var n = 0; n < list.length; n++) {
			if(list[n].isSelect) {
				var nowAnswer = list[n].item;
				that.setData({ nowAnswer: nowAnswer })
			}
		}
		this.tapSelect(e);

	},
	//多选逻辑
	tapCheckbox: function(e) {
		//判断是否为已答题
		var that = this;
		if(this.data.threeQuestion[1].answer.user_content) {
			return false;
		}
		var thisOption = e.currentTarget.dataset.option,
			list = this.data.threeQuestion[1].items.map(function(option, i) {
				if(thisOption == option.item) {
					if(!option.isSelect) {
						// option.isActive = true;
						option.isSelect = true;
					} else {
						// option.isActive = false;
						option.isSelect = false;
					}
				}

				return option
			});

		this.data.threeQuestion[1].items = list;

		var nowAnswer = "";
		that.setData({ multiselect: false })
		for(var n = 0; n < list.length; n++) {
			if(list[n].isSelect) {
				nowAnswer += list[n].item + ",";
				that.setData({ multiselect: true })
			}
		}
		that.setData({ 'threeQuestion[1].items': list });
		that.setData({ nowAnswer: nowAnswer })
	},
	//答案判断逻辑
	tapSelect: function(e) {
		//判断是否为已答题
		var that = this;
		console.log("点：" + that.data.canView)
		if(!that.data.canView) {
			//弹支付
			that.setData({ "template_pay.payShow": true });
			return false;
		}
		if(this.data.threeQuestion[1].answer.user_content) {
			return false;
		}

		that.showAnswer(that.data.threeQuestion[1], that.data.nowAnswer);
		that.setData({ 'threeQuestion[1].answer.allSelect': that.data.threeQuestion[1].answer.allSelect });
		that.setData({ 'threeQuestion[1].question.allRight': that.data.threeQuestion[1].question.allRight });
		app.codeBook.markQuestion(
			that.data.nowAnswer,
			that.data.threeQuestion[1].question.id,
			that.data.threeQuestion[1].question.aqid,
			function(res) {
				if(res.success) {
					that.data.threeQuestion[1].answer.user_content = that.data.nowAnswer;
					that.setData({ 'threeQuestion[1].answer.user_content': that.data.nowAnswer });
					//that.setData({ threeQuestion: that.data.threeQuestion });
					if(that.data.threeQuestion[1].question.num + 1 < that.data.threeQuestion[2].question.num + 1) {
						//setTimeout(() => that.onSwiper('left'), 200);
					}
					//快速双击答题时，会有重复计数现象
					if(that.data.dbClick) {
						return false;
					}
					that.setData({ dbClick: true })
					setTimeout(function() {
						that.setData({ dbClick: false })
					}, 1000)
					if(that.data.threeQuestion[1].answer.user_content) {
						if(that.data.threeQuestion[1].question.allRight == that.data.threeQuestion[1].answer.allSelect) {
							that.setData({ 'threeQuestion[1].answer.mark_right': 1 })
							var right_num = that.data.right_num * 1 + 1;
							that.setData({ right_num: right_num })

						} else {
							that.setData({ 'threeQuestion[1].answer.mark_right': 0 })
							var error_num = that.data.error_num * 1 + 1;
							that.setData({ error_num: error_num })
						}

					}

				}
			}
		)
	},

	//swiper切换
	setEvent: function(e) {

		this.data.swiper.touchstartEvent = e;
		return false;
	},
	//滑动结束
	touchEnd: function(e) {
		var that = this;
		//判断网络
		that.hasNetWork(function(){
			var x = Math.abs(that.data.swiper.touchstartEvent.changedTouches[0].clientX - e.changedTouches[0].clientX);
			if(x > 25) {
				that.onSwiper(that.getDirection(that.data.swiper.touchstartEvent, e));
				return false;
			}
		})

	},
	//swiper切换
	onSwiper: function(dire) {
		var that = this;
		this.active = 0;
		var	storeSetTime;
		this.animationO = wx.createAnimation({
				transformOrigin: "50% 50%",
				duration: 200,
				timingFunction: "linear",
				delay: 0
			})
		this.animationT = wx.createAnimation({
				transformOrigin: "50% 50%",
				duration: 200,
				timingFunction: "linear",
				delay: 0
			})
		this.animationS = wx.createAnimation({
				transformOrigin: "50% 50%",
				duration: 200,
				timingFunction: "linear",
				delay: 0
			})

		if(!this.$isLock) { //锁屏控制

			this.$isLock = true;

			if(dire == 'bottom' || dire == 'top' || !dire) {
				this.$isLock = false;
				return false;
			}

			if(this.data.questions.num >= this.data.questions.totalNum && dire == 'left') { //最后一题
				this.$isLock = false;

				return false;
			}
			if(this.data.questions.num <= 1 && dire == 'right') { //第一题
				this.$isLock = false;
				return false;
			}

			if(dire == 'right') {
				this.hasNetWork(function(){
		      		if(that.data.payLoading){
		      			//判断该资源是否需要付费
						    template.isCanView(that,that.uid,match_sales_id,match_sales_name,function(){
						    	if(!that.data.canView){
						    		//获取付费消息
								    app.codeBook.getBookMatchInfo
								    (
								        match_id,
								        function(res)
								        {
								        	res.data.match_price=Number(res.data.match_price).toFixed(2)
								            that.setData({'template_pay.sourceName':res.data.match_title});
								            that.setData({'template_pay.price':res.data.match_price});
								        }
								    );
								    nextMove();
						    	}
							    
						    });
		      		}else{//付费加载完
		      			nextMove();
		      		}
		      		function nextMove(){
		      			if(!that.data.canView){
							//弹支付
							that.setData({"template_pay.payShow":true});
							that.$isLock = false;
						}else{
							that.animationO.translate3d('0', 0, 0).step();
					        that.animationT.translate3d('100%', 0, 0).step();
					        var toid = that.data.threeQuestion[0].question.aqid;
					        that.setData({ 'threeQuestion[1]': that.data.threeQuestion[0] })
							that.addData(toid);
						}	        
		      		}
		      		
		      	},function(){
		      		that.$isLock = false;
		    	})
			}
			if(dire == 'left') {
				console.log("左：" + that.data.canView)
				this.hasNetWork(function(){//付费加载中
		      		if(that.data.payLoading){
		      			//判断该资源是否需要付费
						    template.isCanView(that,that.uid,match_sales_id,match_sales_name,function(){
						    	if(!that.data.canView){
						    		//获取付费消息
								    app.codeBook.getBookMatchInfo
								    (
								        that.data.match_id,
								        function(res)
								        {
								        	res.data.match_price=Number(res.data.match_price).toFixed(2)
								            that.setData({'template_pay.sourceName':res.data.match_title});
								            that.setData({'template_pay.price':res.data.match_price});
								        }
								    );
								    nextMove();
						    	}
							    
						    });
		      		}else{//付费加载完
		      			nextMove();
		      		}
		      		function nextMove(){
		      			if(!that.data.canView){
							//弹支付
							that.setData({"template_pay.payShow":true});
							that.$isLock = false;
						}else{
							that.animationT.translate3d('-100%', 0, 0).step();
					        that.animationS.translate3d('0', 0, 0).step();
					        var toid = that.data.threeQuestion[2].question.aqid;
					        that.setData({ 'threeQuestion[1]': that.data.threeQuestion[2] })
							that.addData(toid);
						}
		      		}      		
		      	},function(){
		      		//没有网络
		      		that.$isLock = false;
		      	})
			}
		}
	},
	//加载数据
	addData:function(toid){
		var that=this;
		this.data.swiper.animationO = this.animationO.export();
		this.data.swiper.animationT = this.animationT.export();
		this.data.swiper.animationS = this.animationS.export();
		this.data.answers.showActiveNum = this.data.answers.activeNum + this.active;
		this.setData(this.data);
		this.setData({ multiselect: false })
		//加载数据
		this.getTestQuestion(
			that,
			that.data.answer_id,
			toid,
			function(res) {
				var threeQuestion = that.CollatingData(res.data);
				for(var i = 0; i < threeQuestion.length; i++) {
					if(!threeQuestion[i].question.title) {
						continue;
					}
					threeQuestion[i].question.title = JSON.parse(threeQuestion[i].question.title);
					threeQuestion[i].question.tip = JSON.parse(threeQuestion[i].question.tip);
				}
				that.data.threeQuestion[2] = threeQuestion[2];
				that.data.threeQuestion[0] = threeQuestion[0];
				setTimeout(function() {
					that.setHtmlsetHtml(this.active);
				}, 200);

			},

		)

	},
	//修改页面至正常位置
	setHtmlsetHtml: function(active) {
		var animationO = wx.createAnimation({
				transformOrigin: "50% 50%",
				duration: 0,
				delay: 0
			}),
			animationT = wx.createAnimation({
				transformOrigin: "50% 50%",
				duration: 0,
				delay: 0
			}),
			animationS = wx.createAnimation({
				transformOrigin: "50% 50%",
				duration: 0,
				delay: 0
			});
		animationO.translate3d('-100%', 0, 0).step();
		animationT.translate3d('0', 0, 0).step();
		animationS.translate3d('100%', 0, 0).step();
		//this.data.answers.activeNum = this.data.answers.activeNum + active;
		//this.data.answers.showActiveNum = this.data.answers.activeNum;
		this.data.swiper.animationO = animationO;
		this.data.swiper.animationT = animationT;
		this.data.swiper.animationS = animationS;
		this.setData(this.data);

		//调用滑动结束回调
		if(this.isLockCall && typeof this.isLockCall == 'function') {
			this.isLockCall();
			this.isLockCall = false;
		}
		this.$isLock = false;
	},
	//获得手势方向
	getDirection: function(startEvent, endEvent) {
		var x = endEvent.changedTouches[0].clientX - startEvent.changedTouches[0].clientX,
			y = endEvent.changedTouches[0].clientY - startEvent.changedTouches[0].clientY,
			pi = 360 * Math.atan(y / x) / (2 * Math.PI);
		if(pi < 25 && pi > -25 && x > 0 && Math.abs(x) > 10) {
			return 'right';
		}
		if(pi < 25 && pi > -25 && x < 0 && Math.abs(x) > 10) {
			return 'left';
		}
		if((pi < -75 || pi > 750) && y > 0 && Math.abs(y) > 10) {
			return 'bottom';
		}
		if((pi < -75 || pi > 75) && y < 0 && Math.abs(y) > 10) {
			return 'top';
		}
	},
	//解析答案数字编码
	changeAnswer: function(option) {
		var answered;
		switch(option) {
			case 'item1':
				answered = "A ";
				break;
			case 'item2':
				answered = "B ";
				break;
			case 'item3':
				answered = "C ";
				break;
			case 'item4':
				answered = "D ";
				break;
			case 'item5':
				answered = "E ";
				break;
			case 'item6':
				answered = "F ";
				break;
			case 'item7':
				answered = "G ";
				break;
			default:
				console.log('超出设定');
		}

		return answered

	},
	//整理数据
	CollatingData: function(accept) {
		var data = accept;
		var that = this;
		//上一题数据
		var prew = {
			question: {},
			answer: {},
			items: {}
		};
		var now = {
			question: {},
			answer: {},
			items: {}
		};
		var next = {
			question: {},
			answer: {},
			items: {}
		};
		var threeQuestion = [];

		if(data.preSeedPretestAnswerQuestion) {
			prew.question.aqid = data.preSeedPretestAnswerQuestion.id;
			prew.question.id = data.preseedPretestQuestions.seedPretestQuestions.id;
			prew.question.num = data.preSeedPretestAnswerQuestion.number;
			prew.question.title = data.preseedPretestQuestions.seedPretestQuestions.title;
			prew.question.type = data.preseedPretestQuestions.selection;
			prew.question.tip = data.preseedPretestQuestions.seedPretestQuestions.resolution;
			prew.answer.id = data.preSeedPretestAnswerQuestion.answer_id;
			prew.answer.user_content = data.preSeedPretestAnswerQuestion.user_content;
			prew.answer.mark_right = data.preSeedPretestAnswerQuestion.mark_right;
			prew.items = data.preseedPretestQuestions.items;
			if(prew.answer.user_content) {
				this.showAnswer(prew, prew.answer.user_content)
			}

		}

		//本题数据
		now.question.aqid = data.seedPretestAnswerQuestion.id;
		now.question.id = data.seedPretestQuestions.seedPretestQuestions.id;
		now.question.num = data.seedPretestAnswerQuestion.number;
		now.question.title = data.seedPretestQuestions.seedPretestQuestions.title;
		now.question.type = data.seedPretestQuestions.selection;
		now.question.tip = data.seedPretestQuestions.seedPretestQuestions.resolution;
		now.question.allRight = "";
		now.answer.id = data.seedPretestAnswerQuestion.answer_id;
		now.answer.user_content = data.seedPretestAnswerQuestion.user_content;
		now.answer.mark_right = data.seedPretestAnswerQuestion.mark_right;
		now.answer.allSelect = "";
		now.items = data.seedPretestQuestions.items;
		if(now.answer.user_content) {
			this.showAnswer(now, now.answer.user_content)

		}
		//下一题
		if(data.nextSeedPretestAnswerQuestion) {
			next.question.aqid = data.nextSeedPretestAnswerQuestion.id;
			next.question.id = data.nextseedPretestQuestions.seedPretestQuestions.id;
			next.question.num = data.nextSeedPretestAnswerQuestion.number;
			next.question.title = data.nextseedPretestQuestions.seedPretestQuestions.title;
			next.question.type = data.nextseedPretestQuestions.selection;
			next.question.tip = data.nextseedPretestQuestions.seedPretestQuestions.resolution;
			next.question.allRight = "";
			next.answer.id = data.nextSeedPretestAnswerQuestion.answer_id;
			next.answer.user_content = data.nextSeedPretestAnswerQuestion.user_content;
			next.answer.mark_right = data.nextSeedPretestAnswerQuestion.mark_right;
			next.answer.allSelect = "";
			next.items = data.nextseedPretestQuestions.items;
			if(next.answer.user_content) {
				this.showAnswer(next, next.answer.user_content)
			}
		}

		threeQuestion.push(prew);
		threeQuestion.push(now);
		threeQuestion.push(next);
		return threeQuestion;
	},
	showAnswer: function(obj, arr) {
		var that = this;
		var user_content = arr.split(",");
		obj.answer.allSelect = "";
		obj.question.allRight = "";
		for(var i = 0; i < obj.items.length; i++) {
			obj.items[i].isSelect = false;
			for(var j = 0; j < user_content.length; j++) {
				if(user_content[j] == obj.items[i].item) {
					obj.items[i].isSelect = true;
					obj.answer.allSelect += that.changeAnswer(obj.items[i].item);
				}
			}
			if(obj.items[i].correct == "true") {
				obj.question.allRight += that.changeAnswer(obj.items[i].item)
			}
		}
	},

	onLoad(options) {

		var that = this;
		var match_id = options.match_id;
		var match_sales_id = options.match_sales_id;
		var match_sales_name = options.match_sales_name;

		var uid = app.globalData.weixinUserInfo.uid;
		var page_id = options.page_id;
		that.setData({ page_id: page_id, match_id: match_id, match_sales_name: match_sales_name });
		that.data.uid = uid;
		that.data.match_sales_id = match_sales_id
		//第一次答题
		if(options.isFistAnswer) {
			that.setData({ isFistAnswer: true });
		}
		//选项的icon
		that.setData({ letter: letter });
		//获取试题
		var answer_id = options.answer_id;
		var answer_questions_id = options.answer_questions_id;
		that.setData({ answer_id: answer_id })
		that.setData({ answer_questions_id: answer_questions_id })
		this.getTestQuestion(
			that,
			that.data.answer_id,
			that.data.answer_questions_id,
			function(res) {
				var threeQuestion = that.CollatingData(res.data);
				for(var i = 0; i < threeQuestion.length; i++) {
					if(!threeQuestion[i].question.title) {
						continue;
					}
					threeQuestion[i].question.title = JSON.parse(threeQuestion[i].question.title);
					threeQuestion[i].question.tip = JSON.parse(threeQuestion[i].question.tip);
				}
				that.setData({ threeQuestion: threeQuestion })
				if(that.data.isFistAnswer) {
					setTimeout(function() {
						that.setData({ isFistAnswer: false })
					}, 1000);
				}

			}
		)
		//获取正确和错误题目数
		app.codeBook.getAnswerState(
			that.data.answer_id,
			function(res) {
				that.setData({ answerResultsList: res.data.list })

				var right_num = that.needQuestionNum(res.data.list, "mark_right", "1");
				var noanswer_num = that.needQuestionNum(res.data.list, "user_content", "");
				var error_num = that.needQuestionNum(res.data.list, "mark_right", "0") - noanswer_num;

				that.setData({ right_num: right_num, error_num: error_num, noanswer_num: noanswer_num })
			}
		)

		//判断该资源是否需要付费
		template.isCanView(that,uid,match_sales_id,match_sales_name,function(){
			//获取付费消息
		    app.codeBook.getBookMatchInfo
		    (
		        match_id,
		        function(res)
		        {
		        	res.data.match_price=Number(res.data.match_price).toFixed(2)
		            that.setData({'template_pay.sourceName':res.data.match_title});
		            that.setData({'template_pay.price':res.data.match_price});
		        }
		    );
		});
		//获取应用实例基本信息
		app.codeBook.getPretestPaperInfoById(
			uid,
			page_id,
			function(res) {
				that.setData({ bookMatch: res.data });				
				//设置导航标题
				wx.setNavigationBarTitle({
						title: that.data.bookMatch.list[0].paper_name
					}

				);
			}
		);
	},
	getTestQuestion(that, answer_id, answer_questions_id, callback) {
		app.codeBook.getQuestions( //answer_id,answer_questions_id,callback
			answer_id,
			answer_questions_id,
			function(res) {
				that.setData({ questions: res.data })
				//答案
				// var dailyAnswerItems = that.data.questions.seedPretestQuestions.items;
				// var user_content = that.data.questions.seedPretestAnswerQuestion.user_content;//"item1,item3,"
				if(callback) {
					callback(res);
				}

			}
		)
	},

	toggleAnswerSheet: function(e) {
		const that = this
		const ele = e.target.dataset.ele;
		if(ele == 'title') {
			//判断网络
			that.hasNetWork(function(){
				app.codeBook.getAnswerState(
					that.data.answer_id,
					function(res) {
						that.setData({ answerResultsList: res.data.list })
						that.setData({ answerSheetNegative: !that.data.answerSheetNegative })
						var right_num = that.needQuestionNum(res.data.list, "mark_right", "1");
						var noanswer_num = that.needQuestionNum(res.data.list, "user_content", "");
						var error_num = that.needQuestionNum(res.data.list, "mark_right", "0") - noanswer_num;
	
						that.setData({ right_num: right_num, error_num: error_num, noanswer_num: noanswer_num })
					}
				)	
			})			
		} else if(ele == 'mask') {
			that.setData({ answerSheetNegative: !that.data.answerSheetNegative })
		}
	},
	//题目状态数 
	needQuestionNum: function(all, need, judgment) {
		var n = 0

		for(var i = 0; i < all.length; i++) {
			if(all[i][need] == judgment) {
				n++;
			}
		}
		return n
	},
	//再做一次
	answerAgin: function() {

		var that = this;
		var type = that.data.type;
		var answer_id = that.data.answer_id;

		//判断网络
		that.hasNetWork(function(){
			that.setData({ isLoading: false })
			app.codeBook.submitAnswers(
				answer_id,
				function(res) {
					if(res.success) {
						app.codeBook.addBeginAnswer(
							that.data.uid,
							that.data.page_id,
							that.data.match_sales_id,
							0, //Istimekeeping（练习为0，考试为1）
							0, //0
							function(res) {
								var answer_id = res.data.id;
								var answer_questions_id = 0;
								var toPage = "/pages/view/pretest/dailyInfo/dailyInfo?match_id=" + that.data.match_id + "&match_sales_id=" + that.data.match_sales_id + "&match_sales_name=" + that.data.match_sales_name + "&page_id=" + that.data.page_id + "&answer_id=" + answer_id + "&answer_questions_id=0";

								wx.redirectTo({ url: toPage });

							}
						)
					}
				}
			)
		})
	},
	//答题卡跳转
	toquestion: function(e) {
		var that = this;
		var answer_questions_id = e.target.dataset.qid;
		if(!that.data.canView) {
			//弹支付
			that.setData({ "template_pay.payShow": true });
			return false;
		}
		this.getTestQuestion(
			that,
			that.data.answer_id,
			answer_questions_id,
			function(res) {
				var threeQuestion = that.CollatingData(res.data);
				for(var i = 0; i < threeQuestion.length; i++) {
					if(!threeQuestion[i].question.title) {
						continue;
					}
					threeQuestion[i].question.title = JSON.parse(threeQuestion[i].question.title);
					threeQuestion[i].question.tip = JSON.parse(threeQuestion[i].question.tip);
				}
				that.setData({ threeQuestion: threeQuestion });
				that.setData({ answerSheetNegative: true })

			}
		)

	},
	closePayBox: function() {
		this.setData({ "template_pay.payShow": false });
		this.setData({ "template_pay.clicked": false });
	},
	payNow: function() {
		var that = this;
		var seedId = that.data.match_sales_id;
		//点击立即支付后按钮文字变化且不能再点击
		if(that.data.template_pay.clicked) {
			return;
		}
		that.setData({ "template_pay.clicked": true })
		//快速购买并统一下单
		app.codeBook.fastBuySeed(
			seedId,
			4226,
			function(rts) {
				console.log("统一下单成功，回调开始发起支付！");
				//发起支付
				wx.requestPayment({
					'timeStamp': rts.weixinpayinfo.timeStamp,
					'nonceStr': rts.weixinpayinfo.nonceStr,
					'package': rts.weixinpayinfo.package,
					'signType': rts.weixinpayinfo.signType,
					'paySign': rts.weixinpayinfo.paySign,
					'success': function(res) {
						//支付成功
						console.log("支付成功啦");
						that.setData({ canView: true });
						that.setData({ "template_pay.payShow": false });

					},
					'fail': function(res) {
						//支付失败
						console.log("支付失败");
						that.setData({ canView: false });
						that.setData({ "template_pay.clicked": false })
					}
				});
				console.log(rts);
			},
			function(rts) {
				that.setData({ "template_pay.clicked": false })
				that.setData({ "template_pay.payShow": false });
			}
		);
	},
	closeFirstTip: function() {
		that.setData({ isFistAnswer: false })
	},
	hasNetWork:function(callback,failCallback){
		//判断网络
	  	wx.getNetworkType({
		    success: function(res){
		      // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
		      var networkType = res.networkType;
		      if(networkType=="none"){      	
		        wx.showToast({
						  title: '网络异常',
						  duration: 2000
						});  
						if(failCallback){
							failCallback();
						}
		      }else{
		      	if(callback){
		      		callback();
		      	}
		      }
		     }
	    });
	},
	onUnload() { //页面卸载

	}
});