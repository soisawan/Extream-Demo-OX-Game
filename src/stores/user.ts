import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('handleUser', () => {
  const score = ref(0)
  const isLogin = ref(false)
  const name = ref('')
  const image = ref('')
  return { score, isLogin, name, image }
})
