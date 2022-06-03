<template>
  <div class="treasury-crud">
    <div class="flex flex-wrap flex-col items-center">
      <div class="w-full lg:w-8/12 my-6">
        <div class="flex justify-center my-6"><img src="@/assets/logo.png" class="mx-auto w-40 h-40" alt="WAG Media" title="WAG Media" /></div>
        <h2 class="text-xl font-semibold">Valuated Messages</h2>
        <div class="p-5 mt-6 w-full h-80">
          <div class="flex w-full justify-between">
            <div class="w-5/12"><canvas id="graph-transaction-canvas"></canvas></div>
            <div class="w-5/12"><canvas id="graph-value-canvas"></canvas></div>
          </div>
        </div>
        <div class="px-4 border rounded-lg bg-white border-gray-300 dark:border-gray-700 p-5 mt-6">
          <div class="flex flex-wrap mb-6 justify-between">
            <div class="w-3/12">
              <label for="treasuryId" class="block mb-2">Treasury:</label>
              <multiselect v-model="searchFilter.treasuryId" :allow-empty="false" :showLabels="false" :showPointer="false" label="name" track-by="id" :options="treasuries" @input="$refs.vuetable.reload()">
                <template slot="singleLabel" slot-scope="{ option }"><div>{{option.name}}</div></template>
                <template slot="option" slot-scope="{ option }"><div>{{option.name}}</div></template>
              </multiselect>
            </div>
            <div class="w-3/12">
              <label for="status" class="block mb-2">Status:</label>
              <multiselect v-model="searchFilter.status" :allow-empty="false" :showLabels="false" :showPointer="false" label="label" track-by="value" :options="statusOptions" @input="$refs.vuetable.reload()">
                <template slot="singleLabel" slot-scope="{ option }"><div>{{option.label}}</div></template>
                <template slot="option" slot-scope="{ option }"><div>{{option.label}}</div></template>
              </multiselect>
            </div>
            <div class="w-3/12">
              <label for="date" class="block mb-2">Date Range:</label>
              <date-picker v-model="datepicker" range format="MM/DD/YYYY"></date-picker>
            </div>
          </div>
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
      @vuetable:pagination-data="onPaginationData"
      @vuetable:loading="onLoading"
      @vuetable:loaded="onLoaded"
      @vuetable:load-success="onLoadSuccess"
      @vuetable:row-clicked="onRowClicked"
      detail-row-component="detail-row-public"
    >
    <template slot="date" slot-scope="{ rowData }">
        {{ getDate(rowData.timestamp) }}
    </template>
    <template slot="valuation" slot-scope="{ rowData }">
        {{ rowData.value }} {{ rowData.coinName }}
    </template>
    <template slot="status" slot-scope="{ rowData }">
      <div><ValuatedMessageStatusIcon :status="rowData.status" /></div>
    </template>
    </vuetable>
    <div class="w-full flex items-center mt-6 px-6">
      <vuetable-pagination-info :css="css.paginationInfo" ref="paginationInfo"
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
</template>
<script>
import moment from "moment";
import Vue from "vue";
import Chart from "chart.js/auto";
import Vuetable from "vuetable-2/src/components/Vuetable";
import VuetablePagination from "vuetable-2/src/components/VuetablePagination";
import VuetablePaginationInfo from "vuetable-2/src/components/VuetablePaginationInfo";
import ValuatedMessageStatusIcon from "@/components/ValuatedMessageStatusIcon";
import ValuatedMessageDetailPublic from "@/components/ValuatedMessageDetailPublic";
import { interpolatePlasma } from "d3-scale-chromatic";
import DatePicker from "vue2-datepicker";
import "vue2-datepicker/index.css";
import API from "@/services/api";
import Multiselect from "vue-multiselect";

Vue.component("detail-row-public", ValuatedMessageDetailPublic);

