<template>
  <div class="wrapper">
    <p>{{ _sToMs(seek) }} / {{ _sToMs(duration) }}</p>
    <p>{{ curProgress }}%</p>
    <button @click="togglePlayback">{{ playing ? 'Pause' : 'Play' }}</button>
    <button @click="stop">Stop</button>
    <button @click="handleSetRate">{{ rate === 1 ? 'Normal' : rate === 0.9 ? 'Slow' : 'Fast'}}</button>
    <button @click="handleToggleMute">{{ isMute ? 'Mute' : 'Sound' }}</button>
    <button @click="handleSetVolume(true)">+</button>
    <button @click="handleSetVolume(false)">-</button>

    <div class="slider" ref="slider" @click="handleModifyProgress">
      <div class="progressInfo">Progress: </div>
      <div class="process" :style="{width}"></div>
      <div class="thunk" ref="trunk" :style="{left}">
          <div class="block"></div>
      </div>
      </div>
    </div>
  </div>
</template>
<script>
import Audio from './audio.js'

export default {
  mixins: [Audio],
  data() {
    return {
      min: 0,
      max: 100,
      slider: null,
      thunk: null,
      per: 0,
      rate: 1,
      isMute: true,
      curVolume: 0.5
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
    width(){
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
    // 设置音量
    this.setVolume(this.curVolume);
    this.slider = this.$refs.slider;
    this.thunk = this.$refs.trunk;
    this.thunk.onmousedown = e => {
        let width = parseInt(this.width);
        let disX = e.clientX;
        document.onmousemove = e => {
            // 拖拽的时候获取的新width
            let newWidth = e.clientX - disX + width;
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
.wrapper {
  overflow: hidden;
  width: 500px;
  margin: 0 auto;
  background-color: rgb(206, 224, 240);
  border-radius: 8px;
}
.slider {
  position: relative;
  margin: 24px auto;
  width: 400px;
  height: 10px;
  background: white;
  border-radius: 5px;
  cursor: pointer;
}
.process {
  position: absolute;
  left: 0;
  top: 0;
  width: 112px;
  height: 10px;
  border-radius: 5px;
  background: #409eff;
}
.thunk {
  position: absolute;
  left: 100px;
  top: -7px;
  width: 20px;
  height: 20px;
}
.block {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #409eff;
  background: rgba(255, 255, 255, 1);
  transition: 0.2s all;
}
.block:hover {
  transform: scale(1.1);
  opacity: 0.6;
}
.progressInfo {
  position: absolute;
  top: -28px;
  color: #117eeb;
  font-weight: 600;
}
</style>
