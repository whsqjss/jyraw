import { invoke } from "@tauri-apps/api";
import { Button, Form, Input, Modal, message } from "antd";
import { forwardRef, useImperativeHandle, useState } from "react";
import { Store } from "tauri-plugin-store-api";

export type AppSettings = {
  launch_at_login: boolean;
  theme: string;
  aigc_api_key: string
}

const AIGCApiKeyModal = forwardRef((props, ref) => {
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm();
  const [defaultSettings, setDefaultSettings] = useState<AppSettings| null>(null)

  const show = async () => {
    form.resetFields()
    const appSettings: AppSettings| null = await invoke('get_app_settings', {})
    form.setFieldsValue({apiKey: appSettings?.aigc_api_key})
    setDefaultSettings(appSettings)
    setOpen(true)
  }

  useImperativeHandle(ref, () => ({
    show
  }))

  return (
    <Modal
      centered
      destroyOnClose
      title="AIGC"
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      maskClosable={false}
    >
      <Form
        form={form}
        initialValues={{
          apiKey: defaultSettings?.aigc_api_key
        }}
        onFinish={async (values) => {
          if(defaultSettings) {
            defaultSettings.aigc_api_key = values.apiKey
            invoke('set_app_settings', {settings: defaultSettings}).then(res => {
              console.log('set app settings res:', res)
              message.success('设置成功')
              setOpen(false)
            })
          }
        }}
      >
        <Form.Item 
            name="apiKey"
            label="api-key"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
      </Form>
    </Modal>
  )
})

export default AIGCApiKeyModal;