<template>
  <v-app>
    <v-app-bar
      app
      class="custom-app-bar"
      color="transparent"
      dark
      flat
      height="1px"
    >
      <v-spacer />
      <div class="half-circle">
        <div class="score-container">
          <span class="score player">{{ playerScore }}</span>
          <span class="divider">:</span>
          <span class="score bot">{{ botScore }}</span>
        </div>
      </div>
      <v-spacer />
      <div class="profile-container d-flex align-center">
        <div class="profile-content">
          <v-avatar v-if="name" class="mr-2 ml-2" size="35">
            <v-img alt="User Avatar" :src="pic" />
          </v-avatar>
          <span v-if="name">{{ name }}</span>
        </div>

        <v-menu offset-y>
          <template #activator="{ props }">
            <v-btn icon v-bind="props">
              <v-icon>mdi-chevron-down</v-icon>
            </v-btn>
          </template>

          <v-list>
            <v-list-item @click="logout">
              <v-list-item-title>
                <v-icon color="red" left>mdi-logout</v-icon> Logout
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-app-bar>

    <v-main :style="{ background: colorBg }">
      <v-row
        style=" flex-direction: row;
                             align-items: center"
      >
        <v-col cols="6">
          <v-img
            alt="avatar"
            class="center-avatar"
            height="100"
            :src="img"
            width="100"
          />
          <div class="turn-container">
            <h3>{{ status }}</h3>
          </div>
          <div class="high-score-container">
            <h3>Total Score: {{ totalScore }}</h3>
          </div>
        </v-col>
        <v-col cols="6">
          <div class="tic-tac-toe">
            <div v-for="(cell, index) in board" :key="index" class="cell" @click="makeMove(index)">
              {{ cell }}
            </div>
          </div>
          <div class="mt-4">
            <v-btn class="rounded-pill rainbow rainbow-1" color="white" style="font-size: 20px; width: 200px; height: 50px;" @click="resetGame">
              NEW GAME
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
  import { ref } from 'vue'
  import Notiflix from 'notiflix'
  import botImage from '../assets/img/bot.png'
  import playerImage from '../assets/img/player.png'
  import { instanceAxios } from '../service/axios'
  import { useUserStore } from '@/stores/user'
  import router from '@/router'

  const userStore = useUserStore()
  const name = userStore.name
  const pic = userStore.image
  let isFinish = false

  const board = ref(['', '', '', '', '', '', '', '', ''])
  const playerScore = ref(0)
  const botScore = ref(0)
  const consecutiveWins = ref(0)
  const currentPlayer = ref('X')
  let totalScore = userStore.score

  const colorBg = ref('linear-gradient(150deg, #6d9dff, #c4b9fd, #5d90f8 )')
  const status = ref('YOUR TURN')
  const img = ref(playerImage)

  const updateScore = async (isWin: boolean) => {
    if (isWin) {
      consecutiveWins.value += 1
      playerScore.value += 1
      totalScore += 1
      status.value = 'YOU WIN!!'
      if (consecutiveWins.value === 3) {
        status.value = 'YOU WIN 3 CONSECUTIVE!!'
        playerScore.value += 1
        totalScore += 1
        Notiflix.Notify.success('คุณได้รับคะแนนพิเศษสำหรับการชนะติดต่อกัน 3 ครั้ง!', {
          position: 'right-bottom',
        })
        consecutiveWins.value = 0 // Reset streak
      }
    } else {
      if (totalScore > 0) {
        totalScore -= 1
      }
      if (playerScore.value > 0) {
        playerScore.value -= 1
      }
      botScore.value += 1
      consecutiveWins.value = 0 // Reset streak on loss
      status.value = 'YOU LOSE'
    }
    await updateUserScoreInAuth0(totalScore)
    Notiflix.Notify.success(`คะแนนปัจจุบันของคุณ: ${playerScore.value}`, {
      position: 'right-bottom',
    })
  }

  const checkWinner = (board: string[]) => {
    const winningCombinations = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ]

    for (const combo of winningCombinations) {
      const [a, b, c] = combo
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a]
      }
    }
    return null
  }

  const minimax = (board: string[], depth: number, isMaximizing: boolean) => {
    const winner = checkWinner(board)
    if (winner === 'O') return 10 - depth
    if (winner === 'X') return depth - 10
    if (!board.includes('')) return 0

    if (isMaximizing) {
      let bestScore = -Infinity
      for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
          board[i] = 'O'
          const score = minimax(board, depth + 1, false)
          board[i] = ''
          bestScore = Math.max(score, bestScore)
        }
      }
      return bestScore
    } else {
      let bestScore = Infinity
      for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
          board[i] = 'X'
          const score = minimax(board, depth + 1, true)
          board[i] = ''
          bestScore = Math.min(score, bestScore)
        }
      }
      return bestScore
    }
  }

  const makeBotMove = () => {
    colorBg.value = 'linear-gradient(150deg, #6d9dff, #c4b9fd, #5d90f8 )'
    status.value = 'YOUR TURN'
    img.value = playerImage

    let bestScore = -Infinity
    let move = -1
    for (let i = 0; i < board.value.length; i++) {
      if (board.value[i] === '') {
        board.value[i] = 'O'
        const score = minimax(board.value, 0, false)
        board.value[i] = ''
        if (score > bestScore) {
          bestScore = score
          move = i
        }
      }
    }
    if (move !== -1) {
      board.value[move] = 'O'
      currentPlayer.value = 'X'
    }
  }

  const makeMove = (index: number) => {
    if (isFinish) return
    if (!board.value[index] && currentPlayer.value === 'X') {
      board.value[index] = 'X'
      currentPlayer.value = 'O'
      colorBg.value = 'linear-gradient(190deg, #fea1d2, #ffcccc, #5d90f8 )'
      status.value = 'BOT TURN'
      img.value = botImage
      if (checkDraw()) {
        Notiflix.Notify.info('เกมเสมอ!', {
          position: 'right-bottom',
        })
        status.value = 'DRAW'
        isFinish = true
      } else {
        const winner = checkWinner(board.value)
        if (!winner) {
          setTimeout(() => {
            makeBotMove() // Bot makes a move
            const winnerAfterBot = checkWinner(board.value)
            if (winnerAfterBot) {
              isFinish = true
              if (winnerAfterBot === 'X') {
                Notiflix.Notify.success('คุณชนะ!', {
                  position: 'right-bottom',
                })
                updateScore(true) // Player wins
              } else if (winnerAfterBot === 'O') {
                Notiflix.Notify.failure('คุณแพ้!', {
                  position: 'right-bottom',
                })
                updateScore(false) // Player loses
              }
            }
          }, 1000)
        } else {
          isFinish = true
          Notiflix.Notify.success(`${winner} ชนะ!`, {
            position: 'right-bottom',
          })
          updateScore(winner === 'X') // Determine if player won
        }
      }
    }
  }

  const updateUserScoreInAuth0 = async (newScore: number) => {
    try {
      const token = localStorage.getItem('token')
      await instanceAxios.post(
        `${import.meta.env.VITE_APP_API_URL}/api/user/update_score`,
        {
          score: newScore,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      Notiflix.Notify.success('คะแนนถูกบันทึกแล้ว', {
        position: 'right-bottom',
      })
    } catch (error) {
      console.log(error)
    }
  }

  const checkDraw = () => {
    return board.value.every(cell => cell !== '') && !checkWinner(board.value)
  }

  const resetGame = () => {
    board.value = ['', '', '', '', '', '', '', '', '']
    currentPlayer.value = 'X'
    colorBg.value = 'linear-gradient(150deg, #6d9dff, #c4b9fd, #5d90f8 )'
    img.value = playerImage
    status.value = 'YOUR TURN'
    isFinish = false
    Notiflix.Notify.success('เริ่มเกมใหม่เรียบร้อย', {
      position: 'right-bottom',
    })
  }

  const logout = () => {
    localStorage.removeItem('token')
    Notiflix.Notify.success('ออกจากระบบเรียบร้อยแล้ว', {
      position: 'right-bottom',
    })
    window.location.href = '/'
  }
  onMounted(() => {
    const isLogin = !!localStorage.getItem('token')
    if (!isLogin) {
      router.push('/')
    }
  })

</script>

<style scoped>
.center-avatar {
  display: block;
  margin-left: auto;
  margin-right: auto;
}
.custom-app-bar {
  min-height: 110px;
}
.tic-tac-toe {
  display: grid;
  grid-template-columns: repeat(3, 150px);
  grid-template-rows: repeat(3, 150px);
  gap: 10px;
  margin-top: 20px;
}

.cell {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 3rem;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  cursor: pointer;
  width: 150px;
  height: 150px;
}

/* Flexbox เพื่อให้ตารางอยู่ตรงกลางหน้าจอ */
.v-main {
  display: flex;
  justify-content: center;
  align-items: center;
  /* height: 100vh; */
}

.half-circle {
  width: 200px;
  height: 100px;
  background-color: white;
  border-bottom-left-radius: 90px;
  border-bottom-right-radius: 90px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.score-container {
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 50%;
}

.score {
  font-size: 2rem;
  font-weight: bold;
}

.player {
  color: #50c6fc;
}

.bot {
  color: #FF5733;
}

.divider {
  font-size: 1.5rem;
  color: black;
}

.high-score-container {
  margin-top: 20px;
  font-size: 1.5rem;
  color: #333;
  text-align: center;
  flex-direction: column;
}
.turn-container {
  margin-top: 20px;
  font-size: 2rem;
  color: #333;
  text-align: center;
  flex-direction: column;
}

.profile-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: auto;
  background-color: white;
  border-top-left-radius: 50px;
  border-bottom-left-radius: 50px;
  padding: 10px;
}

.profile-content {
  display: flex;
  align-items: center;
  margin-right: auto;
}

.white--text {
  color: white;
}
</style>
