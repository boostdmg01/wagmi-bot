<template>
  <div class="verified-users">
    <div class="flex flex-wrap flex-col items-center">
      <div class="w-full lg:w-8/12 my-6">
        <h2 class="text-xl font-semibold">Verified Users</h2>

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
          <vuetable
            ref="vuetable"
            :api-url="apiUrl"
            :fields="fields"
            data-path="data"
            pagination-path=""
            :css="css.table"
            :sort-order="sortOrder"
            :per-page="20"
            :query-params="makeQueryParams"
            @vuetable:load-error="onLoadFailed"
            @vuetable:pagination-data="onPaginationData"
            @vuetable:loading="onLoading"
            @vuetable:loaded="onLoaded"
          >
            <template slot="username" slot-scope="{ rowData }">
              <div>
                {{ members[rowData.id] }}
              </div>
            </template>

            <template slot="twitterHandle" slot-scope="{ rowData }">
              <div v-if="rowData.twitterHandle && rowData.twitterHandle != ''">
                <a :href="'https://twitter.com/' + rowData.twitterHandle" target="_blank">{{ rowData.twitterHandle }}</a>
              </div>
            </template>
          </vuetable>
          <div class="w-full flex items-center mt-6 px-6">
            <vuetable-pagination-info
              :css="css.paginationInfo"
              ref="paginationInfo"
            ></vuetable-pagination-info>
            <vuetable-pagination
              ref="pagination"
              :css="css.pagination"
              @vuetable-pagination:change-page="onChangePage"
            ></vuetable-pagination>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import API from "@/services/api";
import config from "@/config";
import Vuetable from "vuetable-2/src/components/Vuetable";
import VuetablePagination from "vuetable-2/src/components/VuetablePagination";
import VuetablePaginationInfo from "vuetable-2/src/components/VuetablePaginationInfo";
import TableFilter from "@/components/TableFilter";

export default {
  name: "VerifiedUsers",
  components: {
    Vuetable,
    VuetablePagination,
    VuetablePaginationInfo,
    TableFilter,
  },
  data() {
    return {
      apiUrl: config.API_URL + "user/all",
      searchFilter: "",
      members: {},
      fields: [
        {
          name: "id",
          title: "Discord ID",
          sortField: "id",
        },
        {
          name: "__slot:username",
          title: "Username",
        },
        {
          name: "evmAddress",
          title: "EVM Address",
          sortField: "evmAddress",
        },
        {
          name: "substrateAddress",
          title: "Substrate Address",
          sortField: "substrateAddress",
        },
        {
          name: "__slot:twitterHandle",
          title: "Twitter Handle",
          sortField: "twitterHandle",
        },
      ],
      sortOrder: [{ field: "id", direction: "asc" }],
      css: {
        table: {
          tableWrapper: "w-full",
          tableHeaderClass: "mb-0",
          tableBodyClass: "mb-0",
          tableClass: "w-full",
          loadingClass: "loading",
          ascendingIcon: "fa fa-chevron-up",
          descendingIcon: "fa fa-chevron-down",
          ascendingClass: "sorted-asc",
          descendingClass: "sorted-desc",
          sortableIcon: "fa fa-sort",
          detailRowClass: "vuetable-detail-row",
          handleIcon: "fa fa-bars text-secondary",
          renderIcon(classes) {
            return `<i class="${classes.join(" ")}"></span>`;
          },
        },
        pagination: {
          wrapperClass: "pagination ml-auto",
          activeClass: "active",
          disabledClass: "disabled",
          pageClass: "page-item",
          linkClass: "page-link",
          paginationClass: "pagination",
          paginationInfoClass: "float-left",
          dropdownClass: "form-control",
          icons: {
            first: "fa fa-backward-fast",
            prev: "fa fa-chevron-left",
            next: "fa fa-chevron-right",
            last: "fa fa-forward-fast",
          },
        },
        paginationInfo: {
          infoClass: "text-sm",
        },
      },
    };
  },
  methods: {
    onPaginationData(paginationData) {
      this.$refs.pagination.setPaginationData(paginationData);
      this.$refs.paginationInfo.setPaginationData(paginationData);
    },
    onChangePage(page) {
      this.$refs.vuetable.changePage(page);
    },
    onLoadFailed(data) {
      if (data.response.status !== 200) {
        this.$router.push({ path: "/admin/login" });
      }
    },
    onLoading() {
      this.$root.isLoading = true;
    },
    async onLoaded() {
      await API.request("discord/members")
        .then((response) => {
          this.members = response.data;
        })
        .catch((error) => {
          console.log(error);
        });
      this.$root.isLoading = false;
    },
    makeQueryParams(sortOrder, currentPage, perPage) {
      return {
        search: this.searchFilter,
        paginated: true,
        sortField: sortOrder[0].field,
        sortOrder: sortOrder[0].direction,
        pageNo: currentPage,
        pageSize: perPage,
      };
    },
  },
};
</script>