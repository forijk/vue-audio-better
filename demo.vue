<template>
  <div class="home">
    <audio-player :sources="audioSources" :loop="true"></audio-player>
  </div>
</template>

<script lang="ts">
import AudioPlayer from './AudioPlayer.vue'

export default {
    components: {
      AudioPlayer
    },
    data () {
      return {
        audioSources: [
          'https://s128.xiami.net/836/1836/10068/380272_18745_l.mp3?ccode=xiami_web_web&expire=86400&duration=309&psid=870ecd151fd8a34f0fa0ffa1bea93bb1&ups_client_netip=36.110.72.18&ups_ts=1572921235&ups_userid=0&utid=H4gzFKzbBl0CASRubEIOCoKc&vid=380272&fn=380272_18745_l.mp3&vkey=Bf972dd4b8006b329aba43842d6add1b4'
        ]
      }
    }
  }
</script>
