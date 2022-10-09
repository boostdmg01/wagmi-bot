<template>
  <div class="emoji-crud">
    <div class="flex flex-wrap flex-col items-center">
      <div class="w-full lg:w-8/12 my-6">
        <h2 class="text-xl font-semibold">Emojis</h2>
        <div class="flex justify-end mt-6">
          <router-link
            to="/admin/emojis/insert"
            class="
              inline-block
              whitespace-nowrap
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
            >Add Emoji</router-link
          >
        </div>
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

        <v-data-table :headers="headers" :items="emojis" :page.sync="page" :options.sync="options"
            :server-items-length="totalItems" :loading="this.$root.isLoading" :mobile-breakpoint="0"
            hide-default-footer :items-per-page="10"
            :sort-by.sync="options.sortBy" :sort-desc.sync="options.sortDesc" class="elevation-1"
            @page-count="pageCount = $event">
            <template v-slot:item.emojiId="{ item }">
                <img
                  :src="getDiscordEmojiUrl(item.emojiId)"
                  class="emoji"
                  alt=""
                  title=""
                />
            </template>
            <template v-slot:item.actions="{ item }">
              <router-link
                  :to="`/admin/emojis/update/${item.id}`"
                  class="
                    inline-block
                    whitespace-nowrap
                    text-white
                    bg-blue-700
                    hover:bg-blue-800
                    focus:ring-4 focus:ring-blue-300
                    font-medium
                    rounded-lg
                    text-sm
                    px-4
                    py-2
                    mr-2
                    dark:bg-blue-600 dark:hover:bg-blue-700
                    focus:outline-none
                    dark:focus:ring-blue-800
                  "
                  ><i class="fas fa-pencil"></i> Edit</router-link
                >
                <button
                  @click="deleteEmoji(item)"
                  class="
                    inline-block
                    whitespace-nowrap
                    text-white
                    bg-red-700
                    hover:bg-red-800
                    focus:ring-4 focus:ring-blue-300
                    font-medium
                    rounded-lg
                    text-sm
                    px-4
                    py-2
                    dark:bg-red-600 dark:hover:bg-red-700
                    focus:outline-none
                    dark:focus:ring-red-800
                  "
                >
                  <i class="fas fa-trash"></i> Delete
                </button>
            </template>
          </v-data-table>

          <div class="flex flex-wrap w-full items-center mt-6">
            <div class="w-1/4 pr-4 text-sm whitespace-nowrap">{{ totalItems == 1 ? totalItems + ' Emoji' :
                totalItems + ' Emojis'
            }}</div>
            <div class="w-3/4 flex justify-end">
              <v-pagination v-model="page" :length="pageCount" :totalVisible="10"></v-pagination>
            </div>
          </div>
        </div>
      </div>
    </div>

    <confirm-dialogue ref="confirmDialogue"></confirm-dialogue>
  </div>
</template>
<script>
import API from "@/services/api";
import ConfirmDialogue from "@/components/Confirmation";

export default {
  name: "TreasuryOverview",
  components: {
    ConfirmDialogue
  },
  mounted() {
    this.$watch(
      (vm) => [vm.tableLoaded],
      () => {
        if (this.tableLoaded) {
          this.$root.isLoading = false;
        } else {
          this.$root.isLoading = true;
        }
      },
      {
        immediate: true,
        deep: true,
      }
    );

    this.getData()
  },
  watch: {
    searchFilter: {
      handler() {
        this.page = 1
        this.getData()
      },
      deep: true,
    },

    options: {
      handler() {
        this.getData();
      },
      deep: true,
    },
  },
  data() {
    return {
      searchFilter: "",
      options: {
        sortBy: ['name'],
        sortDesc: [false]
      },
      page: 1,
      pageCount: 0,
      tableLoaded: false,
      emojis: [],
      headers: [
        {
          value: "emojiId",
          text: "Emoji",
          sortable: false,
          align: "start",
        },
        {
          value: "amount",
          text: "Amount",
          sortField: "amount",
          sortable: true,
          align: "start",
        },
        {
          value: "name",
          text: "Name",
          sortField: "name",
          sortable: true,
          align: "start",
        },
        {
          value: "actions",
          text: "Actions",
          width: "16%",
          sortable: false,
          align: "start",
        },
      ],
      oldQuery: {},
      totalItems: 0
    };
  },
  methods: {
    getDiscordEmojiUrl(id) {
      return `https://cdn.discordapp.com/emojis/${id}.webp?size=64&quality=lossless`;
    },
    async deleteEmoji(rowData) {
      const ok = await this.$refs.confirmDialogue.show({
        title: "Delete Emoji",
        message: `Are you sure you want to delete ${rowData.name} as a treasury? It cannot be undone.`,
        okButton: "Delete Forever",
      });
      
      if (ok) {
        API.request(`emoji/delete/${rowData.id}`, null, "DELETE")
          .then((res) => {
            this.emojis = this.emojis.filter(e => e.id != rowData.id)
            this.$notify({ type: "success", text: res.data.message });
          })
          .catch((error) => {
            this.$notify({ type: "error", text: error.data?.message || error });
          });
      }
    },
    makeQueryParams() {
      let options = {
        paginated: true,
      };

      options.searchFilter = this.searchFilter;
      if (this.options.sortBy) {
        if (this.options.sortBy.length === 0) {
          options.sortField = "name";
        } else {
          options.sortField = this.headers.filter((e) => e.value === this.options.sortBy[0])[0].sortField || this.options.sortBy[0];
        }
      } else {
        options.sortField = "name";
      }

      if (!this.options.sortDesc || this.options.sortDesc.length === 0) {
        options.sortOrder = "DESC";
      } else {
        options.sortOrder = this.options.sortDesc[0] ? "DESC" : "ASC";
      }

      options.pageSize = 10;
      options.pageNo = this.page;

      return options;
    },
    getData() {
      let params = this.makeQueryParams();
      if (JSON.stringify(params) == JSON.stringify(this.oldQuery)) return
      this.oldQuery = params
      return API.request("/emoji/all", params)
        .then((response) => {
          this.tableLoaded = true;
          this.emojis = response.data.data;
          this.totalItems = response.data.total;
          this.pageCount = response.data.last_page;

          return response;
        })
        .catch((e) => {
          this.tableLoaded = false;
          console.log(e);
        });
    }
  },
};
</script>