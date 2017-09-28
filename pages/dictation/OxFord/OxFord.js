
var app=getApp();
Page({
  data: {
    font: app.globalData.font,
    nodouble: true,
    // 修改样式的数据
    grade_listBox: "not_show",
    loadding: false,
    loadMore: true,
    loadLastId:0,
    loadMoreCount:12,
    count:0,
    bannerOfOxFord:[],
    opacity:0,
    book_id:0,
    isFirstShow:true
  },
  onLoad:function(){
    var that=this;
    if(app.globalData.userInfo){//登陆了
    	var uid = app.globalData.weixinUserInfo.uid;
	    that.setData({ uid: uid })
    	that.getOxfordBookList();
    }else{//未登陆
    	app.userLogin(function () {
	      var uid = app.globalData.weixinUserInfo.uid;
	      that.setData({ uid: uid })
	      that.getOxfordBookList();
	    });
    }
    
    
  },
  getOxfordBookList:function(){
  	var that=this;
  	if(that.data.loadMore && !that.data.loadding){
  		that.setData({ loadding: true });
  		app.Dictation.GetOxfordBookList(
	      function (res) {
	        console.log(res.data);
	        let bannerOfOxFord = res.data.list;
	        that.setData({ bannerOfOxFord: bannerOfOxFord,count:res.data.count });
	        // 如果不够12条，标记不用再加载更多
          if (bannerOfOxFord.length != that.data.loadMoreCount) {
            that.setData({ loadMore: false });
          }
          that.setData({ loadding: false });
          wx.stopPullDownRefresh();
	      },
	      that.data.loadLastId,
	      that.data.loadMoreCount
	    );
  	}
  	
  },
  onShow:function(){
			var that=this;
			if(!that.data.isFirstShow){
				if(app.globalData.userInfo){//登陆了
		    	var uid = app.globalData.weixinUserInfo.uid;
			    that.setData({ uid: uid })
		    	that.getOxfordBookList();
		    }else{//未登陆
		    	app.userLogin(function () {
			      var uid = app.globalData.weixinUserInfo.uid;
			      that.setData({ uid: uid })
			      that.getOxfordBookList();
			    });
		    }
			}
  },
  onHide:function(){
		this.setData({isFirstShow:false})
  },
  //点击书籍后跳转到内容页面
  toBookPage: function (event) {
    //允许跳转时才处理
    var that = this;
      var isAdd=event.currentTarget.dataset.isadd;
      var book_id=event.currentTarget.dataset.bookId;
      if(isAdd==1){//已添加过
      	return false;
      }
    if(this.data.book_id==book_id){
    	return;
    }
    if (this.data.nodouble||this.data.book_id!=book_id) {
      console.log(event)
      that.setData({opacity1:0})
      that.data.nodouble = false;
      var book_index = event.currentTarget.dataset.bookIndex;
      var bookId = event.currentTarget.dataset.bookid;
      that.setData({ book_id: bookId });
      app.codeBook.addBookById2(bookId, function (res) {
        if (res.data.success) {
          //app.codeBook.updateBookReadTime(bookId);
          //wx.setStorageSync("bookId", bookID);
          //wx.setStorageSync("ReturnBook", "deskBook")
          
          //禁止1s中内连续打开书籍
          setTimeout(function () { that.data.nodouble = true }, 1000);
          for(var i=0;i<that.data.bannerOfOxFord.length;i++){
          	if(that.data.bannerOfOxFord[i].id==bookId){
          		that.data.bannerOfOxFord[i].isadd=1;
          		that.data.bannerOfOxFord[i].clicked=true;
          		break;
          	}
          }
          that.setData({bannerOfOxFord:that.data.bannerOfOxFord});
          that.setData({opacity1:'opacity1'})
        }
      });
    }       
  },
    /**
   * 用户点击右上角分享
   */
onShareAppMessage: function () {
    var that = this;
    return {
      title: "年级分类",
      path: '/pages/dictation/OxFord/OxFord?share=true'
    }
},
})