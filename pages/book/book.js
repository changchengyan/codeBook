// pages/book/book.js
var app = getApp();
Page({
  data:
  {
    book:
    {
      comment_count: 0,
      ask_count: 0
    }
    , source:
    {
      total_count: 0,
      count: -1,
      list: []
    },
    webcast:
    {
      source_count: -1,
    },
    bookId: 0,
    loadding: false,
    loaddingPage: false,
    loadLastId: 0,
    loadMore: true,
    loadMoreCount: 10,
    font: app.globalData.weixinUserInfo.code_book_font,
    browserId: 0,
    sourceId: 0,
    firstShow: true,
    ifconnection: true,
    isShare: false,
    scrollTop: 0,
    loadTip: {
      showLoadTip: true,
      text: '正在加载'
    },
  },
  onShareAppMessage: function () {
    var that = this;
    var title = that.data.book.book_name;
    var path = "/pages/book/book?book_id=" + that.data.book.id;
    return app.codeBook.onShareAppMessage(title, path, that.data.book.id, "platform_book", "小程序码书阅读分享");

  },
  onShow: function () {
    var that = this;
    var font = app.globalData.weixinUserInfo.code_book_font;
    that.setData({ font: font });
    if (!that.data.firstShow) {
      that.getBookLive();
      //重新获取资源
      var loadLastId = that.data.loadLastId;
      app.codeBook.getBookSourceList
        (
        that.data.bookId,
        0,
        loadLastId,
        function (res) {
          that.setData({ loadding: false });
          var data = res.data;
          var list = data.list;
          if (data.list.length > 0) {
            for (var i = 0; i < data.list.length; i++) {
              data.list[i]["icon_type"] = app.source[data.list[i]["match_type"]];
            }
            var loadLastId = data.list[data.list.length - 1].rownumber;
            //追加数据
            data.count = data.count * 1;
            data.list = data.list;
            //填充数据
            that.setData({ source: data });
            that.setData({ loadLastId: loadLastId });
          }
        }
        );
      that.bookInfo(that.data.bookId)
    }


  },

  //事件处理函数
  toSourceView: function (event) {
    var that = this;
    var nodeData = event.currentTarget.dataset.node;
    var toPage = "";
    this.setData({ sourceId: nodeData.id })
    switch (nodeData.match_type) {
      //应用
      case "video":
        toPage = "../view/video/video";
        break;
      case "sound":
        toPage = "../view/sound/sound";
        break;
      case "album":
        toPage = "../view/album/album";
        break;
      case "pdf":
        toPage = "../view/pdf/pdf";
        break;
      case "article":
        toPage = "../view/article/article";
        break;
      case "live":
        toPage = "../view/webcast/webcast";
        break;
      //商品
      case "seed_default":
        toPage = "../seed/seed";
        break;
      case "seed_ebook":
        toPage = "../view/ebook/ebook";
        break;
      case "seed_book":
        toPage = "../seed/seed";
        break;
      case "seed_sound":
        toPage = "../view/sound/sound";
        break;
      case "seed_video":
        toPage = "../view/video/video";
        break;
      case "seed_match":
        toPage = "../view/match/match";
        break;
      case "seed_pdf":
        toPage = "../view/pdf/pdf";
        break;
      case "seed_album":
        toPage = "../view/album/album";
        break;
      case "seed_number":
        toPage = "../view/number/number";
        break;
      case "seed_member":
        toPage = "../view/member/member";
        break;
      case "seed_pretest":
        toPage = "../view/pretest/pretest";
        break;
      case "seed_question":
        toPage = "../view/question/question";
        break;

      default:
        toPage = "../view/unknown/unknown";
    }

    if (nodeData.match_type == "article") {
      toPage += "?book_id=" + this.data.bookId + "&match_id=" + nodeData.id + "&app_instance_id=" + nodeData.match_sales_id + "&match_sales_name=" + nodeData.match_sales_name + "&app_instance_style=article";
    }
    else if (nodeData.match_type == "seed_default" || nodeData.match_type == "seed_book") {
      toPage += "?book_id=" + this.data.bookId + "&match_id=" + nodeData.id + "&match_sales_id=" + nodeData.match_sales_id + '&match_sales_name=seed' + '&seed_match_type=seed_default';
    }
    else if (nodeData.match_type == "live") {
      /* app.codeBook.getLiveByAppID(nodeData.match_sales_id,function(res){
         //that.setData({ loadding: false });
         var data = res.data;
         var list = data.list[0];
         if(list) {
               that.setData({webcast:list});
           }
       });
       toPage+="?play_url_hls=" +this.data.webcast.play_url_hls+"&match_sales_id=" + this.data.webcast.id + "&match_sales_name=app_instance&match_title="+this.data.webcast.source_name;*/
      toPage += "?book_id=" + this.data.bookId + "&match_app_id=" + nodeData.match_sales_id + "&match_sales_name=app_instance&match_title=" + nodeData.match_title;
    }
    else {
      toPage += "?book_id=" + this.data.bookId + "&match_id=" + nodeData.id + "&match_sales_id=" + nodeData.match_sales_id + "&match_sales_name=" + nodeData.match_sales_name;
    }
    if (nodeData.match_type != "applet") {
      wx.navigateTo({ url: toPage });
    } else {
      //console.log("nodeData", nodeData)
      app.codeBook.getApplet(nodeData.match_sales_id, function (res) {
        if (res.success) {
          console.log("getApplet.res",res)
          wx.navigateToMiniProgram({
            appId: res.data.appid,
            path: res.data.path,
            extraData: {

            },
            envVersion: 'trial',
            success: function () {
              console.log("跳转成功")

              //添加浏览记录
              app.codeBook.addBrowser
                (
                nodeData.match_sales_id,
                "app_instance",
                nodeData.match_title,
                function (rbs) {
                  that.data.browserId = rbs.data.browser_id;
                  console.log("that.data.browserId", that.data.browserId)
                }
                );
            }
          })
        } else {
          wx.showToast({
            title: '资源维护中',
            icon: 'success',
            duration: 2000,

          })
        }
      })
    }


  },
  toComment: function (event) {
    wx.navigateTo({ url: "comment/comment?book_id=" + this.data.bookId });
  },
  toInfo: function (event) {
    wx.navigateTo({ url: "info/info?book_id=" + this.data.bookId });
  },
  toAnswer: function (event) {
    wx.navigateTo({ url: "answer/answer?book_id=" + this.data.bookId });
  },
  bookInfo: function (book_id) {
    //书籍基本信息  
    var that = this

    app.codeBook.getBookBaseInfo
      (
      book_id,
      function (res) {
        // console.log(res.data)
        if (res.data.book_pic == "") {
          res.data.book_pic = "../images/no_image.png"
        }
        that.data.bookId = book_id;
        console.log("res.data ", res.data, "book_id", book_id)
        that.setData({ book: res.data });

        //添加浏览记录
        console.log(book_id)
        app.codeBook.addBrowser
          (
          book_id,
          "platform_book",
          res.data.book_name,
          function (rbs) {
            that.data.browserId = rbs.data.browser_id;
          }
          );
        wx.setNavigationBarTitle
          (
          {
            title: res.data.book_name
          }
          );
      }
      );
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var book_id = options.book_id;
    var that = this;
    that.setData(getApp().globalData);
    that.data.bookId = book_id;
    that.setData({ loaddingPage: true });


    //如果是分享进入，则要将书籍添加到书架  
    if (options.share == "true") {
      app.userLogin(function () { app.codeBook.addBookById(that.data.bookId, function () { }); });
      that.setData({ isShare: true });
    }
    //更新用户的某本书的最后阅读时间
    app.codeBook.updateBookReadTime(book_id);
    //通过听写进入码书
    if (options && options.fromDictation) {
      app.userLogin(function () {
        app.codeBook.addBookById(options.book_id, function (res) {

        })
      });
    }
    that.bookInfo(that.data.bookId)



    //加载资源
    wx.getNetworkType({
      success: function (res) {
        // 返回网络类型, 有效值：
        // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
        var networkType = res.networkType
        if (networkType == "none") {
          that.setData({ ifconnection: false });
        } else {
          that.getBookLive();
          that.loadSourceList();
        }
      }
    })

  },
  onReady: function () {
    // 页面渲染完成
    var that = this;

  },
  onHide: function () {
    // 页面隐藏
    this.setData({ firstShow: false });
  },
  onUnload: function () {
    var that = this;
    // 页面关闭
    app.codeBook.updateBrowserTime
      (
      that.data.browserId,
      function (rts) {

      }
      );

  },
  //点击刷新
  connectionRefrash: function () {
    var that = this;
    wx.getNetworkType({
      success: function (res) {
        // 返回网络类型, 有效值：
        // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
        var networkType = res.networkType
        if (networkType == "none") {
          that.setData({ ifconnection: false });

        } else {
          //console.log("网络出现");
          that.setData({ ifconnection: true });
          that.bookInfo(that.data.bookId)
          that.loadSourceList();
        }
      }
    })
  },
  loadSourceList: function () {
    var that = this;
    //书籍资源列表信息

    //有必要加载更多，且没在请求加载中
    if (that.data.loadMore && !that.data.loadding && that.data.ifconnection) {

      that.setData({ loadding: true });
      app.codeBook.getBookSourceList
        (
        that.data.bookId,
        that.data.loadLastId,
        that.data.loadMoreCount,
        function (res) {
          that.setData({ loadding: false });
          var data = res.data;
          var list = data.list;
          if (data.list.length > 0) {
            for (var i = 0; i < data.list.length; i++) {
              data.list[i]["icon_type"] = app.source[data.list[i]["match_type"]];
            }


            var loadLastId = data.list[data.list.length - 1].rownumber;

            //追加数据
            data.count = data.count * 1 + that.data.source.count * 1;
            data.list = that.data.source.list.concat(data.list);
            //填充数据
            that.setData({ source: data });
            that.setData({ loadLastId: loadLastId });
          }
          that.setData({ loaddingPage: false });

          //如果不够10条，标记不用再加载更多
          if (list.length != that.data.loadMoreCount) {
            that.setData({ loadMore: false });
            that.setData({ 'loadTip.showLoadTip': false });

          }


        }
        );
    }


  },
  toLive: function (event) {
    var id = event.currentTarget.dataset.node.id;
    var name = event.currentTarget.dataset.node.source_name;
    wx.navigateTo({
      url: "../view/webcast/webcast?book_id=" + this.data.bookId + "&match_app_id=" + id + "&match_sales_name=app_instance&match_title=" + name
    });
  },
  toHome: function () {
    app.codeBook.toHome();
  },
  toUser: function () {
    app.codeBook.toUser();
  },
  getBookLive: function () {
    var that = this;
    app.codeBook.getBookLive
      (
      that.data.bookId,
      function (res) {
        that.setData({ loadding: false });
        var data = res.data;
        var list = data.list;

        if (list) {
          list.forEach(function (item, index) {

            item.sale_begin_time = item.sale_begin_time.substring(0, item.sale_begin_time.length - 3);
            item.sale_end_time = item.sale_end_time.substring(0, item.sale_end_time.length - 3);
          })
          that.setData({ webcast: list });

        }


      },

    )


  },

  //swiper高度
  getAllRects: function () {
    wx.createSelectorQuery().select('.top').boundingClientRect(function (rect) {
      // rect.id      // 节点的ID
      // rect.dataset // 节点的dataset
      // rect.left    // 节点的左边界坐标
      // rect.right   // 节点的右边界坐标
      // rect.top     // 节点的上边界坐标
      // rect.bottom  // 节点的下边界坐标
      // rect.width   // 节点的宽度
      // rect.height  // 节点的高度
      console.log(rect)
    }).exec()
  },

  //to听写
  toDictation: function () {
    //获取码书对应的bookId 
    // var ibsn = 0;
    var isbn = this.data.book.isbn,
      book_id = this.data.book.id;
    // console.log(isbn, uid)
    var path1 = `pages/book/book?isbn=${isbn}`
    var path2 = `pages/searchlist/searchlist?isbn=${isbn}`;
    app.Dictation.toDictationByIsbn(isbn, function (res) {
      let path = '';
      if (res.count == 1) {
        path = path1
      } else {
        path = path2
      }
      wx.navigateToMiniProgram({
        appId: 'wxe2a572944d797366',
        path: path,
        extraData: {
          isbn: isbn,
        },
        envVersion: 'develop',
        success: function () {
          console.log("成功")
        }
      })
    })
  }


})