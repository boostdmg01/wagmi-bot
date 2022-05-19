<template>
  <div class="verification-settings">
    <div class="flex flex-wrap flex-col items-center">
      <div class="w-full lg:w-8/12 my-6">
        <h2 class="text-xl font-semibold">Roles Settings</h2>
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
            <FormLabel for="unverified_role_id">Unverified Role ID</FormLabel>
            <multiselect
              v-model="config.unverified_role_id"
              :allow-empty="false"
              :showLabels="false"
              :showPointer="false"
              label="name"
              track-by="id"
              :options="roles"
            >
              <template slot="singleLabel" slot-scope="{ option }"
                ><div>
                  <span :style="getDiscordColor(option.color)">{{
                    option.name
                  }}</span>
                </div></template
              >
              <template slot="option" slot-scope="{ option }"
                ><div>
                  <span :style="getDiscordColor(option.color)">{{
                    option.name
                  }}</span>
                </div></template
              >
            </multiselect>
          </div>

          <div class="mt-6">
            <FormLabel for="newcomer_role_id">Newcomer Role ID</FormLabel>
            <multiselect
              v-model="config.newcomer_role_id"
              :allow-empty="false"
              :showLabels="false"
              :showPointer="false"
              label="name"
              track-by="id"
              :options="roles"
            >
              <template slot="singleLabel" slot-scope="{ option }"
                ><div>
                  <span :style="getDiscordColor(option.color)">{{
                    option.name
                  }}</span>
                </div></template
              >
              <template slot="option" slot-scope="{ option }"
                ><div>
                  <span :style="getDiscordColor(option.color)">{{
                    option.name
                  }}</span>
                </div></template
              >
            </multiselect>
          </div>

          <div class="mt-6">
            <FormLabel for="director_role_id">Director Role ID</FormLabel>
            <multiselect
              v-model="config.director_role_id"
              :allow-empty="false"
              :showLabels="false"
              :showPointer="false"
              label="name"
              track-by="id"
              :options="roles"
            >
              <template slot="singleLabel" slot-scope="{ option }"
                ><div>
                  <span :style="getDiscordColor(option.color)">{{
                    option.name
                  }}</span>
                </div></template
              >
              <template slot="option" slot-scope="{ option }"
                ><div>
                  <span :style="getDiscordColor(option.color)">{{
                    option.name
                  }}</span>
                </div></template
              >
            </multiselect>
          </div>

          <div class="mt-6">
            <FormLabel for="creator_role_id">Creator Role ID</FormLabel>
            <multiselect
              v-model="config.creator_role_id"
              :allow-empty="false"
              :showLabels="false"
              :showPointer="false"
              label="name"
              track-by="id"
              :options="roles"
            >
              <template slot="singleLabel" slot-scope="{ option }"
                ><div>
                  <span :style="getDiscordColor(option.color)">{{
                    option.name
                  }}</span>
                </div></template
              >
              <template slot="option" slot-scope="{ option }"
                ><div>
                  <span :style="getDiscordColor(option.color)">{{
                    option.name
                  }}</span>
                </div></template
              >
            </multiselect>
          </div>

          <div class="mt-6">
            <FormLabel for="creator_emoji_id">Creator Emoji ID</FormLabel>
            <multiselect
              v-model="config.creator_emoji_id"
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
            <FormLabel for="finder_role_id">Finder Role ID</FormLabel>
            <multiselect
              v-model="config.finder_role_id"
              :allow-empty="false"
              :showLabels="false"
              :showPointer="false"
              label="name"
              track-by="id"
              :options="roles"
            >
              <template slot="singleLabel" slot-scope="{ option }"
                ><div>
                  <span :style="getDiscordColor(option.color)">{{
                    option.name
                  }}</span>
                </div></template
              >
              <template slot="option" slot-scope="{ option }"
                ><div>
                  <span :style="getDiscordColor(option.color)">{{
                    option.name
                  }}</span>
                </div></template
              >
            </multiselect>
          </div>

          <div class="mt-6">
            <FormLabel for="finder_emoji_id">Finder Emoji ID</FormLabel>
            <multiselect
              v-model="config.finder_emoji_id"
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
            <FormLabel for="lurker_role_id">Lurker Role ID</FormLabel>
            <multiselect
              v-model="config.lurker_role_id"
              :allow-empty="false"
              :showLabels="false"
              :showPointer="false"
              label="name"
              track-by="id"
              :options="roles"
            >
              <template slot="singleLabel" slot-scope="{ option }"
                ><div>
                  <span :style="getDiscordColor(option.color)">{{
                    option.name
                  }}</span>
                </div></template
              >
              <template slot="option" slot-scope="{ option }"
                ><div>
                  <span :style="getDiscordColor(option.color)">{{
                    option.name
                  }}</span>
                </div></template
              >
            </multiselect>
          </div>

          <div class="mt-6">
            <FormLabel for="lurker_emoji_id">Lurker Emoji ID</FormLabel>
            <multiselect
              v-model="config.lurker_emoji_id"
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
import Multiselect from "vue-multiselect";
import FormLabel from "@/components/Form/Label";

