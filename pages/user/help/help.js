// pages/user/help/help.js
Page({
  data:
  {
      help:
      {
        count:-1,
        list:[]
      }
  },
  onLoad:function(options)
  {
    // 页面初始化 options为页面跳转所带来的参数
     var that = this;

    //文件资源列表
    wx.request
    (
      {
        url: 'https://services.chubanyun.net/?method=CodeBookBO.getHelpList',
        header: {'content-type': 'application/json'},
        success: function(res)
        {     
        	
           if(res.data.success){
           	var data = res.data.data;
	          //填充文件列表数据
	          that.setData({help:data});
           }else{
           	wx.showToast
	         (
	           {
	              title: res.data.message,
	              icon: 'success',
	              duration: 2000
	           }
	         )	   
           }
          
        }
      }
    );


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
  }
})