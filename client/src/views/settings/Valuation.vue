<template>
  <div class="verification-settings">
    <div class="flex flex-wrap flex-col items-center">
      <div class="w-full lg:w-8/12 my-6">
        <h2 class="text-xl font-semibold">Valuation Settings</h2>
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
            <FormLabel for="existential_deposit_statemine"
              >Statemine existential deposit</FormLabel
            >
            <FormInput
              v-model="config.existential_deposit_statemine"
              id="existential_deposit_statemine"
            />
          </div>
          <div class="mt-6">
            <FormLabel for="existential_deposit_statemint"
              >Statemint existential deposit</FormLabel
            >
            <FormInput
              v-model="config.existential_deposit_statemint"
              id="existential_deposit_statemint"
            />
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

export default {
  name: "ValuationSettings",
  components: {
    FormLabel,
    FormInput,
  },
  data() {
    return {
      config: {
        existential_deposit_statemine: null,
        existential_deposit_statemint: null,
      },
    };
  },
  beforeMount() {
    this.$root.isLoading = true;
    this.getData();
  },
  methods: {
    async getData() {
      await API.request(
        "config/find",
        ["existential_deposit_statemine", "existential_deposit_statemint"],
        "POST"
      )
        .then((response) => {
          this.config = response.data;
        })
        .catch((error) => {
          console.log(error);
        });

      this.$root.isLoading = false;
    },
    submit() {
      let data = Object.assign({}, this.config, true);

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