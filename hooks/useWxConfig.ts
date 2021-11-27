import { wxMpGetJsConfig } from "@api/collection/WxMp"
import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import { GetJsConfigResponseDto } from "@api/collection/data-contracts"

const DEFAULT_SHARE_IMAGE_URL = "https://rchs.hbmmtt.com/rch/m/images/default-share-img-for-cheetah.png"

interface WxConfigProps {
  apiList?: string[]
  hideMenuItem?: string[]
  shareConfig?: {
    title?: string
    desc?: string // 分享描述
    link?: string // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
    imgUrl?: string // 分享图标
  }
  onShareSuccess?: () => void
}

const useWxConfig = (props: WxConfigProps) => {
  const { hideMenuItem, shareConfig, apiList, onShareSuccess } = props
  const [baseConfig, setBaseConfig] = useState<GetJsConfigResponseDto>({
    appId: "",
    timestamp: "",
    nonceStr: "",
    signature: "",
  })

  useEffect(() => {
    async function getWxJsConfig() {
      try {
        const data: GetJsConfigResponseDto = await wxMpGetJsConfig({
          contextId: Cookies.get("cid") || "101",
          url: window.location.href,
        })
        setBaseConfig(data)
      } catch (error) {
        console.warn("--- 获取 JSSDK 签名错误: ", error)
      }
    }
    getWxJsConfig()
  }, [])

  useEffect(() => {
    if (!baseConfig.appId) {
      return
    }

    wx.config({
      ...(baseConfig as any),
      debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
      jsApiList: apiList?.length
        ? apiList
        : [
            "onMenuShareAppMessage",
            "onMenuShareWechat",
            "onMenuShareTimeline",
            "shareAppMessage",
            "shareWechatMessage",
            "hideMenuItems",
          ],
    })
  }, [baseConfig, apiList])

  const checkWxReady = () => {
    return new Promise<void>((resolve, reject) => {
      wx.ready(() => resolve())
      wx.error((err: any) => reject(err))
    })
  }

  useEffect(() => {
    const handleWxShare = (): void => {
      wx.onMenuShareAppMessage({
        title: shareConfig?.title || "大西瓜小说",
        desc: shareConfig?.desc || "你想看的我们都有～",
        link: shareConfig?.link || window.location.href,
        imgUrl: shareConfig?.imgUrl || DEFAULT_SHARE_IMAGE_URL,
        success: () => {
          onShareSuccess?.()
        },
      })
      wx.onMenuShareTimeline({
        title: shareConfig?.title || "大西瓜小说",
        link: shareConfig?.link || window.location.href,
        imgUrl: shareConfig?.imgUrl || DEFAULT_SHARE_IMAGE_URL,
        success: () => {
          onShareSuccess?.()
        },
      })
    }

    checkWxReady()
      .then(() => {
        if (hideMenuItem?.length) {
          // @ts-ignore
          wx.hideMenuItems(hideMenuItem)
        }

        if (shareConfig) {
          handleWxShare()
        }
      })
      .catch((err) => {
        console.warn("wx.ready error: ", err)
      })
  }, [shareConfig, hideMenuItem, onShareSuccess])

  return null
}

export default useWxConfig
