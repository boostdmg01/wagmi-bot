<template>
  <div>
    <i
      :class="getIconClass()"
      ref="icon"
      @mouseover="showMessage = true"
      @mouseleave="showMessage = false"
    ></i>
    <span
      ref="statusMessage"
      class="px-3 py-2 bg-gray-800 text-white rounded-lg text-xs"
      v-bind:class="{
        hidden: !showMessage,
        block: showMessage,
      }"
      >{{ getStatusMessage() }}</span
    >
  </div>
</template>

<script>
import { createPopper } from "@popperjs/core";

export default {
  name: "ValuatedMessageStatusIcon",
  props: {
    status: {
      type: Number,
    },
  },
  data() {
    return {
      showMessage: false,
    };
  },
  watch: {
    showMessage(newValue) {
      if (newValue) {
        createPopper(this.$refs.icon, this.$refs.statusMessage, {
          placement: "bottom-start",
          modifiers: [
            {
              name: "offset",
              options: {
                offset: [1, 10],
              },
            },
            {
              name: "preventOverflow",
              options: {
                mainAxis: false,
              },
            },
          ],
        });
      }
    },
  },
  methods: {
    getIconClass() {
      let cssClass = "fas ";
      if (this.status == 1) {
        cssClass += "fa-clock";
      } else if (this.status === 2) {
        cssClass += "fa-check";
      } else if (this.status === 3 || this.status === 6) {
        cssClass += "fa-exclamation-triangle";
      } else if (this.status === 4 || this.status === 7) {
        cssClass += "fa-times";
      } else if (this.status === 5) {
        cssClass += "fa-circle-user";
      }

      return cssClass;
    },
    getStatusMessage() {
      if (this.status === 1) {
        return "Pending";
      } else if (this.status === 2) {
        return "Transaction submitted";
      } else if (this.status === 3) {
        return "Insufficient Balance";
      } else if (this.status === 4 || this.status === 7) {
        return "Transaction Error";
      } else if (this.status === 5) {
        return "No address submitted";
      } else if (this.status === 6) {
        return "Insufficient Asset Balance";
      }
    },
  },
};
</script>
