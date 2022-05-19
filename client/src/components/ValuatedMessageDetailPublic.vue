<template>
  <div class="flex flex-col">
    <div>
      <span class="font-semibold">Post:</span>
      <a target="_blank" :href="rowData.messageLink">{{
        rowData.messageLink
      }}</a>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    rowData: {
      type: Object,
      required: true,
    },
    rowIndex: {
      type: Number,
    },
  },
};
</script>
