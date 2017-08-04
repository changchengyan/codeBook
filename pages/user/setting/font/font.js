// pages/user/setting/font/font.js
var app = getApp();
Page({
  data:
  {
      font:app.globalData.weixinUserInfo.code_book_font
  },
  onLoad:function(options)
  {
    // 页面初始化 options为页面跳转所带来的参数
    var font = app.globalData.weixinUserInfo.code_book_font;
    this.setData({font:font});
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
  },
  updateUserFont:function(event)
  {
    var font = event.currentTarget.dataset.font;
    var that = this;
    //更新用户选择的字号信息 
    app.codeBook.updateUserFont
    (
        font,
        function(res)
        {
             var data = res.data;
             if(data.success)
             {
                app.globalData.weixinUserInfo.code_book_font = font;
                that.setData({font:font});
                app.updateFont(font);
                wx.navigateBack({delta:1})
             }
        }
    );

  }
})