export default {
  name: "RolesSettings",
  components: {
    FormLabel,
    Multiselect,
  },
  data() {
    return {
      roles: [],
      emojis: [],
      config: {
        unverified_role_id: null,
        newcomer_role_id: null,
        creator_role_id: null,
        lurker_role_id: null,
        director_role_id: null,
        finder_role_id: null,
        creator_emoji_id: null,
        lurker_emoji_id: null,
        finder_emoji_id: null,
      },
    };
  },
  beforeMount() {
    this.$root.isLoading = true;
    this.getData();
  },
  methods: {
    getDiscordColor(color) {
      let hexColor = color.toString(16);
      return { color: "#" + hexColor };
    },
    getDiscordEmojiUrl(id) {
      return `https://cdn.discordapp.com/emojis/${id}.webp?size=64&quality=lossless`;
    },
    async getData() {
      await API.request("discord/roles")
        .then((response) => {
          this.roles = response.data;
          console.log(this.roles);
        })
        .catch((error) => {
          console.log(error);
        });

      await API.request("discord/emojis")
        .then((response) => {
          this.emojis = response.data;
          console.log(this.emojis);
        })
        .catch((error) => {
          console.log(error);
        });

      await API.request(
        "config/find",
        [
          "unverified_role_id",
          "newcomer_role_id",
          "creator_role_id",
          "lurker_role_id",
          "director_role_id",
          "finder_role_id",
          "creator_emoji_id",
          "lurker_emoji_id",
          "finder_emoji_id",
        ],
        "POST"
      )
        .then((response) => {
          this.config = response.data;

          this.config.newcomer_role_id =
            this.roles.find(
              (role) => role.id == this.config.newcomer_role_id
            ) ?? null;
          this.config.unverified_role_id =
            this.roles.find(
              (role) => role.id == this.config.unverified_role_id
            ) ?? null;
          this.config.creator_role_id =
            this.roles.find((role) => role.id == this.config.creator_role_id) ??
            null;
          this.config.finder_role_id =
            this.roles.find((role) => role.id == this.config.finder_role_id) ??
            null;
          this.config.lurker_role_id =
            this.roles.find((role) => role.id == this.config.lurker_role_id) ??
            null;
          this.config.director_role_id =
            this.roles.find(
              (role) => role.id == this.config.director_role_id
            ) ?? null;
          this.config.creator_emoji_id =
            this.emojis.find(
              (emoji) => emoji.id == this.config.creator_emoji_id
            ) ?? null;
          this.config.finder_emoji_id =
            this.emojis.find(
              (emoji) => emoji.id == this.config.finder_emoji_id
            ) ?? null;
          this.config.lurker_emoji_id =
            this.emojis.find(
              (emoji) => emoji.id == this.config.lurker_emoji_id
            ) ?? null;
        })
        .catch((error) => {
          console.log(error);
        });

      this.$root.isLoading = false;
    },
    submit() {
      let data = Object.assign({}, this.config, true);

      data.newcomer_role_id = data.newcomer_role_id?.id;
      data.unverified_role_id = data.unverified_role_id?.id;
      data.creator_role_id = data.creator_role_id?.id;
      data.finder_role_id = data.finder_role_id?.id;
      data.lurker_role_id = data.lurker_role_id?.id;
      data.director_role_id = data.director_role_id?.id;
      data.creator_emoji_id = data.creator_emoji_id?.id;
      data.finder_emoji_id = data.finder_emoji_id?.id;
      data.lurker_emoji_id = data.lurker_emoji_id?.id;

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