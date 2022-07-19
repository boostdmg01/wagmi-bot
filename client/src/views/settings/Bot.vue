<template>
  <div class="verification-settings">
    <div class="flex flex-wrap flex-col items-center">
      <div class="w-full lg:w-8/12 my-6">
        <h2 class="text-xl font-semibold">Bot Settings</h2>
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
            <FormLabel for="log_channel_id"
              >Log Channel</FormLabel
            >
            <multiselect
              v-model="config.log_channel_id"
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
  name: "BotSettings",
  components: {
    FormLabel,
    FormInput,
    Multiselect,
  },
  data() {
    return {
      channels: [],
      config: {
        log_channel_id: null,
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
          "log_channel_id",
        ],
        "POST"
      )
        .then((response) => {
          this.config = response.data;

          this.config.log_channel_id =
            this.channels.find(
              (channel) => channel.id == this.config.log_channel_id
            ) ?? null;
        })
        .catch((error) => {
          console.log(error);
        });

      this.$root.isLoading = false;
    },
    submit() {
      let data = Object.assign({}, this.config, true);

      data.log_channel_id = data.log_channel_id?.id;

      API.request("config/update", data, "POST")
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