<template>
  <v-app class="animated-background">
    <v-main>
      <v-container class="d-flex flex-column align-center justify-center fill-height text-center">
        <v-card class="mx-auto elevation-3" outlined style="border-radius: 30px; padding: 30px;" width="500">
          <v-card-title class="text-h5" style="font-size: 30px; font-weight: bold;"><h2>Welcome To Tic Tac Toe</h2></v-card-title>
          <v-card-text>
            <v-avatar v-if="userStore.isLogin" class="mx-auto mb-3" size="120">
              <v-img alt="User Avatar" :src="userStore.image" />
            </v-avatar>
            <h3 v-if="userStore.isLogin" class="mb-2" style="font-size: 24px; font-weight: bold;">{{ userStore.name }}</h3>
            <v-card
              v-if="userStore.isLogin"
              class="mx-auto mb-4 elevation-2"
              max-width="300px"
              outlined
              style="border-radius: 20px; background: linear-gradient(10deg, #3B76EF, #ac9cff ); color: white; transition: all 0.3s ease;"
              @mouseleave="hover = false"
              @mouseover="hover = true"
            >
              <v-card-title class="text-h5 mb-n2" style="font-weight: bold; color: white;">
                Total Score
              </v-card-title>
              <v-card-subtitle
                class="font-weight-bold"
                style="font-size: 26px; font-weight: bold; color:white ; text-shadow: 2px 20px 10px rgba(0, 0, 0, 0.5);"
              >
                {{ userStore.score }}
              </v-card-subtitle>
            </v-card>
            <div v-else class="welcome-card">
              <img
                alt="Welcome to Tic Tac Toe"
                class="welcome-image"
                src="../assets/img/logo.png"
              >
            </div>

            <v-form v-if="!userStore.isLogin" ref="form" v-model="valid" lazy-validation>
              <v-text-field
                v-model="loginData.username"
                density="compact"
                label="Username"
                required
                :rules="[rules.required]"
                style="border-radius: 20px;"
                variant="outlined"
              />
              <v-text-field
                v-model="loginData.password"
                :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
                density="compact"
                label="Password"
                required
                :rules="[rules.required]"
                :type="visible ? 'text' : 'password'"
                variant="outlined"
                @click:append-inner="visible = !visible"
              />
              <v-btn

                class="rounded-pill rainbow rainbow-2"
                elevation="2"
                style="font-size: 20px; width: 200px; height: 50px;"
                @click="submitLogin"
              >
                Login
              </v-btn>
            <!-- @click="login" -->
            </v-form>
            <v-btn
              v-else
              class="rounded-pill rainbow rainbow-1"
              elevation="3"
              style="font-size: 20px; width: 200px; height: 50px;"
              to="/ox-game"
            >
              Start
            </v-btn>

          </v-card-text>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
  import { useUserStore } from '@/stores/user'
  import { useAuth0 } from '@auth0/auth0-vue'
  import axios from 'axios'

  const auth0 = useAuth0()
  const userStore = useUserStore()

  const hover = ref(false)
  let token = ''
  const user = {
    name: '',
    image: '',
    score: '',
  }

  const valid = ref(false)
  const form = ref()
  const visible = ref(false)

  const loginData = reactive({
    username: '',
    password: '',
  })

  const rules = {
    required: (value: string) => !!value || 'This field is required',
  }

  const submitLogin = async () => {
    if (form.value?.validate()) {
      try {
        const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/auth/login`, {
          username: loginData.username,
          password: loginData.password,
        })

        if (response.status === 200) {
          localStorage.setItem('token', response.data.token)
          token = response.data.token
          await fetchProfile()
        }
      } catch (error) {
        console.error('Login failed:', error)
      }
    }
  }

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token') // ดึง token จาก localStorage
      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/api/auth/get_profile`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.status === 200) {
        console.log(response.data.result)

        userStore.name = response.data.result.name
        userStore.image = response.data.result.image
        userStore.score = response.data.result.score
        userStore.isLogin = true
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

</script>

<style scoped>
html, body {
  margin:0;
  padding:0;
  height:100%;
}

.rainbow{
  background-color: #76b8fa;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  padding: 8px 16px;

}

.rainbow-1:hover{
   background-image: linear-gradient(90deg, #70dafd 0%, #fae482 49%, #ff8989 80%, #70dafd 100%);
   animation:slidebg 5s linear infinite;
}

.rainbow-2:hover{
   background-image: linear-gradient(90deg, #00C0FF 0%, #ff9844 49%, #ffe986 80%, #00C0FF 100%);
   animation:slidebg 5s linear infinite;
}

@keyframes slidebg {
  to {
    background-position:20vw;
  }
}

.animated-background {
  background: linear-gradient(200deg,#fdeb9a , #ffcccc, #3b65b3);
  animation: bgColorFade 15s ease infinite;
}

@keyframes bgColorFade {
  0% { background-color: #ffcccc; }
  25% { background-color: #ffd9cc; }
  50% { background-color: #a3e1fe; }
  75% { background-color: #ffe6cc; }
  100% { background-color: #ffcccc; }
}

.welcome-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  border-radius: 20px;
}

.welcome-image {
  max-width: 60%;
  border-radius: 50%;
  border: white solid 8px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  animation: spin 10s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.welcome-text {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.v-card:hover {
  transform: scale(1.03);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}
</style>
