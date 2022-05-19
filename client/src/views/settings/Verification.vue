<template>
  <div class="verification-settings">
    <div class="flex flex-wrap flex-col items-center">
      <div class="w-full lg:w-8/12 my-6">
        <h2 class="text-xl font-semibold">Verification Settings</h2>
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
            <FormLabel for="verification_dm_text"
              >Verification DM Text</FormLabel
            >
            <FormInput
              type="textarea"
              v-model="config.verification_dm_text"
              id="verification_dm_text"
            />
          </div>
          <div class="mt-6">
            <FormLabel for="verification_intro_text"
              >Verification Introduction Text</FormLabel
            >
            <FormInput
              type="textarea"
              v-model="config.verification_intro_text"
              id="verification_intro_text"
            />
          </div>

          <div class="mt-6">
            <FormLabel for="verification_channel_id"
              >Verification Channel ID</FormLabel
            >
            <multiselect
              v-model="config.verification_channel_id"
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
            <FormLabel for="introduction_channel_id"
              >Introduction Channel ID</FormLabel
            >
            <multiselect
              v-model="config.introduction_channel_id"
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
          <div class="flex justify-end mt-6">
            <button
              @click="reset()"
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
                mr-auto
              "
            >
              Reset Verification Message
            </button>
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
import Multiselect from "vue-multiselect";

export default {
  name: "VerificationSettings",
  components: {
    FormLabel,
    FormInput,
    Multiselect,
  },
  data() {
    return {
      channels: [],
      roles: [],
      config: {
        introduction_channel_id: null,
        verification_channel_id: null,
        verification_dm_text: "",
        verification_intro_text: "",
      },
    };
  },
  beforeMount() {
    this.$root.isLoading = true;
    this.getData();
  },
  methods: {
    async getData() {
      await API.request("discord/channels")
        .then((response) => {
          this.channels = response.data.filter((channel) => channel.type == 0);
        })
        .catch((error) => {
          console.log(error);
        });

      await API.request(
        "config/find",
        [
          "introduction_channel_id",
          "verification_channel_id",
          "verification_dm_text",
          "verification_intro_text",
        ],
        "POST"
      )
        .then((response) => {
          this.config = response.data;

          this.config.verification_channel_id =
            this.channels.find(
              (channel) => channel.id == this.config.verification_channel_id
            ) ?? null;
          this.config.introduction_channel_id =
            this.channels.find(
              (channel) => channel.id == this.config.introduction_channel_id
            ) ?? null;
        })
        .catch((error) => {
          console.log(error);
        });

      this.$root.isLoading = false;
    },
    submit() {
      let data = Object.assign({}, this.config, true);

      data.introduction_channel_id = data.introduction_channel_id?.id;
      data.verification_channel_id = data.verification_channel_id?.id;

      API.request("config/update", data, "POST")
        .then((res) => {
          this.$notify({ type: "success", text: res.data.message });
        })
        .catch((error) => {
          this.$notify({ type: "error", text: error.data?.message || error });
        });
    },
    reset() {
      API.request("config/verification")
        .then((res) => {
          this.$notify({ type: "success", text: res.data.message });
        })
        .catch((error) => {
          this.$notify({ type: "error", text: error.data?.message || error });
        });
    },
  },
};
</script>