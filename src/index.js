import VueAudio from "./VueAudio.vue";
import MiniAudio from "./MiniAudio.vue";

const Components = {
  VueAudio,
  MiniAudio
};

const VueAudioPlugin = {
  install(Vue, options) {
    Object.keys(Components).forEach(component => {
      Vue.component(Components[component].name, Components[component]);
    });
  }
};

if (typeof window !== "undefined" && window.Vue) {
  window.Vue.use(VueAudioPlugin);
}

export { VueAudio, VueAudioPlugin };

export default VueAudioPlugin;
