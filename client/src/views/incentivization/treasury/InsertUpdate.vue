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
            <FormInput v-model="treasury.name" :errors="getErrors('name')" id="name" />
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
                :class="getSelectClasses('elevationChannelId')"
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
              <p class="text-red-700 pl-2  my-2" v-for="error in getErrors('elevationChannelId')" :key="error">
                {{ error.message }}
              </p>
            </div>

            <div class="mt-6">
              <FormLabel for="elevationEmojiId">Elevation Emoji</FormLabel>
              <multiselect
                v-model="treasury.elevationEmojiId"
                :class="getSelectClasses('elevationEmojiId')"
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
              <p class="text-red-700 pl-2  my-2" v-for="error in getErrors('elevationEmojiId')" :key="error">
                {{ error.message }}
              </p>
            </div>
            <div class="mt-6">
              <FormLabel for="elevationAmount">Required emoji amount</FormLabel>
              <FormInput
                v-model="treasury.elevationAmount" :errors="getErrors('elevationAmount')"
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
          <div>
            <FormLabel for="type">Type</FormLabel>
            <multiselect
              v-model="treasury.type"
                :class="getSelectClasses('type')"
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
              <p class="text-red-700 pl-2  my-2" v-for="error in getErrors('type')" :key="error">
                {{ error.message }}
              </p>
          </div>
          <div class="mt-6">
            <FormLabel for="type">Coin/Token Name</FormLabel>
            <FormInput v-model="treasury.coinName" :errors="getErrors('coinName')" id="coinName" />
          </div>
          <div class="mt-6">
            <FormLabel for="rpcUrl">RPC URL</FormLabel>
            <FormInput v-model="treasury.rpcUrl" :errors="getErrors('rpcUrl')" id="rpcUrl" />
          </div>
          <div v-if="type === 'evm'">
            <div class="mt-6">
              <FormLabel for="isNative">Token Type</FormLabel>
              <multiselect
                v-model="treasury.isNative"
                :class="getSelectClasses('isNative')"
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
              <p class="text-red-700 pl-2  my-2" v-for="error in getErrors('isNative')" :key="error">
                {{ error.message }}
              </p>
            </div>
            <div class="mt-6">
              <FormLabel for="privateKey">Private Key</FormLabel>
              <FormInput
                v-model="treasury.privateKey" :errors="getErrors('privateKey')"
                type="textarea"
                id="privateKey"
              />
            </div>
            <div class="mt-6" v-if="isNative === 0">
              <FormLabel for="tokenAddress">Contract Address</FormLabel>
              <FormInput v-model="treasury.tokenAddress" :errors="getErrors('tokenAddress')" id="tokenAddress" />
            </div>
            <div class="mt-6">
              <FormLabel for="tokenDecimals">Token Decimals</FormLabel>
              <FormInput v-model="treasury.tokenDecimals" :errors="getErrors('tokenDecimals')" id="tokenDecimals" />
            </div>
          </div>
          <div v-else-if="type === 'substrate'">
            <div class="mt-6">
              <FormLabel for="parachainType">Payout Type</FormLabel>
              <multiselect
                v-model="treasury.parachainType"
                :class="getSelectClasses('parachainType')"
                :allow-empty="true"
                :showLabels="false"
                :showPointer="false"
                @input="updateTokenType"
                label="name"
                track-by="value"
                :options="[
                  { value: 0, name: 'Native Coin' },
                  { value: 1, name: 'Asset' },
                ]"
              >
                <template slot="singleLabel" slot-scope="{ option }">{{
                  option.name
                }}</template>
              </multiselect>
              <p class="text-red-700 pl-2  my-2" v-for="error in getErrors('parachainType')" :key="error">
                {{ error.message }}
              </p>
            </div>
            <div v-if="parachainType == 1">
              <div class="mt-6">
                <FormLabel for="assetId">Asset ID</FormLabel>
                <FormInput v-model="treasury.assetId" :errors="getErrors('assetId')" id="assetId" />
              </div>

              <div class="mt-6">
                <FormLabel for="sendMinBalance"
                  >Send Asset Min Balance if receiver balance is not
                  sufficient</FormLabel
                >
                <FormToggle v-model="treasury.sendMinBalance" />
              </div>
            </div>
            <div class="mt-6">
              <FormLabel for="chainPrefix">Chain Prefix</FormLabel>
              <FormInput v-model="treasury.chainPrefix" :errors="getErrors('chainPrefix')" id="chainPrefix" />
            </div>
            <div class="mt-6">
                <FormLabel for="sendExistentialDeposit"
                  >Send existential deposit if receiver balance is not
                  sufficient</FormLabel
                >
                <FormToggle v-model="treasury.sendExistentialDeposit" />
            </div>
            <div class="mt-6">
              <FormLabel for="mnemonic">Mnemonic</FormLabel>
              <FormInput
                v-model="treasury.mnemonic" :errors="getErrors('mnemonic')"
                type="textarea"
                id="mnemonic"
              />
            </div>
            <div class="mt-6">
              <FormLabel for="chainOptions">Types JSON</FormLabel>
              <FormInput
                v-model="treasury.chainOptions" :errors="getErrors('chainOptions')"
                type="textarea"
                id="chainOptions"
              />
            </div>
          </div>
          <div class="mt-6">
            <FormLabel for="royaltyEnabled">Royalty Fee</FormLabel>
            <FormToggle v-model="treasury.royaltyEnabled" />
          </div>
          <div v-if="royaltyEnabled">
            <div class="mt-6">
              <FormLabel for="royaltyPercentage"
                >Royalty Percentage</FormLabel
              >
              <FormInput
                v-model="treasury.royaltyPercentage" :errors="getErrors('royaltyPercentage')"
                id="royaltyPercentage"
              />
            </div>

            <div class="mt-6">
              <FormLabel for="royaltyAddress">Royalty Address</FormLabel>
              <FormInput
                v-model="treasury.royaltyAddress" :errors="getErrors('royaltyAddress')"
                id="royaltyAddress"
              />
            </div>
          </div>
        </div>

        <h2 class="mt-6 text-l font-semibold">Security</h2>
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
            <FormLabel for="encryptionKey">Encryption</FormLabel>
              <FormInput
                v-model="treasury.encryptionKey" :errors="getErrors('encryptionKey')"
                id="encryptionKey"
              />
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
      treasury: {
        id: null,
        encryptionKey: "",
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
        chainOptions: "",
        isNative: null,
        royaltyEnabled: false,
        royaltyPercentage: "",
        royaltyAddress: "",
        parachainType: null,
        assetId: null,
        sendMinBalance: true,
        sendExistentialDeposit: false,
      },
      errors: []
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
    royaltyEnabled: function () {
      return this.treasury.royaltyEnabled;
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

            this.treasury.parachainType = this.treasury.parachainType === 0
                ? { value: 0, name: "Native Coin" }
                : { value: 1, name: "Asset" };

            this.treasury.elevationActive = !!this.treasury.elevationActive;
            this.treasury.royaltyEnabled = !!this.treasury.royaltyEnabled;
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
      data.royaltyEnabled = data.royaltyEnabled ? 1 : 0;
      data.sendMinBalance = data.sendMinBalance ? 1 : 0;
      data.sendExistentialDeposit = data.sendExistentialDeposit ? 1 : 0;
      data.elevationChannelId = data.elevationChannelId?.id;
      data.elevationEmojiId = data.elevationEmojiId?.id;
      data.isNative = data.isNative?.value;
      data.parachainType = data.parachainType?.value;
      data.type = data.type?.value;

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
          if (error.data?.errors) {
            this.errors = error.data.errors
          }
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
    getErrors(key) {
      return this.errors.filter(e => e.key === key)
    },
    getSelectClasses(key) {
      if (this.getErrors(key).length > 0) return "select-error"

      return ""
    }
  },
};
</script>