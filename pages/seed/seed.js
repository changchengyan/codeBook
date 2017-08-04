// pages/seed/seed.js
var app = getApp();
Page({
  data:
  {
    seedInfo: {},
    browserId: 0,
    album: [],
    bookId: 0,
    font: app.globalData.weixinUserInfo.code_book_font,
    uid: app.globalData.weixinUserInfo.uid,
    indicatorDots: true,
    autoplay: false,
    interval: 5000,
    duration: 500,
    indicatorColor: "#fff",
    indicatorActiveColor: "#06c1ae",
    circular: false,
    imgH: [],
    isShare:false,
    screenWidth: 0,
    screenHeight: 0,
    maxHeight: 0,
    canView: true,
    ifbought: false,
    seedDefalutPay: {
      UnitPrice: 0,
      totalMoney: 0,
      clicked: false,
      seedName: "",
      seedNum: 0,
      userName: "",
      uersAddress: "",
      uersPhone: "",
      seedDefalutShow: false
    },
    buySuccess: false,
    orderFormId: "",
    dbClick: false
  },
  onShareAppMessage: function () {
    var that = this;
    var title = that.data.seedInfo.seed_name;
    if(that.data.app_instance_style=='pdf'){   	
    	var path = "/pages/view/pdf/pdf?match_id=" + that.data.match_id + "&match_sales_id=" + that.data.match_sales_id + "&match_sales_name=" + that.data.match_sales_name + "&book_id=" + that.data.bookId;
    }else if(that.data.app_instance_style=="album"){
     	var path = "/pages/view/album/album?match_id="+that.data.match_id+"&match_sales_id="+that.data.match_sales_id+"&match_sales_name="+that.data.match_sales_name+"&book_id="+that.data.bookId;
    }else if(that.data.app_instance_style=="ebook"){//商品文章
     	var path = "/pages/view/ebook/ebook?match_id="+that.data.match_id+"&match_sales_id="+that.data.match_sales_id+"&match_sales_name="+that.data.match_sales_name+"&book_id="+that.data.bookId;
    }else if(that.data.app_instance_style=="pretest"){
    	var path = "/pages/view/pretest/pretest?match_id="+that.data.match_id+"&match_sales_id="+that.data.match_sales_id+"&match_sales_name="+that.data.match_sales_name+"&book_id="+that.data.bookId;
    }else if(that.data.app_instance_style=="video"){
     	var path = "/pages/view/video/video?match_id="+that.data.match_id+"&match_sales_id="+that.data.match_sales_id+"&match_sales_name="+that.data.match_sales_name+"&book_id="+that.data.bookId;
    }else if(that.data.app_instance_style=="sound"){
     	var path = "/pages/view/sound/sound?match_id="+that.data.match_id+"&match_sales_id="+that.data.match_sales_id+"&match_sales_name="+that.data.match_sales_name+"&book_id="+that.data.bookId;
    }else if(that.data.seed_match_type=="seed_default"){//实体商品 分享到本页面
    	var path = "/pages/seed/seed?match_id="+that.data.match_id+"&book_id="+that.data.bookId+"&match_sales_id=" + that.data.match_sales_id + '&match_sales_name=seed&seed_match_type=seed_default';
    }
    
    return app.codeBook.onShareAppMessage(title, path, that.data.seedInfo.id, that.data.match_sales_name, "小程序码书阅读分享");
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数

    //var seed_id = options.seed_id;
    var match_sales_id=options.match_sales_id
    var match_sales_name = options.match_sales_name;
    var match_id=options.match_id;
    var that = this;
    var phoneInfo = wx.getSystemInfoSync();
    this.data.seed_match_type = options.seed_match_type;
    this.data.screenWidth = phoneInfo.screenWidth;
    this.data.screenHeight = phoneInfo.screenHeight;
    that.setData({ screenWidth: phoneInfo.screenWidth, screenHeight: phoneInfo.screenHeight })
    that.setData(getApp().globalData);
    that.setData({match_id:match_id,match_sales_id:match_sales_id,match_sales_name: match_sales_name,app_instance_style:options.app_instance_style});
		//如果是分享进入，则要将书籍添加到书架
    that.data.bookId = options.book_id;
    if(options.share=="true")
    {
        app.userLogin(function(){app.codeBook.addBookById(that.data.bookId,function(){});});    
        that.setData({isShare:true});  
    }
    //判断是否需要付费
    var uid = app.globalData.weixinUserInfo.uid;
    var seedId = that.data.match_sales_id;
    var matchSalesName = that.data.match_sales_name;
    app.codeBook.getCodeBookSeedCanView(
      uid,
      seedId,
      matchSalesName,
      function (res) {
        var canView = res.data.canView;
        console.log("res", res.data)
        that.setData({ ifbought: res.data.isPaid })
        if (canView && that.data.seed_match_type != "seed_default") {
          that.setData({ canView: true })
        } else {
          that.setData({ canView: false })
        }
      }
    )
    //获取商品基本信息
    app.codeBook.getSeedInfo
      (
      match_sales_id,
      function (res) {
        var data = res.data;
        console.log("获取商品基本信息", data)
        data.sale_price_left = data.sale_price.split(".")[0];
        data.sale_price_right = data.sale_price.split(".")[1];

        that.setData({ seedInfo: data, album: data.instance_info.imglist });
        if(data.imglist.length <=1){
          that.setData({ indicatorDots:false});
        }
        //添加浏览记录
        app.codeBook.addBrowser
          (
          match_sales_id,
          "seed",
          res.data.seed_name,
          function (rbs) {
            that.data.browserId = rbs.data.browser_id;

          }
          );
        //设置导航头
        wx.setNavigationBarTitle
        ({
            title:res.data.seed_name
        });
      }
      );
  },
  //选择图片放大预览
  selectPic: function (event) {
    var that = this;
    var nowImg = event.currentTarget.dataset.src.value;
    var urls = [];
    for (var i = 0; i < that.data.album.length; i++) {
      urls[i] = that.data.album[i]
    }
    wx.previewImage({
      current: nowImg, // 当前显示图片的http链接
      urls: urls // 需要预览的图片http链接列表
    });
  },

  //顶部轮播图  
  imgSize: function (e) {
    var phoneH = (e.detail.height / e.detail.width * this.data.screenWidth);
    this.data.imgH.push(phoneH);
    var maxH = Math.max(parseInt(this.data.imgH));
    if (maxH > this.data.maxHeight) {
      this.setData({ maxHeight: maxH })
    }

  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
    var font = app.globalData.weixinUserInfo.code_book_font;
    this.setData({ font: font });
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭，更新浏览时长
    var that = this;
    app.codeBook.updateBrowserTime
      (
      that.data.browserId,
      function (rts) {

      }
      );
  },

  //点击立即购买，判断是否是实体商品
  openFastBuy: function (event) {
     console.log("buybuybuy")
    var that = this;
    //解决双击立即购买出现的问题
    if (that.data.dbClick) {
      return false;
    }
    that.setData({ "seedDefalutPay.clicked": false })
    that.data.dbClick = true;
    if (that.data.seed_match_type == "seed_default") {
      //如果是实体商品，弹框填写收货地址
      that.setData({ "seedDefalutPay.seedDefalutShow": true })
      that.setData({ "seedDefalutPay.UnitPrice": that.data.seedInfo.sale_price })
      that.setData({ "seedDefalutPay.seedName": that.data.seedInfo.seed_name })
      that.setData({ "seedDefalutPay.seedNum": 1 })
      //判断是否填写过地址，如果有则填入
      
      app.codeBook.getDefaultAddressByUid(
        app.globalData.weixinUserInfo.id,
        function (rts) {
          var data = rts.data.address;
          if (data.id != "0") {
            that.setData({ "seedDefalutPay.userName": data.fullname, "seedDefalutPay.uersPhone": data.mobile, "seedDefalutPay.uersAddress": data.address })
          }
        }
      )
    } else {
      //虚拟商品直接发起支付
      app.codeBook.fastBuySeed
        (
        that.data.seedInfo.id,
        4226,
        function (rts) {
          console.log("统一下单成功，回调开始发起支付！");
          that.data.dbClick = false
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
                that.setData({ canView: true })
                that.setData({ ifbought: true })

              },
              'fail': function (res) {
                //支付失败
              }
            }
            );
          console.log(rts);
        },
        function (rts) {
          //失败
          that.data.dbClick = false;
        }
        );
    }
    //快速购买并统一下单
  },

  //用户自己填写收货地址
  paySeedDefault: function (event) {
    var that = this
    if (that.data.seedDefalutPay.clicked) {
      return;
    }
    var eventValue = event.detail.value;
    var shou_fullname = eventValue.userName;
    var shou_mobile = eventValue.uersPhone;
    var shou_adderss = eventValue.uersAddress;
    if (shou_fullname && shou_mobile && shou_adderss) {
      that.setData({ "seedDefalutPay.clicked": true })
      app.codeBook.SaveDefaultAddress(
        app.globalData.weixinUserInfo.id,
        shou_fullname,
        shou_mobile,
        shou_adderss,
        function (rts) {
          var data = rts.data.address;
          that.setData({ "seedDefalutPay.userName": data.fullname, "seedDefalutPay.uersPhone": data.mobile, "seedDefalutPay.uersAddress": data.address })
          if (data.id != 0) {
            //确认提交
            that.defaultSeedToBuy();
            that.closePayBox();
          }
        }

      )
    }else {
      wx.showToast({
        title: '请填写完整收货信息',
        duration: 2000
      }); 
    }


  },
  //关闭弹框
  closePayBox: function () {
    this.setData({ "seedDefalutPay.seedDefalutShow": false });
    this.data.dbClick = false;
  },

  //实体商品下单发起支付
  defaultSeedToBuy: function () {
    var that = this;
    app.codeBook.fastBuyDefaultSeed
      (
      that.data.seedInfo.id,
      4226,
      that.data.seedDefalutPay.userName,
      that.data.seedDefalutPay.uersPhone,
      that.data.seedDefalutPay.uersAddress,
      function (rts) {
        console.log("统一下单成功，回调开始发起支付！");
        that.setData({ orderFormId: rts.orderform_id })

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
              that.setData({ buySuccess: true })
            },
            'fail': function (res) {
              //支付失败

            }
          }
          );
        that.setData({ "seedDefalutPay.clicked": false })
        console.log(rts);
      }
      );
  },

  //改变购买数量，价格
  changeNum: function (e) {
    var that = this;
    var changeDirection = e.target.dataset.direction;
    var changeSeedNum;
    var changeTotalPrice;
    if (changeDirection == "add") {
      changeSeedNum = that.data.seedDefalutPay.seedNum * 1 + 1;
    } else {
      if (that.data.seedDefalutPay.seedNum > 1) {
        changeSeedNum = that.data.seedDefalutPay.seedNum * 1 - 1;
      } else {
        changeSeedNum = 1
      }
    }
    changeTotalPrice = changeSeedNum * that.data.seedDefalutPay.UnitPrice;
    that.setData({ "seedDefalutPay.totalMoney": changeTotalPrice, "seedDefalutPay.seedNum": changeSeedNum })
  },
  //买单后继续购物
  backContinue: function () {
    this.setData({ buySuccess: false, ifbought: true })
  },
  //查看订单
  toSeeOrder: function () {
    var that = this;
    wx.navigateTo({
      url: "order/order?orderform_id=" + that.data.orderFormId
    });
  },
  toHome: function () {
    app.codeBook.toHome();
  },
  toUser: function () {
    app.codeBook.toUser();
  }
})