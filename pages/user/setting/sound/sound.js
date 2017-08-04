// pages/user/setting/sound/sound.js

var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sound: "3",
    font: app.globalData.weixinUserInfo.code_book_font
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) 
  {
     var that=this;
     var voice=wx.getStorageSync("code_book_voice");
     if (voice == "1" || voice == "2" || voice == "3" || voice == "4"){
       that.setData({ sound: voice });
     }
     
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 选择男声，女生...
   */
  updateUserFont:function(e){
     var that=this;
     var voice = e.currentTarget.id;
     var text="不能带你看世界，就带世界来看你";
     //更新人声选择缓存
     app.updateVoice(voice);
     that.setData({ sound: voice})
     //向后退发送请求，将text转化为语音，并播放
     app.codeBook.getUserSettingVoice(voice, text,function(res){
       var path = res.path;
       //播放语音
       // 使用 wx.createAudioContext 获取 audio 上下文 context
       that.audioCtx = wx.createAudioContext('myAudio')
       that.audioCtx.setSrc(path)
       that.audioCtx.play()
     })
  }
})