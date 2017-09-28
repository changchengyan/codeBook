//app.js
var Config =
  {
    services: "https://services.chubanyun.net/version/1.0.4/",
    // services: "https://services.chubanyun.net/",
    // services:"http://loc.services.hifun.me/",
    //  services:"http://192.168.82.212/test/",
    //services:"http://192.168.82.212/test/",
    //services:"http://localhost:9842/",
    //services:"https://dmservices.chubanyun.net/",
    uid: 0
  };
App
  (
  {
    globalData:
    {
      userInfo: null,
      weixinUserInfo: { uid: 0, code_book_font: "default" },
      code_book_voice: "3",
      DEFAULT_ICON: "/pages/images/codebook.png",
      LOADDING_ICON: "/pages/images/loading.gif",
      LOADDING_TEXT: "正在加载",
      NODATA_ICON: "/pages/images/nodata.png",
      NODATA_TEXT: "没有加载到任何信息，\n请等待编辑添加...",
      TO_HOME_TEXT: "返回“码书阅读”首页",
      ICON_HOME_PATH: "/pages/images/naviga-home.png",
      ICON_USER_PATH: "/pages/images/naviga-user.png"
    },
    reloadAskPage: false,
    source: {
      "album": "图片", "sound": "音频", "video": "视频", "pdf": "PDF", "article": "文章", "ask": "问答", "question": "题库",
      "seed_default": "实体商品", "seed_ebook": "收费文章", "seed_book": "实体图书", "seed_sound": "收费音频",
      "seed_video": "收费视频", "seed_pdf": "收费PDF", "seed_album": "收费图片", "seed_number": "收费序列号", "seed_member": "收费会员",
      "seed_pretest": "收费题库", "seed_question": "收费问答", "live": "直播", "seed_match": "报名","applet":"小程序"

    }
    /*当小程序初始化完成时触发*/
    , onLaunch: function () {
      //调用API从本地缓存中获取数据
      var that = this;
      wx.getStorage
        (
        {
          key: 'weixinUserInfo',
          success: function (res) {
            that.globalData.weixinUserInfo = res.data;
            Config.uid = res.data.uid;
            console.log(Config.uid)
          },
          fail: function () {
            that.userLogin();
          }
        }
        )
    },
    updateFont: function (font) {
      //更新字号选择的缓存值
      var that = this;
      that.globalData.weixinUserInfo.code_book_font = font;
      wx.setStorageSync('weixinUserInfo', that.globalData.weixinUserInfo);

    },
    updateVoice: function (voice) {
      //更新人声选择的缓存值
      var that = this;
      that.globalData.code_book_voice = voice;
      wx.setStorageSync('code_book_voice', that.globalData.code_book_voice);
    },
    getUserInfo: function (cb) {
      //仅仅是获得微信用户资料，没有与码书服务器通信
      var that = this
      if (this.globalData.userInfo) {
        typeof cb == "function" && cb(this.globalData.userInfo)
      }
      else {
        //调用登录接口
        wx.login
          (
          {
            success: function () {
              wx.getUserInfo
                (
                {
                  success: function (res) {
                    that.globalData.userInfo = res.userInfo
                    //console.log(res.encryptedData);
                    typeof cb == "function" && cb(that.globalData.userInfo)
                  }
                }
                )
            }
          }
          );
      }
    },
    getIM_UserInfo: function (uid, sourceId, callback) {
      var that = this;
      wx.request
        (
        {
          url: Config.services + '?method=CodeBookBO.getIM_UserInfo',
          data:
          {
            uid: uid,
            source_id: sourceId
          },
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          success: function (res) {
            if (res.data.success) {
              callback(res.data);
            } else {
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
    userLogin: function (cb) {
      var that = this;
      //用户登录
      wx.login
        (
        {
          success: function (res) {
            if (res.code) {
              wx.getUserInfo({
                withCredentials: true,
                success: function (userinfo_res) {
                  wx.request(
                    {
                      url: Config.services + '?method=CodeBookBO.onLogin',
                      method: "POST",
                      header: { 'content-type': 'application/x-www-form-urlencoded' },
                      data: { code: res.code, encryptedData: userinfo_res.encryptedData, iv: userinfo_res.iv },
                      success: function (res) {
                        //保存到全局
                        that.globalData.userInfo = userinfo_res.userInfo;
                        //保存到全局的UID
                        Config.uid = res.data.uid;
                        //更新微信用户资料到码书
                        that.updateWeixinUserInfo(userinfo_res.userInfo, res.data.uid);
                        if (cb) {
                          cb(userinfo_res);
                        }
                      }
                    }
                  )
                }
              })
            }
            else {
              console.log('获取用户登录态失败！' + res.errMsg)
            }
          }
        });
    },
    updateWeixinUserInfo: function (userInfo, uid) {
      var that = this;

      //更新微信用户资料到码书
      wx.request
        (
        {
          url: Config.services + '?method=CodeBookBO.updateWeixinUserInfo',
          data:
          {
            uid: uid,
            nickname: userInfo.nickName,
            headimgurl: userInfo.avatarUrl,
            sex: userInfo.gender,
            province: userInfo.province,
            city: userInfo.city,
            country: userInfo.country
          },
          method: "POST",
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          success: function (res) {
            if (res.data.success) {
              //保存到全局
              that.globalData.weixinUserInfo = res.data.data;
              wx.setStorageSync('weixinUserInfo', res.data.data);
            } else {
              wx.showToast
                (
                {
                  title: res.data.message,
                  icon: 'success',
                  duration: 2000
                }
                )
            }

          },
          fail: function (res) {
            wx.showToast
              (
              {
                title: "更新用户信息失败！",
                icon: 'success',
                duration: 2000
              }
              )
          }
        }
        );


    },
    formatTime: function (time) {
      if (time) {
        var f = time;
        var arr = time.split(":");
        if (arr.length == 3) {
          if (arr[0] == "00") {
            f = arr[1] + ":" + arr[2]
          }
        }
        return f;
      }
      else {
        return "00:00";
      }

    },
    getPicPath: function (str, oldString, newString) {
      var str0 = str.substring(0, str.lastIndexOf(oldString));
      var str1 = str.substring(str.lastIndexOf(oldString) + oldString.length, str.length);
      return (str0 + newString + str1);
    },
    codeBook:
    {
      //根据App_id获取直播状态
      GetLiveRoomStatus: function (app_id, callback) {
        wx.request
          (
          {
            url: Config.services + '?method=CodeBookBO.GetLiveRoomStatus',
            header: { 'content-type': 'application/json' },
            data: { source_id: app_id },
            success: function (res) {
              if (res.data.success) {
                callback(res.data);
              } else {
                wx.showToast
                  ({
                    title: res.data.message,
                    icon: 'success',
                    duration: 2000
                  })
              }
              //                if (res.data.ret==0 || res.data.ret==20601) {
              //                  callback(res.data);
              //                } else if(res.data.ret==1000) {
              //                  wx.showToast
              //                    ({
              //                      title: '记录不存在!',
              //                      icon: 'success',
              //                      duration: 2000,
              //                      success:function(){
              //                      	callback(res.data);
              //                      }
              //                    })
              //                    
              //                }else{
              //                	wx.showToast
              //                    ({
              //                      title: res.data.message,
              //                      icon: 'success',
              //                      duration: 2000
              //                    })
              //                }
            }
          }
          );
      },

      addBookByISBN: function (isbn, callback) {
        //扫条码添加书籍
        wx.request
          (
          {
            url: Config.services + '?method=CodeBookBO.GetLiveRoomStatus',
            header: { 'content-type': 'application/json' },
            data: { source_id: app_id },
            success: function (res) {
              if (res.data.success) {
                callback(res.data);
              } else {
                wx.showToast
                  ({
                    title: res.data.message,
                    icon: 'success',
                    duration: 2000
                  })
              }
              //                if (res.data.ret==0 || res.data.ret==20601) {
              //                  callback(res.data);
              //                } else if(res.data.ret==1000) {
              //                  wx.showToast
              //                    ({
              //                      title: '记录不存在!',
              //                      icon: 'success',
              //                      duration: 2000,
              //                      success:function(){
              //                      	callback(res.data);
              //                      }
              //                    })
              //                    
              //                }else{
              //                	wx.showToast
              //                    ({
              //                      title: res.data.message,
              //                      icon: 'success',
              //                      duration: 2000
              //                    })
              //                }
            }
          }
          );
      },
      addBookByISBN: function (isbn, callback) {
        //扫条码添加书籍
        wx.request
          (
          {
            url: Config.services + '?method=CodeBookBO.addBookByISBN',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            data: { uid: Config.uid, client_name: 4, isbn: isbn },
            success: function (res) {
              callback(res)

            },
            fail: function (res) {
              wx.showToast
                (
                {
                  title: "扫条码添加书籍失败！",
                  icon: 'success',
                  duration: 2000
                }
                )
            }
          }
          );
      },
      addBookById: function (book_id, callback) {
        console.log("addBookById- uid = " + Config.uid);
        //根据id添加书籍
        wx.request
          (
          {
            url: Config.services + '?method=CodeBookBO.addBookById',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            data: { uid: Config.uid, client_name: 4, book_id: book_id },
            success: function (res) {
              if (res.data.state == "add") {//新添加的书籍有提示
                wx.showToast
                  (
                  {
                    //title: res.data.data.book_name+"已添加到书架！",
                    title: "书籍已添加到书架！",
                    icon: 'success',
                    duration: 2000
                  }
                  )
              }
              if (!res.data.success) {
                wx.showToast
                  (
                  {
                    title: res.data.message,
                    icon: 'success',
                    duration: 2000
                  }
                  )
              }

              if (callback) { callback(res); }

            },
            fail: function (res) {
              wx.showToast
                (
                {
                  title: "根据ID添加书籍失败！",
                  icon: 'success',
                  duration: 2000
                }
                )
            }
          }
          );
      },
      addBookById2: function (book_id, callback) {
        //扫条码添加书籍
        wx.request
          ({
            url: Config.services + '?method=CodeBookBO.addBookById',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            data: { uid: Config.uid, client_name: 4, book_id: book_id },
            success: function (res) {
              if (!res.data.success) {
                wx.showToast
                  ({
                    title: res.data.message,
                    icon: 'success',
                    duration: 2000
                  })
              }

              if (callback) { callback(res); }

            },
            fail: function (res) {
              wx.showToast
                ({
                  title: "根据ID添加书籍失败！",
                  icon: 'success',
                  duration: 2000
                })
            }
          });
      },
      getDeskBookList: function (callback, lastid, count) {
        //获得我的书籍列表
        lastid = lastid * 1 + 1;
        wx.request
          (
          {
            url: Config.services + '?method=CodeBookBO.getDeskBookList',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            data: { uid: Config.uid, client_name: 4, count: count, last_id: lastid },
            success: function (res) {
              if (res.data.success) {
                callback(res.data);
              } else {
                wx.showToast
                  (
                  {
                    title: res.data.message,
                    icon: 'success',
                    duration: 2000
                  }
                  )
              }
            },
            fail: function (res) {
              wx.showToast
                (
                {
                  title: "获取书架失败！",
                  icon: 'success',
                  duration: 2000
                }
                )
            }
          }
          );
      },
      getBookInfo: function (book_id, sound, callback) {
        //获得书籍基本信息
        wx.request
          (
          {
            url: Config.services + '?method=CodeBookBO.getBookInfo&book_id=' + book_id + "&sound=" + sound,
            header: { 'content-type': 'application/json' },
            success: function (res) {
              if (res.data.success) {
                callback(res.data);
              } else {
                wx.showToast
                  (
                  {
                    title: res.data.message,
                    icon: 'success',
                    duration: 2000
                  }
                  )
              }
            },
            fail: function (res) {
              wx.showToast
                (
                {
                  title: "获取书籍信息失败！",
                  icon: 'success',
                  duration: 2000
                }
                )
            }
          }
          )

      },
      getBookLive: function (book_id, callback) {
        //获得最近1小时内直播
        wx.request
          (
          {
            url: Config.services + '?method=CodeBookBO.getBookMatchListToLive',
            header: { 'content-type': 'application/json' },
            data: { uid: Config.uid, client_name: 4, book_id: book_id },
            success: function (res) {
              if (res.data.success) {
                callback(res.data);
              } else {
                wx.showToast
                  (
                  {
                    title: res.data.message,
                    icon: 'success',
                    duration: 2000
                  }
                  )
              }
            },
            fail: function (res) {
              wx.showToast
                (
                {
                  title: "获取书籍信息失败！",
                  icon: 'success',
                  duration: 2000
                }
                )
            }
          }
          )
      },
      getLiveByAppID: function (appid, callback) {
        //获取直播信息(地址等)
        wx.request({
          url: Config.services + '?method=CodeBookBO.getLiveBySource',
          header: { 'content-type': 'application/json' },
          data: { source_id: appid },
          success: function (res) {
            if (res.data.success) {
              callback(res.data);
            } else {
              wx.showToast
                (
                {
                  title: res.data.message,
                  icon: 'success',
                  duration: 2000
                }
                )
            }
          },
          fail: function () {
            wx.showToast
              (
              {
                title: "获取书籍信息失败！",
                icon: 'success',
                duration: 2000
              }
              )
          },
          complete: function () {
            // complete
          }
        })
      },
      getBookBaseInfo: function (book_id, callback) {
        //获得书籍基本信息
        wx.request
          (
          {
            url: Config.services + '?method=CodeBookBO.getBookBaseInfo&book_id=' + book_id,
            header: { 'content-type': 'application/json' },
            success: function (res) {
              if (res.data.success) {
                callback(res.data);
              } else {
                wx.showToast
                  (
                  {
                    title: res.data.message,
                    icon: 'success',
                    duration: 2000
                  }
                  )
              }
            },
            fail: function (res) {
              wx.showToast
                (
                {
                  title: "获取书籍信息失败！",
                  icon: 'success',
                  duration: 2000
                }
                )
            }
          }
          )

      },
      getBookSourceList: function (book_id, lastid, count, callback) {
        //获得书籍的资源列表
        lastid = lastid * 1 + 1;
        wx.request
          (
          {
            url: Config.services + '?method=CodeBookBO.getBookMatchList',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            data: { uid: Config.uid, client_name: 4, count: count, last_id: lastid, book_id: book_id },
            success: function (res) {
              if (res.data.success) {
                callback(res.data);
              } else {
                wx.showToast
                  (
                  {
                    title: res.data.message,
                    icon: 'success',
                    duration: 2000
                  }
                  )
              }
            },
            fail: function (res) {
              wx.showToast
                (
                {
                  title: "获取书籍资源列表信息失败！",
                  icon: 'success',
                  duration: 2000
                }
                )
            }
          }
          );
      },
      getBookMatchInfo: function (match_id, uid, callback) {
        if (typeof (uid) == 'function') {
          var url = Config.services + '?method=CodeBookBO.getBookMatchInfo&match_id=' + match_id;
          callback = uid;
        } else {
          var url = Config.services + '?method=CodeBookBO.getBookMatchInfo&match_id=' + match_id + '&uid=' + uid;
        }
        //获取应用实例基本信息
        wx.request
          (
          {
            url: url,
            header: { 'content-type': 'application/json' },
            success: function (res) {
              if (res.data.success) {
                callback(res.data);
              } else {
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
      getBookArticleInfo: function (app_instance_id, sound, callback) {
        //获取应用实例基本信息
        wx.request
          (
          {
            url: Config.services + '?method=CodeBookBO.getBookArticleInfo&app_instance_id=' + app_instance_id + "&sound=" + sound,
            header: { 'content-type': 'application/json' },
            success: function (res) {
              if (res.data.success) {
                callback(res.data);
              } else {
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
      getSeedArticleInfo: function (article_id, sound, callback) {
        //获取应用实例基本信息
        wx.request
          (
          {
            url: Config.services + '?method=CodeBookBO.getSeedArticleInfo&article_id=' + article_id + "&sound=" + sound,
            header: { 'content-type': 'application/json' },
            success: function (res) {
              if (res.data.success) {
                callback(res.data);
              } else {
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
      getBookMatchFileList: function (match_id, match_sales_name, match_sales_id, last_id, count, callback) {
        last_id = last_id * 1 + 1;
        //文件资源列表
        wx.request
          (
          {
            url: Config.services + '?method=CodeBookBO.getBookMatchFileList',
            header: { 'content-type': 'application/json' },
            data: { uid: Config.uid, client_name: 4, count: count, last_id: last_id, match_id: match_id, match_sales_name: match_sales_name, match_sales_id: match_sales_id },
            success: function (res) {
              if (res.data.success) {
                callback(res.data);
              } else {
                wx.showToast
                  (
                  {
                    title: res.data.message,
                    icon: 'success',
                    duration: 2000
                  }
                  )
              }
            },
            fail: function (res) {
              wx.showToast
                (
                {
                  title: "获取文件资源列表失败！",
                  icon: 'success',
                  duration: 2000
                }
                )
            }
          }
          )
      },
      getBookMatchPDFList: function (match_id, match_sales_name, match_sales_id, last_id, count, callback) {
        last_id = last_id * 1 + 1;
        //文件资源列表（PDF文档列表）
        wx.request
          (
          {
            url: Config.services + '?method=CodeBookBO.getBookMatchPDFList',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            data: { uid: Config.uid, client_name: 4, count: count, last_id: last_id, match_id: match_id, match_sales_name: match_sales_name, match_sales_id: match_sales_id },
            success: function (res) {
              if (res.data.success) {
                callback(res.data);
              } else {
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
      getBookMatchPDFImgList: function (match_sales_name, match_sales_id, pdf_file_id, last_id, count, callback) {
        last_id = last_id * 1 + 1;
        //单个PDF文档的每个页转换成图片的文件列表信息
        wx.request
          (
          {
            url: Config.services + '?method=CodeBookBO.getBookMatchPDFImgList',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            data: { uid: Config.uid, client_name: 4, count: count, last_id: last_id, match_sales_name: match_sales_name, match_sales_id: match_sales_id, pdf_file_id: pdf_file_id },
            success: function (res) {
              if (res.data.success) {
                callback(res.data);
              } else {
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
      getBookCommentList: function (book_id, last_id, count, callback) {
        //获得某书的评论列表
        last_id = last_id * 1 + 1;
        wx.request
          (
          {
            url: Config.services + '?method=CodeBookBO.getBookCommentList',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            data: { uid: Config.uid, client_name: 4, count: count, last_id: last_id, book_id: book_id },
            success: function (res) {
              if (res.data.success) {
                callback(res.data);
              } else {
                wx.showToast
                  (
                  {
                    title: res.data.message,
                    icon: 'success',
                    duration: 2000
                  }
                  )
              }
            },
            fail: function (res) {
              wx.showToast
                (
                {
                  title: "获得某书的评论列表失败！",
                  icon: 'success',
                  duration: 2000
                }
                )
            }
          }
          )

      },
      getBookReplyCommentList: function (last_id, count, callback) {
        //获得有回复给我的评论（包含主贴和从贴）
        last_id = last_id * 1 + 1;
        wx.request
          (
          {
            url: Config.services + '?method=CodeBookBO.getBookReplyCommentList',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            data: { uid: Config.uid, client_name: 4, count: count, last_id: last_id },
            success: function (res) {
              if (res.data.success) {
                callback(res.data);
              } else {
                wx.showToast
                  (
                  {
                    title: res.data.message,
                    icon: 'success',
                    duration: 2000
                  }
                  )
              }
            },
            fail: function (res) {
              wx.showToast
                (
                {
                  title: "获得某书的评论列表失败！",
                  icon: 'success',
                  duration: 2000
                }
                )
            }
          }
          )

      },
      getBookAskList: function (book_id, last_id, count, callback) {
        //获得某书的编辑答疑信息列表
        wx.request
          (
          {
            url: Config.services + '?method=CodeBookBO.getBookAskList',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            data: { uid: Config.uid, client_name: 4, count: count, last_id: last_id, book_id: book_id },
            success: function (res) {
              if (res.data.success) {
                callback(res.data);
              } else {
                wx.showToast
                  (
                  {
                    title: res.data.message,
                    icon: 'success',
                    duration: 2000
                  }
                  )
              }
            },
            fail: function (res) {
              wx.showToast
                (
                {
                  title: "获得某书的编辑答疑列表失败！",
                  icon: 'success',
                  duration: 2000
                }
                )
            }
          }
          )

      },
      getBookReplyAskList: function (last_id, count, callback) {
        //获得某书的编辑答疑信息列表
        wx.request
          (
          {
            url: Config.services + '?method=CodeBookBO.getBookReplyAskList_WeChat',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            data: { uid: Config.uid, client_name: 4, count: count, last_id: last_id },
            success: function (res) {
              if (res.data.success) {
                callback(res.data);
              } else {
                wx.showToast
                  (
                  {
                    title: res.data.message,
                    icon: 'success',
                    duration: 2000
                  }
                  )
              }
            },
            fail: function (res) {
              wx.showToast
                (
                {
                  title: "获得某书的编辑答疑列表失败！",
                  icon: 'success',
                  duration: 2000
                }
                )
            }
          }
          )

      },
      getCodeBookUserInfo: function (callback) {
        //获得码书的用户简要统计信息
        wx.request
          (
          {
            url: Config.services + '?method=CodeBookBO.getCodeBookUserInfo',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            data: { uid: Config.uid, client_name: 4 },
            success: function (res) {
              if (res.data.success) {
                callback(res.data);
              } else {
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
      getCodeBookAbout: function (callback) {
        //获得码书的关于说明信息
        wx.request
          (
          {
            url: Config.services + '?method=CodeBookBO.getCodeBookAbout',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            success: function (res) {
              if (res.data.success) {
                callback(res.data);
              } else {
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
      getCodeBookProtocol: function (callback) {
        //获得码书的协议说明信息
        wx.request
          (
          {
            url: Config.services + '?method=CodeBookBO.getCodeBookProtocol',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            success: function (res) {
              if (res.data.success) {
                callback(res.data);
              } else {
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
      getSeedInfo: function (seed_id, callback) {
        //获取商品信息（基本 + 扩展）
        wx.request
          (
          {
            url: Config.services + '?method=CodeBookBO.getSeedInfo&seed_id=' + seed_id,
            header: { 'content-type': 'application/json' },
            success: function (res) {
              if (res.data.success) {
                callback(res.data);
              } else {
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
      addBookCommentLock: false,
      addBookComment: function (info, book_id, parentid, sales_code, callback) {
        var that = this;
        if (!that.addBookCommentLock) {
          that.addBookCommentLock = true;
          //添加书籍评论（学习交流，读者和读者之间针对书籍的评论）       
          wx.request
            (
            {
              url: Config.services + '?method=CodeBookBO.addBookComment',
              header: { 'content-type': 'application/x-www-form-urlencoded' },
              data: { uid: Config.uid, client_name: 4, book_id: book_id, info: info, parentid: parentid, sales_code: sales_code },
              method: "POST",
              success: function (res) {
                if (res.data.success) {
                  callback(res.data);
                } else {
                  wx.showToast
                    (
                    {
                      title: res.data.message,
                      icon: 'success',
                      duration: 2000
                    }
                    )
                }
              },
              fail: function () {
                wx.showToast
                  (
                  {
                    title: "添加评论失败！",
                    icon: 'success',
                    duration: 2000
                  }
                  )
              },
              complete: function () {
                that.addBookCommentLock = false;
              }
            }
            );

        }
        else {
          wx.showToast
            (
            {
              title: "请稍候...",
              icon: 'success',
              duration: 2000
            }
            )
        }



      },
      addBookAskLock: false,
      addBookAsk: function (info, book_id, callback) {
        var that = this;
        if (!that.addBookAskLock) {
          that.addBookAskLock = true;
          //添加书籍提问（编辑答疑）       
          wx.request
            (
            {
              url: Config.services + '?method=CodeBookBO.addBookAsk',
              header: { 'content-type': 'application/x-www-form-urlencoded' },
              data: { uid: Config.uid, client_name: 4, book_id: book_id, info: info },
              method: "POST",
              success: function (res) {
                callback(res);
              },
              fail: function () {
                wx.showToast
                  (
                  {
                    title: "添加答疑失败！",
                    icon: 'success',
                    duration: 2000
                  }
                  )
              },
              complete: function () {
                that.addBookAskLock = false;
              }
            }
            );
        }
        else {
          wx.showToast
            (
            {
              title: "请稍候...",
              icon: 'success',
              duration: 2000
            }
            )
        }

      },
      updateBookReadTime: function (book_id) {
        //更新用户的某本书的最后阅读时间
        wx.request
          (
          {
            url: Config.services + '?method=CodeBookBO.updateBookReadTime',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            data: { uid: Config.uid, client_name: 4, book_id: book_id },
            success: function (res) {

            }
          }
          );
      },
      updateUserFont: function (font, callback) {
        //更新用户选择的字号设置信息
        wx.request
          (
          {
            url: Config.services + '?method=CodeBookBO.updateUserFont',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            data: { uid: Config.uid, client_name: 4, font: font },
            success: function (res) {
              callback(res);
            }
          }
          );
      },
      deleteBook: function (book_id, callback) {
        //删除用户的书籍
        wx.request
          (
          {
            url: Config.services + '?method=CodeBookBO.deleteBook',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            data: { uid: Config.uid, client_name: 4, book_id: book_id },
            success: function (res) {
              callback(res);
            },
            fail: function (res) {
              wx.showToast
                (
                {
                  title: "删除用户的书籍异常！",
                  icon: 'success',
                  duration: 2000
                }
                )
            }
          }
          );
      },
      addBrowser: function (sales_id, sales_name, sales_desc, callback, behavior) {
        if (!behavior) { behavior = 6; }
        //添加浏览记录
        wx.request
          (
          {
            url: Config.services + '?method=CodeBookBO.addBrowser',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            data: { uid: Config.uid, client_name: 4, sales_id: sales_id, sales_name: sales_name, sales_desc: sales_desc, behavior: behavior },
            success: function (res) {
              callback(res);
            },
            fail: function (res) {
              wx.showToast
                (
                {
                  title: "添加浏览记录异常！",
                  icon: 'success',
                  duration: 2000
                }
                )
            }
          }
          );
      },
      updateBrowserTime: function (browser_id, callback) {
        //更新浏览时长
        wx.request
          (
          {
            url: Config.services + '?method=CodeBookBO.updateBrowserTime',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            data: { uid: Config.uid, client_name: 4, browser_id: browser_id },
            success: function (res) {
              callback(res);
            },
            fail: function (res) {
              wx.showToast
                (
                {
                  title: "更新浏览时长异常！",
                  icon: 'success',
                  duration: 2000
                }
                )
            }
          }
          );
      },
      getAdviserBrowserCount: function (id, adviser_id, type, callback) {
        //获取具体某个资源的浏览量
        wx.request
          (
          {
            url: Config.services + '?method=CodeBookBO.getAdviserBrowserCount',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            data: { uid: Config.uid, id: id, adveser_id: adviser_id, type: type },
            success: function (res) {
              if (res.data.success) {
                callback(res.data);
              } else {
                wx.showToast
                  (
                  {
                    title: res.data.message,
                    icon: 'success',
                    duration: 2000
                  }
                  )
              }
            },
            fail: function (res) {
            }
          }
          );
      },
      getInstanceFileInfo: function (pdf_file_id, match_sales_name, callback) {
        //获取应用实例基本信息
        wx.request
          (
          {
            url: Config.services + '?method=CodeBookBO.getInstanceFileInfo&pdf_file_id=' + pdf_file_id + '&match_sales_name=' + match_sales_name,
            header: { 'content-type': 'application/json' },
            success: function (res) {
              if (res.data.success) {
                callback(res.data);
              } else {
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
      fastBuySeed: function (seed_id, adviser_id, callback, failCallback) {
        //快速购买商品
        wx.request
          (
          {
            url: Config.services + '?method=CodeBookWeixinSales.fastBuySeed',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            data: { seed_id: seed_id, uid: Config.uid, adviser_id: adviser_id },
            success: function (res) {
              if (res.data.success) {
                callback(res.data);
              } else {
                wx.showToast
                  (
                  {
                    title: res.data.message,
                    icon: 'success',
                    duration: 2000,
                    success: function () {
                      if (failCallback) {
                        failCallback();
                      }
                    }
                  }
                  )
              }
            },
            fail: function (res) {
            }
          }
          );

      },
      //快速购买实体商品
      fastBuyDefaultSeed: function (seed_id, adviser_id, shou_fullname, shou_mobile, shou_adderss, callback) {
        //快速购买商品
        wx.request
          (
          {
            url: Config.services + '?method=CodeBookWeixinSales.fastBuySeed',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            data: { seed_id: seed_id, uid: Config.uid, adviser_id: adviser_id, shou_fullname: shou_fullname, shou_mobile: shou_mobile, shou_adderss: shou_adderss },
            success: function (res) {
              if (res.data.success) {
                callback(res.data);
              } else {
                wx.showToast
                  (
                  {
                    title: res.data.message,
                    icon: 'success',
                    duration: 2000
                  }
                  )
              }
            },
            fail: function (res) {
            }
          }
          );

      },
      onShareAppMessage: function (pageTitle, pagePath, sales_id, sales_name, sales_desc) {
        //通用分享
        var that = this;
        if (pagePath.indexOf("?") > -1) {
          pagePath += "&share=true"
        }
        else {
          pagePath += "?share=true"
        }
        console.log("path=" + pagePath);
        return {
          title: pageTitle,
          path: pagePath,
          success: function (res) {

            // 分享成功
            getApp().codeBook.addBrowser(sales_id, sales_name, sales_desc, function () { }, 8);

          },
          fail: function (res) {
            // 分享失败

          }
        }

      },
      getWelcomePic: function (callback) {
        //获得分享给好友的界面的主图片
        wx.request
          (
          {
            url: Config.services + '?method=CodeBookBO.getWelcomePic',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            data: { uid: Config.uid },
            success: function (res) {
              if (res.data.success) {
                callback(res);
              } else {
                wx.showToast
                  (
                  {
                    title: res.data.message,
                    icon: 'success',
                    duration: 2000
                  }
                  )
              }
            },
            fail: function (res) {
              wx.showToast
                (
                {
                  title: "获取主图片失败！",
                  icon: 'success',
                  duration: 2000
                }
                )
            }
          }
          );
      },
      toHome: function () {
        wx.switchTab
          (
          {
            url: '/pages/desk/desk'
          }
          )
      },
      toUser: function () {
        wx.switchTab
          (
          {
            url: '/pages/user/user'
          }
          )
      },
      getCodeBookSeedCanView: function (uid, seedId, matchSalesName, callback) {
        //是否需要付费
        wx.request
          (
          {
            url: Config.services + '?method=CodeBookSeedSales.GetCodeBookSeedCanView&uid=' + uid + '&seedId=' + seedId + '&matchSalesName=' + matchSalesName,
            header: { 'content-type': 'application/json' },
            success: function (res) {
              if (res.data.success) {
                callback(res.data);
              } else {
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
      //是否有默认收费地址
      getDefaultAddressByUid: function (uid, callback) {
        wx.request
          (
          {
            url: Config.services + '?method=CodeBookWeixinSales.GetDefaultAddressByUid&uid=' + uid,
            header: { 'content-type': 'application/json' },
            success: function (res) {
              if (res.data.success) {
                callback(res.data);
              } else {
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
      SaveDefaultAddress: function (uid, shou_fullname, shou_mobile, shou_adderss, callback) {
        console.log("appjsshou_fullname", shou_fullname)
        wx.request
          (
          {
            url: Config.services + '?method=CodeBookWeixinSales.SaveDefaultAddress',
            data: { shou_fullname: shou_fullname, shou_mobile: shou_mobile, shou_adderss: shou_adderss, uid: uid },
            header: { 'content-type': 'application/json' },
            success: function (res) {
              if (res.data.success) {
                callback(res.data);
              } else {
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
      getOrderformByOrderformId: function (orderformId, callback) {

        wx.request
          (
          {
            url: Config.services + '?method=CodeBookSeedSales.GetOrderformByOrderformId&orderform_id=' + orderformId,
            header: { 'content-type': 'application/json' },
            success: function (res) {
              if (res.data.success) {
                callback(res.data);
              } else {
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
      getRegisterStatus: function (seed_id, uid, callback) {
        //获取报名状态
        wx.request
          ({
            url: Config.services + '?method=SeedMatchRegisterBO.getRegisterStatus&seed_id=' + seed_id + '&uid=' + uid,
            header: { 'content-type': 'application/json' },
            success: function (res) {
              if (res.data.success) {
                callback(res.data);
              } else {
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
          });
      },
      getSeedInfoMatch: function (seed_id, callback) {
        //获取活动报名信息
        wx.request
          ({
            url: Config.services + '?method=SeedBO.getSeedInfo&seed_id=' + seed_id,
            header: { 'content-type': 'application/json' },
            success: function (res) {
              if (res.data.success) {
                callback(res.data);
              } else {
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
          });
      },
      getSeedMatchComponents: function (seed_id, callback) {
        //获取报名页面组件
        wx.request
          ({
            url: Config.services + '?method=SeedMatchOptionBO.getSeedMatchComponents&seed_id=' + seed_id,
            header: { 'content-type': 'application/json' },
            success: function (res) {
              if (res.data.success) {
                callback(res.data);
              } else {
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
          });
      },
      saveRegister: function (registerInfo, seed_id, uid, callback, failCallback) {
        //保存报名数据
        wx.request
          ({
            url: Config.services + '?method=SeedMatchRegisterBO.SaveRegister',
            header: { 'content-type': 'application/json' },
            method: 'post',
            data: {
              registerInfo: registerInfo,
              seed_id: seed_id,
              uid: uid
            },
            success: function (res) {
              if (res.data.success) {
                callback(res.data);
              } else {
                failCallback(res.data);
              }
            }
          });
      },
      getRegisterInfoById: function (seed_id, uid, callback) {
        //获取报名页面组件
        wx.request
          ({
            url: Config.services + '?method=SeedMatchRegisterBO.getRegisterInfoById&seed_id=' + seed_id + '&uid=' + uid,
            header: { 'content-type': 'application/json' },
            success: function (res) {
              if (res.data.success) {
                callback(res.data);
              } else {
                wx.showToast
                  ({
                    title: res.data.message,
                    icon: 'success',
                    duration: 2000
                  })
              }
            }
          });
      },
      getPaperBySeedPretestId: function (seed_id, count, last_id, callback) {
        //获取题库实例
        wx.request
          ({
            url: Config.services + '?method=CodeBookBO.getPaperBySeedPretestId&seed_pretest_id=' + seed_id + '&count=' + count + '&last_id=' + last_id,
            header: { 'content-type': 'application/json' },
            success: function (res) {
              if (res.data.success) {
                callback(res.data);
              } else {
                wx.showToast
                  ({
                    title: res.data.message,
                    icon: 'success',
                    duration: 2000
                  })
              }
            }
          });
      },
      getPretestPaperInfoById: function (uid, paper_id, callback) {
        //获取题库列表里的每一条列表的信息
        wx.request
          ({
            url: Config.services + '?method=CodeBookBO.getPretestPaperInfoById&uid=' + uid + '&paper_id=' + paper_id,
            header: { 'content-type': 'application/json' },
            success: function (res) {
              if (res.data.success) {
                callback(res.data);
              } else {
                wx.showToast
                  ({
                    title: res.data.message,
                    icon: 'success',
                    duration: 2000
                  })
              }
            }
          });
      },
      checkOtherAnswers: function (uid, paper_id, callback) {
        wx.request({
          url: Config.services + '?method=CodeBookBO.checkOtherAnswers&uid=' + uid + '&paper_id=' + paper_id,
          header: { 'content-type': 'application/json' },
          success: function (res) {
            if (res.data.success) {
              callback(res.data);
            } else {
              wx.showToast
                ({
                  title: res.data.message,
                  icon: 'success',
                  duration: 2000
                })
            }
          }
        });
      },
      getSaveAnswer: function (uid, paper_id, isTime, callback) {
        //再次进入试题时，获得上一次的答题数据,如果未答题 id=0,需要调用保存，如果已经答题不需要调用保存
        wx.request
          ({
            url: Config.services + '?method=CodeBookBO.getSaveAnswer&uid=' + uid + '&paper_id=' + paper_id + '&isTime=' + isTime,
            header: { 'content-type': 'application/json' },
            success: function (res) {
              if (res.data.success) {
                callback(res.data);
              } else {
                wx.showToast
                  ({
                    title: res.data.message,
                    icon: 'success',
                    duration: 2000
                  })
              }
            }
          });
      },
      addBeginAnswer: function (uid, paper_id, seed_id, Istimekeeping, issubmit, callback) {
        //保存
        wx.request
          ({
            url: Config.services + '?method=CodeBookBO.addBeginAnswer',
            header: { 'content-type': 'application/json' },
            data: {
              uid: uid,
              paper_id: paper_id,
              seed_id: seed_id,
              Istimekeeping: Istimekeeping,
              issubmit: issubmit
            },
            success: function (res) {
              if (res.data.success) {
                callback(res.data);
              } else {
                wx.showToast
                  ({
                    title: res.data.message,
                    icon: 'success',
                    duration: 2000
                  })
              }
            }
          });

      },
      getQuestions: function (answer_id, answer_questions_id, callback) {
        //获取试题
        wx.request
          ({
            url: Config.services + '?method=CodeBookBO.getQuestions&answer_id=' + answer_id + '&answer_questions_id=' + answer_questions_id,
            header: { 'content-type': 'application/json' },
            success: function (res) {
              if (res.data.success) {
                callback(res.data);
              } else {
                wx.showToast
                  ({
                    title: res.data.message,
                    icon: 'success',
                    duration: 2000
                  })
              }
            }
          });
      },
      markQuestion: function (user_content, questions_id, id, callback) {
        //提交答案
        wx.request
          ({
            url: Config.services + '?method=CodeBookBO.markQuestion',
            header: { 'content-type': 'application/json' },
            data: {
              user_content: user_content,
              questions_id: questions_id,
              id: id
            },
            success: function (res) {
              if (res.data.success) {
                callback(res.data);
              } else {
                wx.showToast
                  ({
                    title: res.data.message,
                    icon: 'success',
                    duration: 2000
                  })
              }
            }
          });
      },
      submitAnswers: function (answer_id, callback) {
        //提交答卷
        wx.request
          ({
            url: Config.services + '?method=CodeBookBO.submitAnswers',
            header: { 'content-type': 'application/json' },
            data: {
              answer_id: answer_id
            },
            success: function (res) {
              if (res.data.success) {
                callback(res.data);
              } else {
                wx.showToast
                  ({
                    title: res.data.message,
                    icon: 'success',
                    duration: 2000
                  })
              }
            }
          });
      },
      getAnswerResult: function (answer_id, callback) {
        //获取答案结果
        wx.request
          ({
            url: Config.services + '?method=CodeBookBO.getPretestPaperReport&answer_id=' + answer_id,
            header: { 'content-type': 'application/json' },
            success: function (res) {
              if (res.data.success) {
                callback(res.data);
              } else {
                wx.showToast
                  ({
                    title: res.data.message,
                    icon: 'success',
                    duration: 2000
                  })
              }
            }
          });
      },
      getAnswerState: function (answer_id, callback) {
        //获取答题状态
        wx.request
          ({
            url: Config.services + '?method=CodeBookBO.getAnswerSheet&answer_id=' + answer_id,
            header: { 'content-type': 'application/json' },
            success: function (res) {
              if (res.data.success) {
                callback(res.data);
              } else {
                wx.showToast
                  ({
                    title: res.data.message,
                    icon: 'success',
                    duration: 2000
                  })
              }
            }
          });
      },
      getErrorQuestions: function (answer_id, answer_questions_id, callback) {
        //获取错题
        wx.request
          ({
            url: Config.services + '?method=CodeBookBO.getErrorQuestions&answer_id=' + answer_id + '&answer_questions_id=' + answer_questions_id,
            header: { 'content-type': 'application/json' },
            success: function (res) {
              if (res.data.success) {
                callback(res.data);
              } else {
                wx.showToast
                  ({
                    title: res.data.message,
                    icon: 'success',
                    duration: 2000
                  })
              }
            }
          });
      },
      //设置人声
      getUserSettingVoice: function (voice, text, callback) {
        wx.request({
          url: Config.services + '?method=CodeBookBO.chooseSound',
          data: { sound: voice, text: text },
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          success: function (res) {
            callback(res.data);
          }
        })
      },
      //问答商品，提交问题
      addQuestionRecord: function (seed_id, orderform_id, info, callback) {
        wx.request({
          url: Config.services + '?method=SeedQuestionRecordBO.Add',
          data: { uid: Config.uid, seed_id: seed_id, orderform_id: orderform_id, info: info },
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          success: function (res) {
            callback(res.data);
          }
        })
      },
      //问答商品，获取回复列表
      getQuestionRecordList: function (seed_id, callback) {
        wx.request({
          url: Config.services + '?method=SeedQuestionRecordBO.getRecordList&seed_id=' + seed_id + "&uid=" + Config.uid,
          header: { 'content-type': 'application/json' },
          success: function (res) {
            callback(res.data);
          }
        })
      },
      //跳转到不同的小程序，获取appid,path
      getApplet:function(id,callback) {
        wx.request({
          url: `${Config.services}?method=AppInstanceAppletBO.getApplet&id=${id}`,
          success: function (res) {
            callback(res.data);
          },
          fail: function () {
            wx.showToast({
              title: '获取小程序信息失败',
              icon: success,
              duration: 2000
            })
          }
        })
      }

    },
    Dictation: {
      //  选择年级
      GetDictationBookList: function (callback, lastId, count,grade) {
        wx.request({
          url: `${Config.services}?method=CodeBookDictation.GetDictationBookList&uid=${Config.uid}&last_id=${lastId}&count=${count}&grade=${grade}`,
          success: function (res) {
            callback(res.data);
          },
          fail: function () {
            wx.showToast({
              title: '获取书籍失败',
              icon: success,
              duration: 2000
            })
          }
        })
      },
      //广告
      GetCodeBookBannerList: function (callback) {
        wx.request({
          url: `${Config.services}?method=CodeBookDictation.GetCodeBookBannerList`,
          success: function (res) {
            if (res.data.success && callback) {
              callback(res.data)
            }
          },
          fail: function () {
            wx.showToast({
              title: '获取书籍失败',
              icon: success,
              duration: 2000
            })
          }
        })
      },
      //检查是否是听写进来的
      CheckIsAppletBook: function (book_id, callback) {
        wx.request({
          url: `${Config.services}?method=CodeBookDictation.CheckIsAppletBook&book_id=${book_id}&appcode=${'DICTATION'}`,
          success: function (res) {
            callback(res.data);
          },
          fail: function () {
            wx.showToast({
              title: '获取书籍失败',
              icon: success,
              duration: 2000
            })
          }
        })
      },
      //进入牛津书籍列表
      GetOxfordBookList: function (callback, lastId, count) {
        wx.request({
          url: `${Config.services}?method=CodeBookDictation.GetOxfordBookList&uid=${Config.uid}&last_id=${lastId}&count=${count}`,
          success: function (res) {
            callback(res.data);
          },
          fail: function () {
            wx.showToast({
              title: '获取书籍失败',
              icon: success,
              duration: 2000
            })
          }
        })
      },
      //通过isbn判断有几本书
      toDictationByIsbn: function (isbn, cb) {
        console.log(isbn)
        wx.request({
          url: `${Config.services}?method=CodeBookDictation.GetDictationBookCountByISBN&isbn=${isbn}`,
          success: function (res) {
              cb(res.data);
          },
          fail:function(res){
            console.log('获取失败')
          }
        })
      },

    }
  }
  )