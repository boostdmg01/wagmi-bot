<template>
  <div class="treasury-crud">
    <div class="flex flex-wrap flex-col items-center">
      <div class="w-full lg:w-8/12 my-6">
        <h2 class="text-xl font-semibold">Treasuries</h2>
        <div class="flex justify-end mt-6">
          <router-link
            to="/admin/treasuries/insert"
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
            >Add Treasury</router-link
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
            <template slot="table-actions" slot-scope="{ rowData }">
              <div>
                <router-link
                  :to="`/admin/treasuries/update/${rowData.id}`"
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
                <!-- <button
                  @click="deleteTreasury(rowData)"
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
                </button> -->
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

    <confirm-dialogue ref="confirmDialogue"></confirm-dialogue>
  </div>
</template>
<script>
import API from "@/services/api";
import Vuetable from "vuetable-2/src/components/Vuetable";
import VuetablePagination from "vuetable-2/src/components/VuetablePagination";
import VuetablePaginationInfo from "vuetable-2/src/components/VuetablePaginationInfo";
import ConfirmDialogue from "@/components/Confirmation";
import TableFilter from "@/components/TableFilter";

export default {
  name: "TreasuryOverview",
  components: {
    Vuetable,
    VuetablePagination,
    VuetablePaginationInfo,
    ConfirmDialogue,
    TableFilter,
  },
  data() {
    return {
      searchFilter: "",
      apiUrl: process.env.VUE_APP_API_URL + "treasury/all",
      fields: [
        {
          name: "name",
          title: "Name",
          sortField: "name",
        },
        {
          name: "__slot:table-actions",
          title: "Actions",
          width: "16%",
        },
      ],
      sortOrder: [{ field: "name", direction: "asc" }],
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
    async deleteTreasury(rowData) {
      const ok = await this.$refs.confirmDialogue.show({
        title: "Delete Treasury",
        message: `Are you sure you want to delete ${rowData.name} as a treasury? It cannot be undone.`,
        okButton: "Delete Forever",
      });
      
      if (ok) {
        API.request(`treasury/delete/${rowData.id}`, null, "DELETE")
          .then((res) => {
            this.$refs.vuetable.refresh();
            this.$notify({ type: "success", text: res.data.message });
          })
          .catch((error) => {
            this.$notify({ type: "error", text: error.data?.message || error });
          });
      }
    },
    onLoadFailed(data) {
      if (data.response.status === 400) {
        this.$router.push({ path: "/admin/login" });
      }
    },
    onLoading() {
      this.$root.isLoading = true;
    },
    onLoaded() {
      this.$root.isLoading = false;
    },
    makeQueryParams(sortOrder, currentPage, perPage) {
      return {
        searchFilter: this.searchFilter,
        paginated: true,
        sortField: sortOrder[0].sortField,
        sortOrder: sortOrder[0].direction,
        pageNo: currentPage,
        pageSize: perPage,
      };
    },
  },
};
</script>