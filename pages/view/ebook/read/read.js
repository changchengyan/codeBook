// pages/view/ebook/read/read.js
var app = getApp();
Page({
  data:
  {
    appInstance: {},
    browserId: 0,
    album: [],
    bookId: 0,
    font: app.globalData.weixinUserInfo.code_book_font,
    playing:false
  },
  onShareAppMessage: function () {
    var that = this;
    var title = that.data.appInstance.article_title;
    var path = "/pages/view/ebook/ebook?book_id=" + that.data.bookId+"&match_sales_id="+that.data.match_sales_id+"&match_id="+that.data.match_id+"&match_sales_name="+that.data.match_sales_name;
    return app.codeBook.onShareAppMessage(title, path, that.data.match_sales_id, that.data.match_sales_name, "小程序码书阅读分享");

  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var article_id = options.article_id;
    var that = this;
    this.audioTime=null;
    that.setData(getApp().globalData);
    that.data.article_id=options.article_id;
    that.data.match_sales_id=options.match_sales_id;
    that.data.match_id=options.match_id;
    that.data.match_sales_name=options.match_sales_name;

    //如果是分享进入，则要将书籍添加到书架  
    that.data.bookId = options.book_id;
    if (options.share == "true") {
      app.userLogin(function () { app.codeBook.addBookById(that.data.bookId, function () { }); });
      that.setData({ isShare: true });
    }
    var sound = wx.getStorageSync('code_book_voice')
    if (sound != "1" && sound != "2" && sound != "3" && sound != "4") {
      sound = "3";
    }
    //获取应用实例基本信息
    app.codeBook.getSeedArticleInfo
      (
      article_id,
      sound,
      function (res) {
      	console.log(res)
        that.setData({ appInstance: res.data, album: res.data.instance_info.imglist });
				that.setData({'appInstance.currentPosition':'00:00'})
        //添加浏览记录
        app.codeBook.addBrowser
          (
          article_id,
          "seed_info",
          res.data.article_title,
          function (rbs) {
            that.data.browserId = rbs.data.browser_id;

          }
          );
        //设置导航头
        wx.setNavigationBarTitle
        ({
            title:res.data.article_title
        });
      }
      );
		//初始化监听
    that.listenInit();

  },
  selectPic: function (event) {
    var that = this;
    var nowImg = event.currentTarget.dataset.src.value;
    console.log(nowImg)
    var urls = [];
    for (var i = 0; i < that.data.album.length; i++) {
      urls[i] = that.data.album[i]
    }
    wx.previewImage({
      current: nowImg, // 当前显示图片的http链接
      urls: urls // 需要预览的图片http链接列表
    });
  },
  listenAuido:function()
  {
    var that = this;    
    //播放时监听音乐
    wx.getBackgroundAudioPlayerState
    ({
      success: function(res)
      {          
	      var status = res.status;                  
	      if(status==1)
	      {
					that.setData({'appInstance.currentPosition':that.getTimeText(res.currentPosition)})
					that.setData({'appInstance.duration':res.duration})
	      }				          
      }
    });
  },
  listenInit:function()
  {
      //初始化监听
      var that = this;
      //音频播放完毕
      wx.onBackgroundAudioStop
      (      	
        function(){
        	console.log(that.data.appInstance.duration)
        	if(that.data.appInstance.duration!=0&&that.data.appInstance.duration!=null){
        			that.setData({playing:false});
        	}else{
        		wx.getNetworkType
				    ({
			        success: function(res) 
			        {
			          // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
			          var networkType = res.networkType;
			          if(networkType=="none"){
			          	that.setData({playing:false});
			            wx.showToast({
									  title: '网络异常',
									  duration: 2000
									}); 
			          	
			          }
			         }
				    });    
        	}	    		 		     	
        }

      );
         
      //音乐播放时
      wx.onBackgroundAudioPlay
      (
        function()
        { 
          //启用监听定时器        
          that.setData({playing:true});
        }
      );          
      //音乐暂停时
      wx.onBackgroundAudioPause
      (
        function()
        {           
          that.setData({playing:false});
        }
      );
  },
  audioToPlay:function(){
  	//找到某个音频数据
  	var that=this;		
    that.setData({playing:true});   
    wx.playBackgroundAudio
    ({
        dataUrl: that.data.appInstance.seed_info_mp3_url,
        title: that.data.appInstance.article_title,
      coverImgUrl: that.data.appInstance.pic,
        success:function()
        {
					//播放中                 
			    if(that.audioTime)
			    {
		        //清除监听定时器     
		        clearInterval(that.audioTime); 
			    }
			    that.listenAuido();
			    that.audioTime = setInterval(that.listenAuido,1000);
        }
    });

  },
  audioPause: function () {
    wx.pauseBackgroundAudio();
    this.setData({playing:false});
  },
  getTimeText:function(time)
	{
		var formart = function(s,count)
		{
			for(var i=s.length;i<count;i++)
			{
				s = "0"+s;
			}
			return s;
		}
		
		var text = "00:00";
		if(time>60*60)
		{
			text = formart(parseInt((time-(time % (60 *60 ))) / 60).toString(),2) + ":" + formart(parseInt((time-(time % 60)) / 60).toString(),2) + ":" + formart(parseInt(time % 60).toString(),2);
		}
		else if(time>=60)
		{
			text = formart(parseInt((time-(time % 60)) / 60).toString(),2) + ":" + formart(parseInt(time % 60).toString(),2);
			
		}
		else
		{
			text = "00:" + formart(parseInt(time % 60).toString(),2);
		}
		
		return text;
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
   if(that.audioTime)
    {
      //清除监听定时器     
      clearInterval(that.audioTime); 
    }
    wx.stopBackgroundAudio();
  },
  toHome: function () {
    app.codeBook.toHome();
  },
  toUser: function () {
    app.codeBook.toUser();
  }
})