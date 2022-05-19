<template>
  <div class="treasury-crud">
    <div class="flex flex-wrap flex-col items-center">
      <div class="w-full lg:w-8/12 my-6">
        <h2 class="text-xl font-semibold">
          {{ action | capitalize }} Treasury
        </h2>
        <div
          class="
            px-4
            border
            rounded-lg
            bg-white
            border-gray-300
            dark:border-gray-700
            p-5
            mt-6
          "
        >
          <div>
            <FormLabel for="name">Name</FormLabel>
            <FormInput v-model="treasury.name" id="name" />
          </div>
          <div class="mt-6">
            <FormLabel for="elevationActive">Elevation enabled</FormLabel>
            <FormToggle v-model="treasury.elevationActive" />
          </div>
          <div v-if="elevationActive">
            <div class="mt-6">
              <FormLabel for="elevationChannelId">Elevate to Channel</FormLabel>
              <multiselect
                v-model="treasury.elevationChannelId"
                :allow-empty="false"
                :showLabels="false"
                :showPointer="false"
                label="name"
                track-by="id"
                :options="channels"
              >
                <template slot="singleLabel" slot-scope="{ option }"
                  ><div>{{ option.name }}</div></template
                >
                <template slot="option" slot-scope="{ option }"
                  ><div>{{ option.name }}</div></template
                >
              </multiselect>
            </div>

            <div class="mt-6">
              <FormLabel for="elevationEmojiId">Elevation Emoji</FormLabel>
              <multiselect
                v-model="treasury.elevationEmojiId"
                :allow-empty="false"
                :showLabels="false"
                :showPointer="false"
                label="name"
                track-by="id"
                :options="emojis"
              >
                <template slot="singleLabel" slot-scope="{ option }"
                  ><div class="flex items-center">
                    <img
                      :src="getDiscordEmojiUrl(option.id)"
                      class="emoji"
                      :alt="option.name"
                      :title="option.name"
                    />
                    :{{ option.name }}:
                  </div></template
                >
                <template slot="option" slot-scope="{ option }"
                  ><div class="flex items-center">
                    <img
                      :src="getDiscordEmojiUrl(option.id)"
                      class="emoji"
                      :alt="option.name"
                      :title="option.name"
                    />
                    :{{ option.name }}:
                  </div></template
                >
              </multiselect>
            </div>

            <div class="mt-6">
              <FormLabel for="elevationAmount">Required emoji amount</FormLabel>
              <FormInput
                v-model="treasury.elevationAmount"
                id="elevationAmount"
              />
            </div>
          </div>
        </div>
        <h2 class="mt-6 text-l font-semibold">Payout Details</h2>
        <div
          class="
            px-4
            border
            rounded-lg
            bg-white
            border-gray-300
            dark:border-gray-700
            p-5
            mt-6
          "
        >
          <div class="mt-6">
            <FormLabel for="type">Type</FormLabel>
            <multiselect
              v-model="treasury.type"
              :allow-empty="true"
              :showLabels="false"
              :showPointer="false"
              label="name"
              track-by="value"
              :options="[
                { value: 'substrate', name: 'Substrate' },
                { value: 'evm', name: 'EVM' },
              ]"
            >
              <template slot="singleLabel" slot-scope="{ option }">{{
                option.name
              }}</template>
              <template slot="option" slot-scope="{ option }">{{
                option.name
              }}</template>
            </multiselect>
          </div>
          <div class="mt-6">
            <FormLabel for="type">Coin/Token Name</FormLabel>
            <FormInput v-model="treasury.coinName" id="coinName" />
          </div>
          <div class="mt-6">
            <FormLabel for="rpcUrl">RPC URL</FormLabel>
            <FormInput v-model="treasury.rpcUrl" id="rpcUrl" />
          </div>
          <div v-if="type === 'evm'">
            <div class="mt-6">
              <FormLabel for="isNative">Token Type</FormLabel>
              <multiselect
                v-model="treasury.isNative"
                :allow-empty="true"
                :showLabels="false"
                @input="updateTokenType"
                :showPointer="false"
                label="name"
                track-by="value"
                :options="[
                  { value: 1, name: 'Native' },
                  { value: 0, name: 'Contract' },
                ]"
              >
                <template slot="singleLabel" slot-scope="{ option }">{{
                  option.name
                }}</template>
                <template slot="option" slot-scope="{ option }">{{
                  option.name
                }}</template>
              </multiselect>
            </div>
            <div class="mt-6">
              <FormLabel for="privateKey">Private Key</FormLabel>
              <FormInput
                v-model="treasury.privateKey"
                type="textarea"
                id="privateKey"
              />
            </div>
            <div class="mt-6" v-if="isNative === 0">
              <FormLabel for="tokenAddress">Contract Address</FormLabel>
              <FormInput v-model="treasury.tokenAddress" id="tokenAddress" />
            </div>
            <div class="mt-6">
              <FormLabel for="tokenDecimals">Token Decimals</FormLabel>
              <FormInput v-model="treasury.tokenDecimals" id="tokenDecimals" />
            </div>
          </div>
          <div v-else-if="type === 'substrate'">
            <div class="mt-6">
              <FormLabel for="type">Type</FormLabel>
              <multiselect
                v-model="treasury.parachainType"
                :allow-empty="true"
                :showLabels="false"
                :showPointer="false"
                @input="updateTokenType"
                label="name"
                track-by="value"
                :options="[
                  { value: 0, name: 'Parachain' },
                  { value: 1, name: 'Statemine Asset' },
                  { value: 2, name: 'Statemint Asset' },
                ]"
              >
                <template slot="singleLabel" slot-scope="{ option }">{{
                  option.name
                }}</template>
                <template slot="option" slot-scope="{ option }">{{
                  option.name
                }}</template>
              </multiselect>
            </div>
            <div v-if="parachainType > 0">
              <div class="mt-6">
                <FormLabel for="assetId">Asset ID</FormLabel>
                <FormInput v-model="treasury.assetId" id="assetId" />
              </div>

              <div class="mt-6">
                <FormLabel for="sendMinBalance"
                  >Send Asset Min Balance if receiver balance is not
                  sufficient</FormLabel
                >
                <FormToggle v-model="treasury.sendMinBalance" />
              </div>
              <div class="mt-6">
                <FormLabel for="sendExistentialDeposit"
                  >Send existential deposit if receiver balance is not
                  sufficient</FormLabel
                >
                <FormToggle v-model="treasury.sendExistentialDeposit" />
              </div>
            </div>
            <div class="mt-6">
              <FormLabel for="chainPrefix">Chain Prefix</FormLabel>
              <FormInput v-model="treasury.chainPrefix" id="chainPrefix" />
            </div>
            <div class="mt-6">
              <FormLabel for="mnemonic">Mnemonic</FormLabel>
              <FormInput
                v-model="treasury.mnemonic"
                type="textarea"
                id="mnemonic"
              />
            </div>
            <div class="mt-6">
              <FormLabel for="chainTypes">Types JSON</FormLabel>
              <FormInput
                v-model="treasury.chainTypes"
                type="textarea"
                id="chainTypes"
              />
            </div>
          </div>
          <div class="mt-6">
            <FormLabel for="royalityEnabled">Royality Fee</FormLabel>
            <FormToggle v-model="treasury.royalityEnabled" />
          </div>
          <div v-if="royalityEnabled">
            <div class="mt-6">
              <FormLabel for="royalityPercentage"
                >Royality Percentage</FormLabel
              >
              <FormInput
                v-model="treasury.royalityPercentage"
                id="royalityPercentage"
              />
            </div>

            <div class="mt-6">
              <FormLabel for="royalityAddress">Royality Address</FormLabel>
              <FormInput
                v-model="treasury.royalityAddress"
                id="royalityAddress"
              />
            </div>
          </div>

          <div class="flex justify-end mt-6">
            <button
              @click="submit()"
              class="
                text-white
                bg-blue-700
                hover:bg-blue-800
                focus:ring-4 focus:ring-blue-300
                font-medium
                rounded-lg
                text-sm
                px-5
                py-2.5
                dark:bg-blue-600 dark:hover:bg-blue-700
                focus:outline-none
                dark:focus:ring-blue-800
              "
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import API from "@/services/api";
import FormLabel from "@/components/Form/Label";
import FormInput from "@/components/Form/Input";
import FormToggle from "@/components/Form/Toggle";
import Multiselect from "vue-multiselect";

