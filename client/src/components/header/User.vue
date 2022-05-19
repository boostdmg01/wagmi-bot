<template>
  <div>
    <a
      class="text-blueGray-500 block"
      href="#pablo"
      ref="btnDropdownRef"
      v-on:click="toggleDropdown($event)"
    >
      <div class="items-center flex">
        <span
          class="
            text-sm
            bg-blueGray-200
            inline-flex
            items-center
            justify-center
            rounded-full
          "
        >
          {{ username }}
          <img
            alt="..."
            class="
              ml-2
              w-12
              h-12
              rounded-full
              align-middle
              border-none
              shadow-lg
            "
            :src="getAvatarUrl()"
          />
        </span>
      </div>
    </a>
    <div
      ref="popoverDropdownRef"
      class="
        bg-white
        text-base
        z-50
        float-left
        py-2
        list-none
        text-left
        rounded
        shadow-lg
        min-w-48
      "
      v-bind:class="{
        hidden: !dropdownPopoverShow,
        block: dropdownPopoverShow,
      }"
    >
      <a
        href="#"
        @click.prevent="clearDiscordCache()"
        class="
          text-sm
          py-2
          px-4
          font-normal
          block
          w-full
          whitespace-nowrap
          bg-transparent
          text-blueGray-700
        "
      >
        Clear Discord Cache
      </a>
      <router-link to="/api/discord/logout" v-slot="{ href, navigate }">
        <a
          :href="href"
          @click="navigate"
          class="
            text-sm
            py-2
            px-4
            font-normal
            block
            w-full
            whitespace-nowrap
            bg-transparent
            text-blueGray-700
          "
        >
          Logout
        </a>
      </router-link>
    </div>
  </div>
</template>

<script>
import { createPopper } from "@popperjs/core";
import API from "@/services/api";

export default {
  data() {
    return {
      userId: null,
      username: null,
      avatarId: null,
      dropdownPopoverShow: false,
    };
  },
  beforeMount() {
    this.getData();
  },
  methods: {
    getAvatarUrl: function () {
      if (this.userId && this.avatarId) {
        return `https://cdn.discordapp.com/avatars/${this.userId}/${this.avatarId}.webp?size=64`;
      }

      return "";
    },
    getData: function () {
      API.request("discord/data").then((response) => {
        this.userId = response.data.discord_id;
        this.username = response.data.discord_username;
        this.avatarId = response.data.discord_avatar_id;
      });
    },
    toggleDropdown: function (event) {
      event.preventDefault();

      if (this.dropdownPopoverShow) {
        this.dropdownPopoverShow = false;
      } else {
        this.dropdownPopoverShow = true;
        createPopper(this.$refs.btnDropdownRef, this.$refs.popoverDropdownRef, {
          placement: "bottom-start",
        });
      }
    },
    clearDiscordCache: function () {
      API.request("discord/clear").then((response) => {
        this.$notify({ type: "success", text: response.data.message });
      });
    },
  },
};
</script>