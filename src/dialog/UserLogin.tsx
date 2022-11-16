import { useState, useEffect } from 'react'
import { Modal, Button, Form, Input, Checkbox, notification, Select } from 'antd'
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import UserEdit from "./UserEdit";
import UserRegister from "./UserRegister";

const Store = require('electron-store');
const store = new Store();
const { Option } = Select;

type Props = {
  isModalVisible: boolean;
  token: any;
  setToken: (val: any) => void;
  setRemember: (val: boolean) => void;
  setIsModalVisible: (val: boolean) => void;
};

const UserLogin: React.FC<Props> = ({
  isModalVisible,
  setIsModalVisible,
  token,
  setToken,
  setRemember,
}) => {

  const [form] = Form.useForm()
  const [state, setState] = useState({ data: [] })
  const [editVisible, setEditVisible] = useState(false)
  const [regVisible, setRegVisible] = useState(false)
  const fetchData = async () => {
    setState({ data: (store.get('users')).map((user: any) => { return user.name }).sort() });
  }

  useEffect(() => {
    fetchData()
    if (form && isModalVisible) form.resetFields()
  }, [isModalVisible, editVisible, regVisible])

  const openNotificationWithIcon = (type: string, message: string, dur: number, descr?: string, style?: React.CSSProperties) => {
    if (type == 'success' || type == 'warning' || type == 'info' || type == 'error')
      notification[type]({
        message: message,
        description: descr,
        placement: 'bottomRight',
        duration: dur,
        style: style,
      });
  };
  const { t } = useTranslation();
  const handleCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
  }
  const handleOk = async () => {
    form.resetFields();
    setToken(null);
  }

  const onFinish = async (values: { user: any; password: any; remember: boolean; }) => {
    try {
      if (values.user != (token ? JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).name : null)) {
        const response = await fetch('http://localhost:3000/users/login', {
          method: 'POST',
          headers: { 'content-type': 'application/json;charset=UTF-8', },
          body: JSON.stringify({ name: values.user, password: values.password, }),
        });
        const json = await response.json();
        setToken(json.token || token);
        openNotificationWithIcon(json.error ? 'warning' : 'success', t(json.message), 3, '', json.error ? { backgroundColor: '#fffbe6', border: '2px solid #ffe58f' } : { backgroundColor: '#f6ffed', border: '2px solid #b7eb8f' });
        if (!response.ok) { throw Error(response.statusText); }
      }
      setRemember(values.remember);
    }
    catch (error) { console.log(error) }
    //setIsModalVisible(false)
  }

  return (
    <Modal
      title={t('user.signin')}
      okButtonProps={{ size: 'large' }}
      okText={t('user.logout')}
      cancelText={t('menu.close')}
      cancelButtonProps={{ size: 'large' }}
      onOk={handleOk}
      onCancel={handleCancel}
      open={isModalVisible}
      destroyOnClose={true}
      centered={true}
      getContainer={false}
    >
      <div className="sel">
        <Form
          name="login"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          initialValues={{ remember: true }}
          size='middle'
          onFinish={onFinish}
          form={form}
          preserve={false}
        >
          <Form.Item
            label={t('user.curuser')}
          >
            <span className="text" style={{ color: token ? JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role == 'fixer' ? "#108ee9" : JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role == 'weaver' ? "#87d068" : JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role == 'manager' ? "#2db7f5" : "#f50" : "" }}>{token ? JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).name : t('user.anon')}</span>
          </Form.Item>
          <Form.Item
            label={t('user.user')}
            name="user"
            rules={[{ required: true, message: t('user.fill') }]}
          >
            <Select showSearch
              filterOption={(input, option) => (option!.children as unknown as string).toLowerCase().includes(input.toLowerCase())} placeholder={t('user.user')} virtual={true} size="large" suffixIcon={<UserOutlined style={{ fontSize: '120%' }} />}>
              {(state.data || []).map(user => (
                <Option key={user} value={user} label={user}>
                  {user}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label={t('user.password')}
            name="password"
            rules={[{ required: true, message: t('user.fill') }]}
          >
            <Input.Password onChange={e => { }} onFocus={(e) => { }} visibilityToggle={true} placeholder={t('user.password')} prefix={<LockOutlined className="site-form-item-icon" />} />
          </Form.Item>
          <Form.Item name="remember" valuePropName="checked" wrapperCol={{ offset: 8, span: 16 }}>
            <Checkbox>{t('user.remember')}</Checkbox>
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 8, span: 16 }} style={{ marginTop: 15 }}>
            <Button size="large" type="primary" htmlType="submit" >
              {t('user.login')}
            </Button>
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 8, span: 16 }} hidden={!token} >
            <Button type="link" onClick={() => { setEditVisible(true); }}>{t('user.change')}</Button>
            <UserEdit isModalVisible={editVisible} setIsModalVisible={setEditVisible} token={token} setToken={setToken} />
          </Form.Item >
          {token && <Form.Item wrapperCol={{ offset: 8, span: 16 }} >
            <Button type="link" onClick={() => { setRegVisible(true); }}>{t('user.register')}</Button>
            <UserRegister isModalVisible={regVisible} setIsModalVisible={setRegVisible} token={token} />
          </Form.Item >}
        </Form>
      </div>
    </Modal>
  )
}
export default UserLogin;
