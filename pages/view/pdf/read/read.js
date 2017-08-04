// pages/view/pdf/read/read.js
var app = getApp();
var touchStartData = null;
var touchMoveData = null;
Page({
  data:
  {
      imgList:
      {
        count:-1,
        list:[]
      },
      match_sales_id:0,
      match_sales_name:'',
      pdf_file_id:'',
      bookId:0,
      instanceFileName:'file',
      loadding:false,
      loadLastId:0,
      loadMore:true,
      loadMoreCount:5,
      browserId:0,
      fileBrowserId:0,
      progressMax:0,
      zoom:100,
      font:app.globalData.weixinUserInfo.code_book_font,
      touchStartData:[],
      touchMoveData:[],
      touchEndDistance:0,
      scroll:{top:0,left:0,width:0,height:0},
      screen:{width:0,height:0},
      screenW:"",
      screenH:"",
      scaleValue:0,
      systemAndroid:false,
      ifShowSilder:false,
      isShare: false

  },
  onShareAppMessage: function () {
    var that = this;
    var title = that.data.instanceFileName;
    var path = "/pages/view/pdf/pdf?match_id=" + that.data.match_id + "&match_sales_id=" + that.data.match_sales_id + "&match_sales_name=" + that.data.match_sales_name + "&book_id=" + that.data.bookId;
    return app.codeBook.onShareAppMessage(title, path, that.data.match_sales_id, that.data.match_sales_name, "小程序码书阅读分享");
  },
  onLoad:function(options)
  {
    // 页面初始化 options为页面跳转所带来的参数 
    var that = this;
    that.data.match_sales_id = options.match_sales_id;
    that.data.match_sales_name = options.match_sales_name;
    that.data.match_id = options.match_id;
    that.data.pdf_file_id = options.pdf_file_id;
    that.data.browserId = options.browser_id;
    that.setData(getApp().globalData);
    that.loadBookSourcePDFImgList();


    wx.getSystemInfo({success:function(res)
    {
        that.setData({screen:{width:res.windowWidth,height:res.windowHeight}})

    }});

    // 获取素材名称 
    app.codeBook.getInstanceFileInfo
    (
        that.data.pdf_file_id,
        that.data.match_sales_name,
        function(res)
        {
	        that.data.instanceFileName=res.data.file_name;
	        var browser_sales_name='';
	        if("seed"==that.data.match_sales_name){
	          browser_sales_name='seed_info_file';
	        }else if("app_instance" == that.data.match_sales_name){
	          browser_sales_name = 'app_instance_file';
	        }
	        //添加浏览记录
	        app.codeBook.addBrowser
	        (
	            that.data.pdf_file_id,
	            browser_sales_name,
	            that.data.instanceFileName,
	            function(rbs)
	            {
	            that.data.fileBrowserId = rbs.data.browser_id;
	            }
	        );
	        //设置导航头
	        wx.setNavigationBarTitle
	        ({
	            title:that.data.instanceFileName
	        });
        }
    );  
    
   
   
  },
  onScroll:function(e)
  {
      var that = this;
      
      that.data.scroll = {top:e.detail.scrollTop,left:e.detail.scrollLeft,height:e.detail.scrollHeight,width:e.detail.scrollWidth};
  },
  touchStart:function(e)
  {
      if(false) {
          console.log("1")
         var that = this;
         that.data.touchStartData = [];
         that.data.touchMoveData = [];
      }
   
  },  
  touchMove:function(e)
  {
    var that = this;
    //console.log(e);
    if(false) {
        if(e.touches.length==2)
        {
            
            if(that.data.touchMoveData.length==2)
            {
                that.data.touchStartData = that.data.touchMoveData;
                //console.log("touchStartData赋值");
            }
            that.data.touchMoveData = [{x:e.touches[0].clientX,y:e.touches[0].clientY},{x:e.touches[1].clientX,y:e.touches[1].clientY}];
            //console.log("touchStartData.length="+that.data.touchStartData.length);
            if(that.data.touchStartData.length==2 )
            {
                
                
                var s_x1 = that.data.touchStartData[0].x;
                var s_x2 = that.data.touchStartData[1].x;
                var s_y1 = that.data.touchStartData[0].y;
                var s_y2 = that.data.touchStartData[1].y;
                var distance_start = Math.sqrt( (s_x1-s_x2)*(s_x1-s_x2) + (s_y1-s_y2)*(s_y1-s_y2));


                var m_x1 = that.data.touchMoveData[0].x;
                var m_x2 = that.data.touchMoveData[1].x;
                var m_y1 = that.data.touchMoveData[0].y;
                var m_y2 = that.data.touchMoveData[1].y;
                var distance_move = Math.sqrt( (m_x1-m_x2)*(m_x1-m_x2) + (m_y1-m_y2)*(m_y1-m_y2));

                that.data.touchEndDistance = distance_move - distance_start
                //console.log("两点距离："+that.data.touchEndDistance);
                that.setZoom();
            }
            
        }
    }
   

  },
  setZoom:function()
  {
    var that = this;
    var zoom = that.data.zoom;
    var oldzoom = that.data.zoom;
    var value = that.data.touchEndDistance * 2 ;
    var scaleValue;
    zoom += value;

    if(zoom>=100)
    {
        if(zoom>800)
        {
            zoom = 800;
        }        
        that.setData({zoom:zoom});
        // var scroll = {left:0,top:100,width:0,height:0};
        //that.setData({scroll:scroll});

        //console.log("that.data.scroll="+that.data.scroll.top);
        
    }
    else if(zoom<100)
    {
         zoom = 100;
        that.setData({zoom:zoom});
    } 
    scaleValue = zoom/oldzoom;
      that.setData({scaleValue:scaleValue})
      that.changePosition()

    
  },
  showSilder:function() {
      var that = this;
    if(!that.data.ifShowSilder) {
        that.setData({ifShowSilder:true})
       
    }else {
         that.setData({ifShowSilder:false})
    }
     console.log("ifShowSilder",this.data.ifShowSilder)
  },
   sliderStart:function() {
    this.setData({ifSlider:true});
     var oldscroll={top:"",left:""};
    //  oldscroll.top = this.data.scroll.top/(this.data.zoom/100);
    //  oldscroll.left = this.data.scroll.left/(this.data.zoom/100);
      
    //  this.data.scroll.top = oldscroll.top;
    //  this.data.scroll.left = oldscroll.left;

    
  },
  //silder控制放大
silderChange:function(event) {
    var that = this;
    if(this.data.ifSlider) {
        
        var nowValue = event.detail.value;
        that.data.scaleValue = event.detail.value/this.data.zoom;
        that.setData({zoom:nowValue});
        that.changePosition()
    }
    
},
sliderEnd:function() {
     this.setData({ifSlider:false})
},
changePosition:function() {
    var that = this;
     setTimeout(function(){
     var newTop = (that.data.scaleValue)*(that.data.screenH/2+that.data.scroll.top)- that.data.screenH/2;
     console.log(" (this.data.scaleValue/100)*(that.data.screenH/2+this.data.scroll.top)", (that.data.scaleValue)*(that.data.screenH/2+that.data.scroll.top))
     var newLeft = that.data.screenW*(that.data.zoom/100-1)/2;
        that.setData({"scroll.top":newTop});
        that.setData({"scroll.left":newLeft,});
        console.log("newTop,that.data.scroll.top",newTop,that.data.scroll.top)
     },0)
    
},

  loadBookSourcePDFImgList:function()
  {
      var that = this;
      //有必要加载更多，且没在请求加载中
      if(that.data.loadMore && !that.data.loadding)
      { 
          that.setData({loadding:true});
           //文件资源列表
          app.codeBook.getBookMatchPDFImgList
          (
              that.data.match_sales_name,
              that.data.match_sales_id,
              that.data.pdf_file_id,
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
                        var whichend 
                        miniSrc =list[i]["imgurl"];
                        whichend = miniSrc.lastIndexOf(".");
                        var newS = miniSrc.substring(0,whichend); 
                        var newE = miniSrc.substring(whichend);
                        //newS = newS+"_mini";
                        miniSrc = newS+newE;
                        //console.log("miniSrc",miniSrc,"newS",newS,"newE",newE)
                        list[i]["file_size"] = (list[i]["file_size"]/ 1024 / 1024).toFixed(2);
                        list[i]["miniImgurl"] = miniSrc;
                      }

                      //追加数据
                      data.count = data.count*1 + that.data.imgList.count*1;
                      data.list = that.data.imgList.list.concat(data.list);
                      //填充数据
                      that.setData({imgList:data});
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
  selectPic:function(event) {
    var thisUrl;  
    var urlList=[];
    for(var i=0;i<this.data.imgList.list.length;i++) {
        urlList.push(this.data.imgList.list[i].imgurl);
        thisUrl = this.data.imgList.list[event.currentTarget.dataset.index].imgurl
    }
    wx.previewImage({
        current: thisUrl, // 当前显示图片的http链接
        urls: urlList, // 需要预览的图片http链接列表
    })
  },

  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
      var that = this;
    var font = app.globalData.weixinUserInfo.code_book_font;
    this.setData({font:font});
    var systemInfo = wx.getSystemInfoSync();
    var whichsystem  = systemInfo.system;
    // console.log("systemInfo",systemInfo)
    // if(whichsystem.indexOf("Android")!==-1) {
    //     that.setData({systemAndroid:false});
    // }else {
    //     that.setData({systemAndroid:false})
    // }
    this.setData({screenW:systemInfo.screenWidth,screenH:systemInfo.screenHeight})
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭，更新浏览时长
     var that = this;
      app.codeBook.updateBrowserTime
      (
          that.data.fileBrowserId,
          function(rts)
          {
           
          }
      );
     app.codeBook.updateBrowserTime
      (
          that.data.browserId,
          function(rts)
          {
           
          }
      );
  }
})