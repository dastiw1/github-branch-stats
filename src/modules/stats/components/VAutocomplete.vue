<template>
  <div class="url-autocomplete" v-click-outside="hide">
    <input
      class="search-input"
      type="text"
      v-model="internalValue"
      :disabled="isDisabled"
      @focus="onFocus"
      @blur="onBlur"
    />
    <div v-if="expanded" class="dropdown-menu" :class="[{ expaned: expanded }]">
      <ul class="list dropdown-menu__list">
        <li v-for="(item, key) in allItems" :key="key" class="list-item" @click="selectItem(item)">
          <slot name="item" :item="item" :index="key">
            {{ getText(item) }}
          </slot>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
/**
 * @emits change - срабатывает только если подходит под regexp
 * @emits input - срабатывает при любом изменении input value
 */
import { computed, defineComponent, onMounted, ref, watch } from '@vue/composition-api';
import { getPropertyFromItem } from '@/tools/utils';
export default defineComponent({
  props: {
    value: {
      type: [String, Object],
      default: '',
    },
    regexp: {
      type: RegExp,
      default: () => /.+/,
    },
    itemValue: {
      type: String,
      default: null,
    },
    itemText: {
      type: [String, Function],
      default: null,
    },
    items: {
      type: Array,
      default: () => [],
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['input', 'change'],
  setup(props, { emit }) {
    const internalValue = ref<string | Record<string | number, any>>('');

    const expanded = ref(false);

    function show() {
      expanded.value = true;
    }

    function hide() {
      expanded.value = false;
    }

    onMounted(() => {
      internalValue.value = props.value;
    });

    function isValMatchRegexp(val: string | Record<string | number, any>) {
      if (val == null || val == '') {
        return true;
      }
      return props.regexp.test(typeof val === 'string' ? val : getText(val));
    }

    const allItems = computed(() => {
      if (typeof props.items[0] === 'object') {
        return props.items;
      } else {
        return props.items.map((i) => ({
          [props.itemValue]: i,
          [props.itemText]: i,
        }));
      }
    });

    const isDisabled = computed(() => {
      return props.disabled;
    });
    /**
     * Текст выбранного элемента
     */
    function getText(item: any) {
      return item == null ? '' : String(getPropertyFromItem(item, props.itemText, item));
    }
    /**
     * Значение выбранного элемента
     */
    function getValue(item: any) {
      return getPropertyFromItem(item, props.itemValue, getText(item));
    }

    function onFocus() {
      if (isValMatchRegexp(internalValue.value)) {
        show();
      }
    }

    function onBlur() {
      /*  if (!isValMatchRegexp(internalValue.value)) {
        hide();
      } */
    }

    function setValue(value: any) {
      const oldValue = internalValue.value;
      internalValue.value = value;
      if (value !== oldValue) {
        emit('change', value);
      }
    }
    function selectItem(item: any) {
      setValue(getValue(item));
    }
    watch(internalValue, (val) => {
      emit('input', val);
      if (isValMatchRegexp(val)) {
        emit('change', val);
        hide();
      } else {
        show();
      }
    });

    return {
      internalValue,
      expanded,
      // computed ->
      isDisabled,
      allItems,
      // methods ->
      getValue,
      getText,
      show,
      hide,
      onFocus,
      onBlur,
      isValMatchRegexp,
      selectItem,
    };
  },
});
</script>

<style lang="scss" scoped>
.url-autocomplete {
  display: inline-block;
  vertical-align: middle;
  position: relative;
}
.dropdown-menu {
  display: none;
  left: 100%;
  margin: 0;
  padding: 0;
  position: absolute;
  top: 0;
  z-index: 2;
  background-color: #fff;
  left: 0;
  top: auto;
  width: inherit;
  max-height: 260px;
  max-width: 300px;
  min-width: 120px;
  overflow-x: hidden;
  overflow-y: auto;

  &.expaned {
    display: block;
    position: absolute;
    box-shadow: 0 0 1px rgba(183, 122, 122, .78);
  }

  &__list {
    .list-item {
      white-space: nowrap;

      padding: 0.5em 1em;
      text-align-last: left;
      cursor: pointer;
      &:hover {
        background: rgba(19, 251, 226, .44);
      }
    }
  }
}
</style>
