import Vue from 'vue'
import VueRouter from 'vue-router'
import VerifiedUsers from '@/views/data/VerifiedUsers'
import VerificationSettings from '@/views/settings/Verification'
import RolesSettings from '@/views/settings/Roles'
import BotSettings from '@/views/settings/Bot'
import MessageElevationSettings from '@/views/settings/MessageElevation'
import TreasuryOverview from '@/views/incentivization/treasury/Overview'
import TreasuryInsertUpdate from '@/views/incentivization/treasury/InsertUpdate'
import EmojiOverview from '@/views/incentivization/emoji/Overview'
import EmojiInsertUpdate from '@/views/incentivization/emoji/InsertUpdate'
import ValuatedMessages from '@/views/data/ValuatedMessages'
import PageNotFound from '@/views/PageNotFound'

Vue.use(VueRouter)

const routes = [
  {
    path: '/admin',
    beforeEnter() {
      window.location.href = process.env.VUE_APP_DISCORD_OAUTH_URL
    }
  },
  {
    path: '/admin/login',
    beforeEnter() {
      window.location.href = process.env.VUE_APP_DISCORD_OAUTH_URL
    }
  },
  {
    path: '/admin/verification',
    name: 'Verification - Settings',
    component: VerificationSettings
  },
  {
    path: '/admin/roles',
    name: 'Roles - Settings',
    component: RolesSettings
  },
  {
    path: '/admin/bot',
    name: 'Bot - Settings',
    component: BotSettings
  },
  {
    path: '/admin/elevation',
    name: 'Message Elevation - Settings',
    component: MessageElevationSettings
  },
  {
    path: '/admin/treasuries',
    name: 'Treasuries',
    component: TreasuryOverview
  },
  {
    path: '/admin/treasuries/insert',
    name: 'Add Treasury',
    component: TreasuryInsertUpdate,
    props: { action: "insert" }
  },
  {
    path: '/admin/treasuries/update/:id',
    name: 'Edit Treasury',
    component: TreasuryInsertUpdate,
    props: { action: "update" }
  },
  {
    path: '/admin/emojis',
    name: 'Emojis',
    component: EmojiOverview
  },
  {
    path: '/admin/emojis/insert',
    name: 'Add Emoji',
    component: EmojiInsertUpdate,
    props: { action: "insert" }
  },
  {
    path: '/admin/emojis/update/:id',
    name: 'Edit Emoji',
    component: EmojiInsertUpdate,
    props: { action: "update" }
  },
  {
    path: '/admin/verified-users',
    name: 'Verified Users',
    component: VerifiedUsers
  },
  {
    path: '/admin/valuated-messages',
    name: 'Valuated Messages',
    component: ValuatedMessages
  },
  {
    path: "*",
    name: '404',
    component: PageNotFound
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
