// pages/book/answer/answer.js
var app = getApp();
Page({
  data:
  {
    book:{},
    bookId:0,
    formInfo:"",
    ask:
    {
       count:0,
       list:[]
    },
    loadding:false,
    loadLastId:0,
    loadMore:true,
    loadMoreCount:10,
    askSuccess:true,
    font:app.globalData.weixinUserInfo.code_book_font
  },
  onLoad:function(options)
  {
    // 页面初始化 options为页面跳转所带来的参数
    var book_id =  options.book_id;
    var that = this;

    //书籍基本信息  
    app.codeBook.getBookInfo
    (
        book_id,
        "3",
        function(res)
        {
            if(res.data.author_pic.length<10)
            {
                res.data.author_pic = "http://f3.5rs.me/upload/20170327/2017_03_27_114158571.jpg";
            }
            that.setData({book:res.data});
            wx.setNavigationBarTitle
            (
              {
                title:res.data.book_name
              }
            );
        }
    );
    that.data.bookId = book_id;
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
  formSubmit: function(e)
  {
    var that = this;   
    //提交答疑
		if(that.data.askSuccess){
			  app.codeBook.addBookAsk
		    (
		        e.detail.value.info,
		        that.data.bookId,
		        function(res)
		        {
		            var data = res.data.data;
		            that.setData({askSuccess:false});
		            if(res.data.success)
		            {
		                wx.showToast
		                (
		                  {
		                    title: "发表完成！",
		                    icon: 'success',
		                    duration: 2000
		                  }
		                )
		                that.setData({formInfo:""});
		                that.setData({askSuccess:false});
                    app.reloadAskPage = true;
                    wx.navigateBack({
                      delta: 1, // 回退前 delta(默认为1) 页面
                      success: function(res){
                        // success
                      },
                      fail: function(res) {
                        // fail
                      },
                      complete: function(res) {
                        // complete
                      }
                    })
		            }
		            else
		            {
		                wx.showToast
		                (
		                  {
		                    title: "发表失败："+res.data.message,
		                    icon: 'success',
		                    duration: 2000
		                  }
		                )
		                that.setData({askSuccess:false});
		            }
		        }
		    )
			
		}
  },
  toHelp:function(event) 
  {
    var toPage = "../../../user/help/help?book_id="+this.data.book.id;
    wx.navigateTo({url: toPage});    
  }
})