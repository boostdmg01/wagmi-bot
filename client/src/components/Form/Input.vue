<template>
  <div>
    <div class="flex items-center">
      <input
      :type="currentType"
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
    <i class="fas ml-4 cursor" :class="{'fa-eye-slash': currentType === 'password', 'fa-eye': currentType === 'text'}" v-if="type === 'password'" @click="toggleVisibility()"></i>
    </div>
    <p class="text-red-700 pl-2 my-2" v-for="error in errors" :key="error">
      {{ error.message }}
    </p>
  </div>
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
    errors: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      currentType: this.type
    }
  },
  computed: {
    classes: function() {
      let classes = "bg-gray-50 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"

      if (this.errors.length > 0) {
        classes += " border-red-300 dark:border-red-600"
      } else {
        classes += " border-gray-300 dark:border-gray-600"

      }

      return classes
    }
  },
  methods: {
    updateValue: function (value) {
      this.$emit("input", value);
    },
    toggleVisibility: function() {
      if (this.currentType !== 'password') {
        this.currentType = 'password'
      } else {
        this.currentType = 'text'
      }
    }
  },
};
</script>
