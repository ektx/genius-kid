<template>
  <div class="keypad">
    <div class="keys">
      <button v-for="n in 9" :key="n" @click="handleKeypad(n.toString())">
        {{ n }}
      </button>
      <button @click="handleKeypad('0')">0</button>
      <button class="del-btn" @click="handleKeypad('DEL')">退格</button>
      <button class="submit-btn" @click="onSubmitAnswer">确定</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: string
}

const { modelValue } = defineProps<Props>()
const emits = defineEmits(['update:modelValue', 'submitAnswer'])

const userInput = computed({
  get() {
    return modelValue.toString()
  },
  set(val) {
    emits('update:modelValue', val)
  }
})

const handleKeypad = (num: string) => {
  if (num === 'DEL') {
    userInput.value = userInput.value.slice(0, -1)
  } else if (userInput.value.length < 5) {
    userInput.value += num
  }
}

function onSubmitAnswer() {
  emits('submitAnswer', userInput.value)
}
</script>

<style lang="css">
.keypad .keys {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.keypad button {
  height: 60px;
  font-size: 1.5rem;
  background: white;
  border: 3px solid #db2777;
  border-radius: 12px;
}

.submit-btn {
  grid-column: span 3;
  background: #db2777 !important;
  color: white;
}

.del-btn {
  background: #fdf2f8 !important;
}
</style>
