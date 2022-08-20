<template>
  <nav
    class="
      sidebar
      md:left-0
      md:block
      md:fixed
      md:top-0
      md:bottom-0
      md:overflow-y-auto
      md:flex-row
      md:flex-nowrap
      md:overflow-hidden
      shadow-xl
      bg-white
      flex flex-wrap
      items-center
      justify-between
      relative
      md:w-64
      z-10
      py-4
      px-6
    "
  >
    <div
      class="
        md:flex-col md:items-stretch md:flex-nowrap
        px-0
        flex flex-wrap
        items-center
        justify-between
        w-full
        mx-auto
      "
    >
      <button
        class="
          cursor-pointer
          text-black
          opacity-50
          md:hidden
          px-3
          py-1
          text-xl
          leading-none
          bg-transparent
          rounded
          border border-solid border-transparent
        "
        type="button"
        v-on:click="toggleCollapseShow('bg-white m-2 py-3 px-6')"
      >
        <i class="fas fa-bars"></i>
      </button>
      <router-link
        class="
          text-center
          md:pb-2
          text-blueGray-600
          mr-0
          block
          whitespace-nowrap
          text-sm
          uppercase
          font-bold
          p-4
          px-0
        "
        to="/admin"
      >
        <img
          src="@/assets/logo.png"
          class="mx-auto w-20 h-20"
          alt="WAG Media"
          title="WAG Media"
        />
      </router-link>

      <div
        class="
          md:flex
          md:flex-col
          md:items-stretch
          md:opacity-100
          md:relative
          md:mt-4
          md:shadow-none
          shadow
          absolute
          top-0
          left-0
          right-0
          z-40
          overflow-y-auto overflow-x-hidden
          h-auto
          items-center
          flex-1
          rounded
        "
        v-bind:class="collapseShow"
      >
        <div
          class="
            md:min-w-full md:hidden
            block
            pb-4
            mb-4
            border-b border-solid border-blueGray-200
          "
        >
          <div class="flex flex-wrap">
            <div class="w-6/12">
              <router-link
                class="
                  text-center
                  md:pb-2
                  center
                  text-blueGray-600
                  mr-0
                  block
                  whitespace-nowrap
                  text-sm
                  uppercase
                  font-bold
                  p-4
                  px-0
                "
                to="/admin"
              >
                WAGMI Media
              </router-link>
            </div>
            <div class="w-6/12 flex justify-end">
              <button
                type="button"
                class="
                  cursor-pointer
                  text-black
                  opacity-50
                  md:hidden
                  px-3
                  py-1
                  text-xl
                  leading-none
                  bg-transparent
                  rounded
                  border border-solid border-transparent
                "
                v-on:click="toggleCollapseShow('hidden')"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>

        <h6
          class="
            md:min-w-full
            text-blueGray-500 text-xs
            uppercase
            font-bold
            block
            pt-1
            pb-4
            no-underline
          "
        >
          Settings
        </h6>

        <ul class="md:flex-col md:min-w-full flex flex-col list-none">
          <li class="items-center">
            <router-link
              to="/admin/verification"
              v-slot="{ href, navigate, isActive }"
            >
              <a
                :href="href"
                @click="navigate"
                class="text-xs uppercase py-3 font-bold block"
                :class="[
                  isActive
                    ? 'text-blue-700 hover:text-blue-500'
                    : 'text-gray-700 hover:text-gray-400',
                ]"
              >
                <i
                  class="fas fa-check mr-2 text-sm"
                  :class="[isActive ? 'text-blue-500' : 'text-gray-400']"
                ></i>
                Verification
              </a>
            </router-link>
          </li>
          <li class="items-center">
            <router-link
              to="/admin/roles"
              v-slot="{ href, navigate, isActive }"
            >
              <a
                :href="href"
                @click="navigate"
                class="text-xs uppercase py-3 font-bold block"
                :class="[
                  isActive
                    ? 'text-blue-700 hover:text-blue-500'
                    : 'text-gray-700 hover:text-gray-400',
                ]"
              >
                <i
                  class="fas fa-circle-user mr-2 text-sm"
                  :class="[isActive ? 'text-blue-500' : 'text-gray-400']"
                ></i>
                Roles
              </a>
            </router-link>
          </li>
          <li class="items-center">
            <router-link
              to="/admin/elevation"
              v-slot="{ href, navigate, isActive }"
            >
              <a
                :href="href"
                @click="navigate"
                class="text-xs uppercase py-3 font-bold block"
                :class="[
                  isActive
                    ? 'text-blue-700 hover:text-blue-500'
                    : 'text-gray-700 hover:text-gray-400',
                ]"
              >
                <i
                  class="fas fa-up-long mr-2 text-sm"
                  :class="[isActive ? 'text-blue-500' : 'text-gray-400']"
                ></i>
                Message Elevation
              </a>
            </router-link>
          </li>
          <li class="items-center">
            <router-link
              to="/admin/bot"
              v-slot="{ href, navigate, isActive }"
            >
              <a
                :href="href"
                @click="navigate"
                class="text-xs uppercase py-3 font-bold block"
                :class="[
                  isActive
                    ? 'text-blue-700 hover:text-blue-500'
                    : 'text-gray-700 hover:text-gray-400',
                ]"
              >
                <i
                  class="fas fa-robot mr-2 text-sm"
                  :class="[isActive ? 'text-blue-500' : 'text-gray-400']"
                ></i>
                Bot
              </a>
            </router-link>
          </li>
        </ul>

        <hr class="my-4 md:min-w-full" />
        <h6
          class="
            md:min-w-full
            text-blueGray-500 text-xs
            uppercase
            font-bold
            block
            pt-1
            pb-4
            no-underline
          "
        >
          Incentivazation
        </h6>

        <ul class="md:flex-col md:min-w-full flex flex-col list-none">
          <li class="items-center">
            <router-link
              to="/admin/treasuries"
              v-slot="{ href, navigate, isActive }"
            >
              <a
                :href="href"
                @click="navigate"
                class="text-xs uppercase py-3 font-bold block"
                :class="[
                  isActive
                    ? 'text-blue-700 hover:text-blue-500'
                    : 'text-gray-700 hover:text-gray-400',
                ]"
              >
                <i
                  class="fas fa-coins mr-2 text-sm"
                  :class="[isActive ? 'text-blue-500' : 'text-gray-400']"
                ></i>
                Treasuries
              </a>
            </router-link>
          </li>
          <li class="items-center">
            <router-link
              to="/admin/emojis"
              v-slot="{ href, navigate, isActive }"
            >
              <a
                :href="href"
                @click="navigate"
                class="text-xs uppercase py-3 font-bold block"
                :class="[
                  isActive
                    ? 'text-blue-700 hover:text-blue-500'
                    : 'text-gray-700 hover:text-gray-400',
                ]"
              >
                <i
                  class="fas fa-face-laugh mr-2 text-sm"
                  :class="[isActive ? 'text-blue-500' : 'text-gray-400']"
                ></i>
                Emojis
              </a>
            </router-link>
          </li>
        </ul>

        <hr class="my-4 md:min-w-full" />
        <h6
          class="
            md:min-w-full
            text-blueGray-500 text-xs
            uppercase
            font-bold
            block
            pt-1
            pb-4
            no-underline
          "
        >
          Data
        </h6>

        <ul class="md:flex-col md:min-w-full flex flex-col list-none">
          <li class="items-center">
            <router-link
              to="/admin/verified-users"
              v-slot="{ href, navigate, isActive }"
            >
              <a
                :href="href"
                @click="navigate"
                class="text-xs uppercase py-3 font-bold block"
                :class="[
                  isActive
                    ? 'text-blue-700 hover:text-blue-500'
                    : 'text-gray-700 hover:text-gray-400',
                ]"
              >
                <i
                  class="fas fa-user-check mr-2 text-sm"
                  :class="[isActive ? 'text-blue-500' : 'text-gray-400']"
                ></i>
                Verified Users
              </a>
            </router-link>
          </li>
          <li class="items-center">
            <router-link
              to="/admin/valuated-messages"
              v-slot="{ href, navigate, isActive }"
            >
              <a
                :href="href"
                @click="navigate"
                class="text-xs uppercase py-3 font-bold block"
                :class="[
                  isActive
                    ? 'text-blue-700 hover:text-blue-500'
                    : 'text-gray-700 hover:text-gray-400',
                ]"
              >
                <i
                  class="fas fa-comment-dollar mr-2 text-sm"
                  :class="[isActive ? 'text-blue-500' : 'text-gray-400']"
                ></i>
                Valuated Messages
              </a>
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>
); }

<script>
export default {
  data() {
    return {
      collapseShow: "hidden",
    };
  },
  methods: {
    toggleCollapseShow: function (classes) {
      this.collapseShow = classes;
    },
  },
};
</script>