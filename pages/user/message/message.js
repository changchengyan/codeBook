// pages/user/message/message.js
var app = getApp();
Page({
  data:
  {
    loaddingUser:true,
    loaddingAuthor:false,  
    userInfo: null,  
    font: app.globalData.weixinUserInfo.code_book_font,   
    audioPlay: false,
    playPic: [],
    playIndex: -1,
    userMenu:"over",
    authorMenu:"",
    userComment:
    {
      total_count:0,
      count:-1,
      list:[]
    },
    userData:
    {
      loadding:false,
      loadLastId:0,
      loadMore:true,
      loadMoreCount:10,
      comment:
      {
        total_count:0,
        count:-1,
        list:[]
      }
    },
    authorData:
    {
      loadding:false,
      loadLastId:0,
      loadMore:true,
      loadMoreCount:10,
      comment:
      {
        total_count:0,
        count:-1,
        list:[]
      }
    }
  },
  onLoad:function(options)
  {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    this.loadCommentList();
    //调用应用实例的方法获取全局数据
    app.getUserInfo
      (
      function (userInfo) {
        if (userInfo.avatarUrl == "") {
          userInfo.avatarUrl = "../images/user_default.png"
        }
        //更新数据
        that.setData
          (
          {
            userInfo: userInfo
          }
          )
      }
      ); 
  },
  clickPlay: function (e) {
    var that = this;
    that.audioCtx = wx.createAudioContext('myAudio');
    if (that.data.playIndex != e.currentTarget.dataset.node) {
      that.data.playIndex = e.currentTarget.dataset.node;
      that.audioCtx.setSrc(that.data.authorData.comment.list[that.data.playIndex].answer_sound);
      that.setData({ "audioPlay": false });
    }
    if (!that.data.audioPlay) {
      that.audioCtx.play();
      that.setData({ "audioPlay": true });
    }
    else {
      that.audioCtx.pause();
      that.setData({ "audioPlay": false });
    }
    that.setPlayPic();
  },
  playEnd: function () {
    var that = this;
    that.setData({ "audioPlay": false });
    that.setPlayPic();
  },
  setPlayPic: function () {
    var that = this;
    for (var i = 0; i < that.data.authorData.comment.list.length; i++) {
      that.data.playPic[i] = 'http://f3.5rs.me/upload/20170608/2017_06_08_165146276.png';
    }
    if (that.data.audioPlay) {
      that.data.playPic[that.data.playIndex] = 'http://f3.5rs.me/upload/20170608/2017_06_08_151149540.gif';
    }
    that.setData({ "playPic": that.data.playPic });
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
  showComment:function(event)
  {
      var menu = event.currentTarget.dataset.menu;
      if(menu=="user")
      {
         this.setData({loaddingUser:true});
         this.setData({loaddingAuthor:false});
         this.setData({userMenu:"over"});
         this.setData({authorMenu:""});
         this.loadUserCommentList();
      }
      else if(menu=="author")
      {
         this.setData({loaddingUser:false});
         this.setData({loaddingAuthor:true});
         this.setData({userMenu:""});
         this.setData({authorMenu:"over"});
         this.loadAuthorCommentList();
      }
     
  },
  loadCommentList:function()
  {
      if(this.data.loaddingUser)
      {
          this.loadUserCommentList();
      }
      else
      {
          this.loadAuthorCommentList();
      }
  },
  loadUserCommentList:function()
  {
     
      var that = this;
      //书籍资源列表信息

      //有必要加载更多，且没在请求加载中
      if(that.data.userData.loadMore && !that.data.userData.loadding)
      { 
          var userData = that.data.userData;
          userData.loadding = true;
          //that.setData({userData:userData});
          app.codeBook.getBookReplyCommentList
          (
              that.data.userData.loadLastId,
              that.data.userData.loadMoreCount,
              function(res)
              {

                userData.loadding = false;
                

                var data = res.data;
                var list = data.list;
                
                if(data.list.length>0)
                {
                    var loadLastId = data.list[data.list.length-1].rownumber;

                    //追加数据
                    data.count = data.count*1 + that.data.userData.comment.count*1;
                    data.list = that.data.userData.comment.list.concat(data.list);
                    //填充数据
                    
                    userData.comment = data;
                    userData.loadLastId = loadLastId;
                    //that.setData({userData:userData});

                }
                

                //如果不够10条，标记不用再加载更多
                if(list.length!=that.data.userData.loadMoreCount)
                {
                    userData.loadMore = false;
                    //that.setData({userData:userData});
                }
                
                that.setData({userData:userData});
              }
          );
      }
      
  },
  loadAuthorCommentList:function()
  {
     
      var that = this;

      //有必要加载更多，且没在请求加载中
      if(that.data.authorData.loadMore && !that.data.authorData.loadding)
      { 
          var authorData = that.data.authorData;
          authorData.loadding = true;
          app.codeBook.getBookReplyAskList
          (
              parseInt(that.data.authorData.loadLastId)+1,
              that.data.authorData.loadMoreCount,
              function(res)
              {                                
                authorData.loadding = false;                
                var data = res.data;
                var list = data.list;
                if(data.list.length>0)
                {
                    var loadLastId = data.list[data.list.length-1].rownumber;

                    //追加数据
                    data.count = data.count*1 + that.data.authorData.comment.count*1;
                    data.list = that.data.authorData.comment.list.concat(data.list);
                    //填充数据
                    
                    authorData.comment = data;
                    authorData.loadLastId = loadLastId;

                }
                //如果不够10条，标记不用再加载更多
                if(list.length!=that.data.authorData.loadMoreCount)
                {
                    authorData.loadMore = false;
                }

                that.setData({authorData:authorData});
                that.setPlayPic();
              }
          );
      }
      
  },
  gotoQuestion:function(event){    
    wx.navigateTo({ url: '../../view/question/question?match_sales_id=' + event.currentTarget.dataset.id +'&match_sales_name=seed' });
  },
  gotoBook: function (event) {
    wx.navigateTo({ url: '../../book/book?book_id=' + event.currentTarget.dataset.id});
  },
})