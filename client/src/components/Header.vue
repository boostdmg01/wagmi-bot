<template>
  <nav
    class="
      w-full
      bg-transparent
      md:flex-row md:flex-nowrap md:justify-start
      flex
      items-center
      p-4
    "
  >
    <div
      class="
        w-full
        mx-autp
        items-center
        flex
        justify-between
        md:flex-nowrap
        flex-wrap
        md:px-10
        px-4
      "
    >
      <a
        class="text-sm uppercase hidden lg:inline-block font-semibold"
        href="javascript:void(0)"
      >
        {{ route }}
      </a>
      <ul class="flex-col md:flex-row list-none items-center hidden md:flex">
        <user />
      </ul>
    </div>
  </nav>
</template>

<script>
import User from "@/components/header/User.vue";

export default {
  props: ["route"],
  components: {
    User,
  },
};
</script>