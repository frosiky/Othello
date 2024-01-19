//黒0白1
export default class Othello {
  //b,w
  data = [0x0000001008000000n, 0x0000000810000000n]
  turn = 0b0
  dir = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1]
  ]
  history = { move: [], flip: [] }
  put(move, reverse, turn = this.turn, log = true) {
    this.data[turn ^ 1] ^= move | reverse
    this.data[turn] ^= reverse
    if (log) this.log(move, reverse)
  }
  putIf(b = this.data[0], w = this.data[1], move, turn = this.turn) {
    //Make judgement whether player can put cell there
    //Return list of flipped cells if the cell were put there
    let results = 0b0n
    if ((move & (b | w)) != 0) return results
    for (let i = 0; i < 8; i++) {
      const reverse = this.putDirIf([w, b], move, i, turn)
      results |= reverse
    }
    return results
  }
  putDirIf(brd, move, dir, turn) {
    let temp = this.trans(move, dir)
    let results = 0b0n
    let flipped = 0b0
    while (temp != 0 && (temp & brd[turn ^ 1]) != 0) {
      flipped |= 0b1
      results |= temp
      temp = this.trans(temp, dir)
    }
    if ((temp & brd[turn]) != 0 && flipped != 0) {
      return results
    }
    return 0n
  }
  canput(brd = this.data, color = this.turn) {
    for (let i = 0; i < 64; i++) {
      const move = 0x08000000000000000n >> BigInt(i)
      if (this.putIf(brd[0], brd[1], move, color) != 0) return 0
    }
    return 1
  }
  legalMove(brd = this.data, color = this.turn) {
    let res = 0n
    for (let i = 0; i < 64; i++) {
      const move = 0x08000000000000000n >> BigInt(i)
      res |= this.putIf(brd[0], brd[1], move, color) != 0 ? move : 0n
    }
    return res
  }
  pop(brd = this.data) {
    let res = [0, 0]
    let bits = brd[0]
    bits = (bits & 0x5555555555555555n) + ((bits >> 1n) & 0x5555555555555555n)
    bits = (bits & 0x3333333333333333n) + ((bits >> 2n) & 0x3333333333333333n)
    bits = (bits & 0x0f0f0f0f0f0f0f0fn) + ((bits >> 4n) & 0x0f0f0f0f0f0f0f0fn)
    bits = (bits & 0x00ff00ff00ff00ffn) + ((bits >> 8n) & 0x00ff00ff00ff00ffn)
    bits = (bits & 0x0000ffff0000ffffn) + ((bits >> 16n) & 0x0000ffff0000ffffn)
    bits = (bits & 0x00000000ffffffffn) + ((bits >> 32n) & 0x00000000ffffffffn)
    res[0] += Number(bits)
    bits = brd[1]
    bits = (bits & 0x5555555555555555n) + ((bits >> 1n) & 0x5555555555555555n)
    bits = (bits & 0x3333333333333333n) + ((bits >> 2n) & 0x3333333333333333n)
    bits = (bits & 0x0f0f0f0f0f0f0f0fn) + ((bits >> 4n) & 0x0f0f0f0f0f0f0f0fn)
    bits = (bits & 0x00ff00ff00ff00ffn) + ((bits >> 8n) & 0x00ff00ff00ff00ffn)
    bits = (bits & 0x0000ffff0000ffffn) + ((bits >> 16n) & 0x0000ffff0000ffffn)
    bits = (bits & 0x00000000ffffffffn) + ((bits >> 32n) & 0x00000000ffffffffn)
    res[1] += Number(bits)
    return res
  }
  board(showPreview = false) {
    let line = ''
    const preview = showPreview ? this.legalMove() : 0n
    for (let i = 0; i < 64; i++) {
      const p = 0x8000000000000000n >> BigInt(i)
      line +=
        (this.data[0] & p) != 0
          ? '0'
          : (this.data[1] & p) != 0
          ? '1'
          : (preview & p) != 0
          ? '3'
          : '2'
      if (i % 8 == 7) line += ' '
    }
    line += ' '
    return line
  }
  log(move, flip) {
    this.history.move.push(move)
    this.history.flip.push(flip)
  }
  undo(range) {
    if (this.history.move.length < range) {
      console.log("[Othello]: cannot undo (out of the record)")
      return;
    }
    for (let i = 0; i < range; i++) {
      const previous = { move: this.history.move.pop(), flip: this.history.flip.pop() }
      this.goForward()
      this.put(previous.move, previous.flip, this.turn, false)
    }
  }
  trans(move, dir) {
    switch (dir) {
      case 0: //上
        return (move << 8n) & 0xffffffffffffff00n
      case 1: //右上
        return (move << 7n) & 0x7f7f7f7f7f7f7f00n
      case 2: //右
        return (move >> 1n) & 0x7f7f7f7f7f7f7f7fn
      case 3: //右下
        return (move >> 9n) & 0x007f7f7f7f7f7f7fn
      case 4: //下
        return (move >> 8n) & 0x00ffffffffffffffn
      case 5: //左下
        return (move >> 7n) & 0x00fefefefefefefen
      case 6: //左
        return (move << 1n) & 0xfefefefefefefefen
      case 7: //左上
        return (move << 9n) & 0xfefefefefefefe00n
      default:
        return 0n
    }
  }
  goForward() {
    this.turn = this.turn ^ 1
  }
  cpu(depth) {
    let high = -Infinity
    let results = []
    const choice = this.convertBoard(this.data)
    for (const pos of choice) {
      const flipCells = this.putIf(pos[0], pos[1])
      const board_choice = []
      for (let i = 0; i < 8; i++) {
        const line_choice = []
        for (let j = 0; j < 8; j++) {
          if (flipCells.includes([i, j])) line_choice.push(this.turn)
          else line_choice.push(this.data[i][j])
        }
        board_choice.push(line_choice)
      }
      const score = this.branch(board_choice, depth - 1, this.turn * -1) * -1
      if (high < score) {
        high = score
        results = [pos]
      } else if (high == score) {
        results.push(pos)
      }
    }
    return results[Math.floor(Math.random() * results.length)]
  }
  branch(board, depth, turn, pass = false) {
    if (depth == 0)
      //reaching deepest => return value of this leaf
      return this.evaluate(board, turn)
    let high = -Infinity
    for (const pos of this.canput(board, turn)) {
      const flipCells = this.putIf(pos[0], pos[1], board, turn)
      const board_branch = []
      for (let i = 0; i < 8; i++) {
        const line_branch = []
        for (let j = 0; j < 8; j++) {
          if (flipCells.includes([i, j])) line_branch.push(turn)
          else line_branch.push(board[i][j])
        }
        board_branch.push(line_branch)
      }
      //branching deeper
      //in order to find higher point
      high = Math.max(high, this.branch(board_branch, depth - 1, turn * -1) * -1)
      if (high == -Infinity) {
        if (pass) {
          return this.evaluate(board_branch, turn)
        }
        high = Math.max(high, this.branch(board_branch, depth, turn * -1, true) * -1)
      }
    }
    return high
  }
  evaluate(board, color) {
    let points = 0
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        points += this.cellValue[i][j] * board[i][j] * color
      }
    }
    return points
  }
}
