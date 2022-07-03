<template>
  <div class="flex flex-col">
    <div>
      <span class="font-semibold">Post:</span> 
      <a target="_blank" :href="item.messageLink">{{
        item.messageLink
      }}</a>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      required: true,
    }
  },
};
</script>