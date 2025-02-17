<script lang="ts" setup>
import type { formElm, llmInfoVal } from '@/hooks/useModel/type'
import info from '@/components/icon/info.vue'
import {
  ElInput,
  ElInputNumber,
  ElSelectV2,
  ElSlider,
  ElSwitch,
} from 'element-plus'

const props = defineProps<{
  value: llmInfoVal<unknown, { required: boolean }>
  label: string | number | symbol
  depth?: number
}>()

const fromVal = defineModel<any>({ required: true })

function getComponent(elm: formElm['type'] | undefined) {
  switch (elm) {
    case 'input':
      return { el: ElInput, defaultConf: { clearable: true } }
    case 'inputNumber':
      return { el: ElInputNumber, defaultConf: {} }
    case 'select':
      return { el: ElSelectV2, defaultConf: { options: [] } }
    case 'slider':
      return {
        el: ElSlider,
        defaultConf: { style: 'margin: 0 10px;', showInput: true },
      }
    case 'switch':
      return { el: ElSwitch, defaultConf: {} }
  }
  return { el: undefined, defaultConf: {} }
}

const { el, defaultConf } = getComponent(props.value.type)
</script>

<template>
  <template v-if="value && 'alert' in value">
    <el-alert
      :title="value.label || label.toString()"
      :description="value.desc"
      :type="value.alert as any"
      :closable="false"
      show-icon
      :style="`margin: 10px 0px 20px ${(props.depth || 0) * 10}px;`"
    />
    <l-form-item
      v-for="(x, k) in value.value"
      :key="k"
      v-model="fromVal[k]"
      :value="x"
      :label="k"
      :depth="(depth || 0) + 1"
    />
  </template>
  <el-form-item
    v-else-if="value"
    :required="value.required"
    :style="`margin-left: ${(props.depth || 0) * 10}px;`"
  >
    <template #label>
      <el-text size="large">
        {{ value.label || label }}
      </el-text>
      <el-tooltip
        v-if="value.desc"
        :content="`<span>${value.desc}</span>`"
        raw-content
      >
        <el-icon style="margin-left: 8px">
          <info />
        </el-icon>
      </el-tooltip>
    </template>
    <component
      :is="el"
      v-model="fromVal"
      v-bind="{ ...defaultConf, ...value.config }"
    />
  </el-form-item>
</template>

<style>
.el-input__wrapper {
  width: 100%;
}

.el-slider .el-slider__input {
  width: 200px !important;
}
</style>
