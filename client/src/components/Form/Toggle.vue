<template>
  <label
    :class="[
      'relative h-11 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 inline-block w-28 p-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500',
      this.toggled ? 'bg-green-600' : 'bg-red-900',
    ]"
    tabindex="0"
    role="checkbox"
    @keydown.space.prevent="keyToggle"
  >
    <input
      type="checkbox"
      class="v-switch-input"
      :name="name"
      :checked="value"
      tabindex="-1"
      @change.stop="toggle"
    />
    <div
      class="bg-white rounded-lg h-full transition-transform w-12"
      :style="getToggleStyle()"
    />
    <span
      class="
        text-white
        absolute
        text-sm
        top-1/2
        left-0
        transform
        -translate-y-1/2
        pl-5
      "
      v-if="toggled"
    >
      On
    </span>
    <span
      class="
        text-white
        absolute
        text-sm
        top-1/2
        left-full
        transform
        -translate-y-1/2 -translate-x-full
        pr-5
      "
      v-else
    >
      Off
    </span>
  </label>
</template>

<script>
export default {
  name: "FormToggle",
  props: ["value"],
  watch: {
    value(value) {
      this.toggled = !!value;
    },
  },
  data() {
    return {
      toggled: !!this.value,
    };
  },
  methods: {
    getToggleStyle() {
      let transform = this.toggled ? "translateX(3.5rem)" : "translateX(0)";
      return { transform: transform };
    },
    keyToggle(event) {
      this.toggle(event);
    },
    toggle(event) {
      const toggled = !this.toggled;
      if (!this.sync) {
        this.toggled = toggled;
      }
      this.$emit("input", toggled);
      this.$emit("change", {
        value: toggled,
        tag: this.tag,
        srcEvent: event,
      });
    },
  },
};
</script>