<script setup>
import disc from "./component/disc.vue";
import { ref } from "vue";
import Othello from "./lib/Othello.js";

let oth = new Othello();
const board = ref(oth.board(true));
//先手0 後手1
const showPreview = true;
const pop = ref([2, 2]);
const state = ref("黒の手番です");

const put = (index) => {
  const move = 0x08000000000000000n >> BigInt(index);
  const next = oth.putIf(oth.data[0], oth.data[1], move);
  if (next == 0) {
    console.log("[Othello]Err: cannot place there");
    return;
  }
  oth.put(move, next);
  oth.next();
  state.value = (oth.turn == 0 ? "黒" : "白") + "の手番です";
  pop.value = oth.pop();
  if (oth.canput(oth.data, oth.turn) == 1) {
    console.log("[Othello]: passed");
    oth.log(0n, 0n);
    oth.next();
    state.value =
      "パスしました\n" + (oth.turn == 0 ? "黒" : "白") + "の手番です";
    if (oth.canput(oth.data, oth.turn) == 1) {
      const res = pop.value[0] - pop.value[1];
      state.value =
        "ゲームセット\n" +
        (res < 0 ? "黒の勝利" : res != 0 ? "白の勝利" : "引き分け") +
        "です";
      console.log("[Othello]: game ended");
      oth.undo(1);
    }
  }
  board.value = oth.board(showPreview);
};
const undo = () => {
  oth.undo(1);
  board.value = oth.board(showPreview);
  pop.value = oth.pop();
};
const reset = () => {
  oth = new Othello();
  board.value = oth.board(showPreview)
  pop.value = oth.pop()
  state.value = "リセットしました 黒の手番です"
};
</script>

<template>
  <div class="back">
    <div class="pop">
      <disc color="0" class="color" />: {{ pop[0] }}　
      <disc color="1" class="color" />:
      {{ pop[1] }}
    </div>
    <div class="state">{{ state }}</div>
    <table>
      <tr v-for="(line, i) in board.split(` `)">
        <td v-for="(cell, j) in line">
          <div @click="put(i * 8 + j / 1)">
            <disc :color="cell" />
          </div>
        </td>
      </tr>
    </table>
    <button @click="undo()">undo</button>
    <button @click="reset()">reset</button>
  </div>
</template>

<style scoped>
.pop {
  display: flex;
  font-size: 4vh;
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
  max-width: 500px;
  max-height: 500px;
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
