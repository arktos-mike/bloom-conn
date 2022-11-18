import { Card, Col, Divider, Form, notification, Row, Select, Skeleton, Space, Button, List } from 'antd';
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { DesktopOutlined, WifiOutlined, GlobalOutlined, CalendarOutlined, ClockCircleOutlined, ReloadOutlined, PlusOutlined, MinusOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { DatePicker, TimePicker, InputNumber, Input, } from '../components';
import format from 'dayjs';
import dayjs from 'dayjs';


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
  ip: string;
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

  const onNamesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newData = [...groups];
    const index = newData.findIndex((obj => obj.id == Number(event.target.id)));
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...{ id: Number(event.target.id), name: event.target.value }
    });
    setGroups(newData);
  };

  const addItem = () => {
    setGroups([...groups, { id: groups.length ? Number(groups.slice(-1)[0].id) + 1 : 1, name: name }]);
    setName('');
  };

  const removeItem = (id: React.Key) => {
    const newData = groups.filter(item => item.id !== id);
    const newMachineData = machines.map(({ id, name, ip, ...rest }) => {
      if (rest.groupId == id) rest.groupId = Number(groups.slice(-1)[0].id);
      return { id, name, ip, ...rest };
    });
    setMachines(newMachineData)
    setGroups(newData);
  };

  const onFinish = (values: any) => {
    console.log('Received values of form:', values);
  };

  const handleChange = () => {
    store.set('groups', groups);
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
    setMachines(store.get('machines'));
  }, []);

  useEffect(() => {
    store.set('groups', groups)

  }, [groups]);

  return (
    <div className='wrapper'>
      <Row gutter={[8, 8]} style={{ flex: '1 1 100%', alignSelf: 'stretch', alignItems: 'stretch', display: 'flex' }}>
        <Col span={6} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
          <Card title={t('panel.network')} bordered={false} size='small' style={cardStyle} headStyle={cardHeadStyle} bodyStyle={cardBodyStyle}>
            <Skeleton loading={loading} round active>
              <List
                header={<Space style={{ padding: '0 8px 4px' }}>
                  <Input
                    placeholder={t('group.placeholder')}
                    value={name}
                    onChange={onNameChange}
                  />
                  <Button size='large' type="primary" disabled={name == ''} icon={<PlusOutlined />} onClick={addItem}>
                    {t('group.add')}
                  </Button>
                </Space>}
                dataSource={groups}
                renderItem={item => (
                  <List.Item>
                    <Space style={{ padding: '0 8px 4px', alignItems: 'center', justifyContent: 'center' }}>
                      <Input
                        placeholder={t('group.placeholder')}
                        value={item.name}
                        id={item.id}
                        onChange={onNamesChange}
                      /><Button shape='circle' danger type="default" disabled={groups.length == 1} size='small' onClick={() => removeItem(item.id)} block icon={<MinusOutlined />} /></Space>
                  </List.Item>
                )}
              />
            </Skeleton>
          </Card>
        </Col>
        <Col span={18} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
          <Card title={t('panel.network')} bordered={false} size='small' style={cardStyle} headStyle={cardHeadStyle} bodyStyle={cardBodyStyle}>
            <Skeleton loading={loading} round active>

              <Form form={form} onFinish={onFinish} style={{ width: '100%' }}>
                <Form.Item name="group" label={t('group.self')} rules={[{ required: true, message: t('user.fill') }]}>
                  <Select
                    size='large'
                    onChange={handleChange}
                    placeholder={t('group.self')}
                    options={groups.map(item => ({ key: item.id, value: item.id, label: item.name }))}
                  />
                </Form.Item>
                <Form.List name="machines" >
                  {(fields, { add, remove, move }) => {
                    return (
                      <>
                        {fields.map((field, index) => (
                          <div key={index} style={{ display: 'inline-flex', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                            <Button shape='circle' disabled={index == 0} style={{ width: '0%' }} type="default" size='small' onClick={() => {
                              move(index, index - 1);

                            }} icon={<ArrowUpOutlined />} />
                            <Form.Item  {...field} >
                              <div key={index} style={{ display: 'inline-flex', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                                <Form.Item
                                  label={t('group.self')}
                                  name={[field.name, 'groupId']}
                                  rules={[{ required: true, message: t('user.fill') }]}
                                  style={{ width: '20%' }}
                                >
                                  <Select size='large' disabled={!form.getFieldValue('group')} options={groups.map(item => ({ key: item.id, label: item.name, value: item.id }))} />
                                </Form.Item>
                                <Form.Item
                                  label={t('id')}
                                  name={[field.name, 'id']}
                                  rules={[{ required: true, message: t('user.fill') }]}
                                  style={{ width: '20%' }}
                                >
                                  <Input />
                                </Form.Item>
                                <Form.Item
                                  label={t('loom')}
                                  name={[field.name, 'name']}
                                  rules={[{ required: true, message: t('user.fill') }]}
                                  style={{ width: '35%' }}
                                >
                                  <Input />
                                </Form.Item>
                                <Form.Item
                                  label={t('ip.ip')}
                                  name={[field.name, 'ip']}
                                  rules={[{ required: true, message: t('user.fill') }]}
                                  style={{ width: '25%' }}
                                >
                                  <Input />
                                </Form.Item>
                              </div>
                            </Form.Item>
                            <Button shape='circle' style={{ width: '0%' }} danger type="default" size='small' onClick={() => {
                              setMachines(machines.filter(item => item.id !== form.getFieldValue(['machines', field.name, 'id'])));
                              remove(index);
                            }} icon={<MinusOutlined />} />
                          </div>
                        ))}

                        <Form.Item>
                          <Button type="dashed" size='large' onClick={() => {
                            setMachines([...machines, { id: machines.length ? Number(machines.slice(-1)[0].id) + 1 : 1, groupId: form.getFieldValue('group'), name: machines.slice(-1)[0].name, ip: machines.slice(-1)[0].ip }]);
                            add({ id: machines.length ? Number(machines.slice(-1)[0].id) + 1 : 1, groupId: form.getFieldValue('group'), name: machines.slice(-1)[0].name, ip: machines.slice(-1)[0].ip });

                          }} block icon={<PlusOutlined />}>
                            {t('machine.add')}
                          </Button>
                        </Form.Item>
                      </>
                    )
                  }}
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
    </div >
  )
}

export default Settings
