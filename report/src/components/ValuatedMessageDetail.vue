<template>
  <div class="flex flex-col">
    <div>
      <span class="font-semibold">Post:</span> 
      <a target="_blank" :href="item.messageLink">{{
        item.messageLink
      }}</a>
    </div>
    <div>
      <span class="font-semibold">Transaction Hash:</span>
      <span v-html="transactionHash" />
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
  computed: {
    transactionHash: function() {
      if (this.item.transactionHash !== "" && this.item.transactionHash !== null) {
        if (this.item.explorerUrl !== "" && this.item.explorerUrl !== null) {
          const url = this.item.explorerUrl.replace('%s', this.item.transactionHash)
          return `<a href="${url}">${this.item.transactionHash}</a>`
        } else {
          return this.item.transactionHash
        }
      }

      return '-';
    }
  }
};
</script>