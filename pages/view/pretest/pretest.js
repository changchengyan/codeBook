// pages/view/pretest/pretest.js
var app = getApp();
Page({
  data:{
      bookMatch:{},
      pretest:
      {
        total_count:-1,
        count:-1,
        list:[]
      },
      bookId:0,
      loadding:false,
      loadLastId:0,
      loadMore:true,
      browserId:0,  	
    loadMoreCount:20,
    font:app.globalData.weixinUserInfo.code_book_font,
    canView:true,
    firstShow:true,
    dbClick:false,
    isShare:false
  },
  onShareAppMessage: function ()
  {
     var that=this;
	 var title = that.data.bookMatch.match_title;
	 var path = "/pages/view/pretest/pretest?match_id="+that.data.match_id+"&match_sales_id="+that.data.match_sales_id+"&match_sales_name="+that.data.match_sales_name+"&book_id="+that.data.bookId;
	 return app.codeBook.onShareAppMessage(title,path,that.data.match_sales_id,that.data.match_sales_name,"小程序码书阅读分享");  
     
  },
  onShow:function()
  {
  	var that=this;
    var font = app.globalData.weixinUserInfo.code_book_font;
    this.setData({font:font});
    if(!that.data.firstShow){
    	//onShow时判断判断该资源是否需要付费
	   if(this.data.match_sales_name=="seed"){
	   	//是商品
	   	app.codeBook.getCodeBookSeedCanView(
	    	that.data.uid,
	    	that.data.match_sales_id,
	    	that.data.match_sales_name,
	    	function(res){
	    		var canView=res.data.canView;
	    		if(canView){
	    			that.setData({canView:true});
	    		}else{
	    			that.setData({canView:false});				    						    			
	    		}
	    	}
	    )
	   }else{
	   		that.setData({canView:true});
	   }    
    }
  },
  onHide:function(){
    // 页面隐藏
    this.setData({firstShow:false});
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    
    var match_id =  options.match_id;
    var match_sales_id = options.match_sales_id;
    var match_sales_name = options.match_sales_name;
    var uid = app.globalData.weixinUserInfo.uid;
    var that = this;
    this.data.uid=uid;
    this.data.match_id=match_id;
    this.data.match_sales_id=match_sales_id;
    this.data.match_sales_name=match_sales_name;
    that.setData(getApp().globalData);
    
    
    //如果是分享进入，则要将书籍添加到书架
    that.data.bookId = options.book_id;
    that.setData({bookId:options.book_id})
    if(options.share=="true")
    {
        app.userLogin(function(){app.codeBook.addBookById(that.data.bookId,function(){});});    
        that.setData({isShare:true});  
    }
    
    //获取应用实例基本信息
    app.codeBook.getBookMatchInfo
    (
        match_id,
        uid,
        function(res)
        {
        	console.log(res)
        		res.data.match_price=Number(res.data.match_price).toFixed(2)
            that.setData({bookMatch:res.data});

            //文件资源列表 
            that.loadBookMatchFileList();   
            
				      //判断判断该资源是否需要付费
					   if(that.data.match_sales_name=="seed"){
					   	//是商品
					   	app.codeBook.getCodeBookSeedCanView(
					    	that.data.uid,
					    	that.data.match_sales_id,
					    	that.data.match_sales_name,
					    	function(res){
					    		var canView=res.data.canView;
					    		if(canView){
					    			that.setData({canView:true});
					    		}else{
					    			that.setData({canView:false});				    						    			
					    		}
					    	}
					    )
					   }else{
					   		that.setData({canView:true});
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

            //设置导航标题
              wx.setNavigationBarTitle
              ({
                  title:that.data.bookMatch.match_title
               });
        }
    );
  },
  onReady:function(){
    // 页面渲染完成
  },
  
 loadBookMatchFileList:function()
  {
      //文件资源列表 
      var that = this;
     //有必要加载更多，且没在请求加载中

      if(that.data.loadMore && !that.data.loadding)
      { 
          that.setData({loadding:true});          
          app.codeBook.getPaperBySeedPretestId
          (
              //that.data.bookMatch.match_id,
              that.data.bookMatch.match_sales_id,
              that.data.loadMoreCount,
              that.data.loadLastId,
              function(res)
              {
                  that.setData({loadding:false});
                  var data = res.data;
                  var list = data.list;
                  console.log(list.length)
                  if(data.list.length>0)
                  {
                      var loadLastId = data.list[data.list.length-1].rownumber;
                      //追加数据
                      data.count = data.count*1 + that.data.pretest.count*1;
                      data.list = that.data.pretest.list.concat(data.list);
                      //填充数据
                      that.setData({pretest:data});
                      that.setData({loadLastId:loadLastId});
                  }
                  else if(list.length==0)
                  {
                      data.count = data.count*1 + that.data.pretest.count*1;
                      data.list = that.data.pretest.list.concat(data.list);
                      //填充数据
                      that.setData({pretest:data});
                  }
                  //如果不够10条，标记不用再加载更多
                  if(list.length!=that.data.loadMoreCount)
                  {
                      that.setData({loadMore:false});
                  }
              }
          );    
      }

  },
  selectTest:function(e){
  	var that=this;
  	if(this.data.bookMatch.state==1||this.data.bookMatch.isPaid=='true'){//正在售卖中 或 支付过的
  		var page_id=e.currentTarget.dataset.id;
			var toPage="../pretest/pretestInfo/pretestInfo?book_id="+this.data.bookId+"&page_id="+page_id+"&match_id="+this.data.match_id+"&match_sales_id="+this.data.match_sales_id+"&match_sales_name="+this.data.match_sales_name;
			wx.navigateTo({url: toPage});
  	}else{
  		wx.showToast({
			  title: that.data.bookMatch.message,
			  icon: 'success',
			  duration: 2000
			})
  	}
  	
  },
  toInstance:function() 
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
  	this.hasNetWork(function(){
  		var toPage = "/pages/desk/";
	    if(that.data.bookMatch.match_sales_name=="app_instance")
	    {
	       toPage = "../article/article?book_id="+that.data.bookId+"&app_instance_id="+that.data.bookMatch.match_sales_id+"&match_id="+that.data.bookMatch.id+"&match_sales_name="+ that.data.bookMatch.match_sales_name+ "&app_instance_style=pretest";
	    }
	    else if(that.data.bookMatch.match_sales_name=="seed")
	    {
	      toPage = "../../seed/seed?book_id="+that.data.bookId+"&match_sales_id="+that.data.bookMatch.match_sales_id+"&match_sales_name=seed"+"&match_id="+that.data.bookMatch.id+"&app_instance_style=pretest";   
	    }
	    wx.navigateTo({url: toPage}); 
  	})
    
  },
  onUnload:function(){
    // 页面关闭
  },
  toHome: function () {
    app.codeBook.toHome();
  },
  toUser: function () {
    app.codeBook.toUser();
  },
  hasNetWork:function(callback,failCallback){
		//判断网络
  	wx.getNetworkType({
	    success: function(res){
	      // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
	      var networkType = res.networkType;
	      if(networkType=="none"){      	
	        wx.showToast({
					  title: '网络异常',
					  duration: 2000
					});  
					if(failCallback){
						failCallback();
					}
	      }else{
	      	if(callback){
	      		callback();
	      	}
	      }
	     }
    });
	},
})