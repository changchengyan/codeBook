// pages/user/welcome/welcome.js
var app = getApp();
Page({
  data:
  {
    welcome:{}
  },
  onShareAppMessage: function () 
  {
     var that=this;
     var title = that.data.book.book_name;
     var path = "/pages/user/welcome/welcome";
     return app.codeBook.onShareAppMessage(title,path,"1","code_book_config","小程序码书阅读分享");
  },
  goCodebook:function() {
   console.log("a")
      wx.switchTab({
        url: '../../desk/desk'
      })
  },
  onLoad:function(options)
  {
    // 页面初始化 options为页面跳转所带来的参数

      var that=this;
      app.codeBook.getWelcomePic
      (         
          function(res)
          {            
            that.setData({welcome:res.data});
          }
      );



  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})