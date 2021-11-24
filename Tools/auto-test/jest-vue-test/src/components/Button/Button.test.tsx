import { mount } from '@vue/test-utils'
import Button from './Button'

it('测试 emit 事件', async () => {
  const wrapper = mount(Button)

  await wrapper.trigger('click');
  expect(wrapper.emitted('click')).toHaveLength(1)
})

it('测试 当 loading 不能 emit', async () => {
  const wrapper = mount(Button, {
    props: {
      loading: true
    }
  })

  await wrapper.trigger('click')
  expect(wrapper.emitted('click')).toBeUndefined()
})

it('测试渲染 icon', async () => {
  const wrapper = mount(Button, {
    props: {
      icon: 'icon-rocket',
    },
  });

  expect(wrapper.find('.icon-sync').exists()).toBeFalsy()
  expect(wrapper.find('.icon-rocket').exists()).toBeTruthy()
  expect(wrapper.html()).toMatchSnapshot();

  await wrapper.setProps({
    loading: true
  })

  expect(wrapper.find('.icon-sync').exists()).toBeTruthy()
  expect(wrapper.find('.icon-rocket').exists()).toBeFalsy()
  expect(wrapper.html()).toMatchSnapshot();
})
