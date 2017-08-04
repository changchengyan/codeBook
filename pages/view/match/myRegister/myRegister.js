// pages/view/question/question.js
var app = getApp();
Page({
  data:{
  	showNotice:false,
  	seedInfo:[],
  	font:app.globalData.weixinUserInfo.code_book_font,
  },
  onShareAppMessage: function () {
    var that = this;
    var title = that.data.seedInfo.seed_name;
    var path = "/pages/view/match/match?book_id="+that.data.bookId+"&match_id=" + that.data.match_id + "&match_sales_id=" + that.data.match_sales_id + "&match_sales_name=seed";
    console.log(path)
    return app.codeBook.onShareAppMessage(title, path, that.data.match_sales_id, "seed", "小程序码书阅读分享");
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    var uid=app.globalData.weixinUserInfo.uid;
    var match_sales_id = options.match_sales_id;
    this.setData({match_sales_id:options.match_sales_id,match_id:options.match_id,match_sales_name:options.match_sales_name})
    
    var that=this;
    that.data.bookId = options.book_id;
    //获取我的报名信息
     app.codeBook.getRegisterInfoById(
    	match_sales_id,
    	uid,
    	function(res){
    		console.log(res.options)
    		var len=res.options.length;
    		for(var i=0;i<len;i++){
    			if(res.options[i].item_input_type=='input'||res.options[i].item_input_type=='textarea'||res.options[i].item_input_type=='file'){
    				if(res.options[i].values[0].text==""){
    					res.options.splice(i,1);
    					len--;
    				}
    			}else{
    				if(res.options[i].values.length==0){
    					res.options.splice(i,1);
    					len--;
    				}
    			}
    		}
    		that.setData({seedMyInfo:res.options});
    	}
    )
     
		//获取活动信息
    app.codeBook.getSeedInfoMatch(
    	match_sales_id,
    	function(res){
    		that.setData({seedInfo:res.data.list[0]});
    		
    	}
    )
    
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
    var font = app.globalData.weixinUserInfo.code_book_font;
    this.setData({font:font});
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  showNotice:function(){
  	this.setData({showNotice:true})
  },
  hiddenNotice:function(){
  	this.setData({showNotice:false})
  },
  register:function(){
  	//点击立即报名
  	 var toPage = "/pages/view/activity/register/register";   
    wx.navigateTo({url: toPage}); 
  }
  
})