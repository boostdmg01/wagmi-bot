<template>
  <div class="filter-bar ui basic segment grid">
    <div class="ui form">
      <div class="inline field">
        <label>Search for:</label>
        <input
          type="text"
          v-model="filterText"
          class="three wide column"
          @keyup.enter="doFilter"
          placeholder="name, nickname, or email"
        />
        <button class="ui primary button" @click="doFilter">Go</button>
        <button class="ui button" @click="resetFilter">Reset</button>
      </div>
    </div>
  </div>
</template>

  <script>
export default {
  props: ["onFilterChange"],
  data() {
    return {
      filterText: "",
    };
  },
  methods: {
    doFilter() {
      console.log("doFilter:", this.filterText);
      this.onFilterChange(this.filterText);
    },
    resetFilter() {
      this.filterText = "";
      console.log("resetFilter");
      this.onFilterChange(this.filterText);
    },
  },
};
</script>