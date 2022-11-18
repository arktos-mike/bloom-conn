import { Card, Col, Divider, Form, notification, Row, Select, Skeleton, Space, Button } from 'antd';
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { DesktopOutlined, WifiOutlined, GlobalOutlined, CalendarOutlined, ClockCircleOutlined, ReloadOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { DatePicker, TimePicker, InputNumber, Input, } from '../components';
import format from 'dayjs';
import dayjs from 'dayjs';
import type { DataNode, TreeProps } from 'antd/es/tree';

const cardStyle = { background: "whitesmoke", width: '100%', display: 'flex', flexDirection: 'column' as 'column' }
const cardHeadStyle = { background: "#1890ff", color: "white" }
const cardBodyStyle = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' as 'column' }
const { Option } = Select;

const Store = require('electron-store');
const store = new Store();

type Props = {
};

interface GroupType {
  id: React.Key;
  name: string;
}

interface MachineType {
  id: React.Key;
  name: string;
  groupId: React.Key;
}

const Settings: React.FC<Props> = ({
}) => {
  const { t, i18n } = useTranslation();

  let isSubscribed = true;
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [groups, setGroups] = useState<GroupType[]>([]);
  const [machines, setMachines] = useState<MachineType[]>([]);
  const [name, setName] = useState('');

  const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const addItem = () => {
    setGroups([...groups, { id: groups.length ? Number(groups.slice(-1)[0].id) + 1 : 1, name: name }]);
    setName('');
  };

  const removeItem = (id:React.Key) => {
    const newData = groups.filter(item => item.id !== id);
    newData.length && setGroups(newData);
  };

  const onFinish = (values: any) => {
    console.log('Received values of form:', values);
  };

  const handleChange = () => {
    store.set('groups', groups);
    console.log(groups)
    form.setFieldsValue({ machines: machines.filter(item => item.groupId == form.getFieldValue('group')) });
  };
  const openNotificationWithIcon = (type: string, message: string, dur: number, descr?: string, style?: React.CSSProperties) => {
    if (type == 'success' || type == 'warning' || type == 'info' || type == 'error')
      notification[type]({
        message: message,
        description: descr,
        placement: 'bottomRight',
        duration: dur,
        style: style,
      });
  }

  useEffect(() => {
    setGroups(store.get('groups'));
    console.log(store.get('groups'))
    setMachines(store.get('machines'));
  }, []);

  return (
    <div className='wrapper'>
      <Row gutter={[8, 8]} style={{ flex: '1 1 100%', alignSelf: 'stretch', alignItems: 'stretch', display: 'flex' }}>
        <Col span={24} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
          <Card title={t('panel.network')} bordered={false} size='small' style={cardStyle} headStyle={cardHeadStyle} bodyStyle={cardBodyStyle}>
            <Skeleton loading={loading} round active>
              <Form form={form} onFinish={onFinish} style={{ width: '100%' }}>
                <Form.Item name="group" label={t('group.self')} rules={[{ required: true, message: t('user.fill') }]}>
                  <Select
                    size='large'
                    onChange={handleChange}
                    placeholder={t('group.self')}
                    defaultActiveFirstOption
                    dropdownRender={menu => (
                      <>
                        {menu}
                        <Divider style={{ margin: '8px 0' }} />
                        <Space style={{ padding: '0 8px 4px' }}>
                          <Input
                            placeholder={t('group.placeholder')}
                            value={name}
                            onChange={onNameChange}
                          />
                          <Button size='large' type="primary" disabled={name==''} icon={<PlusOutlined />} onClick={addItem}>
                            {t('group.add')}
                          </Button>
                        </Space>
                      </>
                    )}
                    optionLabelProp="label" >
                    {groups.map(item => (
                  <Option key={item.id} value={item.id} label={item.name}>
                    <Space style={{ padding: '0 8px 4px', alignItems: 'center', justifyContent: 'center' }}>{item.name}<Button shape='circle' danger type="default" size='small' disabled={groups.length==1} onClick={() => removeItem(item.id)} block icon={<MinusOutlined />} /></Space></Option>
                ))}
                  </Select>
                </Form.Item>
                <Form.List name="machines">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(field => (
                        <Space key={field.key} align="baseline">
                          <Form.Item
                            {...field}
                            label={t('id')}
                            name={[field.name, 'id']}
                            rules={[{ required: true, message: t('user.fill') }]}
                          >
                            <Input />
                          </Form.Item>
                          <Form.Item
                            {...field}
                            label={t('loom')}
                            name={[field.name, 'groupId']}
                            rules={[{ required: true, message: t('user.fill') }]}
                          >
                            <Select size='large' disabled={!form.getFieldValue('group')} style={{ width: 130 }} options={groups.map(item => ({ key: item.id, label: item.name, value: item.id }))} />
                          </Form.Item>
                          <Form.Item
                            {...field}
                            label={t('loom')}
                            name={[field.name, 'name']}
                            rules={[{ required: true, message: t('user.fill') }]}
                          >
                            <Input />
                          </Form.Item>
                          <Form.Item
                            {...field}
                            label={t('ip.ip')}
                            name={[field.name, 'ip']}
                            rules={[{ required: true, message: t('user.fill') }]}
                          >
                            <Input />
                          </Form.Item>
                          <Button shape='circle' danger type="default" size='middle' onClick={() => remove(field.name)} block icon={<MinusOutlined />} />
                        </Space>
                      ))}

                      <Form.Item>
                        <Button type="dashed" size='large' onClick={() => add()} block icon={<PlusOutlined />}>
                          {t('machine.add')}
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>
                <Form.Item wrapperCol={{ offset: 10, span: 14 }} >
                  <Button type="primary" size='large' htmlType="submit">
                    {t('user.submit')}
                  </Button>
                </Form.Item>
              </Form>
            </Skeleton>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Settings
