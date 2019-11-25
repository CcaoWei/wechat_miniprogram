/** @format */

// pages/addHelpDetails/addHelpDetails.js
var timer;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    pir:false
  },
  getEntityResult: function() {},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options);
    if(options.types == "dc"){
      this.setData({
        detailsHelpImg:"../../imgs/detailsHelpImg_dc.gif"
      })
    } else if (options.types == "pir") {
      this.setData({
        pir:true,
        detailsHelpImg: "../../imgs/detailsHelpImg_pir.gif"
      })
    } else if (options.types == "plug") {
      this.setData({
        detailsHelpImg: "../../imgs/detailsHelpImg_plug.gif"
      })
    } else if (options.types == "light") {
      this.setData({
        detailsHelpImg: "../../imgs/detailsHelpImg_linght.gif"
      })
    } else if (options.types == "curtain") {
      this.setData({
        detailsHelpImg: "../../imgs/detailsHelpImg_dc.gif"
      })
    } else if (options.types == "wallswitch") {
      this.setData({
        detailsHelpImg: "../../imgs/detailsHelpImg_dc.gif"
      })
    } 
  },

  onMqttMsg: function() {},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
  },

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
  onShareAppMessage: function() {}
});
