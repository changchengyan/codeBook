// pages/user/setting/setting.js
var app = getApp();
Page({
  data:
  {
    fontText:"标准",
    soundText:"男声(带情感)",
    font:app.globalData.weixinUserInfo.code_book_font
  },
  onLoad:function(options)
  {    
    // 页面初始化 options为页面跳转所带来的参数
    var that=this;
    
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
    var fontText = "";
    var that = this;
    that.setData(app.globalData);
    if(that.data.weixinUserInfo.code_book_font=="small")
    {
        fontText = "小号"
    }
    else if(that.data.weixinUserInfo.code_book_font=="default")
    {
        fontText = "标准"
    }
    else if(that.data.weixinUserInfo.code_book_font=="big")
    {
        fontText = "大号"
    }
    that.setData({fontText:fontText});
    that.setData({font:that.data.weixinUserInfo.code_book_font});
    var voice = wx.getStorageSync('code_book_voice')
    if (voice == "1") {
      that.setData({ soundText: "男声" });
    }
    else if (voice == "2") {
      that.setData({ soundText: "女声" });
    }
    else if (voice == "3") {
      that.setData({ soundText: "男声(带情感)" });
    }
    else if (voice == "4") {
      that.setData({ soundText: "女声(带情感)" });
    }
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  toPage: function(event) 
  {
    //事件处理函数
    var page = event.currentTarget.dataset.page;
    var toPage = "";
    switch(page)
    {
      case "about":
        toPage = "about/about";
        break;
      case "protocol":
        toPage = "protocol/protocol";
        break;
      case "font":
        toPage = "font/font";
        break;
      case "sound":
        toPage = "sound/sound";
        break;
      default:
        break;
    }
    wx.navigateTo({url: toPage});
    
    }
})