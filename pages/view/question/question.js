// pages/view/question/question.js
var app = getApp();
Page({
  data: {
    seedInfo: {},
    font: app.globalData.weixinUserInfo.code_book_font,   
    template_pay: {
      price: 0,
      sourceName: "",
      sourceNum: 0,
      payShow: false,
      clicked: false
    },
    imgStyle: "pay-item-canvas",
    question:"",
    userInfo:null,
    loadingRecordList:true,
    recordList:null,
    playIndex:-1,
    audioPlay:false,
    totalCount:0,
    answerCount:0,    
    playPic:[],  
    isShare: false,
    
  },
  // 分享
  onShareAppMessage: function () {
    var that = this;
    var title = that.data.seedInfo.seed_name;
    var path = "/pages/view/question/question?book_id="+that.data.bookId+"&match_id=" + that.data.match_id + "&match_sales_id=" + that.data.seedInfo.id  + "&match_sales_name=seed";
    return app.codeBook.onShareAppMessage(title, path, that.data.seedInfo.id, "seed", "小程序码书阅读分享");
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var seed_id = options.match_sales_id;
    var match_id = options.match_id;
    var match_sales_name = options.match_sales_name;
    var that = this; 
    that.setData({match_id:match_id});   
    that.setData(getApp().globalData);
    //如果是分享进入，则要将书籍添加到书架
    that.data.bookId = options.book_id;
    if (options.share == "true") {
      app.userLogin(function () { app.codeBook.addBookById(that.data.bookId, function () { }); });
      that.setData({ isShare: true });

    }
    // 页面渲染完成
    //调用应用实例的方法获取全局数据
    app.getUserInfo
      (
      function (userInfo) {
        if (userInfo.avatarUrl == "") {
          userInfo.avatarUrl = "../images/user_default.png"
        }
        //更新数据
        that.setData
          (
          {
            userInfo: userInfo
          }
          )
      }
      );    
    //获取商品基本信息
    app.codeBook.getSeedInfo
      (
      seed_id,
      function (res) {        
        var data = res.data;
        data.sale_price_left = data.sale_price.split(".")[0];
        data.sale_price_right = data.sale_price.split(".")[1];
        //如果是免费商品，设置为不能销售 ，因小程序支付流程暂不支持免费商品,后期修改
        if (Number(data.sale_price).toFixed(2) == 0) {
          data.sales_status =0;
        }
        that.setData({ seedInfo: data, album: data.instance_info.imglist });
        //添加浏览记录
        app.codeBook.addBrowser
          (
          seed_id,
          "seed",
          res.data.instance_name,
          function (rbs) {            
            that.data.browserId = rbs.data.browser_id;
          }
          );
      }
      );  
    that.getQuestionRecordList(seed_id);
  },
  getQuestionRecordList: function (seed_id){
    var that = this;
    app.codeBook.getQuestionRecordList(
      seed_id,
      function (res) {
        if (res.success) {
          that.setData({ "loadingRecordList": false });
          that.setData({ recordList: res.data.result });
          that.setData({ "totalCount": res.data.quest_count });
          that.setPlayPic();
          that.setData({ "answerCount": res.data.answer_count });
        }
        else {
          wx.showToast({
            title: res.message,
            icon: 'success',
            duration: 2000
          })
        }
        that.setData({ "loadingRecordList": false });
      }
    );  
  },
  toQuestion: function (e) {    
    var that = this;    
    if (e.detail.value.info.replace(/\s/g, "")!="") {
      that.setData({ "question": e.detail.value.info })
      that.setData({ "template_pay.payShow": true })
      that.setData({ "template_pay.price": that.data.seedInfo.sale_price })
      that.setData({ "template_pay.sourceName": that.data.seedInfo.seed_name })
      that.setData({ "template_pay.sourceNum": 1 })
    }
    else{
      wx.showToast({
        title: '请输入您的问题',
        icon: 'success',
        duration: 2000
      })
    }
  },
  payNow: function (event) {
    var that = this;
    if (that.data.template_pay.clicked) {
      return;
    }
    that.setData({ "template_pay.clicked": true })
    //快速购买并统一下单
    app.codeBook.fastBuySeed
      (
      that.data.seedInfo.id,
      4226,
      function (rts) {
        console.log("统一下单成功，回调开始发起支付！");
        //获取订单标识，首先提交问题（避免支付后提交问题失败，这样做提交问题失败不会发起支付）
        app.codeBook.addQuestionRecord(
          that.data.seedInfo.id,
          rts.orderform_id, 
          that.data.question,
          function(sub_res){
              if(sub_res.success){
                //发起支付
                wx.requestPayment
                  (
                  {
                    'timeStamp': rts.weixinpayinfo.timeStamp,
                    'nonceStr': rts.weixinpayinfo.nonceStr,
                    'package': rts.weixinpayinfo.package,
                    'signType': rts.weixinpayinfo.signType,
                    'paySign': rts.weixinpayinfo.paySign,
                    'success': function (res) {
                      //支付成功 
                      that.setData({ "template_pay.payShow": false });                        
                      that.setData({ "template_pay.clicked": false });
                      that.setData({ "question": "" });
                      that.getQuestionRecordList(that.data.seedInfo.id);
                    },
                    'fail': function (res) {
                      //支付失败
                      that.setData({ "template_pay.clicked": false }); 
                      e.detail.value.info = that.data.question;                       
                    }
                  }
                  );
              }
              else{
                that.setData({ "template_pay.payShow": false });
                wx.showToast({
                  title: '提问失败',
                  icon: 'success',
                  duration: 2000
                })
              }
          }
          );
        console.log(rts);
      }
      );

  },
  clickPlay:function(e){
    var that = this;
    that.audioCtx = wx.createAudioContext('myAudio');
    if (that.data.playIndex != e.currentTarget.dataset.node){
      that.data.playIndex = e.currentTarget.dataset.node;
      that.audioCtx.setSrc(that.data.recordList.list[that.data.playIndex].answer_sound);
      that.setData({ "audioPlay": false });
    }            
    if(!that.data.audioPlay){      
      that.audioCtx.play();
      that.setData({"audioPlay":true});
    }
    else{
      that.audioCtx.pause();
      that.setData({ "audioPlay": false });
    }
    that.setPlayPic();
  },
  playEnd:function(){
    var that = this;
    that.setData({ "audioPlay": false });
    that.setPlayPic();
  },
  setPlayPic: function (){
    var that = this;
    for (var i = 0; i < that.data.recordList.list.length;i++){
      that.data.playPic[i] = 'http://f3.5rs.me/upload/20170608/2017_06_08_165146276.png';
    }
    if (that.data.audioPlay){
      that.data.playPic[that.data.playIndex] = 'http://f3.5rs.me/upload/20170608/2017_06_08_151149540.gif';
    }
    that.setData({ "playPic": that.data.playPic });
  },
  closePayBox: function () {
    this.setData({ "template_pay.payShow": false })
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {    
    // 页面显示
    var that = this;
    var font = app.globalData.weixinUserInfo.code_book_font;
    this.setData({ font: font });
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  }
})