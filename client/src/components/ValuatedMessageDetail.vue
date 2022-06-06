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
      {{
        rowData.transactionHash !== "" && rowData.transactionHash !== null
          ? rowData.transactionHash
          : "-"
      }}
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
        {{
          rowData.royaltyTransactionHash !== "" &&
          rowData.royaltyTransactionHash !== null
            ? rowData.royaltyTransactionHash
            : "-"
        }}
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
};
</script>
