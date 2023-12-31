var util = require('../../../util/util.js')
var app = getApp()
Page({
  data:{
    latitude: '',
    longitude: '',
    currenTime:[],
    location_submit : [],
    joint_submit :[],
    radio_state_joint: 'false',
    radio_state_result: 'false',
    radio_state_location: 'false',
    result_submit :[],
    WelderNo:[],
    UserId : [],
    drawing_num:'',
    spool_num:'',
    
    joint: [
      {value: '1', joint: '1',checked: 'true'},
      {value: '2', joint: '2'},
      {value: '3', joint: 'FW-3'}
    ],
  
    result: [
      {value: '1', name: 'ACC'},
      {value: '0', name: 'REJ'},
    ],

    location: [
      {value: '1', name: '配套车间',checked: 'true'},
      {value: '2', name: '三号堆场'},
      {value: '3', name: '总装场地'}
    ],
    wps:[]

  },

  submit(e) {
    wx.request({
      url: app.globalData.url+'zuduiinspectionrequest',
      method : 'POST',
      //data:that.spool_num,
      dataType : 'JSON',
      data: {
        WeldNo: this.data.joint_submit,
        DrawingNo: this.data.drawing_num,
        PipeNo:this.data.spool_num,
        UserId : this.data.UserId,
      
        Result : this.data.result_submit,
        WeldDate : this.data.currenTime,
        Longitude: this.data.longitude,
        Latitude : this.data.latitude,
        Location : this.data.location_submit
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success (res) {
        //{"Status":0,"Note":"此焊口有未申请"}
        if(res.statusCode==200){
          if(res.data.Status == 0){
            wx.showToast({
  
              title: res.data.Note,   
              icon: 'none',   
              duration: 2000   
              })
          }else if(res.data.Status == 1){

            wx.navigateTo({
              url: '../../main/success/up_success',
            })
          }else{
            wx.showToast({
  
              title: "数据提交失败，请与管理员取得联系",   
              icon: 'none',   
              duration: 2000   
              })
            
          }
         

        }else{
          wx.showToast({
  
            title: res.code+"访问失败请与管理取得联系",   
            icon: 'none',   
            duration: 2000   
            }) 
          
        }
        
      },
      fail:function(res){
      
        wx.showToast({
  
          title: "访问失败，当前网络连接不可用",   
          icon: 'none',   
          duration: 2000   
          }) 
  
        }
    })
  },

  //获取焊工信息
   get_text: function(e){
      this.setData({
        welder:e.detail.value
      })
       
    },
    
  //获取location信息
    getCenterLocation: function (){
      var that = this
      wx.chooseLocation({
        success: function (res) {
          that.setData({
            latitude: res.latitude,
            longitude: res.longitude
          });
         },
         fail: function () {
         },
         complete: function () {
         }
     })
    
    },

   radioChange_joint:function(e){
    
    this.setData({
    radio_state_joint : 'ture',
    joint_submit : e.detail.value
    
    })
  },
    radioChange_result(e){
      console.log(e.detail.value)
      this.setData({
        radio_state_result : 'ture',
        result_submit:e.detail.value
      })
  },
  radioChange_location(e){
    this.setData({
      radio_state_location : 'ture',
      location_submit:e.detail.value
    })
},
    
    onLoad: function (options) {
      var that = this.data;
      var spool = options.spool;
      //var array = JSON.parse(options.spool);
      // 调用函数时，传入new Date()参数，返回值是日期和时间
      var currenTime= util.formatTime(new Date());
      // 再通过setData更改Page()里面的data，动态更新页面的数据
      this.setData({
        currenTime: currenTime,
        spool_num : spool,
        WelderNo : app.globalData.WelderNo,
        UserId : app.globalData.UserId,
      });
  
      wx.request({
        url: app.globalData.url+'searchallweldbypipe',
        method : 'POST',
        dataType : 'JSON',
        data:{value :'0',spool:that.spool_num},
        success:(res) =>{
          var result = JSON.parse(res.data)
          var data = result
          var drawing = data[0].DrawingNo
          var lists = []
          //for 循环

          for(let i = 0;i<Object.keys(data).length;i++)
          {
            var object = new Object()
            object.value = i
            object.joint = data[i].WeldNo
            if(i ==0){
              object.checked = 'true'
              }
              lists.push(object)

          }
          this.setData({
          joint : lists,
          drawing_num : drawing,
          spool_num : spool,
          }); 
        
        }, 
        });

        wx.request({
          url: app.globalData.url+'searchWpsAndLocation',
          method : 'POST',
          dataType : 'JSON',
          success:(res) =>{
            var result = JSON.parse(res.data)
          
            var data = result
            var wps = data[0].wps
            var location = data[1].location

            this.setData({
              wps : wps,
              location : location,
              
              }); 
        
          }

        })
    },
    //地图函数，待完善
    onReady: function (e) {
      this.mapCtx = wx.createMapContext('myMap')
    }
  })