<template>
  <div class="flex flex-col">
    <div>
      <span class="font-semibold">Post:</span>
      <a target="_blank" :href="rowData.messageLink">{{
        rowData.messageLink
      }}</a>
    </div>
    <div>
      <span class="font-semibold">Submitted:</span>
      {{
        rowData.transactionHash !== "" && rowData.transactionHash !== null
          ? "Yes"
          : "No"
      }}
    </div>
    <div>
      <span class="font-semibold">Transaction Hash:</span>
      <span v-html="transactionHash" />
    </div>
    <div v-if="rowData.royaltyValue > 0">
      <div>
        <span class="font-semibold">Royalty Fee:</span>
        {{ rowData.royaltyValue }} {{ rowData.coinName }}
      </div>
      <div>
        <span class="font-semibold">Royalty Submitted:</span>
        {{
          rowData.royaltyTransactionHash !== "" &&
          rowData.royaltyTransactionHash !== null
            ? "Yes"
            : "No"
        }}
      </div>
      <div>
        <span class="font-semibold">Royalty Transaction Hash:</span>
        <span v-html="royaltyTransactionHash" />
      </div>
    </div>
    <div v-if="rowData.hasAsset === 1">
      <div>
        <span class="font-semibold"
          >Valuation bumped to asset min balance:</span
        >
        {{ rowData.minBalanceBumped === 1 ? "Yes" : "No" }}
      </div>
      <div>
        <span class="font-semibold">Existential Deposit sent:</span>
        {{ rowData.sentExistentialDeposit === 1 ? "Yes" : "No" }}
      </div>
    </div>

    <div v-if="rowData.royaltyValue > 0 && rowData.hasAsset === 1">
      <div>
        <span class="font-semibold"
          >Royalty Valuation bumped to asset min balance:</span
        >
        {{ rowData.royaltyMinBalanceBumped === 1 ? "Yes" : "No" }}
      </div>
      <div>
        <span class="font-semibold">Royalty Existential Deposit sent:</span>
        {{ rowData.royaltySentExistentialDeposit === 1 ? "Yes" : "No" }}
      </div>
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
  computed: {
    transactionHash: function() {
      if (this.rowData.transactionHash !== "" && this.rowData.transactionHash !== null) {
        if (this.rowData.explorerUrl !== "" && this.rowData.explorerUrl !== null) {
          const url = this.rowData.explorerUrl.replace('%s', this.rowData.transactionHash)
          return `<a href="${url}">${this.rowData.transactionHash}</a>`
        } else {
          return this.rowData.transactionHash
        }
      }

      return '-';
    },
    royaltyTransactionHash: function() {
      if (this.rowData.royaltyTransactionHash !== "" && this.rowData.royaltyTransactionHash !== null) {
        if (this.rowData.explorerUrl !== "" && this.rowData.explorerUrl !== null) {
          const url = this.rowData.explorerUrl.replace('%s', this.rowData.royaltyTransactionHash)
          return `<a href="${url}">${this.rowData.royaltyTransactionHash}</a>`
        } else {
          return this.rowData.royaltyTransactionHash
        }
      }

      return '-';
    }
  }
};
</script>