export default {
  name: "TreasuryInsertUpdate",
  components: {
    FormLabel,
    FormInput,
    FormToggle,
    Multiselect,
  },
  props: ["action"],
  data() {
    return {
      channels: [],
      emojis: [],
      id: null,
      oldMnemonic: "",
      oldPrivateKey: "",
      treasury: {
        id: null,
        name: "",
        coinName: "",
        elevationChannelId: null,
        elevationEmojiId: null,
        elevationActive: false,
        elevationAmount: 1,
        type: null,
        rpcUrl: "",
        chainPrefix: 10,
        mnemonic: "",
        privateKey: "",
        tokenAddress: "",
        tokenDecimals: 18,
        chainTypes: "",
        isNative: null,
        royalityEnabled: false,
        royalityPercentage: "",
        royalityAddress: "",
        parachainType: 0,
        assetId: null,
        sendMinBalance: false,
        sendExistentialDeposit: false,
      },
    };
  },
  beforeMount() {
    this.$root.isLoading = true;
    this.getData();
  },
  computed: {
    type: function () {
      return this.treasury.type?.value;
    },
    isNative: function () {
      return this.treasury.isNative?.value;
    },
    elevationActive: function () {
      return this.treasury.elevationActive;
    },
    royalityEnabled: function () {
      return this.treasury.royalityEnabled;
    },
    parachainType: function () {
      return this.treasury.parachainType?.value;
    },
  },
  methods: {
    getDiscordEmojiUrl(id) {
      return `https://cdn.discordapp.com/emojis/${id}.webp?size=64&quality=lossless`;
    },
    async getData() {
      await API.request("discord/channels")
        .then((response) => {
          this.channels = response.data.filter((channel) => channel.type == 0);
        })
        .catch((error) => {
          console.log(error);
        });

      await API.request("discord/emojis")
        .then((response) => {
          this.emojis = response.data;
        })
        .catch((error) => {
          console.log(error);
        });

      if (this.action === "update") {
        await API.request("treasury/" + this.$route.params.id)
          .then((response) => {
            this.treasury = response.data;
            console.log(this.treasury);

            this.treasury.elevationChannelId =
              this.channels.find(
                (channel) => channel.id == this.treasury.elevationChannelId
              ) ?? null;
            this.treasury.elevationEmojiId =
              this.emojis.find(
                (emoji) => emoji.id == this.treasury.elevationEmojiId
              ) ?? null;

            this.treasury.isNative =
              this.treasury.isNative === 0
                ? { value: 0, name: "Contract" }
                : { value: 1, name: "Native" };
            this.treasury.type =
              this.treasury.type === "substrate"
                ? { value: "substrate", name: "Substrate" }
                : { value: "evm", name: "EVM" };

            if (this.treasury.parachainType === 0) {
              this.treasury.parachainType = { value: 0, name: "Parachain" };
            } else if (this.treasury.parachainType === 1) {
              this.treasury.parachainType = {
                value: 1,
                name: "Statemine Asset",
              };
            } else if (this.treasury.parachainType === 2) {
              this.treasury.parachainType = {
                value: 2,
                name: "Statemint Asset",
              };
            }

            this.oldMnemonic = this.treasury.mnemonic;
            this.oldPrivateKey = this.treasury.privateKey;

            this.treasury.mnemonic = "";
            this.treasury.privateKey = "";

            this.treasury.elevationActive = !!this.treasury.elevationActive;
            this.treasury.royalityEnabled = !!this.treasury.royalityEnabled;
            this.treasury.sendMinBalance = !!this.treasury.sendMinBalance;
            this.treasury.sendExistentialDeposit =
              !!this.treasury.sendExistentialDeposit;
          })
          .catch((error) => {
            console.log(error);
          });
      }

      this.$root.isLoading = false;
    },
    submit() {
      let data = Object.assign({}, this.treasury, true);

      data.elevationActive = data.elevationActive ? 1 : 0;
      data.royalityEnabled = data.royalityEnabled ? 1 : 0;
      data.sendMinBalance = data.sendMinBalance ? 1 : 0;
      data.sendExistentialDeposit = data.sendExistentialDeposit ? 1 : 0;
      data.elevationChannelId = data.elevationChannelId?.id;
      data.elevationEmojiId = data.elevationEmojiId?.id;
      data.isNative = data.isNative?.value;
      data.parachainType = data.parachainType?.value;
      data.type = data.type?.value;

      if (data.privateKey === null || data.privateKey === "")
        data.privateKey = this.oldPrivateKey;
      if (data.mnemonic === null || data.mnemonic === "")
        data.mnemonic = this.oldMnemonic;

      API.request(
        this.action == "insert"
          ? `treasury/insert/`
          : `treasury/update/${this.treasury.id}`,
        data,
        this.action == "insert" ? "post" : "put"
      )
        .then((res) => {
          this.$notify({ type: "success", text: res.data.message });
          this.$router.push({ path: "/admin/treasuries" });
        })
        .catch((error) => {
          this.$notify({ type: "error", text: error.data?.message || error });
        });
    },
    updateTokenType() {
      const oldValue = this.treasury.type;
      this.treasury.type = null;

      this.$nextTick(() => {
        this.treasury.type = oldValue;
      });
    },
    updateParachainType() {
      const oldValue = this.treasury.parachainType;
      this.treasury.parachainType = null;

      this.$nextTick(() => {
        this.treasury.parachainType = oldValue;
      });
    },
  },
};
</script>