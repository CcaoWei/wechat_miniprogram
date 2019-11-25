/** @format */

// pages/interlinkage/interlinkage.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    src: ""
  },
  onMqttMsg: function() {},
  getEntityResult: function() {},
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},
  onLoad: function(options) {
    console.log(options)
    if(options.url){
      this.setData({
        src: options.url
      })
    }else{
      this.setData({
        src: 'https://www.xiaoyan.io/zh-cn/blog/'
      })
      
    }
  },
  btn: function(e) {
    console.log(e);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(e) {
    console.log('即将打印url');
    console.log(e.webViewUrl);
    // this.setData({
    //   weburl: e.webViewUrl
    // })
  }
});
