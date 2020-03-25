import { Howl } from "howler";
import clamp from "math-clamp";
import values from "object-values";
import assign from "object-assign";

export default {
  props: {
    /**
     * An array of audio file urls
     */
    src: {
      type: String,
      required: true,
      validator(src) {
        // Every src must be a non-empty string
        return typeof src === "string" && src.length > 0
      }
    },
    /**
     * Whether to start the playback
     * when the component is mounted
     */
    autoplay: {
      type: Boolean,
      default: false
    },
    /**
     * Whether to start the playback again
     * automatically after it is done playing
     */
    loop: {
      type: Boolean,
      default: false
    },
    /**
     * Whether to start downloading the audio
     * file when the component is mounted
     */
    preload: {
      type: Boolean,
      default: true
    },
    /**
     * Whether to force HTML5 Audio
     */
    html5: {
      type: Boolean,
      default: false
    },
    /**
     * An array of audio file types
     */
    formats: {
      type: Array,
      default() {
        return [];
      }
    },
    /**
     * Whether to enable the withCredentials flag on XHR
     * requests used to fetch audio files when using Web Audio API
     */
    xhrWithCredentials: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      /**
       * The Howl instance used for playback
       */
      _howl: null,
      /**
       * Whether audio is currently playing
       */
      playing: false,
      /**
       * Whether the audio playback is muted
       */
      muted: false,
      /**
       * The volume of the playback on a scale of 0 to 1
       */
      volume: 1.0,
      /**
       * The rate (speed) of the playback on a scale of 0.5 to 4
       */
      rate: 1.0,
      /**
       * The position of playback in seconds
       */
      seek: 0,
      /**
       * The duration of the audio in seconds
       */
      duration: 0,
      /**
       * Functions that poll the Howl instance
       * to update various data
       */
      _polls: {
        seek: {
          id: null,
          interval: 1000 / 4, // 4 times per second (4Hz)
          hook: () => {
            this.seek = this.$data._howl.seek();
          }
        }
      },
      /**
       * A list of howl events to listen to and
       * functions to call when they are triggered
       */
      _howlEvents: [
        {
          name: "load",
          hook: () => {
            this.duration = this.$data._howl.duration();
          }
        },
        "loaderror",
        "playerror",
        {
          name: "play",
          hook: () => {
            this.playing = true;
          }
        },
        {
          name: "end",
          hook: () => {
            this.playing = false;
          }
        },
        {
          name: "pause",
          hook: () => {
            this.playing = false;
          }
        },
        {
          name: "stop",
          hook: () => {
            this.playing = false;
            if (this.$data._howl != null) {
              this.seek = this.$data._howl.seek();
            }
          }
        },
        "mute",
        {
          name: "volume",
          hook: () => {
            this.volume = this.$data._howl.volume();
          }
        },
        {
          name: "rate",
          hook: () => {
            this.rate = this.$data._howl.rate();
          }
        },
        {
          name: "seek",
          hook: () => {
            if(!this.playing) this.seek = this.$data._howl.seek();
          }
        },
        "fade"
      ]
    };
  },

  computed: {
    /**
     * The progress of the playback on a scale of 0 to 1
     */
    progress() {
      if (this.duration === 0) return 0;
      return this.seek / this.duration;
    }
  },

  created() {
    this._initialize();
  },

  beforeDestroy() {
    this._cleanup();
  },

  watch: {
    playing(playing) {
      // Update the seek
      this.seek = this.$data._howl.seek();

      if (playing) {
        // Start the seek poll
        this.$data._polls.seek.id = setInterval(
          this.$data._polls.seek.hook,
          this.$data._polls.seek.interval
        );
      } else {
        // Stop the seek poll
        clearInterval(this.$data._polls.seek.id);
      }
    },

    src(src) {
      this._reinitialize();
    }
  },

  methods: {
    /**
     * Reinitialize the Howler player
     */
    _reinitialize() {
      this._cleanup(false);
      this._initialize();
    },
    /**
     * Initialize the Howler player
     */
    _initialize() {
      this.$data._howl = new Howl({
        src: this.src,
        volume: this.volume,
        html5: this.html5,
        loop: this.loop,
        preload: this.preload,
        autoplay: this.autoplay,
        mute: this.muted,
        rate: this.rate,
        format: this.formats,
        xhrWithCredentials: this.xhrWithCredentials
      });

      const duration = this.$data._howl.duration();
      this.duration = duration;

      if (duration > 0) {
        // The audio file(s) have been cached. Howler won't
        // emit a load event, so we will do this manually
        this.$emit("load");
      }

      // Bind to all Howl events
      this.$data._howlEvents = this.$data._howlEvents.map(event => {
        // Normalize string shorthands to objects
        if (typeof event === "string") {
          event = { name: event };
        }

        // Create a handler
        const handler = (id, details) => {
          if (typeof event.hook === "function") event.hook(id, details);
          this.$emit(event.name, id, details);
        };

        // Bind the handler
        this.$data._howl.on(event.name, handler);

        // Return the name and handler to unbind later
        return assign({}, event, { handler });
      });
    },
    /**
     * Clean up the Howler player
     */
    _cleanup(resetSettings = true) {
      // Stop all playback
      if (this.$data._howl) {
        this.stop();
      }

      // Stop all polls
      values(this.$data._polls).forEach(poll => {
        if (poll.id != null) clearInterval(poll.id);
      });

      // Clear all event listeners
      this.$data._howlEvents.map(event => {
        if (event.handler) {
          if (this.$data._howl) {
            this.$data._howl.off(event.name, event.handler);
          }

          const _event = assign({}, event);
          delete _event.handler;
          return _event;
        }

        return event;
      });

      // Destroy the Howl instance
      this.$data._howl = null;

      this.duration = 0;

      if (resetSettings) {
        this.muted = false;
        this.volume = 1.0;
        this.rate = 1.0;
      }
    },
    /**
     * Start the playback
     */
    play() {
      if (!this.playing) this.$data._howl.play();
    },
    /**
     * Pause the playback
     */
    pause() {
      if (this.playing) this.$data._howl.pause();
    },
    /**
     * Toggle playing or pausing the playback
     */
    togglePlayback() {
      if (!this.playing) {
        this.$data._howl.play();
      } else {
        this.$data._howl.pause();
      }
    },
    /**
     * Stop the playback (also resets the seek to 0)
     */
    stop() {
      this.$data._howl.stop();
    },
    /**
     * Mute the playback
     */
    mute() {
      this.$data._howl.mute(true);
      this.muted = true;
    },
    /**
     * Unmute the playback
     */
    unmute() {
      this.$data._howl.mute(false);
      this.muted = false;
    },
    /**
     * Toggle muting and unmuting the playback
     */
    toggleMute() {
      this.$data._howl.mute(!this.muted);
      this.muted = !this.muted;
    },
    /**
     * Set the volume of the playback
     * @param {Number} volume - The new volume.
     * The value is clamped between 0 and 1
     */
    setVolume(volume) {
      if (typeof volume !== "number") {
        throw new Error(
          `volume must be a number, got a ${typeof volume} instead`
        );
      }

      this.$data._howl.volume(clamp(volume, 0, 1));
    },
    /**
     * Set the rate (speed) of the playback
     * @param {Number} rate - The new rate.
     * The value is clamped between 0.5 and 4
     */
    setRate(rate) {
      if (typeof rate !== "number") {
        throw new Error(`rate must be a number, got a ${typeof rate} instead`);
      }

      this.$data._howl.rate(clamp(rate, 0.5, 4));
    },
    /**
     * Set the position of the playback
     * @param {Number} seek - The new position in seconds.
     * The value is clamped between 0 and the duration
     */
    setSeek(seek) {
      if (typeof seek !== "number") {
        throw new Error(`seek must be a number, got a ${typeof seek} instead`);
      }

      this.$data._howl.seek(clamp(seek, 0, this.duration));
    },
    /**
     * Set the progress of the playback
     * @param {Number} progress - The new progress.
     * The value is clamped between 0 and 1
     */
    setProgress(progress) {
      if (typeof progress !== "number") {
        throw new Error(
          `progress must be a number, got a ${typeof progress} instead`
        );
      }

      this.setSeek(clamp(progress, 0, 1) * this.duration);
    }
  }
};
