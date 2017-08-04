// pages/view/pretest/pretest.js
var app = getApp();
Page({
  data:{
  	bookMatch:{},
  	loadding:false,
  	loadLastId:0,
    loadMore:true,
    loadMoreCount:20,
    font:app.globalData.weixinUserInfo.code_book_font,
    analysisClick:'',//判断是否点击 全题解析或者错题解析,
    answerResult:{

    },
    resultType:"mock",
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    
    // var match_id =  options.match_id;
     var match_sales_id = options.match_sales_id;
    // var match_sales_name = options.match_sales_name;
    var that = this;  
    var answer_id = options.answer_id;
    var resultType = options.type;
    var page_id=options.page_id;
    that.setData({type:resultType})	
		that.setData({page_id:page_id})	
		that.setData({answer_id:answer_id})	
		that.setData({match_sales_id:match_sales_id})	
		var uid=app.globalData.weixinUserInfo.uid;
    this.uid=app.globalData.weixinUserInfo.uid;
    
     
		//判断结果
     var uid=app.globalData.weixinUserInfo.uid;
     app.codeBook.getAnswerResult(
       answer_id,
       function(res) {
         console.log(res.data);
         that.setData({ answerResult: res.data});
         var context = wx.createCanvasContext('isCanvas')
         var rightRate = that.data.answerResult.user_score / that.data.answerResult.total_score;
         that.setData({ rightRate: rightRate})
         context.setStrokeStyle("#06c1ae")
         context.setLineWidth(3)
         context.arc(55, 55, 52, 0, rightRate *2* Math.PI, false)//圆的x坐标 圆的y坐标 圆的半径 起始弧度 终止弧度  指定弧度的方向是逆时针还是顺时针。默认是false，即顺时针
         context.setLineCap('square');
         if (that.data.answerResult.right_num) {
           context.stroke()
         }
         
         context.draw()
       }
     ) 
     that.setData({ resultType: resultType})

		//获取应用实例基本信息
    app.codeBook.getPretestPaperInfoById
    (
    		uid,
        page_id,
        function(res)
        {
            that.setData({bookMatch:res.data});
            //设置导航标题
              wx.setNavigationBarTitle
              (
                {
                  title:that.data.bookMatch.list[0].paper_name
                }
                
              );
        }
    );


	//canvas画图



  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function()
  {
    var font = app.globalData.weixinUserInfo.code_book_font;
    this.setData({font:font});
  },

  toAnalysis:function(e){
  	console.log(e)
  	var that=this;
  	this.setData({analysisClick:'click'})
  	if(e.currentTarget.id=="all"){
  		//调到全题解析页面
  		//获取试题
			var toPage = "/pages/view/pretest/mockInfo/mockInfo?match_sales_id="+that.data.match_sales_id+"&page_id="+that.data.page_id+"&type=allAnalyze&answer_id="+that.data.answer_id+"&answer_questions_id=0";
    	wx.redirectTo({url: toPage});
  	}else if(e.currentTarget.id=='error'){
  		if(that.data.answerResult.user_score!=that.data.answerResult.total_score){
  			//有错题，跳到错题解析页面
  			var toPage = "/pages/view/pretest/mockInfo/mockInfo?match_sales_id="+that.data.match_sales_id+"&page_id="+that.data.page_id+"&type=errorAnalyze&answer_id="+that.data.answer_id+"&answer_questions_id=0";
    		wx.redirectTo({url: toPage});
  		}else{
  			//无错题，留在本页面，提示
  			wx.showToast({
				  title: '恭喜您，暂无错题',
				  icon: 'success',
				  duration: 2000
				})
  			
  		}
  		
  	}
  },



  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})