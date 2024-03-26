<script setup lang="ts">
import { ref, toRefs } from "vue";

const props = defineProps<{
  frequency?: number;
  mouth?: boolean;
  zzzOnly?: boolean;
}>();
const { frequency, mouth } = toRefs(props);

const loadingAnimationDirection = ref(1);
const loadingAnimation = ref(["loadingAnimationActive", "loadingAnimationActive", "loadingAnimationActive"]);
let loadingAnimationIndex = loadingAnimation.value.length - 1;
let loadingId = setInterval(() => {
  if (loadingAnimationIndex < -1) {
    loadingAnimationDirection.value = 1;
    loadingAnimationIndex++;
  }
  if (loadingAnimationIndex == loadingAnimation.value.length) {
    loadingAnimationDirection.value = -1;
    loadingAnimationIndex--; // Uncomment this line to have all the Zs filled in with the little mouth
  }
  loadingAnimationIndex += loadingAnimationDirection.value;

  loadingAnimation.value = loadingAnimation.value.map((_, i) => {
    if (i <= loadingAnimationIndex) {
      return "loadingAnimationActive";
    } else {
      return "loadingAnimation";
    }
  });
}, frequency.value);
</script>

<template>
  <span v-if="!zzzOnly">(ー<span v-if="!mouth || loadingAnimationDirection < 0">。</span><span v-if="mouth && loadingAnimationDirection > 0">o </span>ー)</span>
  <span :class="loadingAnimation[0]"> ᶻ </span>
  <span :class="loadingAnimation[1]"> 𝗓 </span>
  <span :class="loadingAnimation[2]"> 𐰁 </span>
</template>
