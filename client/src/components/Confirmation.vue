<template>
  <popup-modal ref="popup">
    <h2 class="text-lg font-semibold">{{ title }}</h2>
    <slot><p class="my-4 text-sm">{{ message }}</p></slot>
    <div class="flex items-center mt-6">
      <button
        class="
          text-white
          focus:ring-
          font-medium
          rounded-lg
          text-sm
          px-4
          py-2
          mr-2
          focus:outline-none
        "
        :class="{'bg-blue-700 hover:bg-blue-800 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800': inverted, 'bg-red-700 hover:bg-red-800 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800': !inverted }"
        @click="_cancel"
      >
        {{ cancelButton }}
      </button>
      <button
        class="
          ml-auto
          text-white
          focus:ring-4
          font-medium
          rounded-lg
          text-sm
          px-4
          py-2
          focus:outline-none
        "
        :class="{'bg-red-700 hover:bg-red-800 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800': inverted, 'bg-blue-700 hover:bg-blue-800 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800': !inverted }"
        @click="_confirm"
      >
        {{ okButton }}
      </button>
    </div>
  </popup-modal>
</template>
<script>
import PopupModal from "@/components/Popup";

export default {
  name: "ConfirmDialogue",

  components: { PopupModal },

  data: () => ({
    title: undefined,
    message: undefined,
    okButton: undefined,
    cancelButton: "Cancel",
    resolvePromise: undefined,
    rejectPromise: undefined,
    inverted: true
  }),

  methods: {
    show(opts = {}) {
      this.title = opts.title;
      this.message = opts.message;
      if(typeof opts.inverted !== "undefined") {
        this.inverted = opts.inverted;
      }
      this.okButton = opts.okButton;
      if (opts.cancelButton) {
        this.cancelButton = opts.cancelButton;
      }
      this.$refs.popup.open();
      return new Promise((resolve, reject) => {
        this.resolvePromise = resolve;
        this.rejectPromise = reject;
      });
    },

    _confirm() {
      this.$refs.popup.close();
      this.resolvePromise(true);
    },

    _cancel() {
      this.$refs.popup.close();
      this.resolvePromise(false);
    },
  },
};
</script>