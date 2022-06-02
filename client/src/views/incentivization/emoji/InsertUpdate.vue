<template>
  <div class="emoji-crud">
    <div class="flex flex-wrap flex-col items-center">
      <div class="w-full lg:w-8/12 my-6">
        <h2 class="text-xl font-semibold">{{ action | capitalize }} Emoji</h2>
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
            <FormLabel for="emojiId">Emoji</FormLabel>
            <multiselect
              v-model="emoji.emojiId"
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
              <p class="text-red-700 pl-2  my-2" v-for="error in getErrors('emojiId')" :key="error">
                {{ error.message }}
              </p>
          </div>

          <div class="mt-6">
            <FormLabel for="amount">Treasury Value</FormLabel>
            <FormInput v-model="emoji.amount" id="amount" :errors="getErrors('amount')" />
          </div>

          <div class="mt-6">
            <FormLabel for="treasuryId">Treasury</FormLabel>
            <multiselect
              v-model="emoji.treasuryId"
              :allow-empty="false"
              :showLabels="false"
              :showPointer="false"
              label="name"
              track-by="id"
              :options="treasuries"
            >
              <template slot="singleLabel" slot-scope="{ option }"
                ><div>{{ option.name }}</div></template
              >
              <template slot="option" slot-scope="{ option }"
                ><div>{{ option.name }}</div></template
              >
            </multiselect>
              <p class="text-red-700 pl-2  my-2" v-for="error in getErrors('treasuryId')" :key="error">
                {{ error.message }}
              </p>
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
</template>
<script>
import API from "@/services/api";
import FormLabel from "@/components/Form/Label";
import FormInput from "@/components/Form/Input";
import Multiselect from "vue-multiselect";

export default {
  name: "EmojiInsertUpdate",
  components: {
    FormLabel,
    FormInput,
    Multiselect,
  },
  props: ["action"],
  data() {
    return {
      treasuries: [],
      emojis: [],
      id: null,
      errors: [],
      emoji: {
        id: null,
        treasuryId: null,
        emojiId: null,
        amount: 1,
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
      await API.request("treasury/all")
        .then((response) => {
          this.treasuries = response.data;
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
        await API.request("emoji/" + this.$route.params.id)
          .then((response) => {
            this.emoji = response.data;

            this.emoji.treasuryId =
              this.treasuries.find(
                (treasury) => treasury.id == this.emoji.treasuryId
              ) ?? null;
            this.emoji.emojiId =
              this.emojis.find((emoji) => emoji.id == this.emoji.emojiId) ??
              null;
          })
          .catch((error) => {
            console.log(error);
          });
      }

      this.$root.isLoading = false;
    },
    submit() {
      let data = Object.assign({}, this.emoji, true);

      data.treasuryId = data.treasuryId?.id;
      data.emojiId = data.emojiId?.id;

      API.request(
        this.action == "insert"
          ? `emoji/insert/`
          : `emoji/update/${this.emoji.id}`,
        data,
        this.action == "insert" ? "post" : "put"
      )
        .then((res) => {
          this.$notify({ type: "success", text: res.data.message });
          this.$router.push({ path: "/admin/emojis" });
        })
        .catch((error) => {
          this.$notify({ type: "error", text: error.data?.message || error });
          if (error.data?.errors) {
            this.errors = error.data.errors
          }
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