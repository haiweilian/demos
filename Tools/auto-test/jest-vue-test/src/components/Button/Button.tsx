import { defineComponent } from 'vue';

// Types
import type { PropType, ButtonHTMLAttributes } from 'vue';

export type ButtonType =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger';

export type ButtonSize = 'lg' | 'md' | 'sm';

export default defineComponent({
  name: 'Button',

  props: {
    icon: String,
    round: Boolean,
    block: Boolean,
    loading: Boolean,
    loadingText: String,
    nativeType: String as PropType<ButtonHTMLAttributes['type']>,
    type: {
      type: String as PropType<ButtonType>,
      default: 'default',
    },
    size: {
      type: String as PropType<ButtonSize>,
      default: 'md',
    },
    loadingIcon: {
      type: String,
      default: 'icon-sync',
    },
  },

  emits: ['click'],

  setup(props, { emit, slots }) {
    const onClick = (event: MouseEvent) => {
      if (!props.loading) {
        emit('click', event);
      }
    };

    const getStyle = () => {
      const style = [
        'inline-flex',
        'justify-center',
        'items-center',
        'border',
        'rounded-md',
        'disabled:opacity-50',
        'disabled:cursor-not-allowed',
      ];

      // ButtonSize
      if (props.size === 'lg') {
        style.push(
          'min-w-20',
          'min-h-13',
          'px-4',
          'text-lg',
          'tracking-widest'
        );
      }
      if (props.size === 'md') {
        style.push(
          'min-w-16',
          'min-h-10',
          'px-2',
          'text-base',
          'tracking-wider'
        );
      }
      if (props.size === 'sm') {
        style.push('min-w-12', 'min-h-7', 'px-1', 'text-sm', 'tracking-wide');
      }

      // ButtonType
      if (props.block) {
        style.push('block', 'w-full');
      }
      if (props.round) {
        style.push('rounded-full');
      }
      if (props.type === 'default') {
        style.push(
          'text-dark',
          'bg-white',
          'border-gray-300',
          'active:bg-gray-200'
        );
      }
      if (props.type === 'primary') {
        style.push(
          'text-light',
          'bg-blue-500',
          'border-transparent',
          'active:bg-blue-600'
        );
      }
      if (props.type === 'success') {
        style.push(
          'text-light',
          'bg-green-500',
          'border-transparent',
          'active:bg-green-600'
        );
      }
      if (props.type === 'warning') {
        style.push(
          'text-light',
          'bg-yellow-500',
          'border-transparent',
          'active:bg-yellow-600'
        );
      }
      if (props.type === 'danger') {
        style.push(
          'text-light',
          'bg-red-500',
          'border-transparent',
          'active:bg-red-600'
        );
      }

      return style;
    };

    const renderIcon = () => {
      if (props.loading) {
        return slots.loadingIcon ? (
          slots.loadingIcon()
        ) : (
          <i
            class={[
              'iconfont',
              'inline-block',
              'animate-spin',
              props.loadingIcon,
            ]}
          />
        );
      }

      if (props.icon) {
        return <i class={['iconfont', 'inline-block', props.icon]} />;
      }

      if (slots.icon) {
        return slots.icon();
      }
    };

    const renderText = () => {
      if (props.loading) {
        if (slots.loadingText) {
          return slots.loadingText();
        }

        if (props.loadingText) {
          return <span class="mx-0.5">{props.loadingText}</span>;
        }
      }

      if (slots.default) {
        return slots.default();
      }
    };

    return () => (
      <button class={getStyle()} onClick={onClick}>
        {renderIcon()}
        {renderText()}
      </button>
    );
  },
});
