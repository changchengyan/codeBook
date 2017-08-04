//index.js
//获取应用实例
var app = getApp();
Page
(
  {
    data: 
    {
      userInfo: {},
      codeBookUserInfo:{book_count:0,read_time_length:0,read_browser_count:0,ask_unread_count:0,default_unread_count:0},
      userTag:{one:"",two:"",three:"",four:""},
      font:app.globalData.weixinUserInfo.code_book_font,
      isFirstShow:true
    },
    onShow:function()
    {
      var font = app.globalData.weixinUserInfo.code_book_font;
      this.setData({font:font});
      if(!this.data.isFirstShow){
      	//展示的时候也要更新数据
     		this.getCodeBookUserInfo(); 
      }      
    },
    onHide:function()
    {
    	this.setData({isFirstShow:false});
    },
    onLoad: function () 
    {
      //console.log('onLoad')
     
     
      var that = this
      //调用应用实例的方法获取全局数据
      app.getUserInfo
      (
        function(userInfo)
        {
           if(userInfo.avatarUrl=="") {
             userInfo.avatarUrl="../images/user_default.png"
           }    
          //更新数据
          that.setData
          (
            {
              userInfo:userInfo
            }
          )
        }
      )

      this.getCodeBookUserInfo();  
    },
    onPullDownRefresh: function()
    {
      app.userLogin();
      this.getCodeBookUserInfo();      
    },
    getCodeBookUserInfo:function()
    {
      var that = this
      //获得码书用户的基本统计信息
      app.codeBook.getCodeBookUserInfo
      (
          function(res)
          {
	          that.setData({codeBookUserInfo:res.data});
	          wx.stopPullDownRefresh();
          }
      );
    },
    toPage: function(event) 
    {
      var page = event.currentTarget.dataset.page;
      var toPage = "";
      switch(page)
      {
        case "message":
          toPage = "message/message";
          break;
        case "welcome":
          toPage = "welcome/welcome";
          break;
        case "help":
          toPage = "help/help";
          break;
        case "setting":
          toPage = "setting/setting";
          break;
        default:
          break;
      }
      wx.navigateTo({url: toPage});
    
    }
  }
)
