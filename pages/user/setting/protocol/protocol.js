// pages/user/setting/protocol/protocol.js
var app = getApp();
Page({
  data:
  {
      codeBookConfig:
      {
        protocol:""
      }
  },
  onLoad:function(options)
  {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this; 
    app.codeBook.getCodeBookProtocol
    (
        function(res)
        {
            that.setData({codeBookConfig:res.data});            
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