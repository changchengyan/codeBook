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
    font:app.globalData.weixinUserInfo.code_book_font,
    ifconnection:true,
    loaddingPage:false,
  },
  onLoad:function(options)
  {
    // 页面初始化 options为页面跳转所带来的参数
    var book_id =  options.book_id;
    var that = this;
    that.setData({loaddingPage:true});
     that.setData(getApp().globalData);
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
        wx.getNetworkType({
			    success: function(res) {
			      // 返回网络类型, 有效值：
			      // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
			      var networkType = res.networkType
			      if(networkType=="none") {
			      that.setData({ifconnection:false});
			      }else {
			          that.loadAskList();
			      }
			    }
				}) 
    
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function()
  {
    // 页面显示
    var a = getApp();
    if(a.reloadAskPage)
    {
      a.reloadAskPage = false;
      var ask = 
    {
       count:0,
       list:[]
    };
     this.setData({ask:ask,loadLastId:0,loadMore:true});
     this.loadAskList();
   
    
    }


  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  loadAskList:function()
  {
    var that = this;  
     //答疑列表
    
     if(that.data.loadMore && !that.data.loadding)
      { 
          that.setData({loadding:true});
          app.codeBook.getBookAskList
          (
              that.data.bookId,
              that.data.loadLastId,
              that.data.loadMoreCount,
              function(res)
              {
                  console.log("res",res);
                //  console.log("loadLastId", that.data.loadLastId)
                  that.setData({loadding:false});
                  that.setData({loaddingPage:false});
                  var data = res.data;
                  var list = data.list;
                  for(var i=0;i<list.length;i++){
                    if(list[i].headimgurl=="") {
                      list[i].headimgurl = "../../images/user_default.png"
                    }
                  }
                  //console.log("列表",data,list.length)
                  if(list.length>0)
                  {
                      var loadLastId = list[list.length-1].rownumber;

                      //追加数据
                      data.count = data.count*1 + that.data.ask.count*1;
                      data.list = that.data.ask.list.concat(list);
                      //填充数据
                      console.log(data.count)
                      that.setData({ask:data});
                      that.setData({loadLastId:loadLastId});
                  }
                  else
                  {
                    that.setData({ask:{count:0,list:[]}});
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
		                
		                var node = 
		                [
		                  {
		                      rownumber:0,
		                      datetime:data.datetime,
		                      headimgurl:data.user_headimgurl,
		                      id:data.id,
		                      info:data.info,
		                      nickname:data.user_nickname
		                  }
		                ];
		
		                var askdata = that.data.ask;
		                var asklist = askdata.list;
		                askdata.count ++;
		                askdata.total_count ++;
		                askdata.list = node.concat(asklist);
		
		                that.setData({ask:askdata});
		                that.setData({loadMore:true});
		
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
  toForm:function(event) 
  {
    var toPage = "form/form?book_id="+this.data.book.id;
    wx.navigateTo({url: toPage});    
  }
})