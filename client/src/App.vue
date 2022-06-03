<template>
  <div class="bg-gray-50 min-h-screen">
    <notifications
      classes="text-sm transition"
      position="center top"
      :max="3"
    />
    <loading :active="$root.isLoading"></loading>
    <sidebar />
    <div class="relative md:ml-64">
      <Header :route="$route.name" />
      <div class="px-4 md:px-10 mx-auto w-full">
        <router-view />
      </div>
    </div>
  </div>
</template>
<script>
import Header from "@/components/Header.vue";
import Sidebar from "@/components/Sidebar.vue";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/vue-loading.css";

export default {
  name: "admin-layout",
  components: {
    Header,
    Sidebar,
    Loading,
  },
};
</script>