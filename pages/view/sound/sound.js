// pages/view/sound/sound.js
var template = require("../../../utils/template.js");
var app = getApp();
Page({
  data:
  {
      bookMatch:{},
      bookId:0,
      sound:
      {
        total_count:-1,
        count:-1,
        list:[]
      },
      loadding:false,
      loadLastId:0,
      loadMore:true,
      loadMoreCount:20,
      timeBeginText:"00:00",
      timeEndText:"00:00",
      numTimeEnd:"",
      proLoadWidth:"0%",
      proLightWidth:"0%",
      playPauseStyle:"play-out",
      font:app.globalData.weixinUserInfo.code_book_font,
      browserId:0,
      fileBrowserId:0,
      singInfo:{noDrag:true},
      proTouch:{isdrag:false},
      myList:
      {
      	count:0,
      	list:[]
      },      
	  systemInfo:{},
    progressValue:0,
    progressMax:'NaN',
    isShare:false,
    soundSize:0,
    isFirst:false,//是不是第一次弹出提示框并且点了true  您正在使用手机流量收听，是否继续收听 --是 true 否 false
    dbClick:true,
    template_pay:{
			price:0,
			sourceName:"",
			sourceNum:0,
			payShow:false,
			clicked:false
	  },
	  firstShow:true,
	  payLoading:true,
	  isSale:true,//是否售卖 
	  canView:true,
  },
  onShareAppMessage: function ()
  {
	 var that=this;
	 var title = that.data.bookMatch.instance_name;
	 var path = "/pages/view/sound/sound?match_id="+that.data.bookMatch.id+"&match_sales_id="+that.data.bookMatch.match_sales_id+"&match_sales_name="+that.data.bookMatch.match_sales_name+"&book_id="+that.data.bookId;
	 return app.codeBook.onShareAppMessage(title,path,that.data.bookMatch.match_sales_id,that.data.bookMatch.match_sales_name,"小程序码书阅读分享");     
  },
  onShow:function()
  {
  	var that=this;
    var font = app.globalData.weixinUserInfo.code_book_font;
    this.setData({font:font});
    this.setData({hide:false})
    if(!that.data.firstShow){
  	//判断该资源是否需要付费
	    if(that.data.canView&&that.data.match_sales_name=="seed"){
				template.isCanView(that,this.data.uid,this.data.match_sales_id,this.data.match_sales_name);		
			}
    }
  },
  onHide:function(){
    // 页面隐藏
    this.setData({firstShow:false});
  },
  audioTime:null,
  onLoad:function(options)
  {
    /*
     * 本页面仅调用音频暂停、播放、控制音乐播放进度
     * 停止播放在退出书籍主页时调用，所以不要监听停止播放做业务操作
     */


    // 页面初始化 options为页面跳转所带来的参数
    var match_id =  options.match_id;
    console.log(options);
    var match_sales_id = options.match_sales_id;
    var match_sales_name = options.match_sales_name;
    var uid=app.globalData.weixinUserInfo.uid;
    var that = this;
    this.setData({uid:uid,match_id:match_id,match_sales_id:match_sales_id,match_sales_name:match_sales_name})
    that.setData(getApp().globalData);    
    that.audioIndex = 0;
    that.ended=false;//ended表示音频是否播放到末尾


    //如果是分享进入，则要将书籍添加到书架
    that.data.bookId = options.book_id;   
    if(options.share=="true")
    {
        app.userLogin(function(){app.codeBook.addBookById(that.data.bookId,function(){});});    
        that.setData({isShare:true});  
    }
		//判断该资源是否需要付费
    
    var seedId=match_sales_id;
    var matchSalesName=match_sales_name;
   template.isCanView(that,this.data.uid,this.data.match_sales_id,this.data.match_sales_name);		


    //初始化监听
    that.listenInit();
    
    //获取系统消息
    wx.getSystemInfo({
  		success: function(res) {   		
    		//console.log(res.model)//ios iphone 6 android sch i869
    		if(res.model.search(/iPhone/)==-1){
    			//不是iPhone
    			that.setData({'systemInfo.model':"Android"});
    		}else{
    			//是iPhone
    			that.setData({'systemInfo.model':"iPhone"});
    		}
  		}
		})
    //获取网络消息
    wx.getNetworkType
    ({
    success: function(res) 
    {
      // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
      var networkType = res.networkType;
      if(networkType=="none"){
        wx.showToast({
					  title: '网络异常',
					  duration: 2000
					}); 
      	
      }
     }
    });
    //获取应用实例基本信息
    app.codeBook.getBookMatchInfo
    (
        match_id,
        uid,
        function(res)
        {
            that.setData({bookMatch:res.data});
            //判断该资源是否售卖
            console.log(res);
            if(res.data.state==0){
            	//未开始
            	that.setData({isSale:false});           	
            }else if(res.data.state==1){
            	//正在售卖中
            	that.setData({isSale:true});
            }else if(res.data.state==2){
            	//售卖已结束
            	that.setData({isSale:false});
            }
            //添加应用实例浏览记录
            app.codeBook.addBrowser
            (
                match_sales_id,
                match_sales_name,
                res.data.match_title,
                function(rbs)
                {
                  that.data.browserId = rbs.data.browser_id;
                }
            );
        }
    );
    that.setData({loadding:true});
    //首次加载文件资源列表  
    app.codeBook.getBookMatchFileList
    (
        match_id,
        match_sales_name,
        match_sales_id,
        that.data.loadLastId,
        that.data.loadMoreCount,
        function(res)
        {
          that.setData({loadding:false});
          var data = res.data;
          var list = data.list;
          if(list.length>0)
          {
            for(var i=0;i<list.length;i++)
            {
              list[i]["class"] = "sound-item";
              that.data.loadLastId = list[i].rownumber;
              list[i]["time_length"] = app.formatTime(list[i]["time_length"]);
            }
            list[0]["class"] = "sound-item-over";
            var time=app.formatTime(list[0].time_length);							
            that.setData({timeEndText:time})
            //填充文件列表数据
            that.setData({sound:data});              
          }
          else if(list.length==0)
          {
              that.setData({sound:data});
          }
          //如果没有取到20条，则不需要滚动加载
          if(list.length != that.data.loadMoreCount)
          {
               that.setData({loadMore:false});
          }   
        }
    )    

  },
  loadMoreList:function()
  {
      var that = this;
      //有必要加载更多，且没在请求加载中
      if(that.data.loadMore  && !that.data.loadding)
      {
        	that.setData({loadding:true});
          var match_id = that.data.bookMatch.id;
          var match_sales_id = that.data.bookMatch.match_sales_id;
          var match_sales_name=that.data.bookMatch.match_sales_name;
          var last_id = that.data.loadLastId;
          var count = that.data.loadMoreCount;
          app.codeBook.getBookMatchFileList
          (
              match_id,
              match_sales_name,
              match_sales_id,
              last_id,
              count,
              function(res)
              {
                that.setData({loadding:false});
                var data = res.data;
                var list = data.list;
                if(list.length>0)
                {
	                for(var i=0;i<list.length;i++)
	                {
	                  list[i]["class"] = "sound-item";
                    list[i]["time_length"] = app.formatTime(list[i]["time_length"]);
	                  that.data.loadLastId = list[i].rownumber;

	                }
	                //追加数据
	                data.count = data.count*1 + that.data.sound.count*1;
	                data.list = that.data.sound.list.concat(data.list);
	                //填充文件列表数据
	                that.setData({sound:data});
                }                
                //如果没有取到20条，则不需要滚动加载
                if(list.length != that.data.loadMoreCount)
                {
                  that.setData({loadMore:false});
                }               
              }
          );
      }
  },
  listenInit:function()
  {
      //初始化监听
      var that = this;
      //选定音频的长度（单位：s），只有在当前有音乐播放时返回
      that.duration = 0;
      //选定音频的播放位置（单位：s），只有在当前有音乐播放时返回
      that.currentPosition = 0;
      //音频播放完毕
      wx.onBackgroundAudioStop
      (      	
        function(){
        	console.log("播放停止,从头播放",that.data.singInfo.duration)
        	if(!that.data.beSlider){
        		if(that.data.singInfo.duration!=0&&that.data.singInfo.duration!=null&&!that.data.hide){
        			that.audioNext();
        		}else{
        			wx.getNetworkType({
							  success: function(res) {
							    // 返回网络类型, 有效值：
							    // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
							    var networkType = res.networkType;
							    if(networkType=='none'){
							    	that.setData({playPauseStyle:"play-out"});
				            wx.showToast({
										  title: '网络异常',
										  duration: 2000
										}); 
							    }
							  }
							})
        				
        		}
    		
	        }       	
        }

      );
         
      //音乐播放时
      wx.onBackgroundAudioPlay
      (
        function()
        { 
          //启用监听定时器        
          that.setData({playPauseStyle:"play-in"});
          console.log("开始播放")
        }
      );          
      //音乐暂停时
      wx.onBackgroundAudioPause
      (
        function()
        {
          //清除监听定时器            
          that.setData({playPauseStyle:"play-out"});
          console.log("暂停播放")
        }
      );
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
	      	//播放中
          that.setData({timeBeginText:that.getTimeText(res.currentPosition)});
          that.setData({timeEndText:that.getTimeText(res.duration),numTimeEnd:res.duration});
          //装载进度
          that.setData({proLoadWidth:res.downloadPercent+"%"});
          //播放进度
          var plwidth = (res.currentPosition / res.duration *100 );
          that.setData({proLightWidth:plwidth + "%"});
          that.setData({'proTouch.proNowLeft':plwidth});
          that.setData({progressValue:res.currentPosition})
          that.setData({progressMax:res.duration});
          that.downloadTime=Math.floor(res.downloadPercent/100*res.duration);
          that.currentPosition=res.currentPosition;
	      } else if(status==2){
	      	//没有音乐在播放
	      	setTimeout(function(){
	      		if(res.duration!=0&&res.currentPosition!=0){
	      			if(!that.data.hide){
			      		that.audioNext();
			      	}	 
	      		}
	      		
	      	},3000)
	      	     	
	      	if(that.data.progressMax=="NaN"){
	      		that.setData({playPauseStyle:"play-out"});
	      	}
	      	that.setData({timeBeginText:that.getTimeText(0)});
	      }else if(status==0){
	      	//暂停中
	      }
	      console.log(status,res.currentPosition,res.duration)
  
        
       
	      that.setData({'singInfo.duration':res.duration});
				that.setData({'singInfo.currentPosition':res.currentPosition})          
      },fail:function(res){
      	//播放失败--播放下一首
      	console.log('播放失败')
      	if(!that.data.hide){
      		that.audioNext();
      	}
      }
    });
  },
  onReady:function()
  {   
  },
  onUnload:function()
  {
    // 页面关闭，更新浏览时长
     var that = this;
     app.codeBook.updateBrowserTime
      (
	      that.data.browserId,
	      function(rts)
	      {           
	      }
      );


     //更新浏览时长
      app.codeBook.updateBrowserTime
      (
          that.data.fileBrowserId,
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

    //暂停播放音频
    wx.pauseBackgroundAudio();
    
  },
  dragStart:function(event)
  {  	
			clearInterval(this.audioTime);   	
  },
	sliderChange:function(event) {
    var that=this;
    var newValue = event.detail.value;
    that.setData({progressValue:newValue});
    that.newValue=event.detail.value;
    if(that.audioTime){
    	clearInterval(that.audioTime)
    }
    that.audioTime = setInterval(that.listenAuido,1000);
    var muchPlayed = that.getTimeText(newValue);
    that.setData({timeBeginText:muchPlayed});
    console.log(that.data.progressMax,newValue,that.data.playPauseStyle)
    if(that.data.progressMax=="NaN"){
    	return;    	
    }
    if(newValue==0){				
			wx.stopBackgroundAudio();
			that.audioToPlay();	
		}else if(newValue==that.data.progressMax){				
			that.audioNext();
		}else{
			if(that.data.systemInfo.model=="iPhone"){
					wx.seekBackgroundAudio({
						position:newValue,
						fail:function(){
							wx.getNetworkType
					    ({
						    success: function(res) 
						    {
						      // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
						      var networkType = res.networkType;
						      if(networkType=="none"){
						        wx.showToast({
										  title: '网络异常',
										  duration: 2000
										}); 
						      	
						      }
						    }
					    });
							console.log("seek失败")
						}
					})
			}else{
				
			  //安卓	有时候不能很好的监听音乐播放，音乐暂停，音乐停止
			  //安卓下当音乐暂停后seek不能自动播放
			  //安卓下如果seek的时间还没有加载出来就会触发停止播放，有时候newValue<that.downloadTime也会触发停止播放（bug）
			  console.log("下载",newValue,that.downloadTime)
			  if(newValue>that.downloadTime){			  	
			  	//newValue=that.downloadTime-10;//设为下载时间依然触发停止播放
			  	console.log("大于",newValue);
			  	return false;//接着之前的播放继续播放
			  }
			  if(that.data.playPauseStyle=="play-out"){
			  //暂停
			    wx.seekBackgroundAudio({
			      position:newValue	
			    })
			    that.audioToPlay();						
			  }else{
			    wx.seekBackgroundAudio({
			      position:newValue	
			    })	
			  }
			}
				
		}	
 },
  selectPlay:function(event)
  {
    //从列表中选择播放
      var index = event.currentTarget.dataset.index;
      this.audioIndex = index;
      var node = this.data.sound.list[this.audioIndex]; 
      //设置导航标题
	    wx.setNavigationBarTitle
	    ({
	        title:node.file_name
	    });
	    //高亮呈现
	    this.setListLight();
      this.audioToPlay();
  },
  audioPrev:function()
  {
      //转到上一首
      var that=this;
      if(!that.data.dbClick){
				return;
  		}
	    console.log("上一首");
      this.audioIndex --;
      if(this.audioIndex<0)
      {
          this.audioIndex = this.data.sound.list.length-1;      	
      } 
      this.audioToPlay();
      //解决多次点击的问题
	    that.setData({dbClick:false})
	    setTimeout(function(){
	    	that.setData({dbClick:true})
	    },1000)
  },
  audioNext:function()
  {
    //转到下一首
    var that=this;  
    console.log("下首："+that.data.dbClick)
    if(!that.data.dbClick){
  		return;
  	}  		
		that.audioIndex ++;
	  if(that.audioIndex > that.data.sound.list.length-1)
	  {
	      that.audioIndex = 0;
	  }
	  that.audioToPlay();	  	
  	//解决多次点击的问题
    that.setData({dbClick:false})
    setTimeout(function(){
    	that.setData({dbClick:true})
    },1000)
  	
	      
  },
  //三种播放方式 1.检查是4g wifi none网络格式---4g网下的播放 第一次点击播放按钮时
  //2.只检查none和有网络格式 ----- wifi下的播放 以及 4g网下一曲播放完自动播放下一曲
  //3.不检查网络直接播放  -------  点击播放按钮时触发（非第一次）
  audioToPlay:function()
  {
  	//找到某个音频数据
  	var that=this;
    var node = this.data.sound.list[this.audioIndex]; 
    var filesize = Math.floor(node.file_size / 1024 /1024);
    that.setData({soundSize:filesize});		      
    
    //解决多次点击的问题
    if(!that.data.dbClick){
  		return;
  	}
    that.setData({playPauseStyle:"play-in"}); 
	  if(that.data.payLoading){
			//判断该资源是否需要付费
	    template.isCanView(that,that.data.uid,that.data.match_sales_id,that.data.match_sales_name,function(){
	    	if(that.data.canView) { 
				} else {
					paySound();	   
				}	
		    
	    });
		}else{//付费加载完
			if (that.data.canView) {     
			}else {
			  paySound();
			}
		}
		function paySound(){
			if(that.data.isSale){//售卖中
				that.data.bookMatch.match_price = Number(that.data.bookMatch.match_price).toFixed(2)
				that.setData({"template_pay.price":that.data.bookMatch.match_price})
				that.setData({"template_pay.sourceName":that.data.bookMatch.match_title})
				that.setData({"template_pay.sourceNum":that.data.sound.total_count})
				that.setData({"template_pay.payShow":true});
			}else{
				wx.showToast({
				  title: '售卖已结束',
				  duration: 2000
				}); 
			}			
			//设置导航标题
	    wx.setNavigationBarTitle
	    ({
	        title:node.file_name
	    });
	    //高亮呈现
	    this.setListLight();
			return false;
		}			
		if(!that.data.isFirst){
			wx.getNetworkType({
		    success: function(res){
		      // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
		      var networkType = res.networkType;
		      if(networkType=="none"||networkType=="wifi"){      	
		        //指定播放背景音乐
				    wx.playBackgroundAudio
				    ({
				        dataUrl: node.file_url,
				        title: node.file_name,
				        coverImgUrl:that.data.bookMatch.pic_root,
				        success:function()
				        {
									//播放中                 
							    if(that.audioTime)
							    {
						        //清除监听定时器     
						        clearInterval(that.audioTime); 
							    }
							    console.log("wifi播放")
							    that.audioTime = setInterval(that.listenAuido,1000);
				        }
				    });
				    that.keep();	
		      }else{
		      	that.setData({playPauseStyle:"play-in"});
		      	wx.pauseBackgroundAudio();
		      	that.setData({timeBeginText:'00:00'});
		      	that.setData({progressValue:0});
		      	that.setData({timeEndText:that.data.sound.list[that.audioIndex].time_length});
			      wx.showModal({
			      	title:'温馨提示',
						  content: '您正在使用手机流量收听，是否继续收听',
						  showCancel:true,
						  cancelText:'取消收听',
						  cancelColor:'#06c1ae',
						  confirmText:'继续收听',
						  confirmColor:'#06c1ae',
							success:function(res){
								if(res.confirm){
									//用户点击继续观看
									//指定播放背景音乐
									console.log("继续观看")
									that.setData({isFirst:true})
									that.setData({playPauseStyle:"play-in"});
							    wx.playBackgroundAudio
							    ({
							        dataUrl: node.file_url,
							        title: node.file_name,
							        coverImgUrl:that.data.bookMatch.pic_root,
							        success:function()
							        {
												//播放中                 
										    if(that.audioTime)
										    {
									        //清除监听定时器     
									        clearInterval(that.audioTime); 
										    }
										    that.audioTime = setInterval(that.listenAuido,1000);
							        }
							     });
									that.keep();
								}else if(res.cancel){
									//用户点击取消观看--不操作	
									console.log("取消观看")	
									that.setData({playPauseStyle:"play-out"});
									//wx.stopBackgroundAudio();
									wx.pauseBackgroundAudio()
								}
							}
						})
		      }
		     }
	    });
		}else{
			//指定播放背景音乐
			console.log("不是第一次播放")
	    wx.playBackgroundAudio
	    ({
	        dataUrl: node.file_url,
	        title: node.file_name,
          coverImgUrl: that.data.bookMatch.match_pic,
	        success:function()
	        {
						//播放中                 
				    if(that.audioTime)
				    {
			        //清除监听定时器     
			        clearInterval(that.audioTime); 
				    }
				    that.audioTime = setInterval(that.listenAuido,1000);
	        }
	     });
			that.keep();
			
		} 
		that.setData({dbClick:false})
    setTimeout(function(){
    	that.setData({dbClick:true})
    },1000)
		//设置导航标题
    wx.setNavigationBarTitle
    ({
        title:node.file_name
    });
    //高亮呈现
    this.setListLight();
  },
  closePayBox:function(){
  	this.setData({"template_pay.payShow":false});
  	this.setData({ "template_pay.clicked": false })
  	this.setData({playPauseStyle:"play-out"});
  },
	payNow:function(){
	var that=this;
	var seedId=that.data.bookMatch.match_sales_id;
	//点击立即支付后按钮文字变化且不能再点击
	if(that.data.template_pay.clicked){
		return;
	}
	that.setData({"template_pay.clicked":true})
	//快速购买并统一下单
	app.codeBook.fastBuySeed
	  (
	    seedId,
	    4226,
	    function (rts) 
	    {
	        console.log("统一下单成功，回调开始发起支付！");
	          //发起支付
	          wx.requestPayment
	          (
	              {
	                'timeStamp': rts.weixinpayinfo.timeStamp,
	                'nonceStr': rts.weixinpayinfo.nonceStr,
	                'package': rts.weixinpayinfo.package,
	                'signType': rts.weixinpayinfo.signType,
	                'paySign': rts.weixinpayinfo.paySign,
	                'success': function (res)
	                 {
	                    //支付成功
	                    console.log("支付成功啦");
	                    that.data.canView=true;
	                    that.setData({"template_pay.payShow":false});
	                    
	                    //播放
											that.audioToPlay();	  	
	                },
	                'fail': function (res) 
	                {
	                    //支付失败
	                    console.log("支付失败");
	                    that.data.canView=false;
	                    that.setData({"template_pay.clicked":false})
	                }
	              }
	           );
	        console.log(rts);
	    },
	    function(rts){
	    	that.data.canView=false;
	    	that.setData({"template_pay.payShow":false});
	    	that.setData({"template_pay.clicked":false})
	    }
	  );
  },
  keep:function(){
  	var that = this;    
    //找到某个音频数据
    var node = this.data.sound.list[this.audioIndex];        
    if(that.data.fileBrowserId>0)
    {
      //更新浏览时长
      app.codeBook.updateBrowserTime
      (
          that.data.fileBrowserId,
          function(rts)
          {
            
          }
      );
      
    //更新资源的浏览时长
    app.codeBook.updateBrowserTime
      (
          that.data.browserId,
          function(rts)
          {
            
          }
      );
    }
    //添加浏览记录
    app.codeBook.addBrowser
    (
        node.id,
        "app_instance_file",
        node.file_name,
        function(rbs)
        {
           that.data.fileBrowserId = rbs.data.browser_id*1;
        }
    );
  },
  audioPause: function () {
  	//解决多次点击的问题
  	var that=this;
  	console.log("暂停："+this.data.dbClick)
    if(!this.data.dbClick){
  		return;
  	}  	
    wx.pauseBackgroundAudio();
    this.setData({playPauseStyle:"play-out"});
    this.setData({dbClick:false})
    setTimeout(function(){
    	that.setData({dbClick:true})
    },1000)
  },
  audio14: function () {
    this.audioCtx.seek(14)
  },
  audioStart: function () {
    this.audioCtx.seek(0)
  },
  setListLight:function()
  {
    //设置列表中元素高亮    
    var that=this;
    var data = this.data.sound;
    for(var i=0;i<data.list.length;i++)
    {
        data.list[i]["class"] = "sound-item";
    }
    data.list[this.audioIndex]["class"] = "sound-item-over";
    this.setData({sound:data});
    
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
  toInstance:function(event) 
  {
  	var that=this;
  	if(!that.data.dbClick){
  		return;
  	}
  	this.setData({dbClick:false})
    setTimeout(function(){
    	that.setData({dbClick:true})
    },1000)
    var toPage = "/pages/desk/";
    if(this.data.bookMatch.match_sales_name=="app_instance")
    {
       toPage = "../article/article?book_id="+this.data.bookId+"&app_instance_id="+this.data.bookMatch.match_sales_id+"&match_id="+that.data.bookMatch.id+"&match_sales_name="+that.data.bookMatch.match_sales_name+"&app_instance_style=sound";
    }
    else if(this.data.bookMatch.match_sales_name=="seed")
    {
      toPage = "../../seed/seed?book_id="+this.data.bookId+"&match_sales_id="+this.data.bookMatch.match_sales_id+"&match_id="+that.data.bookMatch.id+"&match_sales_name="+that.data.bookMatch.match_sales_name+"&app_instance_style=sound";
    }
    wx.navigateTo({url: toPage}); 
    this.setData({hide:true})
  },
  toHome:function()
  {
    app.codeBook.toHome();
  },
   toUser: function () {
    app.codeBook.toUser();
  }
})