<template>
  <div class="bg-gray-50 min-h-screen p-4">
    <loading :active="$root.isLoading"></loading>
    <div class="flex flex-wrap flex-col items-center">
      <div class="w-full lg:w-8/12 my-6">
        <div class="flex justify-center my-6"><img src="@/assets/logo.png" class="mx-auto w-40 h-40" alt="WAG Media"
            title="WAG Media" /></div>
        <h2 class="text-xl font-semibold">Valuated Messages</h2>
        <div class="p-5 mt-6 w-full">
          <div class="flex flex-col lg:flex-row w-full justify-between">
            <div class="w-full lg:w-5/12 my-4"><canvas id="graph-transaction-canvas" class="h-80"></canvas></div>
            <div class="w-full lg:w-5/12 my-4"><canvas id="graph-value-canvas" class="h-80"></canvas></div>
          </div>
        </div>
        <div class="px-4 border rounded-lg bg-white border-gray-300 dark:border-gray-700 p-5 mt-6">
          <div class="flex flex-wrap mb-6 justify-between">
            <div class="w-full lg:w-3/12 mb-4">
              <label for="treasuryId" class="block mb-2">Treasury:</label>
              <multiselect v-model="searchFilter.treasuryId" :allow-empty="false" :showLabels="false"
                :showPointer="false" label="name" track-by="id" :options="treasuries">
                <template slot="singleLabel" slot-scope="{ option }">
                  <div>{{ option.name }}</div>
                </template>
                <template slot="option" slot-scope="{ option }">
                  <div>{{ option.name }}</div>
                </template>
              </multiselect>
            </div>
            <div class="w-full lg:w-3/12 mb-4">
              <label for="status" class="block mb-2">Status:</label>
              <multiselect v-model="searchFilter.status" :allow-empty="false" :showLabels="false" :showPointer="false"
                label="label" track-by="value" :options="statusOptions">
                <template slot="singleLabel" slot-scope="{ option }">
                  <div>{{ option.label }}</div>
                </template>
                <template slot="option" slot-scope="{ option }">
                  <div>{{ option.label }}</div>
                </template>
              </multiselect>
            </div>
            <div class="w-full lg:w-3/12">
              <label for="date" class="block mb-2">Date Range:</label>
              <date-picker v-model="datepicker" range format="MM/DD/YYYY"></date-picker>
            </div>
          </div>

          <v-data-table :headers="headers" :items="valuations" :page.sync="page" :options.sync="options"
            :server-items-length="totalValuations" :loading="this.$root.isLoading" show-expand :mobile-breakpoint="0"
            hide-default-footer :single-expand="false" :expanded.sync="expanded" :items-per-page="10"
      :sort-by.sync="options.sortBy"
      :sort-desc.sync="options.sortDesc"
            class="elevation-1" @page-count="pageCount = $event">
            <template v-slot:expanded-item="{ headers, item }">
              <td :colspan="headers.length">
                <ValuatedMessageDetail :item="item" />
              </td>
            </template>
            <template v-slot:item.valuation="{ item }">
              {{ item.value }} {{ item.coinName }}
            </template>

            <template v-slot:item.date="{ item }">
              {{ getDate(item.timestamp) }}
            </template>

            <template v-slot:item.status="{ item }">
              <div>
                <ValuatedMessageStatusIcon :status="item.status" />
              </div>
            </template>
          </v-data-table>

          <div class="flex flex-wrap w-full items-center mt-6">
            <div class="w-1/4 pr-4 text-sm whitespace-nowrap">{{ totalValuations == 1 ? totalValuations + ' Valuation' : totalValuations + ' Valuations' }}</div>
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
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/vue-loading.css";
import moment from "moment";
import Chart from "chart.js/auto";
import ValuatedMessageStatusIcon from "@/components/ValuatedMessageStatusIcon";
import ValuatedMessageDetail from "@/components/ValuatedMessageDetail";
import { interpolatePlasma } from "d3-scale-chromatic";
import DatePicker from "vue2-datepicker";
import "vue2-datepicker/index.css";
import API from "@/services/api";
import Multiselect from "vue-multiselect";

export default {
  name: "App",
  components: {
    DatePicker,
    ValuatedMessageDetail,
    ValuatedMessageStatusIcon,
    Multiselect,
    Loading,
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

    API.request("/treasuries/")
      .then((response) => {
        this.treasuries = response.data;
        this.treasuries.unshift({ id: null, name: "All" });
        this.treasuriesLoaded = true;
      })
      .catch((error) => {
        this.treasuriesLoaded = false;
        console.log(error);
      });

    this.getData().then(response => this.renderGraphs(response.data.stats));
  },
  data() {
    return {
      transactionGraph: null,
      valueGraph: null,
      datepicker: null,
      options: {
        sortBy: ['date'],
        sortDesc: [true]
      },
      page: 1,
      pageCount: 0,
      expanded: [],
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
          label: "Transaction submitted",
        },
        {
          value: 3,
          label: "Other",
        },
      ],
      headers: [
        {
          text: "Source",
          value: "source",
          sortField: "valuation.source",
          sortable: true,
          align: "start",
        },
        {
          text: "Valuation",
          value: "valuation",
          sortField: "valuation.value",
          sortable: true,
          align: "start",
        },
        {
          text: "Treasury",
          value: "name",
          sortField: "treasury.name",
          sortable: true,
          align: "start",
        },
        {
          text: "Date",
          value: "date",
          sortField: "valuation.timestamp",
          sortable: true,
          align: "start",
        },
        {
          text: "Status",
          value: "status",
          sortField: "valuation.status",
          sortable: true,
          align: "start",
        },
      ],
      treasuriesLoaded: false,
      dataTableLoaded: false,
      treasuries: [],
      valuations: [],
      totalValuations: 0
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
    },

    searchFilter: {
      handler() {
        this.page = 1
        this.getData().then((response) => this.renderGraphs(response.data.stats));
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
  methods: {
    getDate(timestamp) {
      return moment.unix(timestamp).format("MM/DD/YYYY HH:mm");
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
                      return (tooltipItem.label +  ": " + numberFormatter.format(tooltipItem.dataset.data[tooltipItem.dataIndex]));
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
                      return (tooltipItem.label + ": " + numberFormatter.format(tooltipItem.dataset.data[tooltipItem.dataIndex]));
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
    makeQueryParams() {
      let options = {
        paginated: true,
      };

      let searchFilter = { ...this.searchFilter };
      searchFilter.treasuryId = this.searchFilter.treasuryId?.id;
      searchFilter.status = this.searchFilter.status?.value;

      options.searchFilter = searchFilter;
      if (this.options.sortBy) {
        if (this.options.sortBy.length === 0) {
          options.sortField = "valuation.timestamp";
        } else {
          options.sortField = this.headers.filter((e) => e.value === this.options.sortBy[0])[0].sortField || this.options.sortBy[0];
        }
      } else {
        options.sortField = "valuation.timestamp";
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
      return API.request("/valuations/", params)
        .then((response) => {
          this.dataTableLoaded = true;
          this.valuations = response.data.data;
          this.totalValuations = response.data.total;
          this.pageCount = response.data.last_page;

          return response;
        })
        .catch((e) => {
          this.dataTableLoaded = false;
          console.log(e);
        });
    },
  },
};
</script>