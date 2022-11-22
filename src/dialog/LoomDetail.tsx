import { useState, useEffect } from 'react'
import { Modal, Button, Form, Input, Checkbox, notification, Select } from 'antd'
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';


const Store = require('electron-store');
const store = new Store();
const { Option } = Select;

type Props = {
  isModalVisible: boolean;
  shift: any;
  machine: any;
  tags: any;
  modeCode: any;
  setIsModalVisible: (val: boolean) => void;
};

const LoomDetail: React.FC<Props> = ({
  isModalVisible,
  setIsModalVisible,
  shift,
  machine,
  tags,
  modeCode
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

  const { t } = useTranslation();
  const handleCancel = () => {
    setIsModalVisible(false)
  }

  return (
    <Modal
      title={machine.name}
      cancelText={t('menu.close')}
      cancelButtonProps={{ size: 'large' }}
      onCancel={handleCancel}
      open={isModalVisible}
      destroyOnClose={true}
      centered={true}
      getContainer={document.body}
    >
      <div className="sel">

      </div>
    </Modal>
  )
}
export default LoomDetail;
