// pages/book/comment/comment.js
var app = getApp();
Page({
  data:
  {
    bookId:0,
    comment:
    {
      count:0,
      list:[]
    },
    formInfo:"",
    placeholder:"",
    commentParentId:0,
    formDisplay:false,
    formFocus:false,
    loadding:false,
    loadLastId:0,
    loadMore:true,
    loadMoreCount:10,
    commentSuccess:true,
    font:app.globalData.weixinUserInfo.code_book_font,
    nodouble:true,
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
            wx.setNavigationBarTitle
            (
              {
                title:res.data.book_name
              }
            );
        }
    );

     that.data.bookId=book_id;
     that.data.bookId = book_id;
        wx.getNetworkType({
			    success: function(res) {
			      // 返回网络类型, 有效值：
			      // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
			      var networkType = res.networkType
			      if(networkType=="none") {
			      that.setData({ifconnection:false});
			      }else {
			          that.loadCommentList();
			      }
			    }
				}) 
     

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
  loadCommentList:function()
  {
     var that = this;  
     //评论列表
     //有必要加载更多，且没在请求加载中
      if(that.data.loadMore && !that.data.loadding)
      { 
          that.setData({loadding:true});
          app.codeBook.getBookCommentList
          (
              that.data.bookId,
              that.data.loadLastId,
              that.data.loadMoreCount,
              function(res)
              {
                  that.setData({loadding:false});
									that.setData({loaddingPage:false});
                  var data = res.data;
                  var list = data.list;
                  console.log(list)
                  for(var i=0;i<list.length;i++) {
                    if(list[i].headimgurl=="") {
                      list[i].headimgurl = "../../images/user_default.png"
                    }
                  }
                  if(data.list.length>0)
                  {
                      var loadLastId = data.list[data.list.length-1].rownumber;

                      //追加数据
                      data.count = data.count*1 + that.data.comment.count*1;
                      data.list = that.data.comment.list.concat(data.list);
                      //填充数据
                      that.setData({comment:data});
                      that.setData({loadLastId:loadLastId});
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
  showForm:function()
  {

  },
  openForm:function()
  {
    //打开评论表单
    var that = this;
    that.setData({formDisplay:true,formFocus:true,commentParentId:0});
    that.setData({placeholder:""});
  },
  openReForm:function(event)
  {
    //打开回复评论表单
    var nodeData = event.currentTarget.dataset.node;
    var that = this;
    that.setData({formDisplay:true,formFocus:true,commentParentId:nodeData.id});
    that.setData({placeholder:"回复"+nodeData.nickname});
  },
  closeForm:function()
  {
    //关闭评论表单
    this.setData({formDisplay:false,formFocus:false,commentParentId:0});
  },
  formSubmit: function(e)
  { 
    var that = this;   
    //提交评论

    //如果一秒内连续点击多次
     if(!that.data.nodouble) {
       return false
     }
     console.log(that.data.nodouble)
    if(that.data.commentSuccess)
    {    	
    	app.codeBook.addBookComment
	    (
	        e.detail.value.info,
	        that.data.bookId,
	        that.data.commentParentId,
          'DEFAULT',
	        function(res)
	        {
	            var data = res.data;
	            that.setData({commentSuccess:false});	            
	            if(res.success)
	            {
	                
	                var node = 
	                [
	                  {
	                      rownumber:0,
	                      datetime:data.datetime,
	                      headimgurl:data.headimgurl,
	                      id:data.id,
	                      info:data.info,
	                      nickname:data.nickname,
	                      childlist:{count:0,list:[]}
	                  }
	                ];
	
	                var commentdata = that.data.comment;
	                var commentlist = commentdata.list;
	
	                //如果是主贴
	                if(data.parentid*1==0)
	                {
	                  console.log("主贴发布！");
	                  commentdata.count ++;
	                  commentdata.total_count ++;
	                  commentdata.list = node.concat(commentlist);
	
	                  that.setData({comment:commentdata});
	                  that.setData({loadMore:true});
	                }
	                else
	                {
	                  for(var i=0;i<commentlist.length;i++)
	                  {                     
	                      if(commentlist[i].id == data.parentid)
	                      {
	                          console.log("找到父节点！");
	                          commentlist[i].childlist.list = commentlist[i].childlist.list.concat(node);
	                          that.setData({comment:commentdata});
	                          that.setData({loadMore:true});
	                          break;
	                      }
	                  }
	
	                }
	                
                  
	                that.closeForm();
	                
	                wx.showToast
	                (
	                  {
	                    title: "发表完成！",
	                    icon: 'success',
	                    duration: 2000
	                  }
	                )
	                that.setData({commentSuccess:true});
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
	                that.setData({commentSuccess:true});
	            }
	        }
	    )
    }
    that.data.nodouble = false;
    setTimeout(function(){that.data.nodouble=true},1000)
  },
  formReset: function() {
    console.log('form发生了reset事件')
  }
})