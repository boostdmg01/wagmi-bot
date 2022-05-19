<template>
  <input
    :type="type"
    :value="value"
    @input="updateValue($event.target.value)"
    :class="classes"
    v-if="type !== 'textarea'"
  />
  <textarea
    @input="updateValue($event.target.value)"
    v-model="value"
    :class="classes"
    rows="9"
    v-else
  ></textarea>
</template>
<script>
export default {
  name: "FormInput",
  props: {
    value: String,
    type: {
      type: String,
      default: "text",
    },
  },
  data() {
    return {
      classes:
        "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500",
    };
  },
  methods: {
    updateValue: function (value) {
      this.$emit("input", value);
    },
  },
};
</script>
