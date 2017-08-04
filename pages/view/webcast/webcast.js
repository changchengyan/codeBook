
//获取应用实例
var webim = require("../../../utils/webim.js");
var webimhandler = require('../../../utils/webim_handler.js');
var Config = {
    sdkappid : 1400031195
    ,accountType : 12841
    ,accountMode : 0 //帐号模式，0-表示独立模式，1-表示托管模式
};
//tls.init({
//  sdkappid : Config.sdkappid
//})
var app = getApp();
Page({
  data:
  {
    Liveinfo: {},
    browserId: 0,
    bookId: 0,
    font: app.globalData.weixinUserInfo.code_book_font,
    isShare: false,
    msgs : [],
    Identifier : null,
    UserSig : null,
    msgContent : "",
    userInfo: {},
    livestate:-1,
    sendContent:{
      userAction:'1',
      userId:'0',
      userName:'',
      headPic:'',
      msg:'',
      groupId:''
    },
    dbClick:false,
    timer:null,
    fit:"cover",
    autoplay:false
  },
  onShareAppMessage: function () {
    var that = this;
    var title = that.data.match_title;
    var path = "/pages/view/webcast/webcast?book_id="+this.data.bookId+"&match_app_id=" + this.data.match_app_id + "&match_sales_name=app_instance&match_title="+this.data.match_title;
    return app.codeBook.onShareAppMessage(title, path, that.data.match_app_id, "app_instance", "小程序码书阅读分享");

  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    var match_app_id = options.match_app_id;
    var match_title = options.match_title;
    that.setData({match_app_id:match_app_id,match_title:match_title})    
      var match_sales_name = options.match_sales_name;
      that.setData(getApp().globalData);
      that.data.bookId = options.book_id;
      
      
    if(match_app_id)
    {
      app.codeBook.getLiveByAppID(match_app_id,function(res){
        var data = res.data;
        var list = data.list[0];
        if(list) {
          list.sale_begin_time = list.sale_begin_time.substring(0, list.sale_begin_time.length - 3);
          list.sale_end_time = list.sale_end_time.substring(0, list.sale_end_time.length - 3);
            that.setData({Liveinfo:list});
            that.setData({'Liveinfo.match_title':match_title});
          }
      });
      app.codeBook.GetLiveRoomStatus(match_app_id, function(res) {
      	//    	 if(res.output.length>0){
      	//    	 	that.setData({livestate:res.output[0].status});
      	//    	 }else if(res.ret==1000){
      	//    	 	setTimeout(function(){
      	//    	 		wx.redirectTo({url: '../../book/book?book_id='+that.data.bookId});
      	//    	 		return false;
      	//    	 	},2000)
      	//    	 	
      	//    	 }
      	if(res.data.success) {
      		that.setData({
      			livestate: res.data.status
      		});
      	}

      	if(res.data.status == 0) {
      		var msgs = that.data.msgs || [];
      		var xx = '{"userAction":"1","userName":"温馨提示:","headPic":"","msg":"主播不在家噢~~"}';
      		var content = JSON.parse(xx);
      		msgs.push(content);
      		that.setData({
      			msgs: msgs
      		})
      	} else if(res.data.status == 3) {
      		var msgs = that.data.msgs || [];
      		var xx = '{"userAction":"1","userName":"温馨提示:","headPic":"","msg":"因故停止播放"}';
      		var content = JSON.parse(xx);
      		msgs.push(content);
      		that.setData({
      			msgs: msgs
      		})
      	}
      });

       that.data.timer = setInterval(function(){
       	console.log("未播")
        app.codeBook.GetLiveRoomStatus(that.data.match_app_id, function (res) {
          //直播正在播放中，将定时器清除
          //if ((res.output.length > 0 && res.output[0].status == 1)) {
          	//that.setData({livestate:res.output[0].status});
          	console.log(res)
          if (res.data.status == 1) {
          	//正在直播
          	that.setData({livestate:1});
            wx.getNetworkType
              ({
                success: function (res) {
                  // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
                  var networkType = res.networkType;
                  if (networkType == "wifi") {
                   
                    that.setData({ autoplay: true });
                    that.setData({ "LiveInfo.play_url_hls": that.data.Liveinfo.play_url_hls });
                    var videoContext = wx.createVideoContext('liveVideo');
                    videoContext.play();

                  } else if (networkType == "none") {
                    console.log("无网络")

                    //that.setData({ 'videoInfo.file_url': 'http://.mp3' })
                    wx.showToast({
                      title: '网络异常',
                      duration: 2000
                    });
                  } else {
                    wx.showModal({
                      title: '温馨提示',
                      content: '您正在使用手机流量观看,是否继续观看',
                      showCancel: true,
                      cancelText: '取消观看',
                      cancelColor: '#06c1ae',
                      confirmText: '继续观看',
                      confirmColor: '#06c1ae',
                      success: function (res) {
                        if (res.confirm) {
                          //用户点击继续观看
                          that.setData({ autoplay: true });
                          that.setData({ "LiveInfo.play_url_hls": that.data.Liveinfo.play_url_hls });
                          var videoContext = wx.createVideoContext('liveVideo');
                          videoContext.play();

                        } else if (res.cancel) {
                          //用户点击取消观看--不操作
                          that.setData({ autoplay: false });
                          that.setData({ 'videoInfo.file_url': 'http://.mp3' })
                        }
                      }
                    })
                  }
                }
              });
           
            clearInterval(that.data.timer);
          }else if(res.data.status==3){
          	//禁播
          	//wx.redirectTo({url: '../../book/book?book_id='+that.data.bookId})
          	//clearInterval(that.data.timer);
          }else if(res.data.status==0){
          	//没有播
          }
        });
      },2000);

    }
    else
    {
      that.setData({ Liveinfo:options})
    }
    //设置导航标题
	  wx.setNavigationBarTitle
	  ({
	      title:match_title
	  });
    //添加浏览记录
      app.codeBook.addBrowser
        (
        match_app_id,
        match_sales_name,
        match_title,
        function (rbs) {
          that.data.browserId = rbs.data.browser_id;
        }
        );
    var uid=app.globalData.weixinUserInfo.uid;
    var sourceId=match_app_id;
    
    //如果是分享进入，则要将书籍添加到书架  	  
	  if (options.share == "true") {
	  	that.setData({ isShare: true });
	    app.userLogin(function () { app.codeBook.addBookById(that.data.bookId, function () {
	    	var uid=app.globalData.weixinUserInfo.uid;
	    	app.getIM_UserInfo(uid,sourceId,function(userInfo){
		      //获取直播数据
		      that.setData({
		        userInfo:userInfo.data
		      })
	          that.initIM(userInfo.data);
		    })
	    }); });
	    return false;
	  }   
    app.getIM_UserInfo(uid,sourceId,function(userInfo){
      //获取直播数据
      that.setData({
        userInfo:userInfo.data
      })
      that.initIM(userInfo.data);
    })

   
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
    webimhandler.quitBigGroup();
    webimhandler.logout();
    app.codeBook.updateBrowserTime
      (
      that.data.browserId,
      function (rts) {

      }
      );

      if(that.data.timer != null){
        clearInterval(that.data.timer);	
      }
  },
  toInstance:function(event) 
  {
  	var that=this;
  	//解决多次点击的问题
  	if(this.data.dbClick){
				return;
  	}  	
	this.setData({dbClick:true})
	setTimeout(function(){
	  that.setData({dbClick:false})
	},1000)
    var toPage = "";
    toPage = "../article/article?book_id="+that.data.bookId+"&app_instance_id="+this.data.match_app_id+"&app_instance_style=live";  
    wx.navigateTo({url: toPage}); 
  },
  toHome: function () {
    app.codeBook.toHome();
  },
  toUser: function () {
    app.codeBook.toUser();
  },
  //求手机大小
  phonesize:function() {
    var that = this;
    var res = wx.getSystemInfoSync()
    nowH = res.windowHeight+"px";
    nowW = res.windowWidth+"px";
    that.setData({ nowH: nowH, nowW: nowW})
  
  },
  screenchange: function (event) {
    var that = this;
    
    if (event.detail.fullScreen) {
      that.setData({ fit: "cover" });
      
    } else {
      that.setData({ fit: "contain" });
      

    }
    console.log(event.detail)

  },
  //直播弹幕事件处理函数
//bindViewTap: function() {
//  wx.navigateTo({
//    url: '../logs/logs'
//  })
//},

  clearInput : function(){
      this.setData({
          msgContent : ""
      })
  },
  
  bindConfirm : function(e){
      var that = this;
      var content = e.detail.value.info;
      if (!content.replace(/^\s*|\s*$/g, '')) return;
      that.setData({
        'sendContent.userId': app.globalData.weixinUserInfo.uid, 'sendContent.userName': app.globalData.weixinUserInfo.nickname, 'sendContent.headPic': app.globalData.weixinUserInfo.headimgurl, 'sendContent.msg': content, 'sendContent.groupId': that.data.userInfo.roomid });
      var json_content = JSON.stringify(that.data.sendContent);
      webimhandler.onSendMsg(json_content, function () {
        that.clearInput();
      });

  },
/*
  bindTap : function(){
      webimhandler.sendGroupLoveMsg();
  },*/

//login : function(cb){
//    var that = this;
//    tls.anologin(function(data){
//           that.setData({
//               Identifier : data.Identifier,
//               UserSig : data.UserSig
//           })
//           cb();
//        });
//},


  receiveMsgs : function(data){
        var msgs = this.data.msgs || [];
        if(data.content.length==0){
          return;
        }
        var content = JSON.parse(data.content);
        msgs.push(content);
        //最多展示10条信息
        if(msgs.length > 10){
            msgs.splice(0,msgs.length - 10)
        }

        this.setData({
          msgs: msgs
        })
  },

  initIM : function(userInfo){
        var that = this;

        var avChatRoomId =userInfo.roomid;
        webimhandler.init({
            accountMode : Config.accountMode 
            ,accountType : Config.accountType
            ,sdkAppID : Config.sdkappid
            ,avChatRoomId : avChatRoomId //默认房间群ID，群类型必须是直播聊天室（AVChatRoom），这个为官方测试ID(托管模式)
            ,selType : webim.SESSION_TYPE.GROUP
            ,selToID : avChatRoomId
            ,selSess : null //当前聊天会话
        });
        //当前用户身份
        var loginInfo = {
            'sdkAppID': Config.sdkappid, //用户所属应用id,必填
            'appIDAt3rd': Config.sdkappid, //用户所属应用id，必填
            'accountType': Config.accountType, //用户所属应用帐号类型，必填
            'identifier': userInfo.identifier, //当前用户ID,必须是否字符串类型，选填
            'identifierNick': userInfo.identifierNick, //当前用户昵称，选填
            'userSig': userInfo.userSig, //当前用户身份凭证，必须是字符串类型，选填
        };

        //监听（多终端同步）群系统消息方法，方法都定义在demo_group_notice.js文件中
        var onGroupSystemNotifys = {
            "5": webimhandler.onDestoryGroupNotify, //群被解散(全员接收)
            "11": webimhandler.onRevokeGroupNotify, //群已被回收(全员接收)
            "255": webimhandler.onCustomGroupNotify//用户自定义通知(默认全员接收)
        };

        //监听连接状态回调变化事件
        var onConnNotify = function (resp) {
            switch (resp.ErrorCode) {
                case webim.CONNECTION_STATUS.ON:
                    //webim.Log.warn('连接状态正常...');
                    break;
                case webim.CONNECTION_STATUS.OFF:
                    webim.Log.warn('连接已断开，无法收到新消息，请检查下你的网络是否正常');
                    break;
                default:
                    webim.Log.error('未知连接状态,status=' + resp.ErrorCode);
                    break;
            }
        };


        //监听事件
        var listeners = {
            "onConnNotify": webimhandler.onConnNotify, //选填
            "onBigGroupMsgNotify": function(msg){
                webimhandler.onBigGroupMsgNotify(msg,function(msgs){
                    that.receiveMsgs(msgs);
                })
            }, //监听新消息(大群)事件，必填
            "onMsgNotify": webimhandler.onMsgNotify,//监听新消息(私聊(包括普通消息和全员推送消息)，普通群(非直播聊天室)消息)事件，必填
            "onGroupSystemNotifys": webimhandler.onGroupSystemNotifys, //监听（多终端同步）群系统消息事件，必填
            "onGroupInfoChangeNotify": webimhandler.onGroupInfoChangeNotify//监听群资料变化事件，选填
        };

        //其他对象，选填
        var options = {
            'isAccessFormalEnv': true,//是否访问正式环境，默认访问正式，选填
            'isLogOn': false//是否开启控制台打印日志,默认开启，选填
        };

        
        webimhandler.sdkLogin(loginInfo, listeners, options, avChatRoomId);
        
  }
})