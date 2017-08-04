// pages/view/pretest/pretest.js
var app = getApp();
Page({
  data:{
  	bookMatch:{},
  	loadding:false,
  	loadLastId:0,
    loadMore:true,
    loadMoreCount:20,
    bookId:0,
    font:app.globalData.weixinUserInfo.code_book_font,
    template_pay:{
			price:0,
			sourceName:"码书阅读",
			sourceNum:0,
			payShow:false,
			clicked:false
			
  	},
  	dailyClicked:false,
  	mockClicked:false,
  	isFistAnswer:false,
  	Unfinished:{
  		answer_id:0,
  		paper_id:0,
  		boole:false
  	},//模拟考试，是否有未完成考试
  },
  onShareAppMessage: function ()
  {
   	var that=this;
		var title = that.data.bookMatch.list[0].paper_name;
		var path = "/pages/view/pretest/pretest?match_id="+that.data.match_id+"&match_sales_id="+that.data.match_sales_id+"&match_sales_name="+that.data.match_sales_name+"&book_id="+that.data.bookId;
		return app.codeBook.onShareAppMessage(title,path,that.data.match_sales_id,that.data.match_sales_name,"小程序码书阅读分享");  
     
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    var that = this; 
    var match_id =  options.match_id;
    var match_sales_id = options.match_sales_id;
    var match_sales_name = options.match_sales_name;
    var page_id=options.page_id;
    this.page_id=options.page_id;
    this.setData({page_id:page_id})
    
    var uid=app.globalData.weixinUserInfo.uid;
    this.uid=app.globalData.weixinUserInfo.uid;
    this.match_id =  options.match_id;
    this.match_sales_id=match_sales_id;
    this.match_sales_name=match_sales_name;
    that.setData(getApp().globalData);
    this.setData({match_id:match_id,match_sales_id:match_sales_id,match_sales_name:match_sales_name})
    that.data.bookId = options.book_id;
    
    //获取应用实例基本信息
    app.codeBook.getBookMatchInfo
    (
        match_id,
        function(res)
        {
        	console.log(res)
        		res.data.match_price=Number(res.data.match_price).toFixed(2)
            that.setData({'template_pay.sourceName':res.data.match_title});
            that.setData({'template_pay.price':res.data.match_price});
        }
    );
    
    //获取应用实例基本信息
    app.codeBook.getPretestPaperInfoById
    (
    		uid,
        page_id,
        function(res)
        {
            that.setData({bookMatch:res.data});
            if(res.data.list[0].isFirst=="true"){
            	that.setData({isFistAnswer:true})
            } 
//          //添加应用实例浏览记录
//          app.codeBook.addBrowser
//          (
//              match_sales_id,
//              match_sales_name,
//              res.data.list[0].paper_name,
//              function(rbs)
//              {
//                that.data.browserId = res.data.list[0].browser_id;
//              }
//          );
            //设置导航标题
              wx.setNavigationBarTitle
              (
                {
                  title:that.data.bookMatch.list[0].paper_name
                }
                
              );
        }
    );
    
    
    
    

  },
  bindTapAnswer:function(e){
  	console.log(e)
  	var that=this;
  	var type=e.currentTarget.id;
  	this.type=type;	  
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
					return false;      	
	      }else{
	      	if(type=="daily"){
						that.mockAnswer(0);		 		
			  	}else if(type=="mock"){
			  		//先判断是否有其他考试正在进行
			  		app.codeBook.checkOtherAnswers(
			  			that.uid,
			  			that.data.page_id,
			  			function(res){
			  				if(res.data.exist_other){
			  					//有其他考试进行，且不是当前题，需要弹出提示
			  					
			  					that.setData({
			  						'Unfinished.booler':true,
			  						'Unfinished.answer_id':res.data.answer_id,
			  						'Unfinished.paper_id':res.data.paper_id,
			  						'Unfinished.seed_id':res.data.seed_id
			  					});
			  				}else{
			  					//没有其他考试进行，或者有其他考试但是是当前题的情况，不弹出，直接进行保存获取试题的操作
			  					that.mockAnswer(1,that.data.page_id);
			  				}
			  			}
			  		)
			  	}
	      }
	     }
    });
  },
  noPre:function(){
  	var that=this;
  	//重新答题,先提交上次答卷
  	this.setData({'Unfinished.booler':false})
  	app.codeBook.submitAnswers(
			that.data.Unfinished.answer_id,
	    function (res) {
	    	//交卷
	    	if(res.success){
	    		//成功 	    		
	    	}else{
	    		//失败
	    	}
	    }
		)
  	that.mockAnswer(1,that.data.page_id);
  },
  yesPre:function(){
  	//继续上次
  	this.setData({'Unfinished.booler':false})
  	this.page_id=this.data.Unfinished.paper_id;
  	this.match_sales_id=this.data.Unfinished.seed_id;
  	this.mockAnswer(1);
  },
  mockAnswer:function(isMock,page_id){
  	var that=this;
  	if(page_id){
  		page_id=page_id;
  	}else{
  		page_id=that.page_id;
  	}
  	  //再次进入试题时，获得上一次的答题数据,如果未答题 id=0,需要调用保存，如果已经答题不需要调用保存
  		app.codeBook.getSaveAnswer(
  			that.uid,
  			page_id,
  			isMock,//日常练习isTime=0，模拟考试isTime=1
  			function(res){
  				console.log(res.data.id)
  				//that.setData({saveAnswer:res.data})
  				if(res.data.id==0){
  					//之前未答过题，调用保存
  					//uid,paper_id,seed_id,Istimekeeping,issubmit
  					app.codeBook.addBeginAnswer(  						
  						that.uid,
  						page_id,
  						that.match_sales_id,
  						isMock,//Istimekeeping（日常练习为0，模拟考试为1）
  						0,//0
  						function(res){
  							console.log(res)
  							var answer_id=res.data.id;
		  					var answer_questions_id=0;
		  					if(isMock){
		  						//模拟考
		  						if(that.data.isFistAnswer){
				  					var toPage = "/pages/view/pretest/mockInfo/mockInfo?isFistAnswer=true&page_id="+page_id+"&answer_id="+answer_id+"&answer_questions_id="+answer_questions_id+"&match_id="+that.match_id+"&match_sales_id="+that.match_sales_id+"&match_sales_name="+that.match_sales_name;
		  							wx.navigateTo({url: toPage});
	  							}else{
	  								var toPage = "/pages/view/pretest/mockInfo/mockInfo?page_id="+page_id+"&answer_id="+answer_id+"&answer_questions_id="+answer_questions_id+"&match_id="+that.match_id+"&match_sales_id="+that.match_sales_id+"&match_sales_name="+that.match_sales_name;
		  							wx.navigateTo({url: toPage});
	  							}
		  					}else{
		  						if(that.data.isFistAnswer){
	  								var toPage = "/pages/view/pretest/dailyInfo/dailyInfo?isFistAnswer=true&match_id="+that.match_id+"&match_sales_id="+that.match_sales_id+"&match_sales_name="+that.match_sales_name+"&page_id="+page_id+"&answer_id="+answer_id+"&answer_questions_id="+answer_questions_id;
									wx.navigateTo({url: toPage});
	  							}else{
	  								var toPage = "/pages/view/pretest/dailyInfo/dailyInfo?match_id="+that.match_id+"&match_sales_id="+that.match_sales_id+"&match_sales_name="+that.match_sales_name+"&page_id="+page_id+"&answer_id="+answer_id+"&answer_questions_id="+answer_questions_id;
									wx.navigateTo({url: toPage});
	  							}
		  					}
		  					
  						}
  					) 					
  				}else{
  					//之前保存过
  					//获取试题
  					var answer_id=res.data.id;
  					var answer_questions_id=res.data.last_submit_question_id;
  					if(isMock){
  						var toPage = "/pages/view/pretest/mockInfo/mockInfo?page_id="+page_id+"&answer_id="+answer_id+"&answer_questions_id="+answer_questions_id+"&match_id="+that.match_id+"&match_sales_id="+that.match_sales_id+"&match_sales_name="+that.match_sales_name;
  						wx.navigateTo({url: toPage});			
  					}else{
  						var toPage = "/pages/view/pretest/dailyInfo/dailyInfo?match_id="+that.match_id+"&match_sales_id="+that.match_sales_id+"&match_sales_name="+that.match_sales_name+"&page_id="+page_id+"&answer_id="+answer_id+"&answer_questions_id="+answer_questions_id;
  						wx.navigateTo({url: toPage});
  					}
  						
  				}
  			}
  		) 
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function()
  {
    var font = app.globalData.weixinUserInfo.code_book_font;
    this.setData({font:font});
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})