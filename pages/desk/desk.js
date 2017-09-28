// pages/desk/desk.js
//https://services.chubanyun.net/?method=CodeBookBO.getDeskBookList
var app = getApp();
Page({
  data: 
  {
    book:
    {
      total_count:0,
      count:0,
      list:[]
    },
    readbook:
    {
      count:-1,
      list:[]
    },
    loadding:false,
    loadLastId:0,
    loadMore:true,
    loadMoreCount:12, 
    toPage:true,
    longTimeOver:false,
    showDeleteBtn:false,
    ifShowBtn:false,
    font:app.globalData.weixinUserInfo.code_book_font,
    ifTrueDel: false,
    bookId:"",
    bookIndex:"",
    nodouble:true,
    banners:[],
    isFirstShow:true,
    bannerOfOxFord:[],
    currentIndex:0,
    loadTip:{
    	showLoadTip:true,
    	text:'正在加载'
    }
  },
  bindStartScan:function(event)
  {
    var that = this;
     wx.scanCode
     ({
      success: (res) => {   
            app.codeBook.addBookByISBN(
                res.result,
                function(resbook)
                {    
                     if(resbook.data.success)
                     {
                        //把返回的数据插入到数组，放在第一个
                        var resdata = resbook.data;
                        var bookdata = that.data.book;
                        var booklist = bookdata.list;
                        var push = true;
                        for(var i=0;i<bookdata.list.length;i++)
                        {
                            if(bookdata.list[i].id * 1 == resdata.data.id * 1)
                            {
                                push = false;
                                that.swapArray(booklist,i);
                                that.setData({book:bookdata});

                                break
                            }

                        }
                       
                        if(push)
                        {
                           
                           if(resdata.data.book_pic =="") {
                               resdata.data.book_pic = "../images/no_image.png"
                           }
                            var node = 
                            [ 
                                {
                                    rownumber:0,
                                    book_name:resdata.data.book_name,
                                    book_pic:resdata.data.book_pic,
                                    id:resdata.data.id,
                                    updatetime:resdata.data.updatetime
                                }
                            ];
                            
                            var loadLastId = that.data.loadLastId + 1;
                            bookdata.count ++;
                            bookdata.total_count ++;
                            bookdata.list = node.concat(booklist);
                            
                            that.setData({book:bookdata});
                            that.setData({loadMore:true});

                            that.setData({loadLastId:loadLastId});

                        }

                        
                        //that.loadBookList();
                        wx.navigateTo({url: '../book/book?book_id='+resdata.data.id});
                     }else {
                          wx.showToast
                            (
                                {
                                    title: resbook.data.message,
                                    image:"/pages/images/delete_btn.png",
                                    duration: 2000
                                }
                            )
                     }
                     
                }
            );
      }
    });
  },
  onShow:function()
  {
    var that=this;
    var font = app.globalData.weixinUserInfo.code_book_font;
    this.setData({font:font});
    this.hiddenDeleteBtn();
    //清空数据
    
    //加载
    // app.codeBook.updateBookReadTime(bookId);
    console.log(that.data.book_id);
    //重新加载
    if (!that.data.isFirstShow){
    	that.data.book.count=0;
    	that.data.book.list=[];
    	that.data.index=1;
    	that.data.loadMore=true;
    	that.data.loadLastId=0;
      that.loadBookList();     
    }
    //判断网络
    wx.getNetworkType
    ({
    success: function(res) 
    {
      // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
      var networkType = res.networkType;
      if(networkType=="none"){
        wx.showToast({
					  title: '网络异常',
					  duration: 2000
					}); 
      	
      }
     }
     });
    
  },
  onHide:function(){
      var that=this;
      that.setData({ isFirstShow:false});
  },
  onLoad: function () 
  {
    var that=this;
    that.setData(getApp().globalData);
    app.Dictation.GetCodeBookBannerList(
      function (res) {
        console.log(res.data);
        let banner=res.data.list;
        let tmpArr=[];
        for(let i=0;i<banner.length;i++){
          let myJson={
            imgurl: banner[i].fileurl,
            title:banner[i].title,
            id: banner[i].id,
            url:banner[i].url
          }
          tmpArr.push(myJson);
        }
        that.setData({banners:tmpArr});
      }
    );
    that.loadBookList();
  },
 onReachBottom:function(){
 	if(this.data.loadding){
    	return;
    }else{
    	//加载
	    this.loadBookList();
    }
 },
  onPullDownRefresh: function()
  {
  	var that=this;
    //清空数据
    if(that.data.loadding){
    	return;
    }else{
    	that.data.book.total_count=0;
    	that.data.book.count=0;
    	that.data.book.list=[];
	    this.setData({loadding:false});
	    this.setData({loadLastId:0});
	    this.setData({loadMore:true});
	    this.setData({showDeleteBtn:false})
	    //加载
	    this.loadBookList();
    }
  },
  toBookPage:function(event)
  {
    //允许跳转时才处理
   
    if(this.data.toPage)
    {

         if(this.data.nodouble) {
            var book_id = event.currentTarget.dataset.bookId;
            var book_index = event.currentTarget.dataset.bookIndex;
            var that = this;

            var app = function()
            {
                //数组元素移动，把当前点击的书籍排在第一位
                var new_book = that.data.book;
                var list = new_book.list;
                that.swapArray(list,book_index);

                that.setData({book:new_book});
            }
            setTimeout(app,500);

            //console.log("index="+book_index);
            that.data.nodouble = false;
            //禁止1s中内连续打开书籍
            setTimeout(function(){that.data.nodouble=true},1000)
            wx.navigateTo({url: '../book/book?book_id=' + book_id});
            
         }
        
    }
    else if(this.data.longTimeOver)
    {   
        //一般为展示删除按钮后，再点击书籍，则需要隐藏删除按钮，并设置为可以跳转到书籍页的状态
        this.longTapReset();
    }
    

  },
  longTapReset:function()
  {
  	if(!this.data.ifTrueDel){
  		this.data.toPage = true;
    	this.setData({showDeleteBtn:false});
  	}
  },
  longTapBook:function(event)
  {
      var that = this;
      that.setData({longTimeOver:false})
      this.data.toPage = false;
      this.setData({showDeleteBtn:true});
  
      setTimeout(function(){that.setData({longTimeOver:true,ifShowBtn:true})},1000);
      //长按某本书籍
     // console.log("longTapBook");
  },
  hiddenDeleteBtn:function(event) {
    var that = this;
    if(that.data.ifShowBtn) {
        that.setData({showDeleteBtn:false,ifShowBtn:false,toPage:true});
    }
    if(that.data.ifTrueDel){
    	this.setData({ifTrueDel:false});
    }
  },

  deleteBook:function(event)
  {
      //点击按钮删除图书
      var book_id = event.currentTarget.dataset.bookId;
      var book_index = event.currentTarget.dataset.bookIndex;
      this.setData({ifTrueDel:true,bookId:book_id,bookIndex:book_index});
  },
  noDel:function() {
      this.setData({ifTrueDel:false});
  },
  sureDel:function(){
      var book_id = this.data.bookId;
      var book_index = this.data.bookIndex;
      var that = this;
      app.codeBook.deleteBook
      (
          book_id,
          function(res)
          {
              if(res.data.success)
              {
                  var bookdata = that.data.book;
                  bookdata.count --;
                  bookdata.total_count --;
                  bookdata.list.splice(book_index,1);
                  that.setData({book:bookdata});

                  var loadLastId = that.data.loadLastId - 1;
                  that.setData({loadLastId:loadLastId});

                  //删除到已经没有书籍时
                  console.log(bookdata.total_count)
                  if(bookdata.total_count==0)
                  {
                      that.longTapReset();
                  }
               
                  wx.showToast
                  (
                      {
                          title: "删除成功！",
                          icon: 'success',
                          duration: 2000
                      }
                  )

              }
              else
              {
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
      );
      this.setData({ifTrueDel:false});
  },
  
  loadBookList:function()
  {
      //首次加载
      //上拉加载更多
      //下来全部刷新
      var that = this;
       //有必要加载更多，且没在请求加载中
      //  console.log(" that.data.loadMore",that.data.loadMore)
       console.log("下拉刷新");
      if(that.data.loadMore && !that.data.loadding)
      {       
          //  console.log("that.data.loadMore",that.data.loadMore)   
          if(app.globalData.weixinUserInfo.uid>0)
          {    
          	
              that.setData({loadding:true});
              app.codeBook.getDeskBookList(
                  function(res)
                  {                  
                      var data = res.data;
                      var list = data.list;
                      if(data.list.length>0)
                      {
                        console.log(data.list);
                          var loadLastId = data.list[data.list.length-1].rownumber;

                          //追加数据
                          data.count = data.count*1 + that.data.book.count*1;
                          data.list = that.data.book.list.concat(data.list);
                          //填充数据
                          
                          for(var i=0;i<list.length;i++) {
                          
                            var bookPic = list[i].book_pic;
                            list[i].book_pic = bookPic.substring(0, bookPic.length - 4) + "_c" + bookPic.substring(bookPic.length - 4)
                            
                            if(list[i].book_pic == "") {
                                list[i].book_pic = "../images/no_image.png"
                            }
                          }
                          
                          that.setData({book:data});
                          that.setData({loadLastId:loadLastId});
                      }
                      //console.log("list.length="+list.length+",that.data.loadMoreCount="+that.data.loadMoreCount)
                      //如果不够12条，标记不用再加载更多
                      if(list.length!=that.data.loadMoreCount)
                      {
                          that.setData({loadMore:false});
                    			that.setData({'loadTip.showLoadTip':false});
                      }
                      that.setData({loadding:false});
                      wx.stopPullDownRefresh();
                  },
                  that.data.loadLastId,
                  that.data.loadMoreCount
              );

          }
          else
          {
            setTimeout(that.loadBookList,100);
          }
      }
      

  },
  swapArray:function(arr, index1) 
  {
        if(index1>0)
        {
           
            var item = arr[index1];
            arr.splice(index1,1);
            arr.splice(0,0,item);
        }
  },
  //去听写
  toDictation:function(){
  	wx.redirectTo({
      url: `/pages/dictation/searchlist/searchlist`
		})
  },
  gotoSearchList:function(e){
    var that=this;
    const URL=e.currentTarget.dataset.urls;
    wx.navigateTo({
      url: URL
      })
  },
  //主题下一个
  bindNext:function(){
  	var that=this;
  	that.data.currentIndex=that.data.currentIndex+1;
  	if(that.data.currentIndex+1>that.data.banners.length){
  		that.data.currentIndex=0;
  	}
  	that.setData({currentIndex:that.data.currentIndex})
  },
  bindChange:function(e){
  	var current=e.detail.current;
  	this.setData({currentIndex:current})
  },
  catchTouchMove:function(){
  	return false;
  }
})
