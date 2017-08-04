// pages/view/match/match.js
var app = getApp();
Page({
  data:{
  	showNotice:false,
  	font:app.globalData.weixinUserInfo.code_book_font,
  	registerStatus:{},
  	seedInfo:{register_count:0,max_count:0,surplus_day:0,sale_price:0},
  	register_ratio:'0%',//已报名的比率
  	isFirst:true,
    moveS:0,
    moveE:0,
    isShare: false,
    bookId:0,

  },
  onShareAppMessage: function () {
    var that = this;
    var title = that.data.seedInfo.seed_name;
    var path = "/pages/view/match/match?book_id="+that.data.bookId+"&match_id=" + that.data.match_id + "&match_sales_id=" + that.data.match_sales_id + "&match_sales_name=seed";
    return app.codeBook.onShareAppMessage(title, path, that.data.match_sales_id, "seed", "小程序码书阅读分享");
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    var match_id =  options.match_id;
    this.match_id =  options.match_id;
    var match_sales_id = options.match_sales_id;
    this.match_sales_id = options.match_sales_id;
    var match_sales_name = options.match_sales_name;
    var uid=app.globalData.weixinUserInfo.uid;  
    var bookId=options.book_id;
    var that = this;
    that.setData({ match_sales_name:match_sales_name,match_id: match_id, match_sales_id: match_sales_id,bookId:bookId})
    that.setData(getApp().globalData);
    //如果是分享进入，则要将书籍添加到书架
    that.data.bookId = options.book_id;

    if (options.share == "true") {
      app.userLogin(function () { app.codeBook.addBookById(that.data.bookId, function () { }); });
      that.setData({ isShare: true });
    }
    //重新报名跳回此页
    
    if(options.isMoving){
    	this.setData({ isMoving: true })
    }
    //获取报名状态
    app.codeBook.getRegisterStatus(
    	match_sales_id,
    	uid,    	
    	function(res){
    		that.setData({'registerStatus.state':res.data,'registerStatus.message':res.message});
    	}
    )
    //获取活动信息
     app.codeBook.getSeedInfoMatch(
    	match_sales_id,
    	function(res){        
    		that.setData({seedInfo:res.data.list[0]});
    		//计算已报名的比率
    		var register_ratio=res.data.list[0].register_count/res.data.list[0].max_count*100+'%';
    		if(res.data.list[0].register_count/res.data.list[0].max_count*100>=100){
    			register_ratio=100+'%';
    		}
    		that.setData({register_ratio:register_ratio})
    		//添加应用实例浏览记录
        app.codeBook.addBrowser
        (
            match_sales_id,
            match_sales_name,
            res.data.list[0].seed_name,
            function(rbs)
            {
              that.data.browserId = rbs.data.browser_id;
            }
        );

        //设置导航标题
				wx.setNavigationBarTitle
	      ({
	         title:res.data.list[0].seed_name
	      });
    	}
    )

    that.setData({isFirst:true})
    
    
    
  },
  onReady:function(){
    // 页面渲染完成
  },
  touchStart:function(e) {
    this.data.moveS = e.touches[0].pageY;
    console.log("this.data.moveS", this.data.moveS)
    
  },
  touchMove:function(e) {
    this.data.moveE = e.touches[0].pageY;
    console.log("this.data.moveE", this.data.moveE)
    if (this.data.moveE < this.data.moveS) {
      this.setData({ isMoving: true })
    }

  
    

  },
  touchEnd:function(e) {
   

  },
  onShow:function(){
    // 页面显示
    var that=this;
    var font = app.globalData.weixinUserInfo.code_book_font;
    this.setData({font:font});
    
   if(that.data.isFirst){
   		return false;
   }
    //获取报名状态
    app.codeBook.getRegisterStatus(
    	that.match_sales_id,
    	app.globalData.weixinUserInfo.uid,    	
    	function(res){
    		that.setData({'registerStatus.state':res.data,'registerStatus.message':res.message});
    	}
    )
    //获取活动信息
     app.codeBook.getSeedInfoMatch(
    	that.match_sales_id,
    	function(res){        
    		that.setData({seedInfo:res.data.list[0]});
    		//计算已报名的比率
    		var register_ratio=res.data.list[0].register_count/res.data.list[0].max_count*100+'%';
    		
    		if(res.data.list[0].register_count/res.data.list[0].max_count*100>=100){
    			register_ratio=100+'%';
    		}
    		that.setData({register_ratio:register_ratio})
    	}
    )
    
  },
  onHide:function(){
    // 页面隐藏
    this.setData({isFirst:false})
  },
  onUnload:function(){
    // 页面关闭
  },
  bindNext:function(){
  	this.setData({ isMoving: true });
  },
  showNotice:function(){
  	this.setData({showNotice:true})
  },
  hiddenNotice:function(){
  	this.setData({showNotice:false})
  },
  register:function(){
  	//点击立即报名
  	var that=this;
  	wx.getNetworkType({
		  success: function(res) {
		    // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
		    var networkType = res.networkType
		    if(networkType=="none"){
		    	wx.showToast({
					  title: '无网络，请联网',
					  icon: 'success',
					  duration: 2000
					})
		    }else{
		    	if(that.data.registerStatus.state==1){//未报名
			  		var toPage = "/pages/view/match/register/register?book_id="+that.data.bookId+"&match_id="+that.match_id+"&match_sales_id="+that.match_sales_id+"&match_sales_name=seed";   
			    	wx.navigateTo({url: toPage}); 
			  	}else if(that.data.registerStatus.state==3){//已报名
			  		var toPage = "/pages/view/match/myRegister/myRegister?book_id="+that.data.bookId+"&match_sales_id="+that.match_sales_id+"&match_id="+that.match_id+"&match_sales_name=seed";   
			    	wx.navigateTo({url: toPage}); 
			  	}
		    }
		  }
		})
  	 
  },
  toHome: function () {
    app.codeBook.toHome();
  },
  toUser: function () {
    app.codeBook.toUser();
  }
  
})