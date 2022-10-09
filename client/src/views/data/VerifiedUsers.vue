<template>
  <div class="verified-users">
    <div class="flex flex-wrap flex-col items-center">
      <div class="w-full lg:w-8/12 my-6">
        <h2 class="text-xl font-semibold">Verified Users</h2>

        <div class="flex justify-end mt-6">
          <button @click="downloadExport" class="
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
            ">Export</button>
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
        <v-data-table :headers="headers" :items="users" :page.sync="page" :options.sync="options"
            :server-items-length="totalItems" :loading="this.$root.isLoading" :mobile-breakpoint="0"
            hide-default-footer :items-per-page="10"
            :sort-by.sync="options.sortBy" :sort-desc.sync="options.sortDesc" class="elevation-1"
            @page-count="pageCount = $event">
            <template v-slot:item.username="{ item }">
              {{ members[item.id] }}
            </template>
            <template v-slot:item.twitterHandle="{ item }">
              <div v-if="item.twitterHandle && item.twitterHandle != ''">
                <a :href="'https://twitter.com/' + item.twitterHandle" target="_blank">{{ item.twitterHandle }}</a>
              </div>
            </template>
          </v-data-table>

          <div class="flex flex-wrap w-full items-center mt-6">
            <div class="w-1/4 pr-4 text-sm whitespace-nowrap">{{ totalItems == 1 ? totalItems + ' User' :
                totalItems + ' Users'
            }}</div>
            <div class="w-3/4 flex justify-end">
              <v-pagination v-model="page" :length="pageCount" :totalVisible="10"></v-pagination>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import API from "@/services/api";
import TableFilter from "@/components/TableFilter";

export default {
  name: "VerifiedUsers",
  components: {
    TableFilter,
  },
  mounted() {
    API.request("discord/members")
        .then((response) => {
          this.members = response.data;
          this.memberLoaded = true
        })
        .catch((error) => {
          this.memberLoaded = true
          console.log(error);
        });

    this.$watch(
      (vm) => [vm.tableLoaded, vm.memberLoaded],
      () => {
        if (this.tableLoaded && this.memberLoaded) {
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
        sortBy: ['id'],
        sortDesc: [false]
      },
      page: 1,
      pageCount: 0,
      tableLoaded: false,
      members: {},
      users: [],
      headers: [
        {
          value: "id",
          text: "Discord ID",
          sortField: "id",
          sortable: true,
          align: "start",
        },
        {
          value: "username",
          text: "Username",
          sortable: false,
        },
        {
          value: "evmAddress",
          text: "EVM Address",
          sortField: "evmAddress",
          sortable: true,
          align: "start",
        },
        {
          value: "substrateAddress",
          text: "Substrate Address",
          sortField: "substrateAddress",
          sortable: true,
          align: "start",
        },
        {
          value: "twitterHandle",
          text: "Twitter Handle",
          sortField: "twitterHandle",
          sortable: true,
          align: "start",
        },
      ],
      oldQuery: {},
      totalItems: 0
    };
  },
  methods: {
    makeQueryParams() {
      let options = {
        paginated: true,
      };

      options.searchFilter = this.searchFilter;
      if (this.options.sortBy) {
        if (this.options.sortBy.length === 0) {
          options.sortField = "id";
        } else {
          options.sortField = this.headers.filter((e) => e.value === this.options.sortBy[0])[0].sortField || this.options.sortBy[0];
        }
      } else {
        options.sortField = "id";
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
      return API.request("/user/all", params)
        .then((response) => {
          this.tableLoaded = true;
          this.users = response.data.data;
          this.totalItems = response.data.total;
          this.pageCount = response.data.last_page;

          return response;
        })
        .catch((e) => {
          this.tableLoaded = false;
          console.log(e);
        });
    },
    downloadExport() {
      let params = this.makeQueryParams();
      params.paginated = false;

      API.request("/user/export", params)
        .then((response) => {
          let a = document.createElement("a");
          a.style = "display: none";
          document.body.appendChild(a);
          let url = window.URL.createObjectURL(new Blob([response.data], { type: "text/csv" }));
          a.href = url;
          a.download = 'user_export.csv';
          a.click();
          window.URL.revokeObjectURL(url);
        })
    }
  }
};
</script>