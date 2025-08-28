<template>
  <img
    :src="isDark ? darkSrc : lightSrc"
    :alt="alt"
    :class="imageClass"
    v-bind="$attrs"
  />
</template>

<script setup>
import { useData } from "vitepress"
import { computed } from "vue"

const props = defineProps({
  lightSrc: {
    type: String,
    required: true,
  },
  darkSrc: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    default: "",
  },
  customClass: {
    type: String,
    default: "",
  },
})

const { isDark } = useData()

const imageClass = computed(() => {
  return props.customClass
})
</script>
