<template>
  <div class="vueAudioBetter" :style="{ width: totalWidth }">
    <div class="operate">
      <span
        class="iconfont icon-playcircle-fill"
        @click="togglePlayback"
        v-if="!playing"
      ></span>
      <span
        class="iconfont icon-pausecircle-fill"
        @click="togglePlayback"
        v-else
      ></span>
      <span class="iconfont icon-stopcircle-fill" @click="stop"></span>
      <span style="color: white;padding-left: 6px;"
        >{{ _sToMs(seek) }} / {{ _sToMs(duration) }}</span
      >
    </div>
    <div class="slider" ref="slider" @click="handleModifyProgress">
      <div class="progressInfo"></div>
      <div class="process" :style="{ width: pWidth }"></div>
      <div class="thunk" ref="trunk" :style="{ left }">
        <div class="block"></div>
      </div>
    </div>
    <span
      class="iconfont icon-notificationfill"
      @click="handleToggleMute"
      v-if="isMute"
    ></span>
    <span
      class="iconfont icon-notificationforbidfill"
      @click="handleToggleMute"
      v-else
    ></span>
  </div>
</template>
<script>
import Audio from './audio.js'
import './font/iconfont.css'

export default {
  name: 'MiniAudio',
  mixins: [Audio],
  props: ['width'],
  data () {
    return {
      min: 0,
      max: 100,
      slider: null,
      thunk: null,
      per: 0,
      rate: 1,
      isMute: true,
      curVolume: 0.5,
      totalWidth: 500
    }
  },
  watch: {
    curProgress (v) {
      // 避免拖拽未完成 进度发生变化
      if (!document.onmouseup) {
        this.per = v
      }
    }
  },
  computed: {
    curProgress () {
      let curProgress = (Math.round(this.progress * 10000) / 100.0).toFixed(2)
      return curProgress
    },
    // 设置一个百分比，提供计算slider进度width和trunk的left值
    scale () {
      let scale = (this.per - this.min) / (this.max - this.min)
      return scale
    },
    pWidth () {
      if (this.slider) {
        return this.slider.offsetWidth * this.scale + 'px'
      } else {
        return 0 + 'px'
      }
    },
    left () {
      if (this.slider) {
        return (
          this.slider.offsetWidth * this.scale -
          this.thunk.offsetWidth / 2 +
          'px'
        )
      } else {
        return 0 + 'px'
      }
    }
  },
  methods: {
    handleModifyProgress (e) {
      if (e.target.className === 'slider' || e.target.className === 'process') {
        let scale = e.offsetX / this.slider.offsetWidth
        this.setProgress(scale)
      }
    },
    handleToggleMute () {
      this.isMute ? (this.isMute = false) : (this.isMute = true)
      this.toggleMute()
    },
    _sToMs (s) {
      if(typeof s !== 'number') return '00' + ':' + '00'
      s = parseInt(s)
      let h
      h = Math.floor(s / 60)
      s = s % 60
      h += ''
      s += ''
      h = h.length == 1 ? '0' + h : h
      s = s.length == 1 ? '0' + s : s
      return h + ':' + s
    }
  },
  mounted () {
    if (this.width && typeof this.width === 'number') {
      this.totalWidth = this.width + 'px'
    }
    // 设置音量
    this.setVolume(this.curVolume)
    this.slider = this.$refs.slider
    this.thunk = this.$refs.trunk
    this.thunk.onmousedown = e => {
      let pWidth = parseInt(this.pWidth)
      let disX = e.clientX
      document.onmousemove = e => {
        // 拖拽的时候获取的新width
        let newWidth = e.clientX - disX + pWidth
        // 拖拽的时候得到新的百分比
        let scale = newWidth / this.slider.offsetWidth
        this.per = Math.ceil((this.max - this.min) * scale + this.min)
        this.per = Math.max(this.per, this.min)
        this.per = Math.min(this.per, this.max)
      }
      document.onmouseup = () => {
        document.onmousemove = document.onmouseup = null
        this.setProgress(this.scale)
      }
      return false
    }
  }
}
</script>

<style scoped>
.vueAudioBetter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  width: 300px;
  height: 40px;
  line-height: 40px;
  margin: 14px;
  padding: 0 14px;
  border-radius: 20px;
  box-shadow: 5px 5px 10px -4px #63645e;
  background-image: linear-gradient(to right, #9ca5f5, #7ff5ae);
}
.vueAudioBetter span {
  font-size: 16px;
  color: #1f0719c7;
  cursor: pointer;
}
.operate span:last-child {
  position: relative;
  top: -1px;
  font-size: 14px;
  color: #1f0719c7;
  cursor: default;
}
.vueAudioBetter .iconfont:active {
  position: relative;
  top: 2px;
  left: 2px;
}
.vueAudioBetter .slider {
  position: relative;
  width: 40%;
  height: 4px;
  background: rgb(248, 247, 247);
  border-radius: 2px;
  cursor: pointer;
}
.slider .process {
  position: absolute;
  left: 0;
  top: 0;
  width: 112px;
  height: 4px;
  border-radius: 2px;
  background: #409eff;
}
.slider .thunk {
  position: absolute;
  left: 100px;
  top: -3px;
  width: 8px;
  height: 8px;
}
.slider .block {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1px solid #409eff;
  background: rgba(255, 255, 255, 1);
  transition: 0.2s all;
}
.slider .block:hover {
  transform: scale(1.1);
  opacity: 0.6;
}
.slider .progressInfo {
  position: absolute;
  top: -28px;
  color: #117eeb;
  font-weight: 600;
}
</style>
