<template>
  <popup-modal ref="popup">
    <h2 class="text-lg font-semibold">{{ title }}</h2>
    <p class="my-4 text-sm">{{ message }}</p>
    <div class="flex items-center">
      <button
        class="
          text-white
          bg-blue-700
          hover:bg-blue-800
          focus:ring-4 focus:ring-blue-300
          font-medium
          rounded-lg
          text-sm
          px-4
          py-2
          mr-2
          dark:bg-blue-600 dark:hover:bg-blue-700
          focus:outline-none
          dark:focus:ring-blue-800
        "
        @click="_cancel"
      >
        {{ cancelButton }}
      </button>
      <button
        class="
          ml-auto
          text-white
          bg-red-700
          hover:bg-red-800
          focus:ring-4 focus:ring-blue-300
          font-medium
          rounded-lg
          text-sm
          px-4
          py-2
          dark:bg-red-600 dark:hover:bg-red-700
          focus:outline-none
          dark:focus:ring-red-800
        "
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
  }),

  methods: {
    show(opts = {}) {
      this.title = opts.title;
      this.message = opts.message;
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