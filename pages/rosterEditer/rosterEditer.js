// pages/rosterEditer/rosterEditer.js
var HomeCenterManager = require('../../data/HomeCenterManager.js');
var app = getApp()
var feedbackApi = require('../../utils/showToast.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mySelf:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.setData({
      username:options.username,
      boxuuid:options.boxuuid
    })
    if (options.username == wx.getStorageSync('username_')) {
      this.setData({
        mySelf:true
      })
    }
    console.log(HomeCenterManager.getHomeCenter(options.boxuuid))
  },
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  onMqttMsg:function(){},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this
    let information = {}
    console.log(that.data.username)
    var getUserUrl = app.globalData.xyurl + '/users/' + that.data.username + '?id_type=basic';
    wx.request({
      url: getUserUrl,
      method: 'GET',
      header: {
        Authorization: 'Bearer ' + app.globalData.token_
      },
      success: function (res) {
        console.log(res);
        information.name = res.data.name
        if (res.data.email != ''){
          information.email = res.data.email
        }
        if (res.data.mobile != '') {
          information.mobile = res.data.mobile
        }
        that.setData({
          information: information
        })
        console.log(that.data.information)
        wx.setNavigationBarTitle({
          title: information.name,
        })
      }
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },
  deleteRosterUser:function(){
    let that = this
    let myUsername = app.globalData.username_
    let otherUsername = that.data.username 
    let deleteUserUrl = app.globalData.xyurl + '/devices/'+that.data.boxuuid+'/association'
    wx.showModal({
      title: '提示',
      content: '确定删除该用户？',
      success: function(res) {
        if (res.confirm) {
          wx.request({
            url: deleteUserUrl,
            method: 'post',
            data: {
              "action": "remove",
              user: that.data.username,
              user_display_name: that.data.username, //我的昵称
              by: app.globalData.username_,
              by_display_name: wx.getStorageSync('nickname'), //我的昵称
              device_name: HomeCenterManager.getHomeCenter(that.data.boxuuid).name //box名称
            },
            header: {
              Authorization: 'Bearer ' + app.globalData.token_
            },
            success: function (msg_) {
              console.log(msg_)
              if (msg_.statusCode == 200) {
                feedbackApi.showToast({
                  title: '删除成功'
                });
                console.log(HomeCenterManager.getHomeCenter(that.data.boxuuid))
                // (HomeCenterManager.getHomeCenter(that.data.boxuuid).roster.splice("")
                let roster = HomeCenterManager.getHomeCenter(that.data.boxuuid).roster
                for (let i = 0; i < roster.length; i++) {
                  if (roster[i].Username == that.data.username) {
                    roster.splice(i, 1)
                  }
                }
                console.log(roster)
                setTimeout(function () {
                  wx.navigateBack({
                    delta: 1,
                  })
                }, 1000)

              }
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消');
          console.log(res);
        }
      }
    })
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})