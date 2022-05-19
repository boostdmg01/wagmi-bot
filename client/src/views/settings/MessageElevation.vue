<template>
  <div class="verification-settings">
    <div class="flex flex-wrap flex-col items-center">
      <div class="w-full lg:w-8/12 my-6">
        <h2 class="text-xl font-semibold">Message Elevation Settings</h2>
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
            <FormLabel for="elevation_required_emojis"
              >Required amount of emojis</FormLabel
            >
            <FormInput
              v-model="config.elevation_required_emojis"
              id="elevation_required_emojis"
            />
          </div>
          <div class="mt-6">
            <FormLabel for="elevation_emoji_id"
              >General elevation emoji</FormLabel
            >
            <multiselect
              v-model="config.elevation_emoji_id"
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
            <FormLabel for="news_channel_ids"
              >Elevate news messages from</FormLabel
            >
            <div class="flex flex-wrap">
              <div class="w-full lg:w-5/12">
                <multiselect
                  v-model="config.news_channel_ids"
                  :allow-empty="false"
                  :showLabels="false"
                  :show-no-results="false"
                  :hide-selected="true"
                  :multiple="true"
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
              <div class="w-full lg:w-2/12 text-center form-divider">to</div>
              <div class="w-full lg:w-5/12">
                <multiselect
                  v-model="config.news_elevation_channel_id"
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
            </div>
          </div>
          <div class="mt-6">
            <FormLabel for="content_channel_ids"
              >Elevate content messages from</FormLabel
            >
            <div class="flex flex-wrap">
              <div class="w-full lg:w-5/12">
                <multiselect
                  v-model="config.content_channel_ids"
                  :allow-empty="false"
                  :showLabels="false"
                  :show-no-results="false"
                  :hide-selected="true"
                  :multiple="true"
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
              <div class="w-full lg:w-2/12 text-center form-divider">to</div>
              <div class="w-full lg:w-5/12">
                <multiselect
                  v-model="config.content_elevation_channel_id"
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
            </div>
          </div>
          <div class="mt-6">
            <FormLabel for="elevation_required_emojis"
              >Instant message elevation channel</FormLabel
            >
            <multiselect
              v-model="config.instant_elevation_channel_id"
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
  name: "MessageElevationSettings",
  components: {
    FormLabel,
    FormInput,
    Multiselect,
  },
  data() {
    return {
      channels: [],
      emojis: [],
      config: {
        elevation_required_emojis: null,
        elevation_emoji_id: null,
        news_channel_ids: null,
        news_elevation_channel_id: null,
        content_channel_ids: null,
        content_elevation_channel_id: null,
        instant_elevation_channel_id: null,
      },
    };
  },
  beforeMount() {
    this.$root.isLoading = true;
    this.getData();
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

      await API.request(
        "config/find",
        [
          "elevation_required_emojis",
          "elevation_emoji_id",
          "news_channel_ids",
          "news_elevation_channel_id",
          "content_channel_ids",
          "content_elevation_channel_id",
          "instant_elevation_channel_id",
        ],
        "POST"
      )
        .then((response) => {
          this.config = response.data;

          this.config.news_elevation_channel_id =
            this.channels.find(
              (channel) => channel.id == this.config.news_elevation_channel_id
            ) ?? null;
          this.config.content_elevation_channel_id =
            this.channels.find(
              (channel) =>
                channel.id == this.config.content_elevation_channel_id
            ) ?? null;
          this.config.instant_elevation_channel_id =
            this.channels.find(
              (channel) =>
                channel.id == this.config.instant_elevation_channel_id
            ) ?? null;
          this.config.news_channel_ids =
            this.channels.filter((channel) =>
              this.config.news_channel_ids.includes(channel.id)
            ) ?? null;
          this.config.content_channel_ids =
            this.channels.filter((channel) =>
              this.config.content_channel_ids.includes(channel.id)
            ) ?? null;
          this.config.elevation_emoji_id =
            this.emojis.find(
              (emoji) => emoji.id == this.config.elevation_emoji_id
            ) ?? null;
        })
        .catch((error) => {
          console.log(error);
        });

      this.$root.isLoading = false;
    },
    submit() {
      let data = Object.assign({}, this.config, true);

      data.news_channel_ids = data.news_channel_ids
        .map((channel) => channel.id)
        .join(",");
      data.content_channel_ids = data.content_channel_ids
        .map((channel) => channel.id)
        .join(",");
      data.news_elevation_channel_id = data.news_elevation_channel_id?.id;
      data.content_elevation_channel_id = data.content_elevation_channel_id?.id;
      data.instant_elevation_channel_id = data.instant_elevation_channel_id?.id;
      data.elevation_emoji_id = data.elevation_emoji_id?.id;

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