import { Button, Form, Input, Modal, Select, Skeleton } from "antd";
import { forwardRef, useImperativeHandle, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { convertChineseSymbolsToEnglish, convertToHalfWidth } from "../../utils/strUtils";

const AIGCModal = forwardRef((props: {
  onFinish: (resText: string) => void;
}, ref) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [form] = Form.useForm();
  const aigcType = Form.useWatch('type', form);
  const show = () => {
    form.resetFields()
    setOpen(true)
  }

  const close = () => {
    setOpen(false)
  }

  const generateFlowChart = (flowContent: string) => {
    console.log('flowContent:', flowContent)
    return invoke('generate_flow_chart', { flowContent }).then(res => {
      const resJson = JSON.parse((res as any).data)
      // console.log(resJson)
      if (resJson?.output?.text) {
        const resText = resJson?.output?.text as string
        const mermaidJS = resText.split("```mermaid")[1].split("```")[0]
        const convertMermaidJS = convertChineseSymbolsToEnglish(convertToHalfWidth(mermaidJS))
        return convertMermaidJS
      }
      return ''
    })
  }

  const generateMindmap = (mapContent: string) => {
    console.log('mapContent:', mapContent)
    return invoke('generate_mindmap', { mapContent }).then(res => {
      const resJson = JSON.parse((res as any).data)
      // console.log(resJson)
      if (resJson?.output?.text) {
        const resText = resJson?.output?.text as string
        const mermaidJS = resText.split("```mermaid")[1].split("```")[0]
        const convertMermaidJS = convertChineseSymbolsToEnglish(convertToHalfWidth(mermaidJS))
        return convertMermaidJS
      }
      return ''
    })
  }

  const getContentFieldLabel = () => {
    if(aigcType === 'flowchart') {
      return '流程图内容'
    } else if(aigcType === 'mindmap') {
      return '思维导图内容'
    }
    return ''
  }

  const getContentFieldTooltip = () => {
    if(aigcType === 'flowchart') {
      return '例：外贸服饰报关'
    } else if(aigcType === 'mindmap') {
      return '例：tensorflow学习路线'
    }
    return ''
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
      <Skeleton loading={loading}>
        <Form
          form={form}
          initialValues={formData}
          onFinish={async (values) => {
            console.log(values)
            setLoading(true)
            let resText = '';
            if(values.type === 'flowchart') {
              resText = await generateFlowChart(values.content)
            } else if(values.type === 'mindmap') {
              resText = await generateMindmap(values.content)
            }
            setLoading(false)
            if(props.onFinish) {
              props.onFinish(resText)
            }
            close()
          }}
        >
          <Form.Item
            name="type"
            label="类型"
          >
            <Select 
              options={[
                { label: '流程图', value: 'flowchart' },
                { label: '思维导图', value: 'mindmap' }
              ]} 
            />
          </Form.Item>
          <Form.Item 
            hidden={!aigcType}
            name="content"
            label={getContentFieldLabel()}
            tooltip={getContentFieldTooltip()}
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
      </Skeleton>
    </Modal>
  )
})

export default AIGCModal