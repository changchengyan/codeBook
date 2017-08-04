// pages/view/activity/register.js
var app = getApp();
var provincialcity={};//存放临时选择的省市区，还没有按确定
Page({
  data: {
  	font:app.globalData.weixinUserInfo.code_book_font,
    picker:{index: 0},
    showTip:true,

    commentSuccess:true,
    registerInfo:[],
    seedMatchComponents:[],
    template_pay:{clicked:false,payShow:false,sourceName:''},
    showPlaceholder:[],
    sheng_index:0,
    shi_index:0,
    shengshi:[],
    //result:{},//最后取到的
    animationData:{},
    pickerJilian:[],
    id:NaN,//级联的id,点击的时候赋值
    textareaShow:true,
  },
  onShow:function()
  {
  	var font = app.globalData.weixinUserInfo.code_book_font;
    this.setData({font:font});
  },
  onLoad:function(options){
  	var match_sales_id = options.match_sales_id;
    this.match_sales_id = options.match_sales_id;
    var match_id=options.match_id;
    this.match_id=options.match_id;
    this.data.match_id = options.match_id;
   	var match_sales_name = options.match_sales_name;
    var that=this;
    that.setData(getApp().globalData);
    
    console.log(app.globalData.weixinUserInfo.uid,"app.globalData.weixinUserInfo.uid")
    that.data.bookId = options.book_id;
    var uid = app.globalData.weixinUserInfo.uid;
    //判断该资源是否需要付费
	   if(match_sales_name=="seed"){
	   	//是商品
       console.log(app.globalData.weixinUserInfo.uid, "app.globalData.weixinUserInfo.uid2")
	   	app.codeBook.getCodeBookSeedCanView(
        app.globalData.weixinUserInfo.uid,
	    	match_sales_id,
	    	match_sales_name,
	    	function(res){
	    		var canView=res.data.canView;
	    		if(canView){
	    			that.setData({canView:true})
	    		}else{
	    			that.setData({canView:false})
	    		}
	    	}
	    )
	   }else{
	   		that.setData({canView:true})
	   }
  	//获取报名页面组件  	
     app.codeBook.getSeedMatchComponents(
    	match_sales_id,
    	function(res){
    		var data=res.data;
    		console.log(data)
    		for(var k=0;k<data.length;k++){
    			if(data[k].item_input_type=="levelselect"){
    				var value=[];
						var len=data[k].values.length;
						for(var i=0;i<len;i++){
							if(data[k].values[i].parentid==0){
								value.push(data[k].values[i])							
							}
						}
						for(var i=0;i<value.length;i++){
							value[i].children=[];
							for(var j=0;j<len;j++){
								if(value[i].id==data[k].values[j].parentid){
									value[i].children.push(data[k].values[j]);
								}
							}
						}
						data[k].jilian=value;
						that.setData({shengshi:value})
						
    			}
    		}
    		//that.cascade();
    		that.setData({seedMatchComponents:res.data})   		
     		for(var i=0;i<res.data.length;i++){
     			//添加showPlaceholder
     			that.data.showPlaceholder.push(true);
     			
     		}
     		that.setData({showPlaceholder:that.data.showPlaceholder})  
    		
    		
    	}
    )
     
     //获取之前填写过的报名信息  加到组件里
     console.log(app.globalData.weixinUserInfo.uid, "app.globalData.weixinUserInfo.uid3")
     app.codeBook.getRegisterInfoById(
    	match_sales_id,
      app.globalData.weixinUserInfo.uid,
    	function(res){
    		var seedMyInfo=res.options;
    		var seedMatchComponents=that.data.seedMatchComponents;
    		console.log(res)
    		//没有保存过报名信息的 res.options.length==0
    		if(res.options.length!==0){
    			for(var i=0;i<seedMatchComponents.length;i++){
    				for(var j=0;j<res.options.length;j++){
    					if(seedMatchComponents[i].id==res.options[j].id){
    						if(seedMatchComponents[i].item_input_type=='input'||seedMatchComponents[i].item_input_type=='textarea'){
		    					seedMatchComponents[i].values[0].text=seedMyInfo[j].values[0].text;
		    				}else if(seedMatchComponents[i].item_input_type=='radio'){
		    					for(var k=0;k<seedMatchComponents[i].values.length;k++){
		    						if(seedMatchComponents[i].values[k].text==seedMyInfo[j].values[0].text){
		    							seedMatchComponents[i].values[k].checked='checked';
		    							break;
		    						}
		    						
		    					}
		    				}else if(seedMatchComponents[i].item_input_type=='checkbox'){
		    					for(var k=0;k<seedMatchComponents[i].values.length;k++){
		    						for(var m=0;m<seedMyInfo[j].values.length;m++){
		    							if(seedMatchComponents[i].values[k].text==seedMyInfo[j].values[m].text){
		    								seedMatchComponents[i].values[k].checked='checked';
		    							}
		    						}
		    						
		    					}
		    				}else if(seedMatchComponents[i].item_input_type=='select'){
		    					for(var k=0;k<seedMatchComponents[i].values.length;k++){
		    						for(var m=0;m<seedMyInfo[j].values.length;m++){
		    							if(seedMatchComponents[i].values[k].text==seedMyInfo[j].values[m].text){
		    								that.data.seedMatchComponents[i].pickerIndex=k;
		    								
		    							}
		    						}
		    						
		    					}
									that.setData({seedMatchComponents:that.data.seedMatchComponents})
		    					
		    				}else if(seedMatchComponents[i].item_input_type=='levelselect'){
		    					//result.province+' '+result.city
		    					if(seedMyInfo[j].values.length>0){
		    						var result={};
		    						var jilian_index=[];
		    						for(var k=0;k<seedMyInfo[j].values.length;k++){
		    							if(seedMyInfo[j].values[k].parentid==0){
		    								result.province=seedMyInfo[j].values[k].text;
		    								for(var m=0;m<seedMatchComponents[i].jilian.length;m++){
		    									if(seedMyInfo[j].values[k].id==seedMatchComponents[i].jilian[m].id){
		    										jilian_index[0]=m;
		    									}
		    								}
		    							}else{
		    								result.city=seedMyInfo[j].values[k].text;
		    								for(var m=0;m<seedMatchComponents[i].jilian.length;m++){
		    									if(seedMyInfo[j].values[k].parentid==seedMatchComponents[i].jilian[m].id){
		    										for(var n=0;n<seedMatchComponents[i].jilian[m].children.length;n++){
		    											if(seedMyInfo[j].values[k].id==seedMatchComponents[i].jilian[m].children[n].id){
		    												jilian_index[1]=n;
		    											}
		    										}
		    									}
		    								}
		    								
		    							}
		    						}
		    						
		    						//that.setData({'result.province':seedMyInfo[j].values[0].text})
		    						//that.setData({'result.city':seedMyInfo[j].values[1].text})
		    					}
		    					seedMatchComponents[i].result=result;
		    					seedMatchComponents[i].jilian_index=jilian_index;
		    				}
		    				break;
    					}
    				}
    			}
    			that.setData({seedMatchComponents:seedMatchComponents})
    		}
    		
    	}
    )
    //获取活动信息
     app.codeBook.getSeedInfoMatch(
    	match_sales_id,
    	function(res){
    		that.setData({seedInfo:res.data.list[0]});	
    		that.setData({'template_pay.price':res.data.list[0].sale_price});
    		that.setData({'template_pay.sourceName':res.data.list[0].seed_name});
    	}
    ) 
     
     
  },
  bindFocusIpt:function(e){
  	var that=this;
  	var idx=e.currentTarget.dataset.index;
  	that.data.showPlaceholder[idx]=false;
  	that.setData({showPlaceholder:that.data.showPlaceholder})
  },
  bindBlur:function(e){
  	var that=this;
  	var idx=e.currentTarget.dataset.index;
  	that.data.showPlaceholder[idx]=true;
  	that.setData({showPlaceholder:that.data.showPlaceholder})
  },
  bindInput:function(e){
  	var that=this;
  	var id=e.currentTarget.dataset.id;
  	for(var i=0;i<this.data.seedMatchComponents.length;i++){
  		if(this.data.seedMatchComponents[i].id==id){
  			this.data.seedMatchComponents[i].values[0].text=e.detail.value;
  		}
  	}
    this.setData({seedMatchComponents: this.data.seedMatchComponents})
  },
  bindAreaInput:function(e){
  	var that=this;
  	var id=e.currentTarget.dataset.id;
  	for(var i=0;i<this.data.seedMatchComponents.length;i++){
  		if(this.data.seedMatchComponents[i].id==id){
  			this.data.seedMatchComponents[i].values[0].text=e.detail.value;
  		}
  	}
    this.setData({seedMatchComponents: this.data.seedMatchComponents})
  },
  bindPickerChange: function(e) {
  	var that=this;
  	var id=e.currentTarget.dataset.id;
  	for(var i=0;i<this.data.seedMatchComponents.length;i++){
  		if(this.data.seedMatchComponents[i].id==id){
  			this.data.seedMatchComponents[i].pickerIndex=e.detail.value;
  		}
  	}
    this.setData({seedMatchComponents: this.data.seedMatchComponents})
  },
  radioChange:function(e){
  	var that=this;
  	var id=e.currentTarget.dataset.id;
  	for(var i=0;i<this.data.seedMatchComponents.length;i++){
  		if(this.data.seedMatchComponents[i].id==id){
  			//this.data.seedMatchComponents[i].values[0].text=e.detail.value;
  			for(var j=0;j<this.data.seedMatchComponents[i].values.length;j++){
  				this.data.seedMatchComponents[i].values[j].checked=false;
  				if(this.data.seedMatchComponents[i].values[j].text==e.detail.value){
  					this.data.seedMatchComponents[i].values[j].checked=true;
  				}
  			}
  		}
  	}
    this.setData({seedMatchComponents: this.data.seedMatchComponents})
  	
  },
  checkboxChange:function(e){
  	var that=this;
  	var id=e.currentTarget.dataset.id;
  	for(var i=0;i<this.data.seedMatchComponents.length;i++){
  		if(this.data.seedMatchComponents[i].id==id){
  			for(var j=0;j<this.data.seedMatchComponents[i].values.length;j++){
					this.data.seedMatchComponents[i].values[j].checked=false;
					for(var k=0;k<e.detail.value.length;k++){
						if(this.data.seedMatchComponents[i].values[j].text==e.detail.value[k]){
							this.data.seedMatchComponents[i].values[j].checked=true;
						}
					}
  			}
  		}
  	}
    this.setData({seedMatchComponents: this.data.seedMatchComponents})
  },
  dianji:function(e){
  	var that=this;
  	console.log(e)
  	//初始化数据
  	var id=e.currentTarget.dataset.id;
  	this.setData({id:id})
  	this.setData({textareaShow:false})
  	for(var i=0;i<this.data.seedMatchComponents.length;i++){

  		if(this.data.seedMatchComponents[i].id==id){
  			var shengshi=this.data.seedMatchComponents[i].jilian;
  			var pickerJilian=this.data.seedMatchComponents[i].jilian_index;
  		}
  	}
  	this.setData({seedMatchComponents: this.data.seedMatchComponents})
  	provincialcity={};
  	var sheng_index=0;
  	var shi_index=0;
  	
  	//var result={};
  	var animationData={};
  	var sheng=[];
  	var shi=[];
  	that.setData({shengshi:shengshi})
  	that.setData({provincialcity:provincialcity})
  	that.setData({sheng_index:sheng_index})
  	that.setData({shi_index:shi_index})
  	//that.setData({result:result})
  	that.setData({animationData:animationData})
  	that.setData({pickerJilian:pickerJilian})
  	that.setData({sheng:sheng})
  	that.setData({shi:shi})
  	that.cascade();
      var animation=wx.createAnimation({
        duration: 400,
        timingFunction: 'ease',      
      })
      this.animation=animation;
      animation.height(1332+'rpx').step();
      this.setData({
        animationData:animation.export()
      })
  },
  quxiao:function(){
  		this.setData({textareaShow:true});
     var animation=wx.createAnimation({
        duration: 400,
        timingFunction: 'ease',      
      })
      this.animation=animation;
      animation.height(0).step();
      this.setData({
        animationData:animation.export()
      })
  },
  queren:function(){
  	this.setData({textareaShow:true})
     var animation=wx.createAnimation({
        duration: 400,
        timingFunction: 'ease',      
      })
      this.animation=animation;
      animation.height(0).step();
      this.setData({
        animationData:animation.export()
      })
      this.setData({
        result:provincialcity
      })
      for(var i=0;i<this.data.seedMatchComponents.length;i++){
	  		if(this.data.seedMatchComponents[i].id==this.data.id){
	  			this.data.seedMatchComponents[i].result=this.data.result;
	  			this.data.seedMatchComponents[i].jilian_index=this.data.pickerJilian;
	  			this.setData({'seedMatchComponents':this.data.seedMatchComponents})
	  			break;
	  		}
	  	}
			
  },
  bindJilianChange:function(e){
  	var val=e.detail.value;
  	console.log()
	  this.setData({
	    sheng_index:val[0],
	    shi_index:val[1]
	  })
	  console.log("二级："+e.detail.value)
	  this.setData({'pickerJilian': e.detail.value})
	  this.cascade();
  },
  cascade:function(){
		  var that=this,
		  shengshi=that.data.shengshi,
		  sheng=[],
		  shi=[],
		  shi_index=that.data.shi_index,
		  sheng_index=that.data.sheng_index;
		for(var i=0;i<shengshi.length;i++){
		  sheng.push(shengshi[i].text)
		}
		if(shengshi[sheng_index].children.length!=0){
		  if(shengshi[sheng_index].children[shi_index]){
		    for(var i=0;i<shengshi[sheng_index].children.length;i++){
		      shi.push(shengshi[sheng_index].children[i].text)
		    }		
		
		  }else{
		    that.setData({
		      shi_index:0
		    })
		     for(var i=0;i<shengshi[sheng_index].children.length;i++){
		          shi.push(shengshi[sheng_index].children[i].text)
		      }
		  }
		
		
		}else{
		  shi.push(shengshi[sheng_index].text);
		}
		that.setData({
		  sheng:sheng,
		  shi:shi
		});
		
		provincialcity={
		  province:sheng[that.data.sheng_index],
		  city:shi[that.data.shi_index]

		}
},
  formSubmit:function(e){
  	//点击提交信息
  	var that = this; 
  	console.log(e);
  	wx.getNetworkType({
		  success: function(res) {
		    // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
		    var networkType = res.networkType
		    if(networkType=="none"){
		    	wx.showToast({
					  title: '无网络，请联网',
					  icon: 'success',
					  duration: 2000
					})
		    }else{
		    	//先判断网络再验证
		    	for(var i=0;i<that.data.seedMatchComponents.length;i++){
			  		//验证手机号
			  		if(that.data.seedMatchComponents[i].item_data_type=="Mobile"&&that.data.seedMatchComponents[i].values[0].text){
			  			var tel=that.data.seedMatchComponents[i].values[0].text;
			  			var isPhoneReg = /^1[3|4|5|7|8][0-9]{9}$/;
			        if(!isPhoneReg.test(tel)){
			        	wx.showToast
				        ({
				            title: "手机号输入不正确",
				            icon: 'success',
				            duration: 2000
				        })
				        return;
			        }
			  		}else if(that.data.seedMatchComponents[i].item_data_type=="Email"&&that.data.seedMatchComponents[i].values[0].text){//验证邮箱
			  			var email=that.data.seedMatchComponents[i].values[0].text;
			  			var isEmailReg = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
			        if(!isEmailReg.test(email)){
			        	wx.showToast
				        ({
				            title: "邮箱输入不正确",
				            icon: 'success',
				            duration: 2000
				        })
				        return;
			        }
			  		}else if(that.data.seedMatchComponents[i].item_data_type=="IdCard"&&that.data.seedMatchComponents[i].values[0].text){//验证身份证
			  			var cardCode=that.data.seedMatchComponents[i].values[0].text.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
			  			var num = cardCode.toUpperCase();
			  			//身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X。
			  			if (!(/(^\d{15}$)|(^\d{17}([0-9]|X)$)/.test(num))) {
			  				wx.showToast
				        ({
				            title: "身份证输入不正确",
				            icon: 'success',
				            duration: 2000
				        })
			          return;
			        }
			  			//校验位按照ISO 7064:1983.MOD 11-2的规定生成，X可以认为是数字10。
			        //下面分别分析出生日期和校验位
			        var len, re;
			        len = num.length;
			         if (len == 15) {
			            re = new RegExp(/^(\d{6})(\d{2})(\d{2})(\d{2})(\d{3})$/);
									var arrSplit = num.match(re);
									
									//检查生日日期是否正确
									var dtmBirth = new Date('19' + arrSplit[2] + '/' + arrSplit[3] + '/' + arrSplit[4]);
									var bGoodDay,goodyear;
									bGoodDay = (dtmBirth.getYear() == Number(arrSplit[2])) && ((dtmBirth.getMonth() + 1) == Number(arrSplit[3])) && (dtmBirth.getDate() == Number(arrSplit[4]) && (thisYear >= dtmBirth.getFullYear()));
									if (!bGoodDay) {
										wx.showToast
						        ({
						            title: "身份证输入不正确",
						            icon: 'success',
						            duration: 2000
						        })
										return;
									}
			        }
			         if (len == 18) {
			            re = new RegExp(/^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/);
									var arrSplit = num.match(re);
									
									//检查生日日期是否正确
									var dtmBirth = new Date(arrSplit[2] + "/" + arrSplit[3] + "/" + arrSplit[4]), bGoodDay,thisYear = new Date().getFullYear();
									bGoodDay = (dtmBirth.getFullYear() == Number(arrSplit[2])) && ((dtmBirth.getMonth() + 1) == Number(arrSplit[3])) && (dtmBirth.getDate() == Number(arrSplit[4]));
									if(dtmBirth.getFullYear() > new Date().getFullYear()){//判断出生年份是否大于当前年份
										wx.showToast
						        ({
						            title: "身份证输入不正确",
						            icon: 'success',
						            duration: 2000
						        })
										return;
									}else if(dtmBirth.getFullYear() < 1900){
										wx.showToast
						        ({
						            title: "身份证输入不正确",
						            icon: 'success',
						            duration: 2000
						        })
										return;
									}
			        }
			  			
			  		}
			  		//验证必填项
						if(that.data.seedMatchComponents[i].require==1&&that.data.seedMatchComponents[i].item_input_type!="file"){
							var value=that.data.seedMatchComponents[i].values[0].text;
							if(value.trim().length==0){
								wx.showToast
					        ({
					            title: "请完善报名信息",
					            icon: 'success',
					            duration: 2000
					        })
					        return;
							}
						}
			  	}
		    	//验证完之后传数据
			  	var seedMatchComponents=that.data.seedMatchComponents.concat();
			  	that.setData({"registerInfo":seedMatchComponents})
			  	for(var i=0;i<that.data.registerInfo.length;i++){
			  		if(that.data.registerInfo[i].item_input_type=='input'||that.data.registerInfo[i].item_input_type=='textarea'){
			  			that.data.registerInfo[i].values[0].text=e.detail.value['info_'+i];
			  		}else if(that.data.registerInfo[i].item_input_type=='radio'){
			  			var arr=that.data.registerInfo[i].values;
			  			that.data.registerInfo[i].values=[];
			  			for(var j=0;j<arr.length;j++){
			  				if(arr[j].text==e.detail.value['info_'+i]){
			  					that.data.registerInfo[i].values.push(arr[j]);
			  					break;
			  				}
			  			}
			  		}else if(that.data.registerInfo[i].item_input_type=='checkbox'){
			  			var arr=that.data.registerInfo[i].values;
			  			that.data.registerInfo[i].values=[];
			  			for(var j=0;j<arr.length;j++){
			  				for(var k=0;k<e.detail.value['info_'+i].length;k++){
			  					if(arr[j].text==e.detail.value['info_'+i][k]){
				  					that.data.registerInfo[i].values.push(arr[j])
				  					break;
				  				}
			  				}
			  				
			  			}
			  		}else if(that.data.registerInfo[i].item_input_type=='select'){
			  			var idx=e.detail.value['info_'+i][0];//选了第几个
			  			var arr=that.data.registerInfo[i].values;
			  			that.data.registerInfo[i].values=[];
			  			that.data.registerInfo[i].values.push(arr[idx]);
			  		}else if(that.data.registerInfo[i].item_input_type=='levelselect'){
			  			if(that.data.registerInfo[i].jilian_index){
			  				//选择级联
			  				var arr=that.data.registerInfo[i].values.concat();
				  			that.data.registerInfo[i].values=[];
				  			delete that.data.registerInfo[i]["result"];  
				  			if(that.data.registerInfo[i].jilian_index.length>0){
				  				var parentIdx=that.data.registerInfo[i].jilian_index[0];
					  			var childIdx=that.data.registerInfo[i].jilian_index[1];
					  			that.setData({shengshi_nouse:that.data.shengshi})
					  				var parent=that.data.shengshi_nouse[parentIdx];				  				
					  				var child=parent.children[childIdx];
					  				console.log(parent,child,parentIdx,childIdx)
					  				delete parent["children"]; 
					  				delete that.data.registerInfo[i]["jilian"];  
					  				that.data.registerInfo[i].values[0]=parent;
					  				that.data.registerInfo[i].values[1]=child;
				  			}	
				  			delete that.data.registerInfo[i]["jilian_index"];  
			  			}else{
			  				//未选择级联
			  				var arr=that.data.registerInfo[i].values.concat();
				  			that.data.registerInfo[i].values=[];
			  			}
			  			
			  		}
			  	}
          console.log(app.globalData.weixinUserInfo.uid, "app.globalData.weixinUserInfo.uid4")
			    if(that.data.commentSuccess)
			    {    
			    	var registerInfo=that.data.registerInfo;
			    	var seed_id=that.match_sales_id;
			    	var uid=app.globalData.weixinUserInfo.uid;
			    	app.codeBook.saveRegister
				    (
				        registerInfo,
				        seed_id,
								uid,
				        function(res)
				        {
				            var data = res.data;
				            console.log(res)
				            that.setData({commentSuccess:false});	            
				            if(res.success)
				            {
				            	if(!that.data.canView){
				            		that.setData({textareaShow:false})
				            		that.setData({'template_pay.payShow':true})
				            	}else{
				            		var toPage = "/pages/view/match/registerState/registerState?match_sales_id="+that.match_sales_id+"&state=1";   
			  								wx.redirectTo({url: toPage}); 
				            	}
				            	
			//	              var toPage = "/pages/view/match/registerState/registerState?match_sales_id="+that.match_sales_id;   
			//  							wx.navigateTo({url: toPage}); 
				            }
				            else
				            {          	
				            	if(res.data==2||res.data==3){
				            		//2 报名已满 3您已报名
				              var toPage = "/pages/view/match/registerState/registerState?match_sales_id="+that.match_sales_id+"&state="+res.data;   
			  							wx.redirectTo({url: toPage}); 	            		
				            	}else{
				            		wx.showToast
				                ({
				                    title: "提交失败："+res.message,
				                    icon: 'success',
				                    duration: 2000
				                })
				            	}                
				            }
				            that.setData({commentSuccess:true});
				        },
				        //报名失败
				        function(res){  	
				        	var state=0;//报名失败
				        	var toPage = "/pages/view/match/registerState/registerState?match_sales_id="+that.match_sales_id+"&state="+state;   
			  					wx.redirectTo({url: toPage}); 
				        }
				    )
			    }
		    }
		  }
		})
  	
  	
  	
  	
  },
  closeTip:function(){
  	this.setData({showTip:false})
  },
  closePayBox:function(){
  	this.setData({"template_pay.payShow":false});
  	this.setData({"template_pay.clicked":false});
  	this.setData({textareaShow:true})
  },
	payNow:function(){
		var that=this;
		var seedId=that.match_sales_id;
		//点击立即支付后按钮文字变化且不能再点击
		if(that.data.template_pay.clicked){
			return;
		}
		that.setData({"template_pay.clicked":true})
		//判断网络
		wx.getNetworkType({
		  success: function(res) {
		    // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
		    var networkType = res.networkType
		    if(networkType=="none"){
		    	wx.showToast({
					  title: '无网络，请联网',
					  icon: 'success',
					  duration: 2000
					})
		    }else{
		    	//快速购买并统一下单
					app.codeBook.fastBuySeed
					  (
					    seedId,
					    4226,
					    function (rts) 
					    {
					        console.log("统一下单成功，回调开始发起支付！");
					          //发起支付
					          wx.requestPayment
					          (
					              {
					                'timeStamp': rts.weixinpayinfo.timeStamp,
					                'nonceStr': rts.weixinpayinfo.nonceStr,
					                'package': rts.weixinpayinfo.package,
					                'signType': rts.weixinpayinfo.signType,
					                'paySign': rts.weixinpayinfo.paySign,
					                'success': function (res)
					                 {
					                    //支付成功
					                    console.log("支付成功啦");
					                    that.setData({"template_pay.payShow":false});
					                    that.setData({textareaShow:true})
					                    var toPage = "/pages/view/match/registerState/registerState?match_sales_id="+that.match_sales_id+"&state=1";   
					 										wx.redirectTo({url: toPage}); 
					                },
					                'fail': function (res) 
					                {
					                    //支付失败
					                    console.log("支付失败");
					                    that.setData({"template_pay.clicked":false})
					                }
					              }
					           );
					        console.log(rts);
					    },function(rts){
					    	that.setData({"template_pay.clicked":false})
					    	that.setData({"template_pay.payShow":false});
					    }
					  );
					    	
		    }
		  }
		})
	
  },
  toHome: function () {
    app.codeBook.toHome();
  },
  toUser: function () {
    app.codeBook.toUser();
  }
})