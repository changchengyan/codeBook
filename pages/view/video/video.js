// pages/view/video/video.js
var template = require("../../../utils/template.js");
var app = getApp();
Page({
  data:
  {
      bookMatch:{},//state 0 1 2 对应message 售卖未开始  正在售卖中 售卖已结束
      bookId:0,
      videoInfo:{},
      video:
      {
        total_count:-1,
        count:-1,
        list:[]
      },
      videoSize:0,
      loadding:false,
      loadLastId:0,
      loadMore:true,
      loadMoreCount:20,
      showVideoMessage:false,
      controls:true,
      controlsTime:null,
      controlsTimeNumber:5000,
      browserId:0,
      fileBrowserId:0,
      systemInfo:{},
      font:app.globalData.weixinUserInfo.code_book_font,
      isFirst:true,
      videoShow:false,
      winH:0,
      videoTime:'00:00',
      isShare:false,
      template_pay:{
				price:0,
				sourceName:"",
				sourceNum:0,
				payShow:false,
				clicked:false
				
      },
      firstShow:true,
      dbClick:false,
      payLoading:true,
      isSale:true,//是否售卖 
      canView:true,
      
      //videoShow设为false的同时videoInfo.file_url设为一个无效地址
  },
   onShareAppMessage: function ()
   {
    var that=this;
	 var title = that.data.bookMatch.instance_name;
	 var path = "/pages/view/video/video?match_id="+that.data.bookMatch.id+"&match_sales_id="+that.data.bookMatch.match_sales_id+"&match_sales_name="+that.data.bookMatch.match_sales_name+"&book_id="+that.data.bookId;
	 return app.codeBook.onShareAppMessage(title,path,that.data.bookMatch.match_sales_id,that.data.bookMatch.match_sales_name,"小程序码书阅读分享");          
  },
  //iphone下设置controls为true,默认不显示播放控件，点击出来，再点击隐藏，故不需要controlsTap函数
  //android下设置controls为true，默认一直显示播放控件，故需要controlsTap函数，并在play函数里延时隐藏播放控件
  
  //iPhone下不支持bindtap、bindtouchstart、bindtouchend事件
  controlsTap:function()
  {
  	var that = this;
  	//视频区域click 显示/隐藏播放控件
		if(that.data.systemInfo.model=="iPhone"){
			that.setData({controls:true});
			return; 		
		}else{
			if(that.controlsTime!=null)
	      {
	        clearTimeout(that.controlsTime);
	      }
	      //点击现实或隐藏播放控件
	      that.setData({controls:!that.data.controls});
	      if(that.data.controls)
	      {
	        that.controlsTime = setTimeout(that.controlsHide,that.data.controlsTimeNumber);
	      }
		}
  },
  controlsHide:function()
  {
    //隐藏播放控件
      this.setData({controls:false});
  },
  onShow:function(){
    // 页面显示
    var that=this;
    if(!that.data.firstShow){
    	//判断是否付费
			if(that.data.canView&&that.data.match_sales_name=="seed"){
				template.isCanView(that,this.data.uid,this.data.match_sales_id,this.data.match_sales_name);		
			}
	  }
    //字体
    var font = app.globalData.weixinUserInfo.code_book_font;
    this.setData({ font: font });
  },
  onHide:function(){
    // 页面隐藏
    this.setData({firstShow:false});
  },
  onLoad:function(options)
  {
    // 页面初始化 options为页面跳转所带来的参数
    var uid=app.globalData.weixinUserInfo.uid;
    var match_id =  options.match_id;
    var match_sales_id = options.match_sales_id;
    var match_sales_name = options.match_sales_name;
    var book_id=options.book_id;
    var that = this;
    this.setData({uid:uid,match_id:match_id,match_sales_id:match_sales_id,match_sales_name:match_sales_name})
    that.setData(getApp().globalData);
    this.videoIndex = 0;
    this.videoContext = wx.createVideoContext('myVideo');
    
    console.log("页面加载完成")
    //如果是分享进入，则要将书籍添加到书架
    that.data.bookId = options.book_id;

    if (options.share == "true") {
      app.userLogin(function () { app.codeBook.addBookById(that.data.bookId, function () { }); });
      that.setData({ isShare: true });
    }
    
    //获取系统消息
    wx.getSystemInfo({
  		success: function(res) {
    		that.setData({winW:res.windowWidth});
    		that.setData({winH:res.windowHeight});
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
    //判断该资源是否需要付费
    template.isCanView(that,this.data.uid,this.data.match_sales_id,this.data.match_sales_name);		
    //获取应用实例基本信息
    app.codeBook.getBookMatchInfo 
    (
        match_id,
        uid,
        function(res)
        {
            that.setData({bookMatch:res.data});
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
            //判断该资源是否售卖
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
        }
    );
    //文件资源列表  
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
              list[i]["class"] = "video-item";
              that.data.loadLastId = list[i].rownumber;
              list[i]["time_length"] = app.formatTime(list[i]["time_length"]);
            }
          that.setData({videoTime:list[0].time_length})
          that.setData({video:data});
          //设置导航标题
			      wx.setNavigationBarTitle
			      ({
			          title:that.data.video.list[that.videoIndex].file_name
			      });				
			      //设置高亮
			      that.setListLight(); 
          }
          else if(list.length==0)
          {
             that.setData({video:data});
          }
          //如果没有取到20条，则不需要滚动加载
          if(list.length != that.data.loadMoreCount)
          {
               that.setData({loadMore:false});
          }
            

        }
    );
  
  },
  onReady:function(){
    // 页面渲染完成
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

      //更新浏览时长
      app.codeBook.updateBrowserTime
      (
          that.data.fileBrowserId,
          function(rts)
          {
            
          }
      );

  },
  loadMoreList:function()
  {
      var that = this;
      //有必要加载更多，且没在请求加载中
      if(that.data.loadMore  && !that.data.loadding)
      {
        	that.setData({loadding:true});
          var match_id = that.data.bookMatch.id;
          var last_id = that.data.loadLastId;
          var count = that.data.loadMoreCount;
          //文件资源列表  
		    app.codeBook.getBookSourceFileList
		    (
		        match_id,
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
		              list[i]["class"] = "video-item";
		              that.data.loadLastId = list[i].rownumber;
		              list[i]["time_length"] = app.formatTime(list[i]["time_length"]);
		            }
		          
		          var time=app.formatTime(list[0].time_length);		
		          that.setData({videoTime:time})
		          //追加数据
	            data.count = data.count*1 + that.data.video.count*1;
	            data.list = that.data.video.list.concat(data.list);
	            //填充文件列表数据
	            that.setData({video:data});
		          
		          //设置导航标题
					      wx.setNavigationBarTitle
					      ({
					          title:that.data.video.list[that.videoIndex].file_name
					      });				
					      //设置高亮
					      that.setListLight(); 
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
  bindEnded:function()
  {
    //播放结束时
    this.nextPlay();

  },
  bindPlay:function()
  {
  	//点击列表开始播放也会触发bindPlay
    //消息提示页中播放
    //if(this.data.isFirst){
    	//this.videoContext.pause();
    	//this.play(false);
    //}
    
    //没有加载到视频并且在视频中间有播放按钮时
  },
  play:function()
  {
    var that = this;
    var info = that.data.video.list[that.videoIndex];
    var filesize = Math.floor(info.file_size / 1024 /1024);
    that.setData({videoSize:filesize});

    if(that.controlsTime!=null)
    {
      clearTimeout(that.controlsTime);
    }
    //检查网络
    if(that.data.isFirst)
    {    	
				that.setData({isFirst:false})
				//根据网络状态判断是否立即播放
        wx.getNetworkType
        ({
            success: function(res) 
            {
              // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
              var networkType = res.networkType;
              if(networkType=="wifi"){               
                that.setData({controls:true});
                that.setData({videoShow:true});
                that.setData({videoInfo:info});
                setTimeout(function(){
                	console.log("付款成功后播放",2)
									that.videoContext.play();
								},100)
                that.keep();
                if(that.data.systemInfo.model=="iPhone"){
  									return; 		
  							}else{
  								that.controlsTime = setTimeout(that.controlsHide,that.data.controlsTimeNumber);
  							} 							
              }else if(networkType=="none"){
              	console.log("无网络")
              	that.setData({videoShow:false})
              	that.setData({'videoInfo.file_url':'http://.mp3'})
                wx.showToast({
								  title: '网络异常',
								  duration: 2000
								});                
              }else{            	
	              wx.showModal({
	              	title:'温馨提示',
								  content: '您正在使用手机流量观看,是否继续观看',
								  showCancel:true,
								  cancelText:'取消观看',
								  cancelColor:'#06c1ae',
								  confirmText:'继续观看',
								  confirmColor:'#06c1ae',
									success:function(res){
										if(res.confirm){
											//用户点击继续观看
											console.log("继续观看")
											that.setData({videoShow:true})
											that.setData({videoInfo:info});
											setTimeout(function(){
												that.videoContext.play();
											},100)
											that.keep();
										}else if(res.cancel){
											//用户点击取消观看--不操作
											console.log("取消观看")
											that.setData({isFirst:true})
											that.setData({videoShow:false})
											that.setData({'videoInfo.file_url':'http://.mp3'})
										}
									}
								}) 
              }
            }
          });
    }
    else
    {
	    	//网络状态判断
        wx.getNetworkType
        ({
            success: function(res) 
            {
              // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
              var networkType = res.networkType;
              if(networkType=="none"){  
              	that.setData({videoShow:false})
              	that.setData({'videoInfo.file_url':'http://.mp3'})
                wx.showToast({
								  title: '网络异常',
								  duration: 2000
								});                                 							                            
              }else{            	
								that.setData({controls:true});
                that.setData({videoShow:true});
                that.setData({videoInfo:info});
                setTimeout(function(){
                	console.log("付款成功后播放",3)
									that.videoContext.play();
								},100)
                that.keep();
                if(that.data.systemInfo.model=="iPhone"){
  									return; 		
  							}else{
  								that.controlsTime = setTimeout(that.controlsHide,that.data.controlsTimeNumber);
  							}
              }
            }
          });
  	}
  },
  centerPlay:function(){
  	var that=this;
  	if(that.data.payLoading){
		//判断该资源是否需要付费
	    template.isCanView(that,that.data.uid,that.data.match_sales_id,that.data.match_sales_name,function(){
	    	if(that.data.canView) {
					that.setData({videoShow:true});
					that.play();  
				} else {
					payVideo();	   
				}	
		    
	    },function(){
	    	that.setData({videoShow:true});
				that.play();  
	    });
		}else{//付费加载完
			if (that.data.canView) {
				that.setData({videoShow:true});
				that.play();      
			}else {
			  payVideo();
			}
		}
		
		function payVideo(){
			if(that.data.isSale){//售卖中
				that.data.bookMatch.match_price = Number(that.data.bookMatch.match_price).toFixed(2)
				that.setData({"template_pay.price":that.data.bookMatch.match_price})
				that.setData({"template_pay.sourceName":that.data.bookMatch.match_title})
				that.setData({"template_pay.sourceNum":that.data.video.total_count})
				that.setData({"template_pay.payShow":true})
			}else{
				wx.showToast({
				  title: '售卖已结束',
				  duration: 2000
				}); 
			}
		}
  	
  },
  selectPlay:function(event)
  {
    //从列表中选择播放
    var that=this;
    this.videoIndex = event.currentTarget.dataset.index;
    this.videoContext.pause();
    var uid=app.globalData.weixinUserInfo.uid;
    var seedId=this.data.bookMatch.match_sales_id;
    /*点击列表设置样式*/
    var info = that.data.video.list[that.videoIndex];
    //设置导航标题
	  wx.setNavigationBarTitle
	  ({
	    title:that.data.video.list[that.videoIndex].file_name
	   });
	  //设置高亮
	  that.setListLight();
    that.setData({videoTime:info.time_length})
    /*点击列表设置样式完*/
   //判断是资源还是商品
		
	  	if(that.data.payLoading){
			//判断该资源是否需要付费
	    template.isCanView(that,that.data.uid,that.data.match_sales_id,that.data.match_sales_name,function(){
	    	if(that.data.canView) {
					that.setData({videoShow:true});
					that.play();  
				} else {
					payVideo();	   
				}	
		    
	    },function(){
	    	that.setData({videoShow:true});
				that.play();  
	    });
		}else{//付费加载完
			if (that.data.canView) {
				that.setData({videoShow:true});
				that.play();      
			}else {
			  payVideo();
			}
		}
			function payVideo(){
				if(that.data.isSale){
					that.data.bookMatch.match_price = Number(that.data.bookMatch.match_price).toFixed(2)
					that.setData({"template_pay.price":that.data.bookMatch.match_price})
					that.setData({"template_pay.sourceName":that.data.bookMatch.match_title})
					that.setData({"template_pay.sourceNum":that.data.video.total_count})
					that.setData({"template_pay.payShow":true})
				}else{
					wx.showToast({
					  title: '售卖已结束',
					  duration: 2000
					}); 
				}
			}
			

    
    
  },
  closePayBox:function(){
  	this.setData({"template_pay.payShow":false});
  	this.setData({ "template_pay.clicked": false });
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
	                    that.play();
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
	    function(){
	    	//失败
        that.data.canView=false;
        that.setData({"template_pay.payShow":false});
        that.setData({"template_pay.clicked":false})
	    }
	  );
  },
  nextPlay:function()
  {
    this.videoIndex ++;
    if(this.videoIndex > this.data.video.list.length - 1 )
    {
        this.videoIndex = 0;
    }
    //设置导航标题
	  wx.setNavigationBarTitle
	  ({
	      title:this.data.video.list[this.videoIndex].file_name
	  });				
	  //设置高亮
	  this.setListLight();	  
    this.play();
  },
  setListLight:function()
  {
    //设置列表中元素高亮    
    var data = this.data.video;
    for(var i=0;i<data.list.length;i++)
    {
        data.list[i]["class"] = "video-item";
    }
    data.list[this.videoIndex]["class"] = "video-item-over";
    this.setData({video:data});
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
    var toPage = "/pages/desk/";
    if(this.data.bookMatch.match_sales_name=="app_instance")
    {
       toPage = "../article/article?book_id="+this.data.bookId+"&app_instance_id="+this.data.bookMatch.match_sales_id+"&match_id="+that.data.bookMatch.id+"&match_sales_name="+that.data.bookMatch.match_sales_name+"&app_instance_style=video";
    }
    else if(this.data.bookMatch.match_sales_name=="seed")
    {
      toPage = "../../seed/seed?book_id="+this.data.bookId+"&match_sales_id="+this.data.bookMatch.match_sales_id+"&match_id="+that.data.bookMatch.id+"&match_sales_name="+that.data.bookMatch.match_sales_name+"&app_instance_style=video";
    }
    wx.navigateTo({url: toPage}); 
  },
  toHome:function()
  {
    app.codeBook.toHome();
  },
  toUser:function()
  {
    app.codeBook.toUser();
  },
  keep:function(){
  	var that=this;
  	var info = that.data.video.list[that.videoIndex];
  	if(that.data.fileBrowserId>0)
    {
      //更新素材浏览时长
      app.codeBook.updateBrowserTime
      (
          that.data.fileBrowserId,
          function(rts)
          {
            
          }
      );
      //更新资源浏览时长
      app.codeBook.updateBrowserTime
      (
          that.data.browserId,
          function(rts)
          {
            
          }
      );
    }
    //添加素材浏览记录
    app.codeBook.addBrowser
    (
        info.id,
        "app_instance_file",
        info.file_name,
        function(rbs)
        {
           that.data.fileBrowserId = rbs.data.browser_id*1;
        }
    );
  }
})