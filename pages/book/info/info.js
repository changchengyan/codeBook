// pages/book/info/info.js
var app = getApp();
Page({
  data:
  {
    book:{},
    font:app.globalData.weixinUserInfo.code_book_font,
    audioPlayed:false,
  },
  onLoad:function(options)
  {
    // 页面初始化 options为页面跳转所带来的参数
    var book_id =  options.book_id;
    var sound = wx.getStorageSync('code_book_voice')
    if (sound != "1" && sound != "2" && sound != "3" && sound != "4") {
      sound = "3";
    }
    var that = this;
    

    //书籍基本信息  
    app.codeBook.getBookInfo
    (
        book_id,
        sound,
        function(res)
        {
            //console.log("res",res)
          var reg = new RegExp("&nbsp;", "g"); //创建正则RegExp对象   
          var stringObj = res.data.book_info;
          var newstr = stringObj.replace(reg, "");   
          res.data.book_info = newstr;
            that.setData({book:res.data});     
            that.setData({'appInstance.currentPosition':'00:00'})
        }
    );
    //初始化监听
    that.listenInit();

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
        dataUrl: that.data.book.book_info_mp3_url,
        title: that.data.book.book_name,
      coverImgUrl: that.data.book.book_pic,
        success:function()
        {
        	that.setData({audioPlayed:true}); 
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
    // 页面关闭，更新浏览时长
     var that = this;
     app.codeBook.updateBrowserTime
      (
          that.data.browserId,
          function(rts)
          {
           
          }
      );
      // 页面关闭
    if(this.audioTime)
    {
      //清除监听定时器     
      clearInterval(this.audioTime); 
    } 
    if(this.data.audioPlayed){
    	wx.stopBackgroundAudio();
    }
  }
})