export default {
  name: "ValuatedMessagesPublic",
  components: {
    DatePicker,
    Vuetable,
    VuetablePagination,
    VuetablePaginationInfo,
    ValuatedMessageDetailPublic,
    ValuatedMessageStatusIcon,
    Multiselect,
  },
  mounted() {
    this.$watch(
      (vm) => [vm.treasuriesLoaded, vm.dataTableLoaded],
      () => {
        if (this.treasuriesLoaded && this.dataTableLoaded) {
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

    API.request("treasury/public")
      .then((response) => {
        this.treasuries = response.data;
        this.treasuries.unshift({ id: null, name: "All" });
        this.treasuriesLoaded = true;
      })
      .catch((error) => {
        this.treasuriesLoaded = false;
        console.log(error);
      });
  },
  data() {
    return {
      transactionGraph: null,
      valueGraph: null,
      datepicker: null,
      searchFilter: {
        dateStart: null,
        dateEnd: null,
        treasuryId: null,
      },
      statusOptions: [
        {
          value: null,
          label: "All",
        },
        {
          value: 1,
          label: "Pending",
        },
        {
          value: 2,
          label: "Paid",
        },
        {
          value: 3,
          label: "Other",
        },
      ],
      treasuriesLoaded: false,
      dataTableLoaded: false,
      treasuries: [],
      oldQueryParams: null,
      currentQueryParams: null,
      rerenderGraphs: true,
      apiUrl: process.env.VUE_APP_API_URL + "valuation/public",
      fields: [
        {
          name: "source",
          title: "Source",
          sortField: "valuation.source",
        },
        {
          name: "__slot:valuation",
          title: "Valuation",
        },
        {
          name: "name",
          title: "Treasury",
          sortField: "treasury.name",
        },
        {
          name: "__slot:date",
          title: "Date",
          sortField: "valuation.timestamp",
        },
        {
          name: "__slot:status",
          title: "Status",
          sortField: "valuation.status",
        },
      ],
      sortOrder: [{ field: "valuation.timestamp", direction: "desc" }],
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
  watch: {
    datepicker: function () {
      this.searchFilter.dateStart = Math.floor(
        this.datepicker[0]?.getTime() / 1000
      );
      this.searchFilter.dateEnd = Math.floor(
        this.datepicker[1]?.getTime() / 1000
      );
      this.$refs.vuetable.reload();
    },
  },
  methods: {
    getDate(timestamp) {
      return moment.unix(timestamp).format("MM/DD/YYYY HH:mm");
    },
    onPaginationData(paginationData) {
      this.$refs.pagination.setPaginationData(paginationData);
      this.$refs.paginationInfo.setPaginationData(paginationData);
    },
    onChangePage(page) {
      this.$refs.vuetable.changePage(page);
    },
    onLoading() {
      this.dataTableLoaded = false;
    },
    onLoaded() {
      this.dataTableLoaded = true;
    },
    onLoadSuccess(data) {
      this.renderGraphs(data.data.stats);
    },
    onRowClicked(data) {
      this.$refs.vuetable.toggleDetailRow(data.id);
    },
    renderGraphs(data) {
      if (data.length == 0) {
        if (this.transactionGraph) this.transactionGraph.destroy();
        if (this.valueGraph) this.valueGraph.destroy();
      } else if (data.length > 0) {
        let labels = [];
        let transactionValues = [];
        let valueValues = [];
        let colors = [];

        let stepInterpolation = 1 / data.length;
        let step = 0;

        for (let stat of data) {
          labels.push(`${stat.name}`);
          transactionValues.push(stat.count);
          valueValues.push(stat.total);
          colors.push(interpolatePlasma(stepInterpolation * step));
          step++;
        }

        if (this.transactionGraph) this.transactionGraph.destroy();
        if (this.valueGraph) this.valueGraph.destroy();

        this.transactionGraph = new Chart(
          document.getElementById("graph-transaction-canvas"),
          {
            type: "pie",
            data: {
              labels: labels,
              datasets: [
                {
                  data: transactionValues,
                  backgroundColor: colors,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                tooltip: {
                  callbacks: {
                    label: function (tooltipItem) {
                      const numberFormatter = Intl.NumberFormat("en-US");
                      return (
                        tooltipItem.label +
                        ": " +
                        numberFormatter.format(
                          tooltipItem.dataset.data[tooltipItem.dataIndex]
                        )
                      );
                    },
                  },
                },
                legend: {
                  position: "top",
                },
                title: {
                  display: true,
                  text: "Transactions",
                },
              },
            },
          }
        );
        this.valueGraph = new Chart(
          document.getElementById("graph-value-canvas"),
          {
            type: "pie",
            data: {
              labels: labels,
              datasets: [
                {
                  data: valueValues,
                  backgroundColor: colors,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                tooltip: {
                  callbacks: {
                    label: function (tooltipItem) {
                      const numberFormatter = Intl.NumberFormat("en-US");
                      return (
                        tooltipItem.label +
                        ": " +
                        numberFormatter.format(
                          tooltipItem.dataset.data[tooltipItem.dataIndex]
                        )
                      );
                    },
                  },
                },
                legend: {
                  position: "top",
                },
                title: {
                  display: true,
                  text: "Total Payouts",
                },
              },
            },
          }
        );
      }
    },
    makeQueryParams(sortOrder, currentPage, perPage) {
      let searchFilter = { ...this.searchFilter };
      searchFilter.treasuryId = this.searchFilter.treasuryId?.id;
      searchFilter.status = this.searchFilter.status?.value;

      return {
        searchFilter: searchFilter,
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