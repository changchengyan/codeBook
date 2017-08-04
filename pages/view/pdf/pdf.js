// pages/view/album/album.js
var template = require("../../../utils/template.js");
var app = getApp();
Page({
  data:
  {
      bookMatch:{},
      pdf:
      {
        total_count:-1,
        count:-1,
        list:[]
      },
      loadding:false,
      loadLastId:0,
      loadMore:true,
      loadMoreCount:5,
      browserId:0,
      font:app.globalData.weixinUserInfo.code_book_font,
      bookId:0,
      isShare:false,
      template_pay: {
        price: 0,
        sourceName: "",
        sourceNum: 0,
        payShow: false,
        clicked: false
      },
      imgStyle: "pay-item-canvas",
      firstShow:true,
      dbClick:false,
      isSale:true,//是否售卖 
      payLoading:true,
      canView:true,
  },
   onShareAppMessage: function () {
     var that = this;
     var title = that.data.bookMatch.instance_name;
     var path = "/pages/view/pdf/pdf?match_id=" + that.data.bookMatch.id + "&match_sales_id=" + that.data.bookMatch.match_sales_id + "&match_sales_name=" + that.data.bookMatch.match_sales_name + "&book_id=" + that.data.bookId;
     return app.codeBook.onShareAppMessage(title, path, that.data.bookMatch.match_sales_id, that.data.bookMatch.match_sales_name, "小程序码书阅读分享");
   },
  onShow:function(){
    // 页面显示
    var that=this;
    if(!that.data.firstShow){
    	//判断是否付费
			//that.toArticleView();
			if(that.data.canView&&that.data.match_sales_name=="seed"){
				template.isCanView(that,this.data.uid,this.data.match_sales_id,this.data.match_sales_name,function(){
					if(that.data.canView) {
							that.setData({ imgStyle: "item-canvas" })
						} else {
							that.setData({ imgStyle: "pay-item-canvas" })
						}
				},function(){
						that.setData({ imgStyle: "item-canvas" })				
				});		
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
    that.setData({"bookMatch.match_id":match_id,"bookMatch.match_sales_id":match_sales_id,"bookMatch.match_sales_name":match_sales_name});
    that.setData({match_id:match_id,match_sales_id:match_sales_id,match_sales_name:match_sales_name})
   	var uid = this.data.weixinUserInfo.uid;
   	that.setData({uid:uid})
    //如果是分享进入，则要将书籍添加到书架
    that.data.bookId = options.book_id;   
    if(options.share=="true")
    {
        app.userLogin(function(){app.codeBook.addBookById(that.data.bookId,function(){});});    
        that.setData({isShare:true});  
    }
    //判断是否付费
    //that.toArticleView();
    //判断该资源是否需要付费
		template.isCanView(that,this.data.uid,this.data.match_sales_id,this.data.match_sales_name,function(){
			if(that.data.canView) {
					that.setData({ imgStyle: "item-canvas" })
				} else {
					that.setData({ imgStyle: "pay-item-canvas" })
				}
		},function(){
			that.setData({ imgStyle: "item-canvas" })				
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
	        
          that.closePayBox();
	        //添加浏览记录            
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
	        //设置导航头
	         wx.setNavigationBarTitle
	        ({
	            title:res.data.match_title
	        });
           

        }
    );
   

    //PDF文档列表
    that.loadBookSorcePDFList();

  },
  toArticleView: function () {
    //判断是否需要付费，如果不需要付费直接观看
    var uid = this.data.weixinUserInfo.uid;
    var seedId = this.data.match_sales_id;
    var seedName = this.data.match_sales_name;
    var that = this;
    if (this.data.match_sales_name == "app_instance") {
      that.setData({ imgStyle: "item-canvas" })
    } else {
      app.codeBook.getCodeBookSeedCanView(
        uid,
        seedId,
        seedName,
        function (res) {
          var canView = res.data.canView;
          that.data.canView = res.data.canView;
          if (!canView) {
            that.setData({ imgStyle: "pay-item-canvas" })
          } else {
            that.setData({ imgStyle: "item-canvas" })
          }
        }
      )
    }

  },
  loadBookSorcePDFList: function ()
  {
      var that = this;
      //文件资源列表


      //有必要加载更多，且没在请求加载中
      if(that.data.loadMore && !that.data.loadding)
      { 
          that.setData({loadding:true});   
          app.codeBook.getBookMatchPDFList
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
                  
                  if(data.list.length>0)
                  {
                      var loadLastId = data.list[data.list.length-1].rownumber;
                      var miniSrc
                      for(var i=0;i<list.length;i++)
                      {
                        list[i]["file_size"] = (list[i]["file_size"]/ 1024 / 1024).toFixed(2);
                        var whichend
                        miniSrc = list[i]["imgurl"];
                        if (miniSrc!="") {
                        
                          list[i]["miniImgurl"] = app.getPicPath(list[i]["imgurl"], ".", "_mini.");
                        }
                       
                      }
                      //追加数据
                      data.count = data.count*1 + that.data.pdf.count*1;
                      data.list = that.data.pdf.list.concat(data.list);

                      //填充数据
                      that.setData({pdf:data});
                      that.setData({loadLastId:loadLastId});
                  }
                  else if (data.list.length == 0 && that.data.loadLastId==0)
                  {
                    that.setData({pdf:data});
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
  toRead:function(event)
  {
      var pdf_file_id = event.currentTarget.dataset.fileId;
      var that = this;
      
      
      	if(that.data.payLoading){
	  			//判断该资源是否需要付费
				    template.isCanView(that,that.data.uid,that.data.match_sales_id,that.data.match_sales_name,function(){
				    	if(that.data.canView) {
								wx.navigateTo({ url: "read/read?book_id="+this.data.bookId+"&match_id=" + this.data.bookMatch.id +"&match_sales_id=" + this.data.bookMatch.match_sales_id + "&match_sales_name=" + this.data.bookMatch.match_sales_name + "&pdf_file_id=" + pdf_file_id + "&browser_id=" + this.data.browserId });
							} else {
								toRead();
							}	
					    
				    },function(){
				    	wx.navigateTo({ url: "read/read?book_id="+that.data.bookId+"&match_id=" + that.data.bookMatch.id +"&match_sales_id=" + that.data.bookMatch.match_sales_id + "&match_sales_name=" + that.data.bookMatch.match_sales_name + "&pdf_file_id=" + pdf_file_id + "&browser_id=" + that.data.browserId });
				    });
	  		}else{//付费加载完
	  			if (that.data.imgStyle == "pay-item-canvas") {
	  				toRead();
	  			}else{
	  				wx.navigateTo({ url: "read/read?book_id="+that.data.bookId+"&match_id=" + that.data.bookMatch.id +"&match_sales_id=" + that.data.bookMatch.match_sales_id + "&match_sales_name=" + that.data.bookMatch.match_sales_name + "&pdf_file_id=" + pdf_file_id + "&browser_id=" + that.data.browserId });
	  			}
	  		}
      	function toRead(){
	      	if(that.data.isSale){
	      		that.data.bookMatch.match_price = Number(that.data.bookMatch.match_price).toFixed(2)
		        that.setData({ "template_pay.price": that.data.bookMatch.match_price })
		        that.setData({ "template_pay.sourceName": that.data.bookMatch.match_title })
		        that.setData({ "template_pay.sourceNum": that.data.pdf.total_count })
		        that.setData({ "template_pay.payShow": true })
	      	}else{
	      		wx.showToast({
						  title: '售卖已结束',
						  duration: 2000
						});
	      	}		            
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
      that.data.bookMatch.match_sales_id,
      4226,
      function (rts) {
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
            'success': function (res) {
              //支付成功
              //that.toArticleView();
              that.setData({ imgStyle: "item-canvas" })
              that.setData({ "template_pay.payShow": false })
              that.setData({ "template_pay.clicked": false })
            },
            'fail': function (res) {
              //支付失败
              that.setData({ "template_pay.clicked": false })
              that.setData({ "template_pay.payShow": false })
            }
          }
          );
        console.log(rts);
      },
      function(){
		    	//失败
	        that.data.canView=false;
	        that.setData({ imgStyle: "pay-item-canvas" })
	        that.setData({"template_pay.payShow":false});
	        that.setData({"template_pay.clicked":false})
		    }
      );

  },
  closePayBox: function () {
    this.setData({ "template_pay.payShow": false });
    this.setData({ "template_pay.clicked": false })

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
  toInstance: function (event) {
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
    if (this.data.bookMatch.match_sales_name == "app_instance") {
      toPage = "../article/article?book_id="+this.data.bookId+"&match_id=" + this.data.bookMatch.id +"&app_instance_id=" + this.data.bookMatch.match_sales_id+"&match_sales_name=app_instance&app_instance_style=pdf";
    }
    else if (this.data.bookMatch.match_sales_name == "seed") {
      toPage = "../../seed/seed?book_id="+this.data.bookId+"&match_id=" + this.data.bookMatch.id +"&match_sales_id=" + this.data.bookMatch.match_sales_id + "&match_sales_name=seed&app_instance_style=pdf";
    }
    wx.navigateTo({ url: toPage });
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