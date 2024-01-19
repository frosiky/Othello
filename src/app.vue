<script setup>
import disc from './component/disc.vue'
import { ref } from 'vue'
import Othello from './lib/Othello.js'

const oth = new Othello()
const board = ref(oth.board(true))
//先手0 後手1
const showPreview = true
const pop = ref([2, 2])
const preview = []

const put = (index) => {
  const move = 0x08000000000000000n >> BigInt(index)
  const next = oth.putIf(oth.data[0], oth.data[1], move)
  if (next == 0) {
    console.log('[Othello]Err: cannot place there')
    return
  }
  oth.put(move, next)
  oth.next()
  if (oth.canput(oth.data, oth.turn) == 1) {
    console.log('[Othello]: passed')
    oth.log(0n, 0n)
    oth.next()
    if (oth.canput(oth.data, oth.turn) == 1) {
      console.log('[Othello]: game ended')
      oth.undo(1)
    }
  }
  board.value = oth.board(showPreview)
  pop.value = oth.pop()
}
const undo = () => {
  oth.undo(1)
  board.value = oth.board(showPreview)
  pop.value = oth.pop()
}
</script>

<template>
  <div class="back">
    <div class="pop">
      <disc color="0" class="color" />: {{ pop[0] }}　 <disc color="1" class="color" />:
      {{ pop[1] }}
    </div>
    <table>
      <tr v-for="(line, i) in board.split(` `)">
        <td v-for="(cell, j) in line">
          <div @click="put(i * 8 + j / 1)">
            <disc :color="cell == 2 ? (preview.includes([i, j]) ? 3 : 2) : cell" />
          </div>
        </td>
      </tr>
    </table>
    <button @click="undo()">undo</button>
  </div>
</template>

<style scoped>
#play_button {
  user-select: none;
  cursor: pointer;
  margin-top: 2%;
  height: 15%;
  right: 15%;
  position: absolute;
  display: flex;
  border: 2px solid #3877ba;
  border-radius: 100px;
  padding-left: 10%;
  padding-right: 10%;
}
#select {
  width: 50%;
  display: flex;
  border-radius: 10px;
}
.selected {
  background-color: #b7c1cd;
}
.cond {
  user-select: none;
  cursor: pointer;
  border: #000 solid 1px;
  border-radius: 10px;
  text-align: center;
  padding: 3%;
  padding-top: 1%;
  padding-bottom: 1%;
  margin: auto;
  margin-top: 1%;
  margin-bottom: 1%;
}
.pop {
  display: flex;
  font-size: 20px;
  margin-left: 1%;
  text-align: center;
  line-height: 100%;
  align-items: center;
}
.color {
  width: 10%;
}
.back {
  background-color: bisque;
  margin: 0;
  padding: 4vh;
}
td {
  border: solid 1.5px #000;
  padding: 1.5%;
  background-color: darkgreen;
}
table {
  margin-top: 1vh;
  width: 75%;
  user-select: none;
  border-collapse: collapse;
}
h3 {
  font-size: 130%;
  margin: auto;
}
svg {
  text-align: center;
  margin: auto;
}
</style>
