// pages/seed/order/order.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    browserId: 0,
    bookId: 0,
    font: app.globalData.weixinUserInfo.code_book_font,
    uid: app.globalData.weixinUserInfo.uid,
    receiverInfo:{},
    orderInfo:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var orderformId = options.orderform_id;
    var that = this;
    //获取订单信息
    app.codeBook.getOrderformByOrderformId(
      orderformId,
      function(res){
        var data = res.data
        console.log(data)
        that.setData({ receiverInfo: data.orderform, orderInfo: data.orderform_item[0]})
      }
    ) 
  },
  toAgain:function() {
    var toPage = "../seed?seed_id=" + this.data.orderInfo.pro_sales_id + '&match_sales_name=seed' + '&seed_match_type=seed_default';
    wx.navigateTo({ url: toPage });
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
  
  }
})