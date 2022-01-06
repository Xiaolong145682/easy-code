// 隐藏菜单栏
function onBridgeReady() {
  window.WeixinJSBridge && window.WeixinJSBridge.call('hideOptionMenu')
}

if (typeof window.WeixinJSBridge === 'undefined') {
  if (document.addEventListener) {
    document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false)
  } else if (document.attachEvent) {
    document.attachEvent('WeixinJSBridgeReady', onBridgeReady)
    document.attachEvent('onWeixinJSBridgeReady', onBridgeReady)
  }
} else {
  onBridgeReady()
}

// iOS 后退不刷新问题处理
window.addEventListener("pageshow", function (event) {
  var historyTraversal = (
    event.persisted ||
    (
      typeof window.performance != "undefined" &&
      window.performance.navigation.type === 2
    )
  )
  if (historyTraversal) {
    window.location.reload()
  }
})