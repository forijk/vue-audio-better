<template>
  <div class="vueAudioBetter" :style="{width: totalWidth}">
    <div class="total">
      <span style="font-weight: 700;">{{ _sToMs(seek) }} / {{ _sToMs(duration) }}</span>
      <span style="font-weight: 700;">{{ curProgress }}%</span>
    </div>
    <div class="operatorButton">
      <span class="iconfont icon-playcircle-fill" @click="togglePlayback" v-if="!playing"></span>
      <span class="iconfont icon-pausecircle-fill" @click="togglePlayback" v-else></span>
      <span class="iconfont icon-stopcircle-fill" @click="stop"></span>
      <span class="iconfont icon-notificationfill" @click="handleToggleMute" v-if="isMute"></span>
      <span class="iconfont icon-notificationforbidfill" @click="handleToggleMute" v-else="!isMute"></span>
      <span class="iconfont icon-roundaddfill" @click="handleSetVolume(true)"></span>
      <span class="iconfont icon-subtract_fill" @click="handleSetVolume(false)"></span>
      <span class="iconfont icon-speed-2 rate" @click="handleSetRate" v-if="rate === 0.9"></span>
      <span class="iconfont icon-speed-1 rate" @click="handleSetRate" v-if="rate === 1"></span>
      <span class="iconfont icon-speed- rate" @click="handleSetRate" v-if="rate === 1.2"></span>
    </div>
    <div class="slider" ref="slider" @click="handleModifyProgress">
      <div class="progressInfo"></div>
      <div class="process" :style="{width: pWidth}"></div>
      <div class="thunk" ref="trunk" :style="{left}">
          <div class="block"></div>
      </div>
      </div>
    </div>
  </div>
</template>
<script>
import Audio from './audio.js';
import './font/iconfont.css';


export default {
  name: 'VueAudio',
  mixins: [Audio],
  props: ['width'],
  data() {
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
    curProgress(v) {
      // 避免拖拽未完成 进度发生变化
      if (!document.onmouseup) {
        this.per = v;
      }
    }
  },
  computed:{
    curProgress() {
      let curProgress = ((Math.round((this.progress * 10000)))/100.00).toFixed(2);
      return curProgress;
    },
    // 设置一个百分比，提供计算slider进度width和trunk的left值
    scale(){
      let scale = (this.per - this.min) / (this.max - this.min);
      return scale;
    },
    pWidth(){
      if(this.slider){
        return this.slider.offsetWidth * this.scale + 'px';
      }else{
        return 0 + 'px'
      }
    },
    left(){
      if(this.slider){
        return this.slider.offsetWidth * this.scale -  this.thunk.offsetWidth/2  + 'px';
      }else{
        return 0 + 'px'
      }
    }
  },
  methods: {

    handleModifyProgress(e) {
      if (e.target.className === 'slider' || e.target.className === 'process') {
        let scale = e.offsetX / this.slider.offsetWidth;
        this.setProgress(scale);
      }
    },
    handleSetRate() {
      if (this.rate === 1) {
        this.rate = 0.9;
        this.setRate(this.rate);
      } else if (this.rate === 0.9) {
        this.rate = 1.2;
        this.setRate(this.rate);
      } else {
        this.rate = 1;
        this.setRate(this.rate);
      }
    },
    handleToggleMute() {
      this.isMute ? this.isMute = false : this.isMute = true;
      this.toggleMute();
    },
    handleSetVolume(flag) {
      flag ? this.curVolume += 0.1 : this.curVolume -= 0.1;
      this.curVolume > 1 ? this.curVolume = 1 : this.curVolume < 0 ? this.curVolume = 0 : '';
      this.setVolume(this.curVolume);
    },
    _sToMs(s) {
      s = parseInt(s);
      let h;
      h = Math.floor(s/60);
      s = s%60;
      h += '';
      s += '';
      h = (h.length == 1) ? '0' + h : h;
      s = (s.length == 1) ? '0' + s : s;
      return h+':'+s;
    }
  },
  mounted () {
    if(this.width && typeof this.width === 'number') {
      this.totalWidth = this.width + 'px';
    }
    // 设置音量
    this.setVolume(this.curVolume);
    this.slider = this.$refs.slider;
    this.thunk = this.$refs.trunk;
    this.thunk.onmousedown = e => {
        let pWidth = parseInt(this.pWidth);
        let disX = e.clientX;
        document.onmousemove = e => {
            // 拖拽的时候获取的新width
            let newWidth = e.clientX - disX + pWidth;
            // 拖拽的时候得到新的百分比
            let scale = newWidth / this.slider.offsetWidth;
            this.per = Math.ceil((this.max - this.min) * scale + this.min);
            this.per = Math.max(this.per,this.min);
            this.per = Math.min(this.per,this.max);
        }
        document.onmouseup = () => {
            document.onmousemove = document.onmouseup = null;
            this.setProgress(this.scale);
        }
        return false;
    }
  },
}
</script>

<style scoped>
.vueAudioBetter {
  overflow: hidden;
  width: 500px;
  margin: 0 auto;
  background-color: rgb(243, 242, 189);
  border-radius: 8px;
  box-shadow: 5px 5px 10px -4px #63645e;
  background-image: linear-gradient(to right, #9ca5f5, #7ff5ae);
}
.vueAudioBetter .total {
  margin: 20px auto;
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 80%;
}
.vueAudioBetter .operatorButton {
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 80%;
  height: 38px;
}
.operatorButton .rate {
  font-size: 32px;
}
.operatorButton span {
  font-size: 24px;
  cursor: pointer;
}
.operatorButton span:hover {
  font-size: 32px;
}
.operatorButton span:last-child:hover {
  font-size: 36px;
}
.vueAudioBetter .slider {
  position: relative;
  margin: 26px auto;
  width: 80%;
  height: 10px;
  background: rgb(248, 247, 247);
  border-radius: 5px;
  cursor: pointer;
}
.slider .process {
  position: absolute;
  left: 0;
  top: 0;
  width: 112px;
  height: 10px;
  border-radius: 5px;
  background: #409eff;
}
.slider .thunk {
  position: absolute;
  left: 100px;
  top: -7px;
  width: 20px;
  height: 20px;
}
.slider .block {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #409eff;
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
.operatorButton .iconfont:active {
  position: relative;
  top: 2px;
  left: 2px;
}
</style>
