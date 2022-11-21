import { Card, Col, Form, notification, Row, Select, Space, Button, List, Modal } from 'antd';
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { PlusOutlined, MinusOutlined, ArrowUpOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Input } from '../components';

const cardStyle = { background: "whitesmoke", width: '100%', display: 'flex', flexDirection: 'column' as 'column' }
const cardHeadStyle = { background: "#1890ff", color: "white" }
const cardBodyStyle = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' as 'column' }

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
  const [height, setHeight] = useState<number | undefined>(0)
  const div = useRef<HTMLDivElement | null>(null);

  const addItem = () => {
    setGroups([...groups, { id: groups.length ? Number(groups.slice(-1)[0].id) + 1 : 1, name: name }]);
    setName('');
  };
  const confirm = (id: React.Key) => {
    Modal.confirm({
      title: t('confirm.title'),
      icon: <ExclamationCircleOutlined style={{ fontSize: "300%" }} />,
      content: t('confirm.descr'),
      okText: t('confirm.ok'),
      cancelText: t('confirm.cancel'),
      centered: true,
      okButtonProps: { size: 'large', danger: true },
      cancelButtonProps: { size: 'large' },
      onOk: () => { removeItem(id) },
    });
  };
  const removeItem = (id: React.Key) => {
    const newData = groups.filter(item => item.id !== id);
    const newMachineData = machines.filter(item => item.groupId !== id)
    setMachines(newMachineData);
    setGroups(newData);
    store.set('machines', newMachineData)
    form.setFieldsValue({ machines: machines.filter(item => item.groupId == form.getFieldValue('group')) });
    openNotificationWithIcon('success', t('notifications.confupdate'), 3, '', { backgroundColor: '#f6ffed', border: '2px solid #b7eb8f' });
  };

  const onFinish = () => {
    store.set('machines', machines)
    form.setFieldsValue({ machines: machines.filter(item => item.groupId == form.getFieldValue('group')) });
    openNotificationWithIcon('success', t('notifications.confupdate'), 3, '', { backgroundColor: '#f6ffed', border: '2px solid #b7eb8f' });
  };

  const handleChange = () => {
    store.set('groups', groups);
    form.setFieldsValue({ machines: machines.filter(item => item.groupId == form.getFieldValue('group')) });
  };

  const handleOrderChange = () => {
    let newData = [...machines];
    form.getFieldValue(['machines']).map((row: any) => {
      newData = newData.filter(item => item.id !== row.id)
      newData.push(row)
    })
    setMachines(newData);
  };

  const handleMachineChange = () => {
    const newData = [...machines];
    form.getFieldValue(['machines']).map((row: any) => {
      const index = newData.findIndex((obj => obj.id == row.id));
      const item = newData[index];
      newData.splice(index, 1, {
        ...item,
        ...row
      });
    })
    setMachines(newData);
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
    setHeight(div.current?.offsetHeight ? div.current?.offsetHeight : 0)
    setGroups(store.get('groups'));
    setMachines(store.get('machines'));
  }, []);

  useEffect(() => {
    form.setFieldsValue({ group: groups.length ? Number(groups.slice(-1)[0].id) : null, machines: groups.length ? machines.filter(item => item.groupId == (Number(groups.slice(-1)[0].id))) : null });
  }, [form && groups]);

  useEffect(() => {
    store.set('groups', groups)

  }, [groups]);

  return (
    <div ref={div} className='wrapper'>
      <Row gutter={[8, 8]} style={{ flex: '1 1 100%', alignSelf: 'stretch', alignItems: 'stretch', display: 'flex' }}>
        <Col span={6} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
          <Card title={t('panel.groups')} bordered={false} size='small' style={cardStyle} headStyle={cardHeadStyle} bodyStyle={cardBodyStyle}>
            <Space style={{ padding: '0 8px 4px', marginBottom: 10 }}>
              <Input
                placeholder={t('group.placeholder')}
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setName(e.target.value); }}
              />
              <Button size='large' type="primary" disabled={name == ''} icon={<PlusOutlined />} onClick={addItem}>
                {t('group.add')}
              </Button>
            </Space>
            <div style={{ height: height && height - 140, maxHeight: '100%', width: '100%', overflowY: 'auto' }}>
              <List
                dataSource={groups}
                renderItem={item => (
                  <List.Item >
                    <Space style={{ padding: '0 8px 4px', justifyContent: 'center', width: '100%' }}>
                      <Input style={{ width: '100%' }}
                        placeholder={t('group.placeholder')}
                        value={item.name}
                        id={item.id}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const newData = [...groups];
                          const index = newData.findIndex((obj => obj.id == Number(e.target.id)));
                          const item = newData[index];
                          newData.splice(index, 1, {
                            ...item,
                            ...{ id: Number(e.target.id), name: e.target.value }
                          });
                          setGroups(newData);
                        }}
                      /><Button shape='circle' danger type="default" disabled={(machines.filter(obj => obj.groupId == item.id).length > 0)} size='middle' onClick={() => confirm(item.id)} block icon={<MinusOutlined />} /></Space>
                  </List.Item>

                )}
              />
            </div>
          </Card>
        </Col>
        <Col span={18} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
          <Card title={t('panel.network')} bordered={false} size='small' style={cardStyle} headStyle={cardHeadStyle} bodyStyle={cardBodyStyle}>
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
                      <div style={{ height: height && height - 250, maxHeight: '100%', width: '100%', overflowY: 'auto' }}>
                        {fields.map((field, index) => (
                          <Form.Item key={index}>
                            <div style={{ display: 'inline-flex', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                              <Button shape='circle' disabled={index == 0} style={{ marginInline: 10, marginBottom: 10 }} type="default" size='middle' onClick={() => {
                                move(index, index - 1);
                                handleOrderChange()
                              }} icon={<ArrowUpOutlined />} />
                              <Form.Item
                                label={t('group.self')}
                                name={[field.name, 'groupId']}
                                rules={[{ required: true, message: t('user.fill') }]}
                                style={{ width: '20%', marginInline: 10 }}
                              >
                                <Select size='large' onSelect={() => { handleMachineChange() }} disabled={!form.getFieldValue('group')} options={groups.map(item => ({ key: item.id, label: item.name, value: item.id }))} />
                              </Form.Item>
                              <Form.Item
                                label={t('user.id')}
                                name={[field.name, 'id']}
                                rules={[{ required: true, message: t('user.fill') }]}
                                style={{ width: '20%', marginInline: 10 }}
                              >
                                <Input onChange={() => { handleMachineChange() }} />
                              </Form.Item>
                              <Form.Item
                                label={t('machine.self')}
                                name={[field.name, 'name']}
                                rules={[{ required: true, message: t('user.fill') }]}
                                style={{ width: '35%', marginInline: 10 }}
                              >
                                <Input onChange={() => { handleMachineChange() }} />
                              </Form.Item>
                              <Form.Item
                                label={t('ip.ip')}
                                name={[field.name, 'ip']}
                                rules={[{ required: true, message: t('user.fill') }]}
                                style={{ width: '25%', marginInline: 10 }}
                              >
                                <Input onChange={() => { handleMachineChange() }} />
                              </Form.Item>
                              <Button shape='circle' style={{ marginInline: 10, marginBottom: 10 }} danger type="default" size='middle' onClick={() => {
                                setMachines(machines.filter(item => item.id !== form.getFieldValue(['machines', field.name, 'id'])));
                                remove(index);
                              }} icon={<MinusOutlined />} />
                            </div>
                          </Form.Item>
                        ))}
                      </div>
                      <Form.Item style={{ marginTop: 15 }}>
                        <Button type="dashed" size='large' disabled={!form.getFieldValue('group')} onClick={() => {
                          const maxId = Math.max(...machines.map(o => Number(o.id)))
                          setMachines([...machines, { id: machines.length ? maxId + 1 : 1, groupId: form.getFieldValue('group'), name: machines.length ? machines.filter(i => i.id == maxId)[0].name : t('machine.placeholder'), ip: machines.length ? machines.filter(i => i.id == maxId)[0].ip : '0.0.0.0' }]);
                        add({id: machines.length ? maxId + 1 : 1, groupId: form.getFieldValue('group'), name: machines.length ? machines.filter(i => i.id == maxId)[0].name : t('machine.placeholder'), ip: machines.length ? machines.filter(i => i.id == maxId)[0].ip : '0.0.0.0' });
                        }} block icon={<PlusOutlined />}>
                        {t('machine.add')}
                      </Button>
                    </Form.Item>
                    </>
              )
                }}
            </Form.List>
            <Form.Item wrapperCol={{ offset: 10, span: 14 }}>
              <Button type="primary" size='large' htmlType="submit">
                {t('user.submit')}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
    </div >
  )
}

export default Settings
