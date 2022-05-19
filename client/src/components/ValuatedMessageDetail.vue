<template>
  <div class="flex flex-col">
    <div>
      <span class="font-semibold">Post:</span>
      <a target="_blank" :href="rowData.messageLink">{{
        rowData.messageLink
      }}</a>
    </div>
    <div>
      <span class="font-semibold">Paid:</span>
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
    <div v-if="rowData.royalityValue > 0">
      <div>
        <span class="font-semibold">Royality Fee:</span>
        {{ rowData.royalityValue }} {{ rowData.coinName }}
      </div>
      <div>
        <span class="font-semibold">Royality Paid:</span>
        {{
          rowData.royalityTransactionHash !== "" &&
          rowData.royalityTransactionHash !== null
            ? "Yes"
            : "No"
        }}
      </div>
      <div>
        <span class="font-semibold">Royality Transaction Hash:</span>
        {{
          rowData.royalityTransactionHash !== "" &&
          rowData.royalityTransactionHash !== null
            ? rowData.royalityTransactionHash
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

    <div v-if="rowData.royalityValue > 0 && rowData.hasAsset === 1">
      <div>
        <span class="font-semibold"
          >Royality Valuation bumped to asset min balance:</span
        >
        {{ rowData.royalityMinBalanceBumped === 1 ? "Yes" : "No" }}
      </div>
      <div>
        <span class="font-semibold">Royality Existential Deposit sent:</span>
        {{ rowData.royalitySentExistentialDeposit === 1 ? "Yes" : "No" }}
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
