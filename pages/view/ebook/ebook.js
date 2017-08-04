// pages/view/ebook/ebook.js
var template = require("../../../utils/template.js");
var app = getApp();
Page({
  data:
  {
      bookId:0,
      bookMatch:{},
      album:
      {
        total_count:-1,
        count:-1,
        list:[]
      },
      matchId:0,
      loadding:false,
      loadLastId:0,
      loadMore:true,
      loadMoreCount:10,
      browserId:0,
      imageHeight:"",
      font:app.globalData.weixinUserInfo.code_book_font,
      uid:app.globalData.weixinUserInfo.uid,
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
      isSale:true,//是否售卖 
      payLoading:true,
      canView:true,
  },
  onShareAppMessage: function ()
  {
     var that=this;
	 var title = that.data.bookMatch.match_title;
	 var path = "/pages/view/ebook/ebook?match_id="+that.data.bookMatch.id+"&match_sales_id="+that.data.bookMatch.match_sales_id+"&match_sales_name="+that.data.bookMatch.match_sales_name+"&book_id="+that.data.bookId;
	 return app.codeBook.onShareAppMessage(title,path,that.data.bookMatch.match_sales_id,that.data.bookMatch.match_sales_name,"小程序码书阅读分享");  
     
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
    var match_id =  options.match_id;
    var match_sales_id = options.match_sales_id;
    var match_sales_name = options.match_sales_name;   
    var that = this;
    that.setData(getApp().globalData);
    that.setData({font:app.globalData.weixinUserInfo.code_book_font});
    that.setData({uid:app.globalData.weixinUserInfo.uid});
		that.setData({match_id:match_id,match_sales_id:match_sales_id,match_sales_name:match_sales_name});  
    //如果是分享进入，则要将书籍添加到书架
    that.data.bookId = options.book_id;
    that.setData({bookId:options.book_id})
    if(options.share=="true")
    {
        app.userLogin(function(){app.codeBook.addBookById(that.data.bookId,function(){});});    
        that.setData({isShare:true});  
    }
		//判断是否付费
		template.isCanView(that,this.data.uid,this.data.match_sales_id,this.data.match_sales_name);		
    //获取应用实例基本信息
    app.codeBook.getBookMatchInfo
    (
        match_id,
        that.data.uid,
        function(res)
        {
            that.setData({bookMatch:res.data});
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
            //文件资源列表 
            that.loadBookMatchFileList();

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
              (
                {
                  title:that.data.bookMatch.match_title
                }
                
              );
        }
    );
   		
    
   
  },
  loadBookMatchFileList:function()
  {
      //文件资源列表 
      var that = this;
     //有必要加载更多，且没在请求加载中

      if(that.data.loadMore && !that.data.loadding)
      { 
          that.setData({loadding:true});          
          app.codeBook.getBookMatchFileList
          (
              that.data.bookMatch.match_id,
              that.data.bookMatch.match_sales_name,
              that.data.bookMatch.match_sales_id,
              that.data.loadLastId,
              that.data.loadMoreCount,
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
                      data.count = data.count*1 + that.data.album.count*1;
                      data.list = that.data.album.list.concat(data.list);
                      //填充数据
                      that.setData({album:data});
                      that.setData({loadLastId:loadLastId});
                  }
                  else if(list.length==0)
                  {
                      data.count = data.count*1 + that.data.album.count*1;
                      data.list = that.data.album.list.concat(data.list);
                      //填充数据
                      that.setData({album:data});
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
    var toPage = "../../seed/seed?book_id="+this.data.bookId+"&match_id=" + this.data.bookMatch.id +"&match_sales_id=" + this.data.bookMatch.match_sales_id + "&match_sales_name=seed&app_instance_style=ebook";

    wx.navigateTo({url: toPage});  
  },
  toArticleView:function(event)
  {
  	//判断是否需要付费，如果不需要付费直接跳转
    this.item = event.currentTarget.dataset.node;
    var that=this;   
    if(that.data.payLoading){
			//判断该资源是否需要付费
			    template.isCanView(that,that.data.uid,that.data.match_sales_id,that.data.match_sales_name,function(){
			    	if(that.data.canView) {
							wx.navigateTo({url: "read/read?book_id="+this.data.bookId+"&article_id="+that.item.id+"&match_id=" + that.data.bookMatch.id +"&match_sales_id=" + that.data.bookMatch.match_sales_id + "&match_sales_name=seed"});  
						} else {
							toView();
						}	
				    
			    },function(){
			    	wx.navigateTo({url: "read/read?book_id="+this.data.bookId+"&article_id="+that.item.id+"&match_id=" + that.data.bookMatch.id +"&match_sales_id=" + that.data.bookMatch.match_sales_id + "&match_sales_name=seed"});  
			    });
		}else{//付费加载完
			if(that.data.canView) {
				wx.navigateTo({url: "read/read?book_id="+this.data.bookId+"&article_id="+that.item.id+"&match_id=" + that.data.bookMatch.id +"&match_sales_id=" + that.data.bookMatch.match_sales_id + "&match_sales_name=seed"});  
			} else {
				toView();
			}	
		}
    
    function toView(){
    	if(that.data.isSale){//售卖中
				that.canView=false;
    			that.setData({"template_pay.price":that.data.bookMatch.match_price})
					that.setData({"template_pay.sourceName":that.data.bookMatch.match_title})
					that.setData({"template_pay.sourceNum":that.data.album.total_count})
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
  	this.setData({ "template_pay.clicked": false })
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
	                    that.data.canView=true;
	                    that.setData({"template_pay.payShow":false});
	                    wx.navigateTo({url: "read/read?book_id="+this.data.bookId+"&article_id="+that.item.id+"&match_id=" + that.data.bookMatch.id +"&match_sales_id=" + that.data.bookMatch.match_sales_id + "&match_sales_name=seed"});  
	                },
	                'fail': function (res) 
	                {
	                    //支付失败
	                    that.data.canView=false;
	                    that.setData({"template_pay.payShow":false});
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
  toHome:function()
  {
    app.codeBook.toHome();
  },
  toUser:function()
  {
    app.codeBook.toUser();
  }
})