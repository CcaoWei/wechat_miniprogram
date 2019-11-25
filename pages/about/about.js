/** @format */

Page({
  /**
   * 页面的初始数据
   */
  data: {
    abouttitle: '关于我们'
  },
  onMqttMsg: function(msg_) {
    console.log(msg_);
  },
  getEntityResult: function() {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options);
    var that = this;
    wx.setNavigationBarTitle({
      title: that.data.abouttitle //页面标题为路由参数
    });
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {}
});
