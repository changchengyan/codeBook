// pages/view/pretest/pretest.js
var app = getApp();
Page({
  data:{
  	bookMatch:{},
  	loadding:false,
    font:app.globalData.weixinUserInfo.code_book_font,
    answerList:{}
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    
    var match_id =  options.match_id;
    var match_sales_id = options.match_sales_id;
    var match_sales_name = options.match_sales_name;
    var answer_id = options.answer_id;
    var that = this;   
    app.codeBook.getAnswerState(
      answer_id,
      function(res) {
        console.log(res.data);
        var data = res.data
        that.setData({ answerList: data})
      }
    )
    that.setData({ answer_id: answer_id})
		//获取应用实例基本信息
//  app.codeBook.getBookMatchInfo
//  (
//      match_id,
//      function(res)
//      {
//          that.setData({bookMatch:res.data});
//          //添加应用实例浏览记录
//          app.codeBook.addBrowser
//          (
//              match_sales_id,
//              match_sales_name,
//              res.data.match_title,
//              function(rbs)
//              {
//                that.data.browserId = rbs.data.browser_id;
//wx.setNavigationBarTitle
//	      ({
//	         title:res.data.list[0].seed_name
//	      });
//              }
//          );
//      }
//  );
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function()
  {
    var font = app.globalData.weixinUserInfo.code_book_font;
    this.setData({font:font});
  },
  toAnswer:function(e){
  	var that=this;
  	console.log(e)
  	var order=e.currentTarget.dataset.order-1;
  	var toPage = "/pages/view/pretest/answer/answer?type=mock&order="+order+"&match_id"+that.match_id+"&match_sales_id="+that.match_sales_id+"&match_sales_name="+that.match_sales_name;
		wx.redirectTo({url: toPage});
  },
  toFinish:function(){
    var that = this;
    app.codeBook.submitAnswers(
      that.data.answer_id,
      function(res){
        wx.redirectTo({
          url: "/pages/view/pretest/result/result?answer_id=" + that.data.answer_id
        }
        )
      }
    )
  },
  
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})