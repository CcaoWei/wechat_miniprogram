/** @format */
Component({
  properties: {
    // 这里定义了innerText属性，属性值可以在组件使用时指定
    innerText: {
      type: String,
      value: 'default value'
    },
    tabarMain: {
      type: String,
      observer:function(){
        console.log(this.data.tabarMain)
      }
    },
    tabarFacility: {
      type: String,
      observer: function () {
        console.log(this.data.tabarFacility)
      }
    },
    tabarMine: {
      type: String,
      observer: function () {
        console.log(this.data.tabarMine)
      }
    }
  },
  data: {
    // 这里是一些组件内部数据
    someData: {}
  },
  methods: {
    // 这里是一个自定义方法
    customMethod: function() {},
    tabBar: function(e) {
      console.log(e);
      let that = this;
      let types = e.currentTarget.dataset.type;
      if (types == 'scene') {
        that.triggerEvent('myevents', 'scene');
      } else if (types == 'facility') {
        that.triggerEvent('myevents', 'facility');
      } else if (types == 'mine') {
        that.triggerEvent('myevents', 'mine');
      }
    }
  }
});
