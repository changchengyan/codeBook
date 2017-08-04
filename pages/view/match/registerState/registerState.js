// pages/view/question/question.js
var app = getApp();
Page({
  data:{
  	state:0,//1 报名成功 2 报名已满 3您已报名
  	isClick:false
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    var match_sales_id = options.match_sales_id;
    this.match_sales_id = options.match_sales_id;
    if(options.state){
    	var state=options.state;
    	this.setData({state:state})
    }   
    
    //获取活动信息
     app.codeBook.getSeedInfoMatch(
    	match_sales_id,
    	function(res){
				wx.setNavigationBarTitle
	      ({
	         title:res.data.list[0].seed_name
	      });
    	}
    )
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
    // 页面关闭
  },
  bindCheck:function(){
  	//点击查看我的报名
  	var that=this;
  	if(!that.data.isClick){
  		var toPage = "/pages/view/match/myRegister/myRegister?match_sales_id="+this.match_sales_id; 
    	wx.redirectTo({url: toPage}); 
    	this.setData({isClick:true})
  	}
  	setTimeout(function(){
  		that.setData({isClick:false})
  	},1000)
  	
  },
  registerAgin:function(){
  	//点击重新报名
  	var that=this;
  	if(!that.data.isClick){
	  	var toPage = "/pages/view/match/match?match_sales_id="+this.match_sales_id+"&isMoving=true";   
	    wx.redirectTo({url: toPage});
	  }
  	setTimeout(function(){
  		that.setData({isClick:false})
  	},1000)
  }
  
})