import router from '@/router'
import { useUserStore } from '@/stores/user'
import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'
import Notiflix from 'notiflix'
const userStore = useUserStore()

export const instanceAxios = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
})

instanceAxios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const padLength = (4 - (base64.length % 4)) % 4
        const correctedBase64 = base64 + '='.repeat(padLength)
        const payload = JSON.parse(atob(correctedBase64))

        const exp = payload.exp
        const now = Date.now() / 1000

        if (exp < now) {
          localStorage.removeItem('token')
          userStore.isLogin = false
          Notiflix.Notify.failure('Token หมดอายุ กรุณา Login ใหม่', {
            position: 'right-bottom',
          })
          router.push('/')
        }
      } catch (error) {
        console.error('Invalid token format:', error)
        localStorage.removeItem('token')
        userStore.isLogin = false
        router.push('/')
      }
    }
    return config
  }
